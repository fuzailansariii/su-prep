"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/store/exam-store";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import CountdownTimer from "@/components/attempt/timer";
import logo from "@/public/su-cropped.png";
import Image from "next/image";

export default function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();

  const testTitle = useExamStore((s) => s.testTitle);
  const setTitle = useExamStore((s) => s.setTitle);
  const attemptId = useExamStore((s) => s.attemptId);
  const answers = useExamStore((s) => s.answers);
  const timeTaken = useExamStore((s) => s.timeTaken);
  const isSubmitting = useExamStore((s) => s.isSubmitting);
  const submitExam = useExamStore((s) => s.submitExam);
  const timeRemaining = useExamStore((s) => s.timeRemaining);

  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const handleSubmitConfirm = async () => {
    if (!attemptId) return;
    submitExam(); // sets isSubmitting: true in store

    try {
      const answersPayload = Object.entries(answers).map(
        ([questionId, selectedOptionIds]) => ({
          questionId,
          selectedOptionIds,
        }),
      );

      const res = await axios.post(`/api/attempt/${attemptId}/submit`, {
        answers: answersPayload,
        timeTaken,
      });

      router.replace(`/results/${res.data.resultId}`);
    } catch (err) {
      console.error("Submit failed:", err);
      // Don't leave user stuck — reset submitting state
      useExamStore.setState({ isSubmitting: false, status: "in_progress" });
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
        <div className="flex items-center gap-4 shrink-0">
          <CountdownTimer
            seconds={timeRemaining}
            onExpire={handleSubmitConfirm}
            variant="lavender"
          />

          <Button
            size="lg"
            className="h-10 px-5 rounded-xl font-heading font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/25 hidden md:flex"
            onClick={() => setShowSubmitDialog(true)}
            disabled={isSubmitting}
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
    </>
  );
}
