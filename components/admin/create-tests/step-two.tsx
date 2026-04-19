import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  FileUp,
  Info,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { CreatedTest } from "../create-test-wizard";

export function AddQuestionsStep({
  test,
  onComplete,
}: {
  test: CreatedTest;
  onComplete: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ inserted: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith(".csv")) {
      setError("Only CSV files are accepted.");
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError("CSV file must be under 5MB.");
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (!dropped) return;
    if (!dropped.name.endsWith(".csv")) {
      setError("Only CSV files are accepted.");
      return;
    }
    setFile(dropped);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(
        `/api/admin/tests/${test.id}/questions`,
        formData,
        {
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
          },
        },
      );
      setResult({ inserted: res.data.inserted });
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.details?.[0]?.message ||
          "Failed to upload questions.",
      );
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers =
      "order,type,question,explanation,marks,section,optionA,optionB,optionC,optionD,correct";
    const sample =
      '1,mcq,"What is the capital of India?","New Delhi is the capital",1,General,New Delhi,Mumbai,Chennai,Kolkata,A';
    const csv = `${headers}\n${sample}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Test badge */}
      <div className="flex items-center gap-3 bg-brand-primary/8 border border-brand-primary/20 rounded-2xl px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-brand-primary/70 font-heading font-semibold">
            Test Created
          </p>
          <p className="text-sm font-bold font-heading text-brand-primary truncate">
            {test.title}
          </p>
        </div>
      </div>

      {/* CSV hint card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold font-heading text-slate-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Expected CSV Column Order
          </p>
          <button
            type="button"
            onClick={downloadTemplate}
            className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold font-heading text-brand-primary bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 rounded-lg px-2.5 py-1.5 transition-all"
          >
            <Download className="w-3 h-3" />
            Template
          </button>
        </div>
        <div className="w-full overflow-x-auto rounded-lg bg-white border border-slate-200 px-3 py-2">
          <code className="text-[11px] text-slate-500 whitespace-nowrap">
            order, type, question, explanation, marks, section, optionA,
            optionB, optionC, optionD, correct
          </code>
        </div>
        <p className="text-[11px] text-slate-400">
          <strong>type:</strong> mcq / multi / truefalse &nbsp;·&nbsp;
          <strong>correct:</strong> A, B, C, D — or A|C for multiple correct
        </p>
      </div>

      {/* Drop zone — hidden once uploaded successfully */}
      {!result && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !file && document.getElementById("csv-input")?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 transition-all",
            file
              ? "border-brand-primary/40 bg-brand-primary/5 cursor-default"
              : "border-slate-300 hover:border-brand-primary/50 bg-white cursor-pointer",
          )}
        >
          <input
            id="csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-brand-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold font-heading text-slate-800 text-sm truncate max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              {uploading && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              {!uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setError(null);
                  }}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" /> Remove file
                </button>
              )}
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileUp className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold font-heading text-slate-700">
                  Click or drag your CSV here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Max 5MB · .csv only
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="flex flex-col items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-6 py-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg font-bold font-heading text-green-800">
            {result.inserted} Questions Imported!
          </p>
          <p className="text-sm text-green-700">
            All questions added to <strong>{test.title}</strong>.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        {!result ? (
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            size="lg"
            className="flex-1 h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold font-heading"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> Import Questions
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            size="lg"
            className="flex-1 h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold font-heading"
          >
            Done <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
        <Button
          onClick={onComplete}
          variant="outline"
          size="lg"
          className="h-12 rounded-2xl border-slate-200 text-slate-600 font-heading font-bold"
        >
          Skip
        </Button>
      </div>
    </div>
  );
}
