import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from "axios";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  FileUp,
  Info,
} from "lucide-react";
import { useState } from "react";
import { CreatedTest } from "../create-test-wizard";
import useConfirm from "@/hooks/use-confirm";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

  const { isOpen, confirm, handleConfirm, handleCancel, close } = useConfirm();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.name.endsWith(".csv")) {
      setError("Only CSV files are accepted.");
      return;
    }
    // validate file size
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
    // validate file size
    if (dropped.size > 5 * 1024 * 1024) {
      setError("CSV file must be under 5MB.");
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
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.details?.[0]?.message ||
            "Failed to upload questions.",
        );
      } else {
        setError("Failed to upload questions.");
      }
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
    <div className="w-full flex flex-col gap-4 sm:gap-5 min-w-0 px-2 sm:px-0">
      {/* Test badge */}
      <div className="flex items-center gap-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl px-3 sm:px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs text-brand-primary/80 font-heading font-semibold mb-0.5">
            Test Created Successfully
          </p>
          <p className="text-sm sm:text-base font-bold font-heading text-brand-primary truncate">
            {test.title}
          </p>
        </div>
      </div>

      {/* CSV hint card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm font-bold font-heading text-slate-700">
              CSV Upload Format
            </p>
          </div>

          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center justify-center gap-1.5 text-xs font-bold font-heading text-brand-primary bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 transition-all shadow-sm w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            Template
          </button>
        </div>

        {/* Code block */}
        <div className="w-full flex items-center flex-wrap gap-1.5">
          {[
            "order",
            "type",
            "question",
            "explanation",
            "marks",
            "section",
            "optionA",
            "optionB",
            "optionC",
            "optionD",
            "correct",
          ].map((field, i, arr) => (
            <div key={field} className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md px-2.5 py-1">
                {field}
              </span>
              {i < arr.length - 1 && (
                <span className="text-slate-300 text-xs">›</span>
              )}
            </div>
          ))}
        </div>

        <div className="text-[10px] sm:text-[11px] text-slate-500 bg-white border border-slate-100 p-3 rounded-xl leading-relaxed wrap-break-words">
          <span className="font-bold text-slate-700">type:</span> mcq, multi,
          truefalse
          <br />
          <span className="font-bold text-slate-700">correct:</span> A, B, C, D
          (use A|C for multiple)
        </div>
      </div>

      {/* Drop zone */}
      {!result && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !file && document.getElementById("csv-input")?.click()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-3 transition-all text-center",
            file
              ? "border-brand-primary/40 bg-brand-primary/5"
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

              <div className="w-full px-2">
                <p className="font-bold font-heading text-slate-800 text-sm truncate">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {uploading && (
                <div className="w-full max-w-xs mt-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary transition-all"
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
                  className="text-xs font-bold text-slate-400 hover:text-red-500 mt-2"
                >
                  Remove file
                </button>
              )}
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileUp className="w-6 h-6 text-slate-400" />
              </div>

              <div>
                <p className="text-sm font-bold font-heading text-slate-700">
                  Tap or drag CSV file
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
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 sm:px-4 py-3 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="wrap-break-words">{error}</span>
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="flex flex-col items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-6 text-center">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
          <p className="text-base sm:text-lg font-bold font-heading text-green-800">
            {result.inserted} Questions Imported!
          </p>
          <p className="text-sm text-green-700 wrap-break-words">
            All questions added to <strong>{test.title}</strong>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!result ? (
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            size="lg"
            className="w-full sm:flex-1 h-12 rounded-2xl"
          >
            {uploading ? "Importing..." : "Import Questions"}
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full sm:flex-1 h-12 rounded-2xl font-bold font-heading text-sm"
          >
            Done
          </Button>
        )}

        <Button
          onClick={async () => {
            if (file) {
              const yes = await confirm();
              if (!yes) return;
              close();
            }
            onComplete();
          }}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto h-12 rounded-2xl font-bold font-heading text-slate-600"
        >
          Skip
        </Button>
      </div>

      <ConfirmDialog
        open={isOpen}
        message="You have selected a CSV file. Skipping will discard it. Are you sure?"
        confirmLabel="Yes, skip"
        cancelLabel="Keep editing"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}
