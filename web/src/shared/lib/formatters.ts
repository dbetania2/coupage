export function formatPrice(amount: number, currency: string = '€'): string {
  const formatted = amount.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}

