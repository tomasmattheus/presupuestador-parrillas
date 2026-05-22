const AVATAR_COLORS = [
  { bg: '#fee2e2', text: '#b91c1c' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#d1fae5', text: '#047857' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#e0e7ff', text: '#4338ca' },
  { bg: '#f3e8ff', text: '#7c3aed' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#ccfbf1', text: '#0f766e' },
];

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(seed: string): { bg: string; text: string } {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
