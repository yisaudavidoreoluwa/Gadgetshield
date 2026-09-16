/**
 * Validates a 15-digit IMEI number using the standard Luhn Algorithm (Mod 10).
 */
export function validateImeiLuhn(imei: string): boolean {
  const sanitized = imei.replace(/[^0-9]/g, '');
  if (sanitized.length !== 15) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = parseInt(sanitized.charAt(i), 10);
    // Double every second digit (odd index in 0-based indexing)
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  return sum % 10 === 0;
}
