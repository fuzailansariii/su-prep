"use client";

import { useEffect, useRef } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

type CountdownTimerProps = {
  seconds: number;
  onExpire?: () => void;
  variant?: "default" | "lavender";
};

export default function CountdownTimer({
  seconds,
  onExpire,
  variant = "lavender",
}: CountdownTimerProps) {
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  // Keep onExpire ref fresh
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Trigger expiration only once when seconds hit 0
  useEffect(() => {
    if (seconds <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpireRef.current?.();
    } else if (seconds > 0) {
      expiredRef.current = false;
    }
  }, [seconds]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const parts = [];
    if (h > 0) parts.push(h.toString().padStart(2, "0"));
    parts.push(m.toString().padStart(2, "0"));
    parts.push(s.toString().padStart(2, "0"));

    return parts.join(":");
  };

  const isLowTime = seconds > 0 && seconds < 300; // 5 minutes

  if (variant === "lavender") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm",
          isLowTime
            ? "bg-red-100 text-red-600 animate-pulse"
            : "bg-[#E0E7FF] text-[#1E1B4B]",
        )}
      >
        <Timer
          className={cn(
            "w-5 h-5",
            isLowTime ? "text-red-500" : "text-[#4338CA]",
          )}
        />
        <span className="font-sans font-black text-sm tabular-nums tracking-wider min-w-[85px]">
          {formatTime(seconds)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all duration-300",
        isLowTime
          ? "bg-red-50 border-red-200 text-red-600 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-pulse"
          : "bg-slate-50 border-slate-200 text-slate-700 shadow-sm",
      )}
    >
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-1.5">
          <Timer
            className={cn(
              "w-4 h-4",
              isLowTime ? "text-red-500" : "text-slate-400",
            )}
          />
          <span className="font-mono font-bold text-base tabular-nums tracking-tight min-w-[70px]">
            {formatTime(seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
