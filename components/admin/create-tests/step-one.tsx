import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { Field } from "./fields";
import { useState } from "react";
import { AdminCreateInput } from "@/src/lib/validations/test.validations";
import { CreatedTest } from "../create-test-wizard";
import axios, { AxiosError } from "axios";
import UploadFile from "@/components/upload-file";

export function TestDetailsStep({
  onCreated,
}: {
  onCreated: (test: CreatedTest) => void;
}) {
  const [form, setForm] = useState<Partial<AdminCreateInput>>({
    difficulty: "medium",
    negativeMarking: false,
    negativeMarkFraction: 25,
    isFeatured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const set = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSubmitting(true);
    try {
      const res = await axios.post("/api/admin/tests", form);
      onCreated({ id: res.data.data.id, title: res.data.data.title });
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          // Field-level errors from zod
          const fieldErrors: Record<string, string> = {};
          const errs = err.response.data?.error;
          if (errs?.properties) {
            Object.entries(errs.properties).forEach(([key, val]: any) => {
              if (val?.errors?.[0]) fieldErrors[key] = val.errors[0];
            });
          }
          setErrors(fieldErrors);
          if (!Object.keys(fieldErrors).length) {
            setApiError(err.response?.data?.message || "Validation failed");
          }
        } else {
          setApiError(
            err.response?.data?.error ||
              "Failed to create test. Please try again.",
          );
        }
      } else {
        setApiError("Failed to create test. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {apiError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {apiError}
        </div>
      )}

      {/* Thumbnail */}

      <Field label="Thumbnail (Optional)" error={errors.thumbnail}>
        <UploadFile
          onUploadComplete={(url) => set("thumbnail", url)}
          onClear={() => set("thumbnail", null)}
        />
      </Field>

      {/* Title */}
      <Field label="Test Title *" error={errors.title}>
        <Input
          placeholder="e.g. Shipping Aptitude Test 2026"
          value={form.title || ""}
          onChange={(e) => set("title", e.target.value)}
          className={errors.title ? "border-red-400" : ""}
        />
      </Field>

      {/* Description */}
      <Field label="Description" error={errors.description}>
        <textarea
          rows={3}
          placeholder="Brief description of the test..."
          value={form.description || ""}
          onChange={(e) => set("description", e.target.value)}
          className="flex w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-4 focus-visible:ring-brand-primary/20 transition-all resize-none disabled:opacity-50 font-heading"
        />
      </Field>

      {/* Duration + Total Questions */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Duration (mins) *" error={errors.duration} hint="Max 600">
          <Input
            type="number"
            placeholder="e.g. 120"
            min={1}
            max={600}
            value={form.duration ?? ""}
            onChange={(e) => set("duration", Number(e.target.value))}
            className={errors.duration ? "border-red-400" : ""}
          />
        </Field>
        <Field label="Total Questions *" error={errors.totalQuestions}>
          <Input
            type="number"
            placeholder="e.g. 100"
            min={1}
            max={500}
            value={form.totalQuestions ?? ""}
            onChange={(e) => set("totalQuestions", Number(e.target.value))}
            className={errors.totalQuestions ? "border-red-400" : ""}
          />
        </Field>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Original Price (₹)"
          error={errors.originalPrice}
          hint="Strikethrough price"
        >
          <Input
            type="number"
            placeholder="e.g. 999"
            min={0}
            value={form.originalPrice ?? ""}
            onChange={(e) => set("originalPrice", Number(e.target.value))}
            className={errors.originalPrice ? "border-red-400" : ""}
          />
        </Field>
        <Field
          label="Offer Price (₹) *"
          error={errors.price}
          hint="Enter 0 for free"
        >
          <Input
            type="number"
            placeholder="e.g. 499"
            min={0}
            value={form.price ?? ""}
            onChange={(e) => set("price", Number(e.target.value))}
            className={errors.price ? "border-red-400" : ""}
          />
        </Field>
      </div>

      <Field label="Total Marks *" error={errors.totalMarks}>
        <Input
          type="number"
          placeholder="e.g. 100"
          min={1}
          value={form.totalMarks ?? ""}
          onChange={(e) => set("totalMarks", Number(e.target.value))}
          className={errors.totalMarks ? "border-red-400" : ""}
        />
      </Field>

      {/* Difficulty */}
      <Field label="Difficulty" error={errors.difficulty}>
        <div className="flex gap-2">
          {(["easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => set("difficulty", d)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold font-heading border-2 transition-all capitalize",
                form.difficulty === d
                  ? d === "easy"
                    ? "bg-green-50 border-green-500 text-green-700"
                    : d === "medium"
                      ? "bg-amber-50 border-amber-500 text-amber-700"
                      : "bg-red-50 border-red-500 text-red-700"
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </Field>

      {/* Negative Marking */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
        <div>
          <p className="text-sm font-semibold font-heading text-slate-700">
            Negative Marking
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Deduct marks for wrong answers
          </p>
        </div>
        <button
          type="button"
          onClick={() => set("negativeMarking", !form.negativeMarking)}
          className={cn(
            "w-12 h-6 rounded-full transition-all relative",
            form.negativeMarking ? "bg-brand-primary" : "bg-slate-300",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
              form.negativeMarking ? "left-6" : "left-0.5",
            )}
          />
        </button>
      </div>

      {form.negativeMarking && (
        <Field
          label="Negative Mark Fraction"
          error={errors.negativeMarkFraction}
          hint="Enter 25 for -0.25, 33 for -0.33"
        >
          <Input
            type="number"
            placeholder="25"
            min={0}
            max={100}
            value={form.negativeMarkFraction ?? 25}
            onChange={(e) =>
              set("negativeMarkFraction", Number(e.target.value))
            }
          />
        </Field>
      )}

      {/* Featured */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4">
        <div>
          <p className="text-sm font-semibold font-heading text-slate-700">
            Featured Test
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Show on landing page highlights
          </p>
        </div>
        <button
          type="button"
          onClick={() => set("isFeatured", !form.isFeatured)}
          className={cn(
            "w-12 h-6 rounded-full transition-all relative",
            form.isFeatured ? "bg-brand-primary" : "bg-slate-300",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all",
              form.isFeatured ? "left-6" : "left-0.5",
            )}
          />
        </button>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold font-heading text-base mt-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Test...
          </>
        ) : (
          <>
            Create Test & Continue <ChevronRight className="w-4 h-4 ml-1" />
          </>
        )}
      </Button>
    </form>
  );
}
