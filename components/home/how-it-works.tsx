import React from "react";
import StepLayout from "../step-layout";
import Container from "../container";
import { CreditCard, LucideIcon, PlayCircle, UserPlus } from "lucide-react";

interface HowItWorksProps {
  title?: string;
  description?: string;
  steps?: {
    step: string;
    title: string;
    description: string;
    icon: LucideIcon;
  }[];
}

export default function HowItWorks({
  title,
  description,
  steps,
}: HowItWorksProps) {
  return (
    <Container className="flex flex-col gap-10 md:gap-16 py-0 md:py-0 lg:py-0">
      <div className="text-center mx-auto max-w-3xl">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-black mb-4">
          {title}
        </h2>
        <p className="text-brand-muted/90 text-base md:text-lg leading-relaxed">
         {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
        {steps?.map((step) => (
          <StepLayout
            key={step.step}
            step={step.step}
            title={step.title}
            description={step.description}
            icon={step.icon}
          />
        ))}
      </div>
    </Container>
  );
}
