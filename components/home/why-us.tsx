import { LucideIcon } from "lucide-react";
import Container from "../container";
import { FeatureCard } from "../feature-card";

interface WhyUsProps {
  title: string;
  description: string;
  features: {
    title: string;
    description: string;
    icon: LucideIcon;
  }[];
}

export default function WhyUs({ title, description, features }: WhyUsProps) {
  return (
    <Container className="flex flex-col gap-10 md:gap-14 py-0 md:py-0 lg:py-0">
      <div className="text-center mx-auto">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-black mb-4">
          {title}
        </h2>
        <p className="text-brand-muted/90 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </Container>
  );
}
