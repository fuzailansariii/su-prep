import { FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { formatPrice } from "@/utils/format-price";
import { type Test } from "@/src/db/schema/tests";

interface TestCardProps {
  test: Test;
  totalSets?: number;
  calculatedQuestions?: number;
}

export default function TestCard({
  test,
  totalSets,
  calculatedQuestions,
}: TestCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-200/80 overflow-hidden flex flex-col sm:flex-row group transition-all duration-300">
      {/* Image Section */}
      <div className="relative w-full sm:w-56 md:w-64 h-48 sm:h-auto shrink-0 bg-slate-100 overflow-hidden">
        {test.thumbnail ? (
          <Image
            src={test.thumbnail}
            alt={test.title}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
            <FileText className="w-10 h-10" />
          </div>
        )}
        <div className="absolute top-3 left-3 sm:hidden">
          <span className="text-[10px] font-bold font-heading tracking-widest px-2.5 py-1 rounded-full border uppercase text-brand-primary bg-white/95 backdrop-blur-md shadow-xs border-slate-200">
            {test.difficulty}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-5 sm:p-6 md:p-7 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="hidden sm:inline-block text-[10px] font-bold font-heading tracking-widest px-2.5 py-1 rounded-full border uppercase text-brand-muted bg-brand-label border-brand-primary/10">
              {test.difficulty}
            </span>
            <div className="flex items-baseline gap-2 ml-auto">
              <span className="font-extrabold text-brand-price text-xl font-sans">
                {formatPrice(test.price)}
              </span>
              {test.originalPrice && (
                <span className="text-xs text-slate-400 font-semibold line-through font-sans">
                  {formatPrice(test.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 mb-2 group-hover:text-brand-primary transition-colors leading-snug">
            {test.title}
          </h3>
          <p className="text-xs sm:text-sm font-sans text-slate-500 mb-4 line-clamp-2 leading-relaxed">
            {test.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium font-sans">
            {totalSets !== undefined && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <FileText className="w-3.5 h-3.5 text-brand-primary" />
                <span>{totalSets} Sets</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <FileText className="w-3.5 h-3.5 text-brand-primary" />
              <span>
                {calculatedQuestions ?? test.totalQuestions} Questions
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 w-full">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-1/2 h-10 font-heading text-xs sm:text-sm text-slate-700 hover:text-brand-primary font-bold rounded-xl border-slate-200"
          >
            <Link href={`/mock-tests/${test.id}`}>View Details</Link>
          </Button>
          <Button
            asChild
            variant="default"
            className="w-full sm:w-1/2 h-10 font-heading text-xs sm:text-sm text-white font-bold bg-brand-primary hover:bg-brand-primary-hover rounded-xl shadow-xs"
          >
            <Link href={`/checkout/${test.id}`}>Buy Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
