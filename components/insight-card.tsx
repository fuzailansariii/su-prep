import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface InsightCardProps {
  title: string;
  description: string;
  buttonText?: string;
  className?: string;
}

export function InsightCard({
  title,
  description,
  buttonText = "Download Report",
  className,
}: InsightCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white",
        "bg-linear-to-r from-primary to-indigo-700",
        className,
      )}
    >
      {/* Overlay (for glass effect) */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 max-w-md space-y-3">
        <h3 className="text-lg font-semibold">{title}</h3>

        <p className="text-sm text-white/80">{description}</p>

        <Button variant={"secondary"} className="w-40 text-sm h-9">
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
