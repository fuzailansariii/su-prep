import React from "react";
import { cn } from "@/lib/utils";

interface ProgressItem {
  label: string;
  value: number;
}

interface ProgressCardProps {
  title: string;
  data: ProgressItem[];
  className?: string;
}

export function ProgressCard({ title, data, className }: ProgressCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-card p-6 shadow-sm border",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>

      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span className="uppercase tracking-wide">{item.label}</span>
              <span>{item.value}%</span>
            </div>

            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
