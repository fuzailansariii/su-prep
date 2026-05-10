"use client";

import { useRef, useState } from "react";
import axios, { AxiosError } from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type ImportError = { row: number; message: string };

type Props = {
  sectionId: string;
  sectionName: string;
  onSuccess?: (count: number) => void;
};

export function QuestionImport({ sectionId, sectionName, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setFile(null);
    setResult(null);
    setErrors([]);
    setApiError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = (f: File) => {
    reset();
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setErrors([]);
    setApiError(null);
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await axios.post(
        `/api/admin/sections/${sectionId}/import`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setResult({ count: res.data.count });
      setFile(null);
      onSuccess?.(res.data.count);
    } catch (err) {
      if (err instanceof AxiosError) {
        const data = err.response?.data;
        if (data?.errors?.length) {
          setErrors(data.errors);
        } else {
          setApiError(data?.message ?? "Import failed.");
        }
      } else {
        setApiError("Unexpected error.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 font-sans">
          Import questions into <span className="font-bold text-slate-700">{sectionName}</span>
        </p>
        <a
          href="/api/admin/questions/template"
          download
          className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-brand-primary hover:underline"
        >
          <Download size={12} /> Download Template
        </a>
      </div>

      {/* Drop zone */}
      {!result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors px-6 py-8 flex flex-col items-center gap-3 text-center
            ${dragging
              ? "border-brand-primary bg-brand-primary/5"
              : file
                ? "border-slate-300 bg-slate-50"
                : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {file ? (
            <>
              <FileSpreadsheet size={28} className="text-brand-primary" />
              <div>
                <p className="text-sm font-heading font-bold text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB — click to change
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload size={28} className="text-slate-300" />
              <div>
                <p className="text-sm font-heading font-bold text-slate-700">
                  Drop your Excel file here
                </p>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  or click to browse — .xlsx / .xls
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={16} className="text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-heading font-bold text-green-700">
              {result.count} question{result.count !== 1 ? "s" : ""} imported!
            </p>
            <p className="text-xs text-green-600 font-sans">Reload the page to see the updated question count.</p>
          </div>
          <button onClick={reset} className="text-green-500 hover:text-green-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* API error */}
      {apiError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Row-level errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 space-y-1">
          <p className="text-xs font-heading font-bold text-red-600 mb-2">
            Fix these errors in your file and try again:
          </p>
          {errors.map((e) => (
            <p key={e.row} className="text-xs text-red-500 font-sans flex items-start gap-1.5">
              <span className="shrink-0 font-bold">Row {e.row}:</span>
              {e.message}
            </p>
          ))}
        </div>
      )}

      {/* Actions */}
      {file && !result && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl font-heading font-bold text-xs"
            onClick={reset}
          >
            Clear
          </Button>
          <Button
            size="sm"
            disabled={uploading}
            className="h-9 rounded-xl font-heading font-bold text-xs bg-brand-primary hover:bg-brand-primary/90 text-white"
            onClick={handleSubmit}
          >
            {uploading ? (
              <Loader2 size={13} className="animate-spin mr-1" />
            ) : (
              <Upload size={13} className="mr-1" />
            )}
            Import Questions
          </Button>
        </div>
      )}
    </div>
  );
}
