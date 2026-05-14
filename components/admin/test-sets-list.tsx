"use client";

import { useState } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import useConfirm from "@/hooks/use-confirm";
import type { Set as TestSet } from "@/src/db/schema/sets";

type Props = {
  testId: string;
  initialSets: TestSet[];
  /** optional: called after a set is deleted so parent can update its own state */
  onDelete?: (setId: string) => void;
};

export function TestSetsList({ testId, initialSets, onDelete }: Props) {
  const [sets, setSets] = useState<TestSet[]>(initialSets);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, confirm, handleConfirm, handleCancel, close } = useConfirm();

  const handleDeleteSet = async (setId: string) => {
    const yes = await confirm();
    if (!yes) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/admin/tests/${testId}/sets/${setId}`);
      setSets((prev) => prev.filter((s) => s.id !== setId));
      onDelete?.(setId);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof AxiosError
          ? (err.response?.data?.message ?? "Failed to delete set.")
          : "Failed to delete set.",
      );
    } finally {
      setIsDeleting(false);
      close();
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-brand-primary" />
            <h3 className="text-sm font-heading font-bold text-slate-900">
              Test Sets
            </h3>
            <span className="text-xs font-heading font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
              {sets.length}
            </span>
          </div>
          <Button
            asChild
            size="sm"
            className="h-8 text-xs font-heading font-bold bg-brand-primary hover:bg-brand-primary/90 rounded-xl"
          >
            <Link href={`/admin/tests/${testId}/sets/create`}>
              <Plus size={13} className="mr-1" /> Add Set
            </Link>
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
            <button
              className="ml-auto text-xs font-bold underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Empty state */}
        {sets.length === 0 ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <FileText size={20} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-sans max-w-xs">
              No sets yet. Create your first set to start adding questions.
            </p>
            <Button
              asChild
              size="sm"
              className="font-heading font-bold bg-brand-primary rounded-xl"
            >
              <Link href={`/admin/tests/${testId}/sets/create`}>
                <Plus size={13} className="mr-1" /> Create Set
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sets.map((set) => (
              <div
                key={set.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors"
              >
                {/* Left — order badge + info */}
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs font-heading font-bold text-slate-400 bg-slate-100 px-2 py-0.5 mt-0.5 sm:mt-0 rounded shrink-0">
                    #{set.order}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-heading font-bold text-slate-900 truncate">
                        {set.title}
                      </h4>
                      <StatusBadge status={set.status} />
                    </div>
                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-sans">
                      <span className="flex items-center gap-1">
                        <BookOpen size={11} /> {set.totalQuestions} questions
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={11} /> {set.totalMarks} marks
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {set.duration} min
                      </span>
                      {set.negativeMarking && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="flex items-center gap-1 text-red-500">
                            <AlertCircle size={11} />-
                            {((set.negativeMarkFraction ?? 25) / 100).toFixed(
                              2,
                            )}{" "}
                            per wrong
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right — actions */}
                <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-heading font-bold text-slate-600 rounded-xl"
                  >
                    <Link href={`/admin/tests/${testId}/sets/${set.id}/edit`}>
                      <Pencil size={11} className="mr-1" /> Edit
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-heading font-bold text-brand-primary border-brand-primary/20 hover:bg-brand-primary/5 rounded-xl"
                  >
                    <Link href={`/admin/tests/${testId}/sets/${set.id}`}>
                      <BookOpen size={11} className="mr-1" /> Questions
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                    onClick={() => handleDeleteSet(set.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isOpen}
        title="Delete Set"
        message="Are you sure you want to delete this set? All questions inside will also be permanently deleted."
        confirmLabel="Delete Set"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
