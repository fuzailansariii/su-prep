"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Bookmark,
  LayoutGrid,
  CheckCircle2,
  Cloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useExamStore } from "@/store/exam-store";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import SectionDropdown from "@/components/attempt/section-dropdown";

export default function AttemptPage() {
  const { setId } = useParams<{ setId: string }>();
  const router = useRouter();

  const initExam = useExamStore((s) => s.initExam);
  const rehydrate = useExamStore((s) => s.rehydrate);
  const status = useExamStore((s) => s.status);
  const tickTimer = useExamStore((s) => s.tickTimer);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchedSetId = useRef<string | null>(null);

  useEffect(() => {
    if (fetchedSetId.current === setId) return;
    fetchedSetId.current = setId;

    setLoading(true);
    setError(null);

    axios
      .post("/api/attempt/start", { setId })
      .then((res) => {
        const data = res.data;
        if (data.isResuming) {
          rehydrate({
            attemptId: data.attemptId,
            setId: data.setId,
            testId: data.testId,
            setTitle: data.setTitle,
            testTitle: data.testTitle,
            questions: data.questions,
            sections: data.sections,
            timeRemaining: data.remainingSeconds,
            savedAnswers: data.savedAnswers,
            savedIndex: data.savedIndex,
          });
        } else {
          initExam({
            attemptId: data.attemptId,
            setId: data.setId,
            testId: data.testId,
            setTitle: data.setTitle,
            testTitle: data.testTitle,
            questions: data.questions,
            sections: data.sections,
            timeRemaining: data.remainingSeconds,
          });
        }
      })
      .catch((err) => {
        if (err instanceof AxiosError) {
          const status = err.response?.status;
          if (status === 409) {
            setError("You have already completed this set.");
          } else if (status === 403) {
            setError("You have not purchased this test.");
          } else {
            setError(err.response?.data?.error ?? "Failed to start exam.");
          }
        } else {
          setError("Something went wrong. Please try again.");
        }
      })
      .finally(() => setLoading(false));
  }, [setId]);

  useEffect(() => {
    if (status !== "in_progress") return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [status, tickTimer]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        <p className="text-sm text-slate-500 font-sans">
          Preparing your exam...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 text-center px-4">
        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-800 mb-1">
            Cannot start exam
          </h2>
          <p className="text-sm text-slate-500 font-sans max-w-sm">{error}</p>
        </div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="rounded-xl font-heading font-bold"
        >
          Go Back
        </Button>
      </div>
    );
  }

  return <ExamShell />;
}

function ExamShell() {
  const {
    questions,
    currentIndex,
    sections,
    answers,
    markedForReview,
    questionStatus,
    goToQuestion,
    goToNext,
    goToPrev,
    selectAnswer,
    toggleReview,
    isSubmitting,
    setShowSubmitDialog,
  } = useExamStore(
    useShallow((s) => ({
      questions: s.questions,
      currentIndex: s.currentQuestionIndex,
      sections: s.sections,
      answers: s.answers,
      markedForReview: s.markedForReview,
      questionStatus: s.questionStatus,
      goToQuestion: s.goToQuestion,
      goToNext: s.goToNext,
      goToPrev: s.goToPrev,
      selectAnswer: s.selectAnswer,
      toggleReview: s.toggleReview,
      isSubmitting: s.isSubmitting,
      setShowSubmitDialog: s.setShowSubmitDialog,
    })),
  );

  const currentQuestion = questions[currentIndex];
  const attemptedCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress = (attemptedCount / totalQuestions) * 100;

  // Find current section
  const currentSection = sections.find(
    (s) => s.id === currentQuestion?.sectionId,
  );

  return (
    <div className="flex flex-col flex-1 bg-white select-none overflow-hidden">
      {/* ─── Sub-Header: Sections & Navigation ─── */}
      <div className="bg-brand-label border-b border-slate-100">
        {/* Question nav + prev/next */}
        <div className="px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Section Dropdown (all screen sizes) */}
          <SectionDropdown
            sections={sections}
            questions={questions}
            currentQuestion={currentQuestion}
            isSubmitting={isSubmitting}
            goToQuestion={goToQuestion}
          />

          {/* Desktop Pagination — question number pills */}
          <div className="hidden md:flex items-center gap-1.5 flex-1 max-w-md lg:max-w-2xl overflow-x-auto px-4 no-scrollbar scroll-smooth mx-auto">
            {questions.map((q, idx) => {
              const status = questionStatus[q.id];
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  id={`q-nav-${idx}`}
                  onClick={() => goToQuestion(idx)}
                  ref={(el) => {
                    if (isCurrent && el) {
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "center",
                      });
                    }
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold font-heading transition-all border flex items-center justify-center shrink-0",
                    isCurrent
                      ? "bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20 scale-110 z-10"
                      : status === "answered" || status === "answered_review"
                        ? "bg-green-50 border-green-200 text-green-600"
                        : status === "marked_for_review"
                          ? "bg-amber-50 border-amber-200 text-amber-600"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300",
                  )}
                  disabled={isSubmitting}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrev}
              disabled={currentIndex === 0 || isSubmitting}
              className="h-9 px-3 rounded-xl border-slate-200 font-heading font-bold text-slate-600 hover:bg-white hover:text-brand-primary"
            >
              <ChevronLeft size={16} className="mr-1" /> Previous
            </Button>
            <Button
              size="sm"
              onClick={goToNext}
              disabled={currentIndex === questions.length - 1 || isSubmitting}
              className="h-9 px-4 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-heading font-bold"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative pb-32">
        {/* Attempted Progress Bar */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5">
          <h2 className="text-[10px] text-center font-black uppercase tracking-widest text-slate-400">
            Attempted {attemptedCount}/{totalQuestions}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 mt-5 gap-10">
            {/* Left Column: Question */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-heading font-bold uppercase tracking-wider rounded-lg">
                  Question {currentIndex + 1}
                </span>
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                  Single Choice
                </span>
              </div>

              <h1 className="text-lg font-sans font-bold text-slate-800 leading-snug">
                {currentQuestion?.questionText}
              </h1>
            </div>

            {/* Right Column: Options */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-sm font-heading font-bold text-slate-800">
                  Select an option
                </h3>
                <p className="text-sm text-slate-400 font-sans mt-1">
                  Read all choices carefully before confirming.
                </p>
              </div>

              <div className="space-y-3">
                {currentQuestion?.options.map((option: any) => {
                  const isSelected = answers[currentQuestion.id]?.includes(
                    option.id,
                  );

                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        selectAnswer(currentQuestion.id, [option.id])
                      }
                      disabled={isSubmitting}
                      className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-left group",
                        isSelected
                          ? "bg-brand-primary/5 border-brand-primary shadow-sm"
                          : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                          isSelected
                            ? "border-brand-primary bg-brand-primary"
                            : "border-slate-300 group-hover:border-slate-400",
                        )}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium font-sans leading-relaxed",
                          isSelected ? "text-slate-900" : "text-slate-600",
                        )}
                      >
                        {option.optionText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Bottom Bar ─── */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-transparent pointer-events-none z-50">
        <div className="max-w-7xl mx-auto flex items-end justify-end gap-4 pointer-events-auto">
          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={() => toggleReview(currentQuestion.id)}
              disabled={isSubmitting}
              className={cn(
                "flex-1 sm:flex-none h-10 px-4 rounded-lg font-heading font-bold text-sm transition-all border-2",
                markedForReview[currentQuestion.id]
                  ? "bg-amber-50 border-amber-400 text-amber-700 hover:bg-amber-100"
                  : "bg-white border-slate-200 text-slate-700 hover:border-brand-primary hover:text-brand-primary",
              )}
            >
              <Bookmark
                className={cn(
                  "w-5 h-5 mr-2",
                  markedForReview[currentQuestion.id] && "fill-current",
                )}
              />
              Mark for Review
            </Button>
            <Button
              size="lg"
              onClick={() => {
                if (currentIndex === questions.length - 1) {
                  setShowSubmitDialog(true);
                } else {
                  goToNext();
                }
              }}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none h-10 px-4 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-heading font-bold text-sm shadow-xl shadow-brand-primary/20"
            >
              {currentIndex === questions.length - 1
                ? "Submit Exam"
                : "Save & Next"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
