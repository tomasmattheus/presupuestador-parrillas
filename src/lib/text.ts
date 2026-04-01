export function escapeHtml(s: string): string {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

export function escapeAttr(s: string | null | undefined): string {
  const str = String(s || '');
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function csvEscape(str: string | null | undefined): string {
  if (!str) return '';
  const s = str.toString();
  if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function normalizeCiudad(raw: string | null | undefined): string {
  if (!raw) return '';
  const c = raw.trim();
  const lower = c.toLowerCase();
  if (lower.indexOf('rosario') >= 0 || lower.indexOf('ros ') >= 0 || lower === 'ros') return 'Rosario';
  if (lower.indexOf('funes') >= 0) return 'Funes';
  if (lower.indexOf('roldan') >= 0 || lower.indexOf('roldán') >= 0) return 'Roldan';
  if (lower.indexOf('fisherton') >= 0 || lower.indexOf('fiseherton') >= 0 || lower.indexOf('fishertón') >= 0) return 'Rosario';
  return c.charAt(0).toUpperCase() + c.slice(1);
}
