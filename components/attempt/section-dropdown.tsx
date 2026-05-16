import { cn } from "@/lib/utils";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type SectionDropdownProps = {
  sections: { id: string; name: string }[];
  questions: { id: string; sectionId: string | null }[];
  currentQuestion: { id: string; sectionId: string | null } | undefined;
  isSubmitting: boolean;
  goToQuestion: (index: number) => void;
};

export default function SectionDropdown({
  sections,
  questions,
  currentQuestion,
  isSubmitting,
  goToQuestion,
}: SectionDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentSection = sections.find(
    (s) => s.id === currentQuestion?.sectionId,
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Single section — just show a non-interactive label
  if (sections.length <= 1) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <LayoutGrid size={14} className="text-slate-500" />
        </div>
        <span className="text-sm font-heading font-bold text-slate-700 truncate max-w-[140px]">
          {currentSection?.name || "Questions"}
        </span>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isSubmitting}
        className={cn(
          "flex items-center gap-2 px-3 h-9 rounded-xl border font-heading font-bold text-xs transition-all whitespace-nowrap",
          open
            ? "bg-brand-primary border-brand-primary text-white shadow-sm"
            : "bg-white border-slate-200 text-slate-700 hover:border-brand-primary/50 hover:text-brand-primary",
        )}
      >
        <LayoutGrid size={13} />
        <span className="max-w-[100px] md:max-w-[160px] truncate">
          {currentSection?.name || "Section"}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            "transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 py-1.5 overflow-hidden">
          <p className="px-3 pt-1 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Jump to Section
          </p>
          {sections.map((section) => {
            const firstQIdx = questions.findIndex(
              (q) => q.sectionId === section.id,
            );
            const isActive = currentQuestion?.sectionId === section.id;

            return (
              <button
                key={section.id}
                onClick={() => {
                  if (firstQIdx !== -1) {
                    goToQuestion(firstQIdx);
                    setOpen(false);
                  }
                }}
                disabled={isSubmitting || firstQIdx === -1}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-heading font-bold transition-colors text-left",
                  isActive
                    ? "bg-brand-primary/8 text-brand-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                )}
              >
                <span className="truncate">{section.name}</span>
                {isActive && (
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
