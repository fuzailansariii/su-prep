"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  XCircle,
} from "lucide-react";
import type { Question, Option } from "@/src/db/schema/questions";

type QuestionWithOptions = Question & { options: Option[] };

const TYPE_LABELS: Record<string, string> = {
  mcq: "MCQ",
  multi: "Multi",
  truefalse: "T/F",
};

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

function QuestionCard({
  question,
  index,
}: {
  question: QuestionWithOptions;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
      {/* Question header */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="shrink-0 mt-0.5 text-xs font-heading font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          Q{index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-heading font-bold uppercase px-1.5 py-0.5 rounded ${
                question.type === "mcq"
                  ? "bg-blue-50 text-blue-600"
                  : question.type === "multi"
                    ? "bg-purple-50 text-purple-600"
                    : "bg-amber-50 text-amber-600"
              }`}
            >
              {TYPE_LABELS[question.type]}
            </span>
            <span className="text-[10px] font-heading font-bold text-slate-400">
              {question.marks} {question.marks === 1 ? "mark" : "marks"}
            </span>
          </div>
          <p className="text-sm font-sans text-slate-800 leading-relaxed">
            {question.questionText}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="px-4 pb-3 flex flex-col gap-1.5 pl-11">
        {question.options.map((opt, oi) => (
          <div
            key={opt.id}
            className={`flex items-start gap-2 text-sm rounded-xl px-3 py-2 ${
              opt.isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-slate-50 border border-slate-100"
            }`}
          >
            <span
              className={`shrink-0 text-xs font-heading font-bold mt-0.5 ${
                opt.isCorrect ? "text-green-600" : "text-slate-400"
              }`}
            >
              {OPTION_LABELS[oi]}.
            </span>
            <span
              className={`font-sans leading-snug ${
                opt.isCorrect ? "text-green-700 font-semibold" : "text-slate-600"
              }`}
            >
              {opt.optionText}
            </span>
            {opt.isCorrect && (
              <CheckCircle2 size={14} className="text-green-500 shrink-0 ml-auto mt-0.5" />
            )}
          </div>
        ))}
      </div>

      {/* Explanation (expandable) */}
      {question.explanation && (
        <div className="border-t border-slate-100 ml-11 mr-4 mb-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-slate-400 font-heading font-bold py-2 hover:text-slate-600 transition-colors"
          >
            <ChevronDown
              size={12}
              className={`transition-transform ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Hide" : "Show"} explanation
          </button>
          {expanded && (
            <p className="text-xs font-sans text-slate-500 leading-relaxed pb-3">
              {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function QuestionsPanel({ sectionId }: { sectionId: string }) {
  const [questions, setQuestions] = useState<QuestionWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`/api/admin/sections/${sectionId}/questions`)
      .then((res) => setQuestions(res.data.data))
      .catch((err) =>
        setError(
          err instanceof AxiosError
            ? (err.response?.data?.error ?? "Failed to load questions.")
            : "Unexpected error.",
        ),
      )
      .finally(() => setLoading(false));
  }, [sectionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2">
        <Loader2 size={16} className="animate-spin text-brand-primary" />
        <span className="text-sm text-slate-500 font-sans">Loading questions…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
        <AlertCircle size={14} className="shrink-0" />
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <XCircle size={24} className="text-slate-200" />
        <p className="text-sm text-slate-400 font-sans">No questions yet. Use Import to add some.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-heading font-bold text-slate-500 mb-1">
        {questions.length} question{questions.length !== 1 ? "s" : ""}
      </p>
      {questions.map((q, i) => (
        <QuestionCard key={q.id} question={q} index={i} />
      ))}
    </div>
  );
}
