/**
 * Self-contained scannable QR Code generator in pure TypeScript.
 * Generates an SVG path or 2D boolean matrix for any verification URL without external dependencies.
 */

// Galois Field GF(256) math for Reed-Solomon error correction
const EXP: number[] = new Array(256);
const LOG: number[] = new Array(256);

(function initGaloisField() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = val;
    LOG[val] = i;
    val = (val << 1) ^ (val & 0x80 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) {
    EXP[i] = EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return EXP[LOG[x] + LOG[y]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], EXP[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsEncode(data: number[], eccLength: number): number[] {
  const gen = rsGeneratorPoly(eccLength);
  const result = new Array(data.length + eccLength).fill(0);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i];
  }

  for (let i = 0; i < data.length; i++) {
    const coef = result[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        result[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }

  return result.slice(data.length);
}

// Version 3-M (29x29 matrix, capacity: 44 data bytes, 26 ECC bytes)
export function generateQrMatrix(text: string): boolean[][] {
  const size = 29; // Version 3
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  );

  // 1. Finder patterns
  function addFinder(r0: number, c0: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = r0 + r;
        const col = c0 + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          const isBlack =
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          matrix[row][col] = isBlack;
        }
      }
    }
  }

  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);

  // 2. Alignment pattern at (22, 22)
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBlack = Math.max(Math.abs(r), Math.abs(c)) !== 1;
      matrix[22 + r][22 + c] = isBlack;
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // 4. Dark module
  matrix[4 * 3 + 9][8] = true;

  // 5. Reserve format info
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = size - 8; i < size; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }

  // Encode byte data
  const utf8Bytes = Array.from(new TextEncoder().encode(text));
  const dataLen = utf8Bytes.length;
  const bits: number[] = [];

  // Mode: Byte (0100)
  bits.push(0, 1, 0, 0);

  // Character count (8 bits for Version 1-9 in byte mode)
  for (let i = 7; i >= 0; i--) {
    bits.push((dataLen >> i) & 1);
  }

  // Data bytes
  for (const b of utf8Bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push((b >> i) & 1);
    }
  }

  // Terminator (up to 4 zeroes)
  while (bits.length < 44 * 8 && bits.length % 8 !== 0) {
    bits.push(0);
  }
  while (bits.length < 44 * 8) {
    bits.push(0);
  }

  // Pack bits into bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byteVal = 0;
    for (let j = 0; j < 8; j++) {
      byteVal = (byteVal << 1) | (bits[i + j] || 0);
    }
    dataBytes.push(byteVal);
  }

  // Pad to 44 bytes
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (dataBytes.length < 44) {
    dataBytes.push(padPatterns[padIdx % 2]);
    padIdx++;
  }

  // 26 ECC bytes for Version 3-M
  const eccBytes = rsEncode(dataBytes.slice(0, 44), 26);
  const totalCodewords = [...dataBytes.slice(0, 44), ...eccBytes];

  // Convert codewords to bitstream
  const allBits: number[] = [];
  for (const byte of totalCodewords) {
    for (let i = 7; i >= 0; i--) {
      allBits.push((byte >> i) & 1);
    }
  }

  // Place data bits in matrix (upwards, right to left in pairs)
  let bitIdx = 0;
  let upward = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column

    const rows = upward
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const col of [right, right - 1]) {
        if (matrix[r][col] === null) {
          const bit = bitIdx < allBits.length ? allBits[bitIdx] === 1 : false;
          // Apply standard mask 0: (row + col) % 2 === 0
          const mask = (r + col) % 2 === 0;
          matrix[r][col] = mask ? !bit : bit;
          bitIdx++;
        }
      }
    }
    upward = !upward;
  }

  // Write format info for Mask 0 and Error Level M (BCH code 0x5412)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  const formatPos = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = formatPos[i];
    matrix[r][c] = formatBits[i] === 1;
  }

  // Duplicate format bits
  for (let i = 0; i < 7; i++) {
    matrix[size - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 7; i < 15; i++) {
    matrix[8][size - 15 + i] = formatBits[i] === 1;
  }

  // Convert to clean boolean matrix
  return matrix.map((row) => row.map((cell) => cell === true));
}
