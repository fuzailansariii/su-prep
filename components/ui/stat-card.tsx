import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
};

export function StatCard({
  icon: Icon,
  label,
  value,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1",
        "border-b border-slate-100 last:border-b-0",
        "md:border-b-0 md:border-r md:last:border-r-0",
        className,
      )}
    >
      <div className="flex items-center gap-3 p-5">
        <div className="w-9 h-9 rounded-xl bg-white flex items-center border border-slate-200 justify-center shrink-0">
          <Icon size={18} className="text-slate-400" />
        </div>
        <div className="flex flex-col items-start justify-start">
          <span className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-widest mb-0.5">
            {label}
          </span>

          <p className="text-base font-heading font-bold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
