"use client";

import { useExamStore } from "@/store/exam-store";
import { useShallow } from "zustand/react/shallow";
import {
  X,
  CheckCircle2,
  Bookmark,
  LayoutGrid,
  Pause,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AttemptMobileSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    questions,
    sections,
    currentIndex,
    questionStatus,
    goToQuestion,
    isSubmitting,
    pauseExam,
    isPausing,
    testId,
    status,
    setShowSubmitDialog,
  } = useExamStore(
    useShallow((s) => ({
      questions: s.questions,
      sections: s.sections,
      currentIndex: s.currentQuestionIndex,
      questionStatus: s.questionStatus,
      goToQuestion: s.goToQuestion,
      isSubmitting: s.isSubmitting,
      pauseExam: s.pauseExam,
      isPausing: s.isPausing,
      testId: s.testId,
      status: s.status,
      setShowSubmitDialog: s.setShowSubmitDialog,
    })),
  );

  const currentQuestion = questions[currentIndex];

  const router = useRouter();
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);

  const handlePauseConfirm = async () => {
    try {
      await pauseExam(() => {
        setIsPauseConfirmOpen(false);
        toast.success("Exam paused successfully.");
        router.replace(`/test/${testId}`);
      });
    } catch (err) {
      setIsPauseConfirmOpen(false);
      toast.error("Failed to pause exam. Please try again.");
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 top-20 z-60 bg-slate-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 top-20 right-0 z-70 w-full max-w-[320px] bg-white shadow-2xl md:hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="font-heading font-bold text-slate-800 flex items-center gap-2">
                  <LayoutGrid size={16} className="text-brand-primary" />
                  Question Palette
                </h3>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Section Switcher */}
                {sections.length > 1 && (
                  <div>
                    <p className="text-xs font-bold font-heading uppercase tracking-widest text-slate-400 mb-2">
                      Sections
                    </p>
                    <select
                      value={currentQuestion?.sectionId ?? ""}
                      onChange={(e) => {
                        const firstQIdx = questions.findIndex(
                          (q) => q.sectionId === e.target.value,
                        );
                        if (firstQIdx !== -1) {
                          goToQuestion(firstQIdx);
                          onClose();
                        }
                      }}
                      disabled={isSubmitting}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-heading font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors disabled:opacity-50"
                    >
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Question Grid */}
                <div>
                  <p className="text-xs font-bold font-heading uppercase tracking-widest text-slate-400 mb-2">
                    Questions
                  </p>
                  <div className="grid grid-cols-5 gap-3">
                    {questions.map((q, idx) => {
                      const qStatus = questionStatus[q.id];
                      const isCurrent = idx === currentIndex;

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            goToQuestion(idx);
                            onClose();
                          }}
                          disabled={isSubmitting}
                          className={cn(
                            "w-full aspect-square rounded-xl text-sm font-bold font-heading transition-all border flex items-center justify-center disabled:opacity-50",
                            isCurrent
                              ? "bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105"
                              : qStatus === "answered" ||
                                  qStatus === "answered_review"
                                ? "bg-green-50 border-green-200 text-green-600"
                                : qStatus === "marked_for_review"
                                  ? "bg-amber-50 border-amber-200 text-amber-600"
                                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300",
                          )}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <p className="text-xs font-bold font-heading uppercase tracking-widest text-slate-400 mb-2">
                    Legend
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-green-200 bg-green-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={12} className="text-green-600" />
                    </div>
                    <span className="text-sm font-sans font-medium text-slate-600">
                      Answered
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-amber-200 bg-amber-50 flex items-center justify-center shrink-0">
                      <Bookmark size={12} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-sans font-medium text-slate-600">
                      Marked for Review
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-brand-primary bg-brand-primary flex items-center justify-center shrink-0 text-white text-[10px] font-bold">
                      1
                    </div>
                    <span className="text-sm font-sans font-medium text-slate-600">
                      Current Question
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0" />
                    <span className="text-sm font-sans font-medium text-slate-600">
                      Unanswered
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 pb-8 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                <Button
                  className="w-full h-12 rounded-xl font-heading font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md flex items-center justify-center gap-2"
                  onClick={() => {
                    setShowSubmitDialog(true);
                    onClose();
                  }}
                  disabled={isSubmitting || isPausing || status !== "in_progress"}
                >
                  Submit Test
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 rounded-xl font-heading font-bold text-amber-700 border-amber-200 bg-white hover:bg-amber-50 flex items-center justify-center gap-2"
                  onClick={() => setIsPauseConfirmOpen(true)}
                  disabled={isSubmitting || isPausing || status !== "in_progress"}
                >
                  <Pause size={18} /> Pause Exam
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={isPauseConfirmOpen}
        title="Pause Test?"
        message="Your progress will be saved. You can resume this test later from the dashboard."
        onConfirm={handlePauseConfirm}
        onCancel={() => setIsPauseConfirmOpen(false)}
        isLoading={isPausing}
      />
    </>
  );
}
