import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-2">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-semibold font-heading text-black mb-2">
          {title}
        </h3>
        <p className="text-brand-muted/90 font-sans leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
