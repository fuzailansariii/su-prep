import { FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { formatPrice } from "@/utils/format-price";
import { type Test } from "@/src/db/schema/tests";

interface TestCardProps {
  test: Test;
}

export default function TestCard({ test }: TestCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-all duration-300">
      {/* Image Section */}
      <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-slate-100 overflow-hidden">
        {test.thumbnail ? (
          <Image
            src={test.thumbnail}
            alt={test.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
            <FileText className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 px-3 py-4 md:px-10 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Tag & Price */}
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-bold font-heading tracking-widest px-2 py-1 rounded-2xl border uppercase text-brand-muted bg-brand-label border-brand-primary/10">
                {test.difficulty}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-brand-price text-xl font-sans">
                  {formatPrice(test.price)}
                </span>
                {test.originalPrice && (
                  <span className="text-sm text-brand-muted font-semibold line-through font-sans">
                    {formatPrice(test.originalPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold font-sans text-black mb-2">
            {test.title}
          </h3>
          <p className="text-sm font-body text-brand-muted/80 mb-3 line-clamp-2">
            {test.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-brand-muted/90 mb-3 font-medium font-body">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-brand-primary/70" />
              <span>{test.totalQuestions} Questions</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-4 w-full">
          <Button
            asChild
            variant={"outline"}
            className="w-full bg-brand-button h-10 font-heading text-sm text-brand-primary font-bold"
          >
            <Link href={`/mock-tests/${test.id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
