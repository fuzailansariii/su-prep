"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
  Hash,
} from "lucide-react";
import { type Question, type Option } from "@/src/db/schema/questions";
import Container from "@/components/container";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import useConfirm from "@/hooks/use-confirm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface QuestionWithRelations extends Question {
  options: Option[];
}

interface QuestionsClientProps {
  questions: QuestionWithRelations[];
  testId: string;
}

const TYPE_STYLES: Record<string, string> = {
  mcq: "bg-blue-50 text-blue-700 border-blue-100",
  multi: "bg-purple-50 text-purple-700 border-purple-100",
  truefalse: "bg-amber-50 text-amber-700 border-amber-100",
};

function QuestionCard({
  q,
  onEdit,
  onDelete,
}: {
  q: QuestionWithRelations;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl py-2 overflow-hidden hover:border-slate-300 transition-colors shadow-sm">
      {/* header row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:py-4 border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center justify-center gap-1 px-2 py-0.5 text-xs rounded-md bg-white border border-slate-200 shrink-0 shadow-sm font-heading font-bold">
              <Hash size={12} />
              {q.order}
            </span>
            <span
              className={`text-xs md:text-sm font-heading font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                TYPE_STYLES[q.type] ??
                "bg-slate-50 text-slate-600 border-slate-100"
              }`}
            >
              {q.type}
            </span>
            {q.section && (
              <span className="text-xs md:text-sm font-heading font-medium text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md bg-white">
                {q.section}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end sm:justify-end gap-1 w-full sm:w-auto pt-2 sm:pt-0 border-slate-100">
          <button
            onClick={() => onEdit(q.id)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 transition-all"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={() => onDelete(q.id)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="px-4 py-2 md:px-6 md:pt-2 space-y-4">
        <p className="text-sm md:text-base font-sans text-slate-800 font-bold leading-relaxed">
          {q.questionText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {q.options
            .sort((a, b) => a.order - b.order)
            .map((opt) => (
              <div
                key={opt.id}
                className={`flex items-start gap-3 px-2 py-1 rounded-lg border text-sm transition-all ${
                  opt.isCorrect
                    ? "bg-green-50 border-green-200 shadow-sm"
                    : "bg-slate-50/50 border-slate-100"
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {opt.isCorrect ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <Circle size={16} className="text-slate-300" />
                  )}
                </div>
                <span
                  className={`leading-snug font-sans ${
                    opt.isCorrect
                      ? "text-green-800 font-bold"
                      : "text-slate-600 font-medium"
                  }`}
                >
                  {opt.optionText}
                </span>
              </div>
            ))}
        </div>

        {/* Explanation */}
        {/* {q.explanation && (
            <div className="mt-6 p-4 bg-amber-50/50 border border-amber-100 rounded-2xl shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-amber-600" />
                <p className="text-[10px] font-heading font-black text-amber-700 uppercase tracking-widest">
                  Explanation
                </p>
              </div>
              <p className="text-sm font-sans text-amber-900/80 leading-relaxed">
                {q.explanation}
              </p>
            </div>
          )} */}
      </div>
    </div>
  );
}

export default function QuestionsClient({
  questions: initialQuestions,
  testId,
}: QuestionsClientProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, confirm, handleConfirm, handleCancel, close } = useConfirm();

  const handleEdit = (id: string) => {
    // wire to edit modal/drawer
  };

  const handleDelete = async (id: string) => {
    const yes = await confirm();
    if (!yes) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/admin/tests/${testId}/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete question. Please try again.");
    } finally {
      setIsDeleting(false);
      close();
    }
  };

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return (
    <Container className="px-0 md:px-10 w-full">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 tracking-tight">
            Manage Questions
          </h1>
          <p className="text-sm text-slate-500 font-sans">
            Build and organize the content for this assessment
          </p>
        </div>
        {questions.length !== 0 && (
          <Button
            asChild
            className="h-12 sm:h-11 px-6 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-heading font-bold text-sm gap-2 shadow-lg shadow-brand-primary/20"
          >
            <Link href={`/admin/tests/${testId}/questions/add`}>
              <Plus size={18} />
              Add Question
            </Link>
          </Button>
        )}
      </div>

      {/* stats row */}
      {questions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          {[
            { label: "Total questions", value: questions.length },
            { label: "Total marks", value: totalMarks },
            {
              label: "Sections",
              value:
                new Set(questions.map((q) => q.section).filter(Boolean)).size ||
                "Global",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <p className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wider mb-1">
                {s.label}
              </p>
              <p className="text-xl font-heading font-bold text-slate-900">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* empty state */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 text-center px-6">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
            <FileText size={28} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-800 mb-2">
            No questions yet
          </h3>
          <p className="text-sm font-sans text-slate-500 max-w-xs mb-8 leading-relaxed">
            Your question bank is empty. Get started by manually adding your
            first question or uploading a batch.
          </p>
          <Button
            asChild
            className="h-11 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-heading font-bold text-sm gap-2 mt-4"
          >
            <Link href={`/admin/tests/${testId}/questions/add`}>
              <Plus size={18} />
              Create First Question
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              q={q}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={isOpen}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmLabel="Delete Question"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </Container>
  );
}
