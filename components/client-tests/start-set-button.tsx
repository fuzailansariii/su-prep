"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

type Props = {
  testId: string;
  setId: string;
};

export default function StartSetButton({ testId, setId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/attempt/start", {
        testId,
        setId,
      });
      router.push(`/test/${testId}/attempt?attemptId=${data.attemptId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Failed to start set");
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
      className="w-full font-heading font-bold rounded-xl shadow-md shadow-brand-primary/20 bg-brand-primary hover:bg-brand-primary/90 text-white"
    >
      <PlayCircle className="w-4 h-4 mr-1.5" />
      <span>{loading ? "Starting..." : "Start Set"}</span>
    </Button>
  );
}
