"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight, BookOpen, Loader2, ServerCrash } from "lucide-react";

import CountdownTimer from "@/components/attempt/timer";
import ProgressBar from "@/components/attempt/progress-bar";
import QuestionCard from "@/components/attempt/question-card";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";

// ─── Types ───────────────────────────────────────────────────────────────────

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

type FetchState = "loading" | "error" | "ready";

// ─── Component ───────────────────────────────────────────────────────────────

interface AttemptClientProps {
  testId: string;
  attemptId: string;
}

export default function AttemptClient({
  attemptId,
  testId,
}: AttemptClientProps) {
  const router = useRouter();

  // ── Fetch state ──
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [endTime, setEndTime] = useState(0);

  // ── Quiz state ──
  const [currentIndex, setCurrentIndex] = useState(0);
  // answers: { [questionId]: string[] }
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAutoSubmitted = useRef(false);

  // ── Fetch questions + remaining time on mount ──
  useEffect(() => {
    let cancelled = false;

    async function fetchAttempt() {
      try {
        const { data } = await axios.get(`/api/attempt/${attemptId}`);
        if (cancelled) return;
        setQuestions(data.questions);
        setEndTime(Date.now() + data.remainingSeconds * 1000);
        setFetchState("ready");
      } catch (err) {
        if (cancelled) return;
        const msg =
          axios.isAxiosError(err)
            ? (err.response?.data?.error ?? "Failed to load test")
            : "Something went wrong";
        toast.error(msg);
        setFetchState("error");
      }
    }

    fetchAttempt();
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  // ── Submit handler ──
  const handleSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (isSubmitting || hasAutoSubmitted.current) return;
      hasAutoSubmitted.current = true;
      setIsSubmitting(true);

      try {
        // Build payload: array of { questionId, selectedOptionIds }
        const payload = questions.map((q) => ({
          questionId: q.id,
          selectedOptionIds: answers[q.id] ?? [],
        }));

        const { data } = await axios.post(
          `/api/attempt/${attemptId}/submit`,
          { answers: payload }
        );

        if (isAutoSubmit) {
          toast.info("Time's up! Test submitted automatically.");
        } else {
          toast.success("Test submitted successfully!");
        }

        router.push(`/test/${testId}/result/${data.resultId}`);
      } catch (err) {
        hasAutoSubmitted.current = false; // allow retry
        setIsSubmitting(false);
        const msg =
          axios.isAxiosError(err)
            ? (err.response?.data?.error ?? "Submission failed")
            : "Something went wrong";
        toast.error(msg);
      }
    },
    [answers, attemptId, isSubmitting, questions, router, testId]
  );

  // ── Option select handler ──
  const handleSelect = useCallback(
    (optionId: string) => {
      const q = questions[currentIndex];
      if (!q) return;

      setAnswers((prev) => {
        const current = prev[q.id] ?? [];

        if (q.type === "mcq" || q.type === "truefalse") {
          // Single-select — toggle off if same option clicked
          return {
            ...prev,
            [q.id]: current[0] === optionId ? [] : [optionId],
          };
        } else {
          // Multi-select — toggle membership
          const exists = current.includes(optionId);
          return {
            ...prev,
            [q.id]: exists
              ? current.filter((id) => id !== optionId)
              : [...current, optionId],
          };
        }
      });
    },
    [currentIndex, questions]
  );

  // ── Navigation ──
  const isLast = currentIndex === questions.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const currentQuestion = questions[currentIndex];

  // ───────────────────────────────────────────────────────────────────────────
  // Loading state
  // ───────────────────────────────────────────────────────────────────────────
  if (fetchState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-brand-muted">
          <Loader2 className="size-10 animate-spin text-brand-primary" />
          <p className="font-heading font-semibold text-sm">
            Loading your test…
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-xs">
          <ServerCrash className="size-12 text-destructive" />
          <h2 className="font-heading font-bold text-lg">
            Could not load the test
          </h2>
          <p className="text-sm text-brand-muted">
            There was a problem fetching your questions. Please go back and try
            again.
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/test/${testId}`)}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Ready — render quiz
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F2F3FF] flex flex-col">
      {/* ── Sticky Header ── */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border">
        <Container className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="size-4 shrink-0 text-brand-primary" />
            <span className="font-heading font-bold text-sm text-brand-primary truncate">
              In Progress
            </span>
          </div>
          <CountdownTimer
            endTime={endTime}
            onExpire={() => handleSubmit(true)}
          />
        </Container>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1">
        <Container className="max-w-2xl flex flex-col gap-5 py-6">
          {/* Progress bar */}
          <ProgressBar
            current={currentIndex + 1}
            total={questions.length}
          />

          {/* Question card */}
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              selectedIds={answers[currentQuestion.id] ?? []}
              onSelect={handleSelect}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-end gap-3">
            {isLast ? (
              <Button
                id="submit-test-btn"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="bg-brand-primary hover:bg-brand-primary-hover font-heading font-semibold h-11 px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Test"
                )}
              </Button>
            ) : (
              <Button
                id="next-question-btn"
                onClick={handleNext}
                className="bg-brand-primary hover:bg-brand-primary-hover font-heading font-semibold h-11 px-6"
              >
                Next
                <ArrowRight className="size-4 ml-1" />
              </Button>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
