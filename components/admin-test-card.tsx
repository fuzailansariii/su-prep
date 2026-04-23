import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Star,
} from "lucide-react";
import { StatRowItem } from "./ui/stat-row-item";
import { Image } from "@imagekit/next";
import { StatusBadge } from "./ui/status-badge";
import { DifficultyBadge } from "./ui/difficulty-badge";
import { formatPrice } from "@/utils/format-price";
import type { Test } from "@/src/db/schema";
import Link from "next/link";

export function AdminTestCard({ test }: { test: Test }) {
  const priceDisplay = test.price === 0 ? "Free" : formatPrice(test.price);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all group">
      {/* Top row */}
      <div className="flex gap-4 mb-3">
        {test.thumbnail && (
          <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
            <Image
              src={test.thumbnail}
              alt=""
              width={200}
              height={200}
              quality={70}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <StatusBadge status={test.status} />
            <DifficultyBadge difficulty={test.difficulty} />
            {test.isFeatured && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold font-heading bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-lg px-2 py-0.5">
                <Star className="w-3 h-3 fill-current" /> Featured
              </span>
            )}
          </div>
          <h3 className="text-base font-bold font-heading text-slate-900 truncate group-hover:text-brand-primary transition-colors">
            {test.title}
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-black font-heading text-brand-primary">
              {priceDisplay}
            </p>
            {test.originalPrice && test.originalPrice > test.price && (
              <p className="text-sm text-slate-400 line-through font-medium">
                ₹{(test.originalPrice / 100).toLocaleString("en-IN")}
              </p>
            )}
          </div>
        </div>
      </div>

      {test.description && (
        <p className="text-xs text-slate-400 mb-4 line-clamp-2 font-sans">
          {test.description}
        </p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 flex-wrap border-t border-slate-100 pt-3">
        <StatRowItem icon={Clock} value={`${test.duration} mins`} />
        <StatRowItem
          icon={BookOpen}
          value={`${test.totalQuestions} questions`}
        />
        <StatRowItem icon={CheckCircle2} value={`${test.totalMarks} marks`} />

        {test.negativeMarking && (
          <span className="text-[11px] bg-red-50 text-red-600 border border-red-100 rounded-md px-1.5 py-0.5 font-heading font-bold">
            {(test.negativeMarkFraction ?? 25) / 100} neg
          </span>
        )}

        <span className="ml-auto text-[11px] text-slate-300 font-sans">
          {new Date(test.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
        <Link
          href={`/admin/tests/${test.id}/questions`}
          className="flex items-center gap-1.5 text-xs font-bold font-heading text-slate-500 hover:text-brand-primary transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Questions
        </Link>
        <span className="text-slate-200">·</span>
        <Link
          href={`/admin/tests/${test.id}/edit`}
          className="flex items-center gap-1.5 text-xs font-bold font-heading text-slate-500 hover:text-brand-primary transition-colors"
        >
          Edit
        </Link>
        <div className="ml-auto">
          <Link
            href={`/admin/tests/${test.id}`}
            className="flex items-center gap-1 text-xs font-bold font-heading text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
