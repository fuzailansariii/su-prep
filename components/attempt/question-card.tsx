"use client";

import { cn } from "@/lib/utils";
import OptionButton from "./option-button";

type Option = { id: string; optionText: string; order: number };

type Question = {
  id: string;
  questionText: string;
  type: "mcq" | "multi" | "truefalse";
  marks: number;
  order: number;
  section: string | null;
  options: Option[];
};

type QuestionCardProps = {
  question: Question;
  selectedIds: string[];
  onSelect: (optionId: string) => void;
};

const TYPE_LABELS: Record<Question["type"], string> = {
  mcq: "Single Correct",
  multi: "Multiple Correct",
  truefalse: "True / False",
};

export default function QuestionCard({
  question,
  selectedIds,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-6 shadow-sm">
      {/* Top meta row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Section badge */}
        {question.section && (
          <span className="text-xs font-heading font-semibold uppercase tracking-wider text-brand-muted bg-brand-label px-2.5 py-1 rounded-full">
            {question.section}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Type badge */}
          <span
            className={cn(
              "text-xs font-heading font-semibold px-2.5 py-1 rounded-full",
              question.type === "multi"
                ? "bg-orange-50 text-orange-600"
                : "bg-brand-label text-brand-primary"
            )}
          >
            {TYPE_LABELS[question.type]}
          </span>

          {/* Marks badge */}
          <span className="text-xs font-heading font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
            {question.marks} {question.marks === 1 ? "mark" : "marks"}
          </span>
        </div>
      </div>

      {/* Question text */}
      <p className="text-base font-sans font-medium leading-relaxed text-foreground">
        {question.questionText}
      </p>

      {/* Instruction for multi */}
      {question.type === "multi" && (
        <p className="text-xs font-sans text-brand-muted bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
          Select <strong>all</strong> correct options.
        </p>
      )}

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <OptionButton
            key={opt.id}
            index={i}
            text={opt.optionText}
            isSelected={selectedIds.includes(opt.id)}
            onSelect={() => onSelect(opt.id)}
          />
        ))}
      </div>
    </div>
  );
}
