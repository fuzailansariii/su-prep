"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { Menu, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/store/exam-store";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CountdownTimer from "@/components/attempt/timer";
import logo from "@/public/su-cropped.png";
import Image from "next/image";

export default function TopBar({
  onMenuClick,
  isLoading,
}: {
  onMenuClick?: () => void;
  isLoading?: boolean;
}) {
  const router = useRouter();

  const testTitle = useExamStore((s) => s.testTitle);
  const setTitle = useExamStore((s) => s.setTitle);
  const attemptId = useExamStore((s) => s.attemptId);
  const answers = useExamStore((s) => s.answers);
  const timeTaken = useExamStore((s) => s.timeTaken);
  const isSubmitting = useExamStore((s) => s.isSubmitting);
  const submitExam = useExamStore((s) => s.submitExam);
  const timeRemaining = useExamStore((s) => s.timeRemaining);
  const status = useExamStore((s) => s.status);
  const showSubmitDialog = useExamStore((s) => s.showSubmitDialog);
  const setShowSubmitDialog = useExamStore((s) => s.setShowSubmitDialog);
  const pauseExam = useExamStore((s) => s.pauseExam);
  const isPausing = useExamStore((s) => s.isPausing);
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);
  const testId = useExamStore((s) => s.testId);

  const handleSubmitConfirm = async () => {
    if (!attemptId) {
      toast.error("Invalid attempt session. Please refresh.");
      return;
    }

    submitExam(); // sets isSubmitting: true in store
    setShowSubmitDialog(false); // Close dialog immediately

    try {
      const answersPayload = (useExamStore.getState().questions || []).map(
        (q) => ({
          questionId: q.id,
          selectedOptionIds: answers[q.id] || [],
        }),
      );

      const res = await axios.post(`/api/attempt/${attemptId}/submit`, {
        answers: answersPayload,
        timeTaken,
      });

      toast.success("Exam submitted successfully!");
      router.replace(`/results/${res.data.resultId}`);
    } catch (err) {
      console.error("Submit failed:", err);
      toast.error(
        "Submission failed. Please check your connection and try again.",
      );
      // Don't leave user stuck — reset submitting state
      useExamStore.setState({ isSubmitting: false, status: "in_progress" });
    }
  };

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
      <header className="sticky top-0 z-40 bg-[#F9FAFF] border-b border-slate-100 px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-5">
          <Image src={logo} alt="SU Tests" height={40} width={40} />
          <div className="hidden md:flex md:flex-col">
            <span className="text-sm font-heading font-bold text-slate-800 truncate">
              {testTitle}
            </span>
            <span className="text-xs font-sans font-medium truncate">
              {setTitle}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <CountdownTimer
            seconds={timeRemaining}
            onExpire={() => {
              if (status === "in_progress") {
                handleSubmitConfirm();
              }
            }}
            variant="lavender"
          />

          <Button
            size="sm"
            variant="outline"
            className="h-10 px-3 rounded-xl font-heading font-bold text-xs border-amber-200 text-amber-700 hover:bg-amber-50 hidden md:flex items-center gap-2"
            onClick={() => setIsPauseConfirmOpen(true)}
            disabled={
              isSubmitting || isPausing || isLoading || status !== "in_progress"
            }
          >
            <Pause size={14} /> Pause
          </Button>

          <Button
            size="lg"
            className="h-10 px-5 rounded-xl font-heading font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/25 flex"
            onClick={() => setShowSubmitDialog(true)}
            disabled={
              isSubmitting || isPausing || isLoading || status !== "in_progress"
            }
          >
            Submit Test
          </Button>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      <ConfirmDialog
        open={showSubmitDialog}
        title="Submit Test?"
        message="Are you sure you want to finalise and submit your test? You won't be able to change your answers after this."
        onConfirm={handleSubmitConfirm}
        onCancel={() => setShowSubmitDialog(false)}
        isLoading={isSubmitting}
      />

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
