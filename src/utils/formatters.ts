export const formatEuro = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const [y, m, d] = dateStr.split('-');
    if (y && m && d) return `${d}.${m}.${y}`;
    const dt = new Date(dateStr);
    return dt.toLocaleDateString('de-DE');
  } catch {
    return dateStr;
  }
};
