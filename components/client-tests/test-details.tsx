import { CircleCheck, Clock, FileText, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type Test } from "@/src/db/schema/tests";
import { formatPrice } from "@/utils/format-price";

interface TestDetailProps {
  test: Test;
  hasPurchased?: boolean;
  attemptStatus?: "not_started" | "in_progress" | "completed";
  attemptId?: string;
  resultId?: string;
  totalSets?: number;
  calculatedQuestions?: number;
}

const whatsIncluded = [
  "Simulate Real Exam Environment",
  "Detailed Explanations",
  "Instant Performance Results",
];

export default function TestDetails({
  test,
  hasPurchased,
  attemptStatus = "not_started",
  attemptId,
  resultId,
  totalSets,
  calculatedQuestions,
}: TestDetailProps) {
  const discountPercent = test.originalPrice
    ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative pt-6 pb-16">
      {/* Left column */}
      <div className="flex flex-col flex-1 gap-6">
        <div>
          <span className="text-xs font-bold font-heading tracking-widest px-3 py-1.5 rounded-2xl border uppercase text-brand-muted bg-brand-label border-brand-primary/10">
            {test.difficulty}
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-black font-sans leading-tight">
          {test.title}
        </h2>

        <p className="text-base text-brand-muted/90 font-body leading-relaxed md:text-lg">
          {test.description}
        </p>

        {/* What's included */}
        <div className="mt-4 p-6 bg-brand-card/40 border border-slate-100 rounded-3xl flex flex-col gap-4">
          <h3 className="font-heading font-bold text-lg mb-2 text-black">
            What's included in this bundle
          </h3>
          {whatsIncluded.map((title, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 font-sans text-brand-muted font-medium text-base"
            >
              <CircleCheck size={20} className="text-brand-primary shrink-0" />
              <span>{title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right column — purchase card */}
      <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24 self-start">
        <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60">
          {/* Image */}
          <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
            {test.thumbnail ? (
              <Image
                src={test.thumbnail}
                alt={test.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                <FileText className="w-12 h-12" />
              </div>
            )}
          </div>

          {/* Card body */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
            {/* Price row */}
            {!hasPurchased && (
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="font-extrabold text-brand-price text-3xl font-sans">
                    {formatPrice(test.price)}
                  </span>
                  {test.originalPrice && (
                    <span className="text-sm text-brand-muted font-semibold line-through font-sans">
                      {formatPrice(test.originalPrice)}
                    </span>
                  )}
                </div>
                {discountPercent && discountPercent > 0 && (
                  <span className="text-xs font-bold font-heading text-green-700 bg-green-100 px-2.5 py-1 rounded-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {totalSets !== undefined && (
                <div className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl py-3 px-2 border border-slate-100 text-center">
                  <FileText size={18} className="text-brand-primary" />
                  <span className="text-[10px] font-bold text-brand-muted tracking-widest font-heading">
                    {totalSets} SETS
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl py-3 px-2 border border-slate-100 text-center">
                <CircleCheck size={18} className="text-brand-primary" />
                <span className="text-[10px] font-bold text-brand-muted tracking-widest font-heading">
                  {calculatedQuestions ?? test.totalQuestions} Qs
                </span>
              </div>
            </div>

            {/* Buy or Action button */}
            {hasPurchased ? (
              attemptStatus === "completed" ? (
                <Link
                  className="w-full py-4 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 font-bold text-lg font-heading transition-all shadow-sm active:scale-[0.98] cursor-pointer text-center block"
                  href={`/test/${test.id}`}
                >
                  Open Test
                </Link>
              ) : attemptStatus === "in_progress" ? (
                <Link
                  className="w-full py-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-lg font-heading transition-all shadow-sm active:scale-[0.98] cursor-pointer text-center block"
                  href={`/test/${test.id}`}
                >
                  Resume Test
                </Link>
              ) : (
                <Link
                  className="w-full py-4 rounded-xl bg-brand-button hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 font-bold text-lg font-heading transition-all shadow-sm active:scale-[0.98] cursor-pointer text-center block"
                  href={`/test/${test.id}`}
                >
                  Start Mock Test
                </Link>
              )
            ) : (
              <Link
                href={`/checkout/${test.id}`}
                className="w-full py-4 rounded-xl bg-brand-button hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 font-bold text-lg font-heading transition-all shadow-sm active:scale-[0.98] cursor-pointer text-center block"
              >
                Buy Now
              </Link>
            )}

            {!hasPurchased && (
              <div className="flex items-center justify-center gap-2 text-brand-muted/70 mt-2">
                <Lock size={14} />
                <span className="text-[10px] tracking-widest font-bold font-heading uppercase text-center">
                  Securely Processed by Razorpay
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
