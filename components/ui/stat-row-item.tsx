import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatRowItemProps = {
  icon: LucideIcon;
  value: string | number;
  className?: string;
};

export function StatRowItem({
  icon: Icon,
  value,
  className,
}: StatRowItemProps) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 text-xs text-slate-500 font-sans",
        className,
      )}
    >
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      {value}
    </span>
  );
}
