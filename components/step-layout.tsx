import { LucideIcon } from "lucide-react";
import React from "react";

interface StepLayoutProps {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function StepLayout({
  step,
  title,
  description,
  icon: Icon,
}: StepLayoutProps) {
  return (
    <div className="flex flex-col items-center text-center group">
      <div className="w-16 h-16 rounded-full bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-center text-brand-primary transition-all duration-300 relative mb-6 z-10 group-hover:-translate-y-1 group-hover:bg-brand-primary/10 group-hover:shadow-md">
        <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-primary text-white text-sm font-bold flex items-center justify-center shadow-sm">
          {step}
        </span>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold font-sans text-black mb-3">{title}</h3>
      <p className="text-brand-muted/80 leading-relaxed max-w-[280px]">
        {description}
      </p>
    </div>
  );
}
