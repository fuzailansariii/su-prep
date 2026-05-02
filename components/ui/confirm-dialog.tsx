"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onCancel} 
      />
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[400px] p-6 sm:p-8 flex flex-col gap-6 relative z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          {variant === "danger" && (
            <div className="w-12 h-12 shrink-0 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          )}
          <div className="flex-1 mt-1">
            <h3 className="text-xl font-black font-heading text-slate-900 tracking-tight">
              {title || "Confirm Action"}
            </h3>
            <p className="text-sm text-slate-500 font-body leading-relaxed mt-2">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <Button 
            variant="outline" 
            className="flex-1 h-11 rounded-xl text-slate-600 border-slate-200 hover:bg-slate-50 font-bold font-heading disabled:opacity-50" 
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button 
            className={cn(
              "flex-1 h-11 rounded-xl text-white font-bold font-heading shadow-sm",
              variant === "danger" 
                ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" 
                : "bg-brand-primary hover:bg-brand-primary/90 shadow-brand-primary/20",
              isLoading && "opacity-70 cursor-not-allowed"
            )}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
