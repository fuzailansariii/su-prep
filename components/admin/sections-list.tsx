"use client";

import { useState } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import {
  AlertCircle,
  BookOpen,
  ChevronDown,
  Layers,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import useConfirm from "@/hooks/use-confirm";
import type { Section } from "@/src/db/schema/sections";
import { QuestionImport } from "@/components/admin/question-import";

type SectionWithCount = Section & { questionCount: number };

type Props = {
  testId: string;
  setId: string;
  initialSections: SectionWithCount[];
};

export function SectionsList({ testId, setId, initialSections }: Props) {
  const [sections, setSections] = useState<SectionWithCount[]>(initialSections);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openImportId, setOpenImportId] = useState<string | null>(null);
  const { isOpen, confirm, handleConfirm, handleCancel, close } = useConfirm();

  const nextOrder = sections.length + 1;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const res = await axios.post("/api/admin/sections", {
        setId,
        name: name.trim(),
        order: nextOrder,
      });
      setSections((prev) => [...prev, { ...res.data.data, questionCount: 0 }]);
      setName("");
    } catch (err) {
      setAddError(
        err instanceof AxiosError
          ? (err.response?.data?.message ?? "Failed to create section.")
          : "Unexpected error.",
      );
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (sectionId: string) => {
    const yes = await confirm();
    if (!yes) return;
    setIsDeleting(true);
    setError(null);
    try {
      await axios.delete(`/api/admin/sections/${sectionId}`);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    } catch (err) {
      setError(
        err instanceof AxiosError
          ? (err.response?.data?.message ?? "Failed to delete section.")
          : "Unexpected error.",
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
            <Layers size={15} className="text-brand-primary" />
            <h3 className="text-sm font-heading font-bold text-slate-900">
              Sections
            </h3>
            <span className="text-xs font-heading font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
              {sections.length}
            </span>
          </div>
        </div>

        {/* Error banner */}
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

        {/* Sections list */}
        {sections.length === 0 ? (
          <div className="px-5 py-8 flex flex-col items-center gap-2 text-center">
            <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <Layers size={18} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 font-sans max-w-xs">
              No sections yet. Add one below to organise questions by topic.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sections.map((section) => (
              <div key={section.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  {/* Left */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <span className="mt-0.5 sm:mt-0 text-xs font-heading font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      #{section.order}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-heading font-bold text-slate-900 truncate">
                        {section.name}
                      </p>
                      <p className="text-xs text-slate-400 font-sans flex items-center gap-1 mt-0.5">
                        <BookOpen size={11} /> {section.questionCount} questions
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pl-10 sm:pl-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 text-xs font-heading font-bold rounded-xl transition-colors ${
                        openImportId === section.id
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "text-brand-primary border-brand-primary/20 hover:bg-brand-primary/5"
                      }`}
                      onClick={() =>
                        setOpenImportId((prev) =>
                          prev === section.id ? null : section.id,
                        )
                      }
                    >
                      <Upload size={11} className="mr-1" />
                      Import
                      <ChevronDown
                        size={11}
                        className={`ml-1 transition-transform ${
                          openImportId === section.id ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-heading font-bold text-brand-primary border-brand-primary/20 hover:bg-brand-primary/5 rounded-xl"
                    >
                      <Link
                        href={`/admin/tests/${testId}/sets/${setId}/questions?section=${section.id}`}
                      >
                        <BookOpen size={11} className="mr-1" /> Questions
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      onClick={() => handleDelete(section.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>


                {/* Import panel */}
                {openImportId === section.id && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-4 bg-slate-50/60">
                    <QuestionImport
                      sectionId={section.id}
                      sectionName={section.name}
                      onSuccess={(count) => {
                        setSections((prev) =>
                          prev.map((s) =>
                            s.id === section.id
                              ? { ...s, questionCount: s.questionCount + count }
                              : s,
                          ),
                        );
                        setOpenImportId(null);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add section inline form */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 sm:px-5 py-4">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Input
              placeholder="Section name, e.g. Navigation & Chartwork"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setAddError(null);
              }}
              className={`flex-1 h-9 text-sm ${addError ? "border-red-400" : ""}`}
            />
            <Button
              type="submit"
              disabled={adding || !name.trim()}
              size="sm"
              className="h-9 shrink-0 font-heading font-bold bg-brand-primary hover:bg-brand-primary/90 rounded-xl text-xs"
            >
              {adding ? (
                <Loader2 size={13} className="animate-spin mr-1" />
              ) : (
                <Plus size={13} className="mr-1" />
              )}
              Add Section
            </Button>
          </form>
          {addError && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <AlertCircle size={11} /> {addError}
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={isOpen}
        title="Delete Section"
        message="Are you sure? All questions in this section will also be permanently deleted."
        confirmLabel="Delete Section"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
