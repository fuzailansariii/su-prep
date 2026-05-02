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

export const ATTEMPT_STATUS_MAP: Record<
  "completed" | "in_progress" | "abandoned",
  { label: string; dot: string; cls: string; ping?: boolean }
> = {
  completed: {
    label: "Completed",
    dot: "bg-green-500",
    cls: "bg-green-50 text-green-700 border-green-200",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-amber-500",
    ping: true,
    cls: "bg-amber-50 text-amber-700 border-amber-200",
  },
  abandoned: {
    label: "Abandoned",
    dot: "bg-red-400",
    cls: "bg-red-50 text-red-600 border-red-200",
  },
};

export const DIFFICULTY_VARIANT_MAP = {
  easy: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200",
};
