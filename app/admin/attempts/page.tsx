"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  Repeat,
  CheckCircle2,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/stat-card";
import { ATTEMPT_STATUS_MAP } from "@/components/contants/test.constants";

type Attempt = {
  id: string;
  userId: string;
  userEmail: string;
  testTitle: string;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: string;
  submittedAt: string | null;
  timeTaken: number | null;
  score: number | null;
  scoredMarks: number | null;
  totalMarks: number | null;
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function AttemptStatusBadge({ status }: { status: Attempt["status"] }) {
  const cfg = ATTEMPT_STATUS_MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-heading font-bold border rounded-lg px-2.5 py-1",
        cfg.cls,
      )}
    >
      <span className="relative flex h-2 w-2">
        {cfg.ping && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", cfg.dot)} />
      </span>
      {cfg.label}
    </span>
  );
}

type SortField = keyof Pick<
  Attempt,
  "userEmail" | "testTitle" | "status" | "score" | "timeTaken" | "startedAt"
>;

export default function AdminAttemptsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("startedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchAttempts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/admin/attempts");
      setAttempts(res.data.data);
    } catch {
      setError("Failed to load attempts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField !== field ? null : sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );

  const filtered = attempts
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .filter(
      (a) =>
        !search ||
        a.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        a.testTitle.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const counts = {
    all: attempts.length,
    completed: attempts.filter((a) => a.status === "completed").length,
    in_progress: attempts.filter((a) => a.status === "in_progress").length,
    abandoned: attempts.filter((a) => a.status === "abandoned").length,
  };

  const avgScore =
    counts.completed > 0
      ? Math.round(
          attempts
            .filter((a) => a.score !== null)
            .reduce((s, a) => s + (a.score ?? 0), 0) / counts.completed,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading tracking-tight text-xl font-bold text-black">
            Attempts
          </h1>
          <p className="text-sm text-[#545F73] font-sans mt-0.5">
            All student test attempts across the platform
          </p>
        </div>
        <button
          onClick={fetchAttempts}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 transition-all"
          title="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Stat cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard count={counts.all} label="Total Attempts" icon={<Repeat size={18} />} />
          <StatCard count={counts.completed} label="Completed" icon={<CheckCircle2 size={18} />} />
          <StatCard count={counts.in_progress} label="In Progress" icon={<Clock size={18} />} />
          <StatCard count={`${avgScore}%`} label="Avg Score" icon={<BarChart2 size={18} />} />
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "all", label: "All" },
            { key: "completed", label: "Completed" },
            { key: "in_progress", label: "In Progress" },
            { key: "abandoned", label: "Abandoned" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold font-heading transition-all",
              statusFilter === f.key
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-white text-slate-500 hover:text-slate-800 border border-slate-200",
            )}
          >
            {f.label}
            <span
              className={cn(
                "text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                statusFilter === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
              )}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by email or test..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 font-sans"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchAttempts} className="ml-auto text-xs font-bold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-bold font-heading text-slate-600">No attempts found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting the filter or search</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {(
                        [
                          { label: "Student", field: "userEmail" },
                          { label: "Test", field: "testTitle" },
                          { label: "Status", field: "status" },
                          { label: "Score", field: "score" },
                          { label: "Duration", field: "timeTaken" },
                          { label: "Started", field: "startedAt" },
                        ] as { label: string; field: SortField }[]
                      ).map((col) => (
                        <th
                          key={col.field}
                          onClick={() => toggleSort(col.field)}
                          className="px-4 py-3 text-left text-xs font-bold font-heading text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-800 select-none whitespace-nowrap"
                        >
                          {col.label}
                          <SortIcon field={col.field} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 font-sans truncate max-w-[200px]">{a.userEmail}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-700 font-sans truncate max-w-[200px]">{a.testTitle}</p>
                        </td>
                        <td className="px-4 py-3">
                          <AttemptStatusBadge status={a.status} />
                        </td>
                        <td className="px-4 py-3 font-heading font-bold">
                          {a.score !== null ? (
                            <span className={a.score >= 60 ? "text-green-600" : "text-red-500"}>
                              {a.score}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-sans whitespace-nowrap">
                          {formatDuration(a.timeTaken)}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-sans whitespace-nowrap text-xs">
                          {new Date(a.startedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filtered.map((a) => (
                  <div key={a.id} className="p-4 space-y-3">
                    {/* Top row: email + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold font-heading text-slate-800 truncate">
                          {a.userEmail}
                        </p>
                        <p className="text-xs text-slate-500 font-sans mt-0.5 truncate">
                          {a.testTitle}
                        </p>
                      </div>
                      <AttemptStatusBadge status={a.status} />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <p className={cn("font-bold font-heading text-base",
                          a.score === null ? "text-slate-400" : a.score >= 60 ? "text-green-600" : "text-red-500"
                        )}>
                          {a.score !== null ? `${a.score}%` : "—"}
                        </p>
                        <p className="text-slate-500 mt-0.5">Score</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <p className="font-bold font-heading text-slate-700 text-base">
                          {formatDuration(a.timeTaken)}
                        </p>
                        <p className="text-slate-500 mt-0.5">Duration</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <p className="font-bold font-heading text-slate-700 text-base">
                          {new Date(a.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                        <p className="text-slate-500 mt-0.5">Date</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
