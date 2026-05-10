import { cn } from "@/lib/utils";

type MiniStatProps = {
  label: string;
  value: string | number;
  align?: "left" | "right";
  className?: string;
};

export function MiniStat({ label, value, align = "right", className }: MiniStatProps) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "right" ? "items-end" : "items-start",
        className,
      )}
    >
      <span className="text-lg font-heading font-bold text-slate-900 leading-tight">
        {value}
      </span>
      <span className="text-xs text-slate-400 font-sans uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}
