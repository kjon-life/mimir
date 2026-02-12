// Deterministic color mapping for project names

const BADGE_COLORS = [
  { bg: "173 58% 39%", fg: "173 58% 90%" },  // teal
  { bg: "142 50% 40%", fg: "142 50% 90%" },  // green
  { bg: "25 85% 50%", fg: "25 85% 95%" },     // orange
  { bg: "262 60% 55%", fg: "262 60% 92%" },   // purple
  { bg: "210 70% 50%", fg: "210 70% 92%" },   // blue
  { bg: "330 65% 55%", fg: "330 65% 92%" },   // pink
  { bg: "45 85% 50%", fg: "45 85% 10%" },     // yellow
  { bg: "0 65% 50%", fg: "0 65% 92%" },       // red
] as const;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getProjectColor(projectName: string) {
  const idx = hashString(projectName) % BADGE_COLORS.length;
  return BADGE_COLORS[idx];
}

export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
