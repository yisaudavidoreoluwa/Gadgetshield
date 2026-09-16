export function formatImei(imei: string): string {
  const cleaned = imei.replace(/[^0-9]/g, '');
  if (cleaned.length === 15) {
    // Standard TAC-FAC-SNR-CD grouping: 8 digits - 6 digits - 1 digit
    return `${cleaned.slice(0, 8)} ${cleaned.slice(8, 14)} ${cleaned.slice(14)}`;
  }
  return imei;
}

export function maskImei(imei: string): string {
  if (imei.length < 8) return imei;
  return `${imei.slice(0, 4)} ******** ${imei.slice(-3)}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  } catch {
    return isoString;
  }
}
