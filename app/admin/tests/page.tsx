"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import { FileText, Loader2, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Test } from "@/src/db/schema/tests";
import { Input } from "@/components/ui/input";
import { AdminTestCard } from "@/components/admin-test-card";
import useConfirm from "@/hooks/use-confirm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
type TestWithCount = Test & { setsCount: number };

export default function AdminTestsPage() {
  const [tests, setTests] = useState<TestWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, confirm, handleConfirm, handleCancel, close } = useConfirm();

  const handleDelete = async (id: string) => {
    const yes = await confirm();
    if (!yes) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/admin/tests/${id}`);
      setTests((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message || "Failed to delete test. Try again.",
        );
      } else setError("Failed to delete test. Try again.");
    } finally {
      setIsDeleting(false);
      close();
    }
  };

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
            <AdminTestCard key={test.id} test={test} setsCount={test.setsCount} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={isOpen}
        title="Delete Test"
        message="Are you sure you want to delete this test? This action cannot be undone."
        confirmLabel="Delete Test"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
