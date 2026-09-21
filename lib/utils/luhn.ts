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

/**
 * Calculates the required 15th Luhn check digit from the first 14 digits of an IMEI.
 */
export function calculateImeiCheckDigit(first14: string): number {
  const sanitized = first14.replace(/[^0-9]/g, '').slice(0, 14);
  let sum = 0;
  for (let i = 0; i < sanitized.length; i++) {
    let digit = parseInt(sanitized.charAt(i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Auto-corrects the 15th digit of an IMEI to make it 100% Luhn compliant.
 */
export function autoCorrectImei(imei: string): string {
  const sanitized = imei.replace(/[^0-9]/g, '');
  if (sanitized.length >= 14) {
    const first14 = sanitized.slice(0, 14);
    return first14 + calculateImeiCheckDigit(first14);
  }
  return sanitized;
}

/**
 * Generates a valid 15-digit Luhn-compliant IMEI for testing or non-cellular device deeds.
 */
export function generateValidLuhnImei(tacPrefix: string = "35874209"): string {
  let digits = tacPrefix.replace(/[^0-9]/g, '');
  while (digits.length < 14) {
    digits += Math.floor(Math.random() * 10).toString();
  }
  return digits + calculateImeiCheckDigit(digits);
}
