import type { Test } from "@/src/db/schema/tests";

export const STATUS_MAP: Record<
  Test["status"],
  { label: string; dot: string; cls: string; ping?: boolean }
> = {
  draft: {
    label: "Draft",
    dot: "bg-slate-400",
    cls: "bg-slate-100 text-slate-600 border-slate-200",
  },
  published: {
    label: "Published",
    dot: "bg-green-500",
    ping: true,
    cls: "bg-green-50 text-green-700 border-green-200",
  },
  archived: {
    label: "Archived",
    dot: "bg-amber-500",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

export const DIFFICULTY_VARIANT_MAP = {
  easy: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};
