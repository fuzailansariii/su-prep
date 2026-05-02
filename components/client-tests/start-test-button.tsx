"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type Props = {
  testId: string;
  isResuming: boolean;
};

export default function StartTestButton({ testId, isResuming }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/attempt/start", { testId });
      router.push(`/test/${testId}/attempt?attemptId=${data.attemptId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to start test");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStart}
      disabled={loading}
      className="bg-brand-primary cursor-pointer flex items-center w-full h-10 text-base font-heading hover:bg-brand-primary-hover"
    >
      <span>
        {loading ? "Please wait..." : isResuming ? "Resume Test" : "Start Test"}
      </span>
      <ArrowRight className="size-4" />
    </Button>
  );
}
