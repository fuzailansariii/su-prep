import { Clock, FileText, Play, RotateCcw, Trophy } from "lucide-react";
import { Image } from "@imagekit/next";
import Link from "next/link";
import { Button } from "./ui/button";
import { type Test } from "@/src/db/schema/tests";

type AttemptStatus = "not_started" | "in_progress" | "completed";

interface PurchasedTestCardProps {
  test: Test;
  attemptStatus: AttemptStatus;
  attemptId?: string;
  resultId?: string;
  score?: number;
}

export default function PurchasedTestCard({
  test,
  attemptStatus,
  attemptId,
  resultId,
  score,
}: PurchasedTestCardProps) {
  const statusBadge = {
    not_started: (
      <span className="text-[10px] font-bold font-heading tracking-widest px-2 py-1 rounded-2xl bg-slate-100 text-slate-600">
        NOT STARTED
      </span>
    ),
    in_progress: (
      <span className="text-[10px] font-bold font-heading tracking-widest px-2 py-1 rounded-2xl bg-amber-100 text-amber-700">
        IN PROGRESS
      </span>
    ),
    completed: (
      <span className="text-[10px] font-bold font-heading tracking-widest px-2 py-1 rounded-2xl bg-green-100 text-green-700">
        COMPLETED
      </span>
    ),
  }[attemptStatus];

  const actionButton = {
    not_started: (
      <Button
        asChild
        className="flex-1 h-11 font-heading text-sm font-bold rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white shadow-sm"
      >
        <Link
          href={`/test/${test.id}`}
          className="flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          Start Mock Test
        </Link>
      </Button>
    ),
    in_progress: (
      <Button
        asChild
        className="flex-1 py-2 h-11 font-heading text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
      >
        <Link
          href={`/test/${test.id}`}
          className="flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Resume Test
        </Link>
      </Button>
    ),
    completed: (
      <Button
        asChild
        variant="outline"
        className="flex-1 h-11 font-heading text-sm font-bold rounded-xl border-green-200 text-green-700 hover:bg-green-50"
      >
        <Link
          href={`/results/${resultId}`}
          className="flex items-center justify-center gap-2"
        >
          <Trophy className="w-4 h-4" />
          View Result {score !== undefined && `· ${score}%`}
        </Link>
      </Button>
    ),
  }[attemptStatus];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row group hover:shadow-md transition-all duration-300">
      {/* Image */}
      <div className="relative w-full md:w-64 h-48 md:h-auto shrink-0 bg-slate-100 overflow-hidden">
        {test.thumbnail ? (
          <Image
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            src={test.thumbnail}
            alt={test.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
            <FileText className="w-10 h-10" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-3 py-4 md:px-10 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-bold font-heading tracking-widest px-2 py-1 rounded-2xl border uppercase text-brand-muted bg-brand-label border-brand-primary/10">
              {test.difficulty}
            </span>
            {statusBadge} {/* attempt status badge */}
          </div>

          <h3 className="text-xl font-bold font-sans text-black mb-2">
            {test.title}
          </h3>
          <p className="text-sm font-body text-brand-muted/80 mb-4 line-clamp-2">
            {test.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-brand-muted/90 mb-4 font-medium font-body">
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4 text-brand-primary/70" />
              <span>{test.totalQuestions} Questions</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-auto">
          <Button
            asChild
            variant="outline"
            className="flex-1 py-2 font-heading text-sm text-brand-primary font-bold rounded-xl"
          >
            <Link href={`/mock-tests/${test.id}`}>View Details</Link>
          </Button>
          {actionButton}
        </div>
      </div>
    </div>
  );
}
