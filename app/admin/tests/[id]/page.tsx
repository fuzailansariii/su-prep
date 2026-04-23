"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Pencil,
  Image as ImageIcon,
  Loader2,
  Calendar,
  BarChart,
  Target,
  Hash,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Test } from "@/src/db/schema/tests";
import { Image } from "@imagekit/next";
import { formatPrice } from "@/utils/format-price";
import Container from "@/components/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatCard } from "@/components/ui/stat-card";
import { DifficultyBadge } from "@/components/ui/difficulty-badge";

export default function AdminTestViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: testId } = use(params);

  const [test, setTest] = useState<Test | null>(null);
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
  const avgMarks = (test.totalMarks / test.totalQuestions).toFixed(1);

  const stats = [
    { icon: BookOpen, label: "Questions", value: test.totalQuestions },
    { icon: Clock, label: "Duration", value: `${test.duration} min` },
    { icon: CheckCircle2, label: "Total marks", value: test.totalMarks },
    { icon: Target, label: "Avg per Q", value: avgMarks },
  ];
  return (
    <Container className="py-8 md:py-10 px-0 max-w-4xl mx-auto flex flex-col gap-5">
      {/* top nav */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant={"ghost"}
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-heading font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-xl font-heading font-bold text-sm border-slate-200 text-slate-700"
          >
            <Link href={`/admin/tests/${test.id}/questions`}>
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Questions
            </Link>
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
      </div>

      {/* main card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* thumbnail + title */}
        <div className="flex flex-col sm:flex-row">
          {/* thumbnail */}
          <div className="sm:w-52 h-40 sm:h-auto bg-slate-50 border-b sm:border-b-0 sm:border-r border-slate-100 flex items-center justify-center shrink-0">
            {test.thumbnail ? (
              <Image
                src={test.thumbnail}
                alt={test.title}
                width={400}
                height={300}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-300">
                <ImageIcon size={28} />
                <span className="text-xs font-sans">No thumbnail</span>
              </div>
            )}
          </div>

          {/* title block */}
          <div className="flex-1 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
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

            <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 leading-tight mb-3">
              {test.title}
            </h1>

            <p className="text-sm font-sans text-slate-500 leading-relaxed line-clamp-2 mb-5">
              {test.description || "No description provided."}
            </p>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-heading font-black text-brand-primary">
                {priceDisplay}
              </span>
              {test.originalPrice && test.originalPrice > test.price && (
                <span className="text-base font-sans text-slate-400 line-through">
                  {formatPrice(test.originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="h-px bg-slate-100" />

        {/* stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x border-t divide-y md:divide-y-0 divide-slate-100 bg-slate-50/50">
          {stats.map((s) => (
            <StatCard
              key={s.label}
              icon={s.icon}
              label={s.label}
              value={s.value}
            />
          ))}
        </div>
      </div>

      {/* bottom two cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* marking scheme */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart size={16} className="text-brand-primary" />
            <h3 className="text-sm font-heading font-bold text-slate-900">
              Marking scheme
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            <Row
              label="Negative marking"
              value={
                <span
                  className={cn(
                    "text-xs font-heading font-bold px-2 py-0.5 rounded-md",
                    test.negativeMarking
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {test.negativeMarking ? "Enabled" : "Disabled"}
                </span>
              }
            />
            {test.negativeMarking && (
              <Row
                label="Penalty per wrong answer"
                value={`-${(test.negativeMarkFraction ?? 25) / 100}`}
              />
            )}
            <Row label="Marks per question (avg)" value={avgMarks} />
            <Row label="Pass requires" value="—" />
          </div>
        </div>

        {/* audit info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} className="text-brand-primary" />
            <h3 className="text-sm font-heading font-bold text-slate-900">
              Audit info
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="py-3">
              <p className="text-xs font-heading font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Test ID
              </p>
              <code className="text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                {test.id}
              </code>
            </div>
            <Row
              label="Created"
              value={new Date(test.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
            <Row
              label="Last updated"
              value={new Date(test.updatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm font-sans text-slate-500">{label}</span>
      <span className="text-sm font-heading font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}
