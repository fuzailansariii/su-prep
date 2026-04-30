"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

const LABELS = ["A", "B", "C", "D", "E", "F"];

type OptionButtonProps = {
  index: number;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
};

export default function OptionButton({
  index,
  text,
  isSelected,
  onSelect,
}: OptionButtonProps) {
  const label = LABELS[index] ?? String(index + 1);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group w-full flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all duration-200",
        isSelected
          ? "border-brand-primary bg-brand-label shadow-sm"
          : "border-border bg-white hover:border-brand-primary/40 hover:bg-brand-card",
      )}
    >
      {/* Label bubble */}
      <span
        className={cn(
          "shrink-0 h-7 w-7 rounded-full text-xs font-heading font-bold flex items-center justify-center transition-colors duration-200",
          isSelected
            ? "bg-brand-primary text-white"
            : "bg-brand-label text-brand-primary group-hover:bg-brand-button",
        )}
      >
        {label}
      </span>

      {/* Option text */}
      <span
        className={cn(
          "flex-1 text-sm font-sans leading-relaxed pt-0.5 transition-colors duration-200",
          isSelected ? "text-brand-primary font-medium" : "text-foreground",
        )}
      >
        {text}
      </span>

      {/* Check icon */}
      <span className="shrink-0 mt-0.5 transition-opacity duration-200">
        {isSelected ? (
          <CheckCircle2 className="size-5 text-brand-primary" />
        ) : (
          <Circle className="size-5 text-border group-hover:text-brand-primary/40" />
        )}
      </span>
    </button>
  );
}
