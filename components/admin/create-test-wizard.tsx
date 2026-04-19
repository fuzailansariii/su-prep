"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Step, StepIndicator } from "./create-tests/step-indicator";
import { TestDetailsStep } from "./create-tests/step-one";
import { AddQuestionsStep } from "./create-tests/step-two";

export interface CreatedTest {
  id: string;
  title: string;
}

// ─────────────────────────────────────────────
// Main Wizard
// ─────────────────────────────────────────────
export default function CreateTestWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [createdTest, setCreatedTest] = useState<CreatedTest | null>(null);

  const handleTestCreated = (test: CreatedTest) => {
    setCreatedTest(test);
    setStep("questions");
  };

  const handleComplete = () => {
    setStep("done");
    setTimeout(() => router.push("/admin/tests"), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black font-heading text-slate-900">
            Create New Test
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-body">
            Set up your mock test in two quick steps.
          </p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} />

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8">
          {step === "details" && (
            <TestDetailsStep onCreated={handleTestCreated} />
          )}
          {step === "questions" && createdTest && (
            <AddQuestionsStep test={createdTest} onComplete={handleComplete} />
          )}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-11 h-11 text-brand-primary" />
              </div>
              <p className="text-xl font-black font-heading text-slate-900">
                All done!
              </p>
              <p className="text-sm text-slate-500">
                Redirecting you to the tests list...
              </p>
              <Loader2 className="w-5 h-5 animate-spin text-brand-primary mt-2" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
