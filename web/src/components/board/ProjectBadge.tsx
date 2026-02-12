import { getProjectColor } from "@/lib/colors";

interface ProjectBadgeProps {
  name: string;
  className?: string;
}

export function ProjectBadge({ name, className = "" }: ProjectBadgeProps) {
  const color = getProjectColor(name);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}
      style={{
        backgroundColor: `hsl(${color.bg} / 0.15)`,
        color: `hsl(${color.fg})`,
      }}
    >
      {name}
    </span>
  );
}
