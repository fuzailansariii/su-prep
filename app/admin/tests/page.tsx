"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  IndianRupee,
  Loader2,
  Plus,
  RefreshCw,
  Star,
  AlertCircle,
  Archive,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Test } from "@/src/db/schema/tests";
import { Input } from "@/components/ui/input";

import { Image } from "@imagekit/next";
import { formatPrice } from "@/utils/format-price";

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────
function StatusBadge({ status }: { status: Test["status"] }) {
  const map = {
    draft: {
      label: "Draft",
      cls: "bg-slate-100 text-slate-600 border-slate-200",
    },
    published: {
      label: "Published",
      cls: "bg-green-50 text-green-700 border-green-200",
    },
    archived: {
      label: "Archived",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-bold font-heading border rounded-lg px-2 py-0.5",
        cls,
      )}
    >
      {status === "published" && <CheckCircle2 className="w-3 h-3" />}
      {status === "draft" && <FileText className="w-3 h-3" />}
      {status === "archived" && <Archive className="w-3 h-3" />}
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Difficulty badge
// ─────────────────────────────────────────────
function DifficultyBadge({ difficulty }: { difficulty: Test["difficulty"] }) {
  const map = {
    easy: "bg-green-50 text-green-700 border-green-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    hard: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex text-[11px] font-bold font-heading border rounded-lg px-2 py-0.5 capitalize",
        map[difficulty],
      )}
    >
      {difficulty}
    </span>
  );
}

// ─────────────────────────────────────────────
// Single test card
// ─────────────────────────────────────────────
function TestCard({ test }: { test: Test }) {
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
      <div className="flex items-center gap-4 text-xs text-slate-500 font-sans border-t border-slate-100 pt-3 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {test.duration} mins
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          {test.totalQuestions} questions
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          {test.totalMarks} marks
        </span>
        {test.negativeMarking && (
          <span className="text-[11px] bg-red-50 text-red-600 border border-red-100 rounded-md px-1.5 py-0.5 font-heading font-bold">
            {(test.negativeMarkFraction ?? 25) / 100} neg
          </span>
        )}
        <span className="ml-auto text-[11px] text-slate-300">
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

// ─────────────────────────────────────────────
// Filter tab
// ─────────────────────────────────────────────
type FilterStatus = "all" | Test["status"];

function FilterTab({
  label,
  active,
  count,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-heading transition-all",
        active
          ? "bg-brand-primary text-white shadow-sm"
          : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200",
      )}
    >
      {label}
      <span
        className={cn(
          "text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
        )}
      >
        {count}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function AdminTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/admin/tests");
      setTests(res.data.data);
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message || "Failed to load tests. Try again.",
        );
      } else setError("Failed to load tests. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Counts per status
  const counts = {
    all: tests.length,
    draft: tests.filter((t) => t.status === "draft").length,
    published: tests.filter((t) => t.status === "published").length,
    archived: tests.filter((t) => t.status === "archived").length,
  };

  // Apply filter + search
  const visible = tests
    .filter((t) => filter === "all" || t.status === filter)
    .filter(
      (t) =>
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="md:px-[40px] md:py-[48px] py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading tracking-tight text-xl font-bold text-black">
            Tests
          </h1>
          <p className="text-sm text-[#545F73] font-sans mt-0.5">
            Manage your mock test library
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTests}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 transition-all"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <Button
            asChild
            className="h-9 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold font-heading"
          >
            <Link href="/admin/tests/create">
              <Plus className="w-4 h-4 mr-1.5" />
              New Test
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input
        type="text"
        placeholder="Search tests..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm font-sans"
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(
          [
            { key: "all", label: "All" },
            { key: "published", label: "Published" },
            { key: "draft", label: "Draft" },
            { key: "archived", label: "Archived" },
          ] as { key: FilterStatus; label: string }[]
        ).map((f) => (
          <FilterTab
            key={f.key}
            label={f.label}
            active={filter === f.key}
            count={counts[f.key]}
            onClick={() => setFilter(f.key)}
          />
        ))}
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-sm text-slate-500 font-sans">Loading tests...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchTests}
            className="ml-auto text-xs font-bold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <p className="text-base font-bold font-heading text-slate-700">
              {search ? "No tests match your search" : "No tests yet"}
            </p>
            <p className="text-sm text-slate-400 mt-1 font-sans">
              {search
                ? "Try a different keyword"
                : "Create your first test to get started"}
            </p>
          </div>
          {!search && (
            <Button
              asChild
              className="rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold font-heading"
            >
              <Link href="/admin/tests/create">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Test
              </Link>
            </Button>
          )}
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}
