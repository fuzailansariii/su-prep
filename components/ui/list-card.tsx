import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type ListCardProps = {
  icon: LucideIcon;
  title: string;
  paragraph: string;
  className?: string;
};

export default function ListCard({
  icon: Icon,
  title,
  paragraph,
  className,
}: ListCardProps) {
  return (
    <div
      className={cn(
        "flex justify-start items-center gap-3 rounded-xl bg-brand-label px-5 py-4",
        className,
      )}
    >
      <span className="w-9 h-9 rounded-xl bg-white flex items-center border border-slate-200 justify-center shrink-0">
        <Icon size={18} aria-hidden="true" className="text-slate-400" />
      </span>
      <div className="flex min-w-0 flex-col">
        <p className="text-sm font-semibold font-heading text-slate-900">
          {title}
        </p>
        <p className="text-xs text-slate-600 font-sans tracking-wide">
          {paragraph}
        </p>
      </div>
    </div>
  );
}
