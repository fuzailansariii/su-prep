import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label?: string;
  count?: string | number;
  icon?: ReactNode;
  className?: string;
}

export default function StatCard({
  count,
  icon,
  label,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "w-full md:max-w-60 rounded-2xl border bg-card text-card-foreground p-5 shadow-sm",
        "flex justify-between items-center gap-2",
        className,
      )}
    >
      <div>
        {/* Label */}
        <div className="text-xs font-bold text-[#545F73]/70 font-body uppercase tracking-widest">
          {label}
        </div>
        {/* Count */}
        <div className="text-2xl font-semibold font-body text-[#3525CD]">
          {count}
        </div>
      </div>
      {/* Icon */}
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
  );
}
