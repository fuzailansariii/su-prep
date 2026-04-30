"use client";

type ProgressBarProps = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  const percent = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-heading font-semibold text-brand-muted">
        <span>
          Question {safeCurrent} of {safeTotal}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-brand-label overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
