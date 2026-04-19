import { AlertCircle, Info } from "lucide-react";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold font-heading text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" /> {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}
