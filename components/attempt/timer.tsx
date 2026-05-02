"use client";
import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

type CountdownTimerProps = {
  endTime: number; // Date.now() + remainingSeconds * 1000
  onExpire?: () => void;
};

export default function CountdownTimer({
  endTime,
  onExpire,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(
    () => Math.max(0, Math.floor((endTime - Date.now()) / 1000)), // ✅ /1000
  );
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // keep onExpire ref fresh
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expiredRef.current = false; // reset on endTime change

    function update() {
      const secondsLeft = Math.max(
        0,
        Math.floor((endTime - Date.now()) / 1000),
      );
      setRemaining(secondsLeft);
      if (secondsLeft === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current?.();
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const secs = remaining % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  const isWarning = remaining <= 300;
  const isDanger = remaining <= 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-bold text-sm border",
        isDanger
          ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
          : isWarning
            ? "bg-orange-50 text-orange-600 border-orange-200"
            : "bg-brand-label text-brand-primary border-transparent",
      )}
    >
      <Timer className="size-4 shrink-0" />
      <span className="tabular-nums tracking-widest">
        {hours > 0 && `${pad(hours)}:`}
        {pad(minutes)}:{pad(secs)}
      </span>
    </div>
  );
}
