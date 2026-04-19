import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

// Type
export type Step = "details" | "questions" | "done";

export function StepIndicator({ current }: { current: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "details", label: "Test Details" },
    { key: "questions", label: "Add Questions" },
    { key: "done", label: "Complete" },
  ];

  const currentIdx = steps.findIndex((s) => s.key === current);

  return (
    <div className="flex items-center mb-10">
      {steps.map((step, i) => {
        const done = currentIdx > i;
        const active = current === step.key;
        return (
          <div key={step.key} className="contents">
            {/* Step: circle + label */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                  done
                    ? "bg-brand-primary border-brand-primary text-white"
                    : active
                      ? "border-brand-primary text-brand-primary bg-brand-primary/10"
                      : "border-slate-300 text-slate-400 bg-white",
                )}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold font-heading whitespace-nowrap",
                  active
                    ? "text-brand-primary"
                    : done
                      ? "text-brand-primary/70"
                      : "text-slate-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-4 rounded-full self-start mt-5 transition-all",
                  done ? "bg-brand-primary" : "bg-slate-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
