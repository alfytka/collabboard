const PALETTE = ['bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-violet-400', 'bg-cyan-400'];

export function getAvatarColor(id: string): string {
  const hash = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTE[hash % PALETTE.length];
}

export function getInitials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export function formatRelativeTime(dateStr: string): string {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMin < 1) return 'Baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay) return `${diffDay} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}