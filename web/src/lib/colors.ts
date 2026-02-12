/** Deterministic color palette for project badges (HSL). */
const PROJECT_COLORS = [
  { bg: 220, fg: 210 }, // blue
  { bg: 160, fg: 150 }, // green
  { bg: 280, fg: 270 }, // purple
  { bg: 30, fg: 45 }, // orange
  { bg: 340, fg: 330 }, // pink
  { bg: 180, fg: 170 }, // cyan
  { bg: 45, fg: 50 }, // yellow/amber
  { bg: 320, fg: 310 }, // magenta
  { bg: 200, fg: 190 }, // teal
  { bg: 15, fg: 25 }, // red-orange
] as const;

/** Simple hash of string to number. */
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Get deterministic color for a project name. */
export function getProjectColor(name: string): { bg: number; fg: number } {
  const idx = hash(name) % PROJECT_COLORS.length;
  return PROJECT_COLORS[idx];
}

/** Format ISO timestamp as relative time (e.g. "2 hours ago"). */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
