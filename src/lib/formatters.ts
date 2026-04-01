export function formatPrice(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num) || num === 0) return '$ 0';
  const s = Math.round(Math.abs(num)).toString();
  let result = '';
  for (let i = s.length - 1, c = 0; i >= 0; i--, c++) {
    if (c > 0 && c % 3 === 0) result = '.' + result;
    result = s[i] + result;
  }
  return '$ ' + result;
}

export function parsePriceInput(str: string): number {
  const digits = str.replace(/\D/g, '');
  return digits === '' ? 0 : parseInt(digits, 10);
}
