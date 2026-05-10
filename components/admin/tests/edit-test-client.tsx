"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronLeft, Save, Loader2 } from "lucide-react";
import { Field } from "@/components/admin/create-tests/fields";
import UploadFile from "@/components/upload-file";
import { AdminUpdateInput } from "@/src/lib/validations/test.validations";
import type { Test } from "@/src/db/schema/tests";
import Container from "@/components/container";

export default function EditTestClient({ test }: { test: Test }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form state, converting prices back to Rupees for the input fields
  const [form, setForm] = useState<Partial<AdminUpdateInput>>({
    title: test.title,
    description: test.description,
    thumbnail: test.thumbnail,
    price: test.price / 100,
    originalPrice: test.originalPrice ? test.originalPrice / 100 : undefined,
    difficulty: test.difficulty,
    isFeatured: test.isFeatured,
    status: test.status,
  });

  const set = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    setSubmitting(true);

    try {
      await axios.patch(`/api/admin/tests/${test.id}`, form);
      router.push("/admin/tests");
      router.refresh();
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
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
              "Failed to update test. Please try again.",
          );
        }
      } else {
        setApiError("Failed to update test. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-8 md:py-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-slate-200"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            Edit Test
          </h1>
          <p className="text-sm text-slate-500 font-sans">
            Update settings and details for "{test.title}"
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {apiError && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {apiError}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-slate-800 border-b border-slate-100 pb-2">
            Basic Details
          </h2>

          <Field label="Thumbnail (Optional)" error={errors.thumbnail}>
            <UploadFile
              initialUrl={form.thumbnail ?? undefined}
              onUploadComplete={(url) => set("thumbnail", url)}
              onClear={() => set("thumbnail", null)}
            />
          </Field>

          <Field label="Test Title *" error={errors.title}>
            <Input
              placeholder="e.g. Shipping Aptitude Test 2026"
              value={form.title || ""}
              onChange={(e) => set("title", e.target.value)}
              className={errors.title ? "border-red-400" : ""}
            />
          </Field>

          <Field label="Description" error={errors.description}>
            <textarea
              rows={3}
              placeholder="Brief description of the test..."
              value={form.description || ""}
              onChange={(e) => set("description", e.target.value)}
              className="flex w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-4 focus-visible:ring-brand-primary/20 transition-all resize-none font-sans"
            />
          </Field>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-slate-800 border-b border-slate-100 pb-2">
            Test Configuration
          </h2>


          <Field label="Difficulty" error={errors.difficulty}>
            <div className="flex gap-3">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set("difficulty", d)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-bold font-heading border-2 transition-all capitalize",
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
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <h2 className="text-lg font-heading font-bold text-slate-800 border-b border-slate-100 pb-2">
            Pricing &amp; Visibility
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="Original Price (₹)"
              error={errors.originalPrice}
              hint="Strikethrough price"
            >
              <Input
                type="number"
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
                min={0}
                value={form.price ?? ""}
                onChange={(e) => set("price", Number(e.target.value))}
                className={errors.price ? "border-red-400" : ""}
              />
            </Field>
          </div>

          <Field label="Status" error={errors.status}>
            <div className="flex gap-3">
              {(["draft", "published", "archived"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set("status", s)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-sm font-bold font-heading border-2 transition-all capitalize",
                    form.status === s
                      ? s === "published"
                        ? "bg-green-50 border-green-500 text-green-700"
                        : s === "archived"
                          ? "bg-amber-50 border-amber-500 text-amber-700"
                          : "bg-slate-100 border-slate-500 text-slate-700"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
            <div>
              <p className="text-sm font-semibold font-heading text-slate-700">
                Featured Test
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Pin to the landing page
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
        </div>

        <div className="flex justify-end gap-3 pb-20">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-lg font-heading font-bold"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="h-10 rounded-lg bg-brand-primary hover:bg-brand-primary/90 text-white font-bold font-heading shadow-md"
          >
            {submitting ? (
              <Loader2 className="animate-spin mr-1" />
            ) : (
              <Save className="mr-1" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </Container>
  );
}
