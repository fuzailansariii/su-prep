"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios, { AxiosError } from "axios";
import {
  Loader2,
  Plus,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AddQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: testId } = use(params);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    questionText: "",
    type: "mcq" as const,
    explanation: "",
    marks: 1,
    order: 1,
    section: "",
  });

  const [options, setOptions] = useState([
    { id: "1", optionText: "", isCorrect: false, order: 1 },
    { id: "2", optionText: "", isCorrect: false, order: 2 },
  ]);

  // Auto-fill the next available order number
  useEffect(() => {
    axios
      .get(`/api/admin/tests/${testId}/questions`)
      .then((res) => {
        const qs = res.data.allQuestions;
        if (qs && qs.length > 0) {
          const maxOrder = Math.max(...qs.map((q: any) => q.order));
          setForm((f) => ({ ...f, order: maxOrder + 1 }));
        }
      })
      .catch(console.error);
  }, [testId]);

  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        optionText: "",
        isCorrect: false,
        order: prev.length + 1,
      },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((o, i) => ({ ...o, order: i + 1 })),
    );
  };

  const updateOption = (index: number, field: string, value: any) => {
    setOptions((prev) => {
      const newOpts = [...prev];
      if (field === "isCorrect") {
        if (form.type === "mcq" || form.type === "truefalse") {
          // Only one correct option
          newOpts.forEach((o) => (o.isCorrect = false));
        }
      }
      newOpts[index] = { ...newOpts[index], [field]: value };
      return newOpts;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.questionText.trim()) {
      return setError("Question text is required.");
    }
    if (options.some((o) => !o.optionText.trim())) {
      return setError("All option fields must be filled.");
    }
    if (!options.some((o) => o.isCorrect)) {
      return setError("Please select at least one correct option.");
    }

    setSubmitting(true);
    try {
      await axios.post(
        `/api/admin/tests/${testId}/questions`,
        {
          ...form,
          options: options.map((o) => ({
            optionText: o.optionText,
            isCorrect: o.isCorrect,
            order: o.order,
          })),
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      router.push(`/admin/tests/${testId}/questions`);
      router.refresh();
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || "Failed to create question");
      } else {
        setError("An unexpected error occurred");
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 md:px-8">
      <div className="mb-8">
        <Link
          href={`/admin/tests/${testId}/questions`}
          className="inline-flex items-center gap-2 text-sm font-bold font-heading text-slate-500 hover:text-brand-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Questions
        </Link>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 tracking-tight">
          Add New Question
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold font-heading text-slate-700 mb-2">
              Question Text *
            </label>
            <textarea
              rows={3}
              value={form.questionText}
              onChange={(e) =>
                setForm({ ...form, questionText: e.target.value })
              }
              className="flex w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-4 focus-visible:ring-brand-primary/20 transition-all resize-none"
              placeholder="What is the capital of France?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold font-heading text-slate-700 mb-2">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as any })
                }
                className="w-full h-11 rounded-xl border border-slate-300 px-3 bg-white"
              >
                <option value="mcq">Single Choice (MCQ)</option>
                <option value="multi">Multiple Correct</option>
                <option value="truefalse">True / False</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold font-heading text-slate-700 mb-2">
                Section / Subject (Optional)
              </label>
              <Input
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                placeholder="e.g. General Knowledge"
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold font-heading text-slate-700 mb-2">
                Marks
              </label>
              <Input
                type="number"
                min={1}
                value={form.marks}
                onChange={(e) =>
                  setForm({ ...form, marks: parseInt(e.target.value) || 1 })
                }
                className="rounded-xl h-11"
              />
            </div>
            <div>
              <label className="block text-sm font-bold font-heading text-slate-700 mb-2">
                Display Order
              </label>
              <Input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: parseInt(e.target.value) || 1 })
                }
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold font-heading text-slate-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              rows={2}
              value={form.explanation}
              onChange={(e) =>
                setForm({ ...form, explanation: e.target.value })
              }
              className="flex w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand-primary transition-all resize-none"
              placeholder="Provide an explanation for the correct answer..."
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-800">
                Options
              </h3>
              <p className="text-sm text-slate-500">
                Mark the correct option(s)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddOption}
              className="h-9 rounded-xl text-xs font-bold font-heading"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Option
            </Button>
          </div>

          <div className="space-y-3">
            {options.map((opt, i) => (
              <div
                key={opt.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  opt.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-slate-200",
                )}
              >
                <button
                  type="button"
                  onClick={() => updateOption(i, "isCorrect", !opt.isCorrect)}
                  className="shrink-0 transition-colors"
                >
                  {opt.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                  )}
                </button>
                <Input
                  value={opt.optionText}
                  onChange={(e) =>
                    updateOption(i, "optionText", e.target.value)
                  }
                  className={cn(
                    "border-0 shadow-none focus-visible:ring-0 px-0 rounded-none bg-transparent h-auto",
                    opt.isCorrect
                      ? "text-green-900 font-medium"
                      : "text-slate-700",
                  )}
                  placeholder={`Option ${i + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold font-heading text-base"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...
            </>
          ) : (
            "Save Question"
          )}
        </Button>
      </form>
    </div>
  );
}
