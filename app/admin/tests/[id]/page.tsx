"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import {
  ChevronLeft,
  AlertCircle,
  Pencil,
  Image as ImageIcon,
  Loader2,
  Star,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Test } from "@/src/db/schema/tests";
import type { Set as TestSet } from "@/src/db/schema/sets";
import { Image } from "@imagekit/next";
import { formatPrice } from "@/utils/format-price";
import Container from "@/components/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";
import { TestSetsList } from "@/components/admin/test-sets-list";
import { MiniStat } from "@/components/ui/mini-stat";

type TestWithSets = Test & {
  sets: TestSet[];
};

export default function AdminTestViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: testId } = use(params);

  const [test, setTest] = useState<TestWithSets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`/api/admin/tests/${testId}`)
      .then((res) => setTest(res.data.data))
      .catch((err) => {
        setError(
          err instanceof AxiosError
            ? (err.response?.data?.error ?? "Failed to load.")
            : "Unexpected error.",
        );
      })
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-brand-primary" />
        <p className="text-sm text-slate-500 font-sans">Loading test...</p>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-800 mb-1">
            Failed to load
          </h2>
          <p className="text-sm text-slate-500 font-sans max-w-sm">
            {error ?? "Test not found."}
          </p>
        </div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="rounded-xl font-heading font-bold"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Go Back
        </Button>
      </div>
    );
  }

  const priceDisplay = test.price === 0 ? "Free" : formatPrice(test.price);
  const testSets = test.sets ?? [];
  const totalSets = testSets.length;
  const calculatedQuestions = testSets.reduce((acc, set) => acc + set.totalQuestions, 0);

  return (
    <Container className="py-8 md:py-10 max-w-4xl mx-auto flex flex-col gap-5">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-heading font-bold text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft size={16} /> Back
        </Button>
        <Button
          asChild
          className="h-9 rounded-xl font-heading font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-white"
        >
          <Link href={`/admin/tests/${test.id}/edit`}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Test
          </Link>
        </Button>
      </div>

      {/* Main info card — sidebar thumbnail + content */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Thumbnail — fixed sidebar, always 16:9 on mobile, fixed width on desktop */}
          <div className="w-full sm:w-72 sm:shrink-0 aspect-video sm:aspect-auto bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-100 overflow-hidden flex items-center justify-center">
            {test.thumbnail ? (
              <Image
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!}
                src={test.thumbnail}
                alt={test.title}
                width={1280}
                height={720}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <ImageIcon size={28} />
                <span className="text-xs font-sans">No thumbnail</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-between p-5 md:p-6 gap-4">
            {/* Badges */}
            <div>
              <div className="flex flex-col md:flex-row justify-start md:justify-between md:gap-0 gap-1.5 mb-3">
                <div className="flex flex-wrap items-center gap-2 ">
                  <StatusBadge status={test.status} />
                  <DifficultyBadge
                    difficulty={test.difficulty}
                    className="text-xs px-2.5 py-1"
                  />
                  {test.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-xs font-heading font-bold bg-brand-primary/8 text-brand-primary border border-brand-primary/15 px-2.5 py-1 rounded-lg">
                      <Star size={10} className="fill-current" /> Featured
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-sans flex items-center gap-1">
                  <Calendar size={11} />
                  {new Date(test.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Title + description */}
              <h1 className="text-xl md:text-2xl font-heading font-bold text-slate-900 leading-tight mb-1.5">
                {test.title}
              </h1>
              <p className="text-sm font-sans text-slate-500 leading-relaxed line-clamp-2">
                {test.description || "No description provided."}
              </p>
            </div>

            {/* Price + stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-heading font-black text-brand-primary">
                  {priceDisplay}
                </span>
                {test.originalPrice && test.originalPrice > test.price && (
                  <span className="text-sm font-sans text-slate-400 line-through">
                    {formatPrice(test.originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-5">
                <MiniStat label="Questions" value={calculatedQuestions} />
                <div className="w-px h-8 bg-slate-100" />
                <MiniStat label="Sets" value={totalSets} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sets list */}
      <TestSetsList
        testId={test.id}
        initialSets={testSets}
        onDelete={(setId) =>
          setTest((prev) =>
            prev
              ? { ...prev, sets: prev.sets.filter((s) => s.id !== setId) }
              : prev,
          )
        }
      />
    </Container>
  );
}
