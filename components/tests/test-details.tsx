import React from "react";
import type { MockTest } from "../feature-tests-card";
import {
  BookText,
  CircleCheck,
  Clock,
  FileText,
  Lock,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";

interface TestDetialProps {
  test: MockTest;
}

const whatsIncluded = [
  "Simulate Real Exam Environment",
  "Detailed Explanations",
  "Instant Performance Results",
];

export default function TestDetails({ test }: TestDetialProps) {
  const discountPercent = test.originalPrice
    ? Math.round(((test.originalPrice - test.price) / test.originalPrice) * 100)
    : null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative pt-6 pb-16">
      {/* Left column */}
      <div className="flex flex-col flex-1 gap-6">
        <div>
          <span className="text-xs font-bold font-heading tracking-widest px-3 py-1.5 rounded-2xl border uppercase text-brand-muted bg-brand-label border-brand-primary/10">
            {test.tags}
          </span>
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-black font-sans leading-tight">
          {test.title}
        </h2>

        <p className="text-base text-brand-muted/90 font-body leading-relaxed md:text-lg">
          {test.description}
        </p>

        {/* <div className="flex flex-wrap gap-8 items-center font-medium font-body text-base text-brand-muted/90 mt-2">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-brand-primary" />
            <span>{test.durationMins} Mins</span>
          </div>
          <div className="flex items-center gap-2">
            <BookText size={18} className="text-brand-primary" />
            <span>{test.questionCount} Questions</span>
          </div>
        </div> */}

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
      <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-24 self-start">
        <div className="rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/60">
          {/* Image */}
          <div className="relative w-full h-52 bg-slate-100 overflow-hidden">
            <Image
              src={test.imageUrl}
              alt="Mock Test"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Card body */}
          <div className="p-6 md:p-8 flex flex-col gap-6">
            {/* Price row */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-brand-price text-3xl font-sans">
                  ₹{test.price}
                </span>
                {test.originalPrice && (
                  <span className="text-sm text-brand-muted font-semibold line-through font-sans">
                    ₹{test.originalPrice}
                  </span>
                )}
              </div>
              {discountPercent && (
                <span className="text-xs font-bold font-heading text-green-700 bg-green-100 px-2.5 py-1 rounded-md">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl py-4 px-2 border border-slate-100">
                <Clock size={20} className="text-brand-primary" />
                <span className="text-[11px] font-bold text-brand-muted tracking-widest font-heading">
                  {test.durationMins} MINS
                </span>
              </div>
              <div className="flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl py-4 px-2 border border-slate-100">
                <FileText size={20} className="text-brand-primary" />
                <span className="text-[11px] font-bold text-brand-muted tracking-widest font-heading">
                  {test.questionCount} QS
                </span>
              </div>
            </div>

            {/* Buy button */}
            <button className="w-full py-4 rounded-xl bg-brand-button hover:bg-brand-primary text-brand-primary hover:text-white border border-brand-primary/20 font-bold text-lg font-heading transition-all shadow-sm active:scale-[0.98] cursor-pointer">
              Buy Now
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-2 text-brand-muted/70 mt-2">
              <Lock size={14} />
              <span className="text-[10px] tracking-widest font-bold font-heading uppercase text-center">
                Secure Encrypted Payment
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
