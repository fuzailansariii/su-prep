"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

type Props = {
  testId: string;
  setId: string;
};

export default function StartSetButton({ testId, setId }: Props) {
  const router = useRouter();

  const handleStart = () => {
    router.push(`/${setId}`);
  };

  return (
    <Button
      onClick={handleStart}
      className="w-full h-10 text-lg font-heading font-bold rounded-xl shadow-md shadow-brand-primary/20 bg-brand-primary hover:bg-brand-primary/90 text-white"
    >
      <PlayCircle className="size-4 mr-1.5" />
      <span>Start Set</span>
    </Button>
  );
}
