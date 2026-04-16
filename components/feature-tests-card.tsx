import { BarChart3, Clock, FileText } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";

export interface MockTest {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tags: { label: string; variant: "primary" | "green" }[];
  durationMins: number;
  questionCount: number;
  sections: string;
  price: number;
  originalPrice?: number;
}

interface FeaturedCardProps {
  test: MockTest;
}

export default function FeaturedCard({ test }: FeaturedCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-all duration-300">
      {/* Image Section */}
      <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-slate-100 overflow-hidden">
        <Image
          src={test.imageUrl}
          alt="Mock Test"
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {test.tags.map((tag, i) => (
              <span
                key={i}
                className={`text-xs font-bold px-2 py-1 rounded border uppercase ${
                  tag.variant === "primary"
                    ? "text-brand-primary bg-brand-primary/5 border-brand-primary/10"
                    : "text-green-600 bg-green-50 border-green-100"
                }`}
              >
                {tag.label}
              </span>
            ))}
          </div>

          <h3 className="text-xl font-bold font-heading text-black mb-2">
            {test.title}
          </h3>
          <p className="text-sm text-brand-muted/80 mb-4 line-clamp-2">
            {test.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-brand-muted/90 mb-4 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-primary/70" />
              <span>{test.durationMins} Mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-primary/70" />
              <span>{test.questionCount} Questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-brand-primary/70" />
              <span>{test.sections}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-black">₹{test.price}</span>
            {test.originalPrice && (
              <span className="text-sm text-brand-muted line-through">
                ₹{test.originalPrice}
              </span>
            )}
          </div>
          <Button className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl">
            Start Test
          </Button>
        </div>
      </div>
    </div>
  );
}
