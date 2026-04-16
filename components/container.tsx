import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto py-12 md:py-14 lg:py-16 px-5 md:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
