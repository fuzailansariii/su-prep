"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Trophy,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/stat-card";

type Student = {
  userId: string;
  email: string;
  name: string;
  joinedAt: string;
  purchasedTests: number;
  totalAttempts: number;
  completedTests: number;
  avgScore: number;
};



export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Student>("joinedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("/api/admin/students");
      setStudents(res.data.data);
    } catch {
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const toggleSort = (field: keyof Student) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ field }: { field: keyof Student }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  const filtered = students
    .filter(
      (s) =>
        !search ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      const av = a[sortField] ?? "";
      const bv = b[sortField] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  const totalPurchases = students.reduce((s, st) => s + st.purchasedTests, 0);
  const totalCompleted = students.reduce((s, st) => s + st.completedTests, 0);
  const overallAvg =
    students.length > 0
      ? Math.round(
          students.reduce((s, st) => s + st.avgScore, 0) / students.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading tracking-tight text-xl font-bold text-black">
            Students
          </h1>
          <p className="text-sm text-[#545F73] font-sans mt-0.5">
            All students who have purchased tests
          </p>
        </div>
        <button
          onClick={fetchStudents}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-brand-primary hover:border-brand-primary/40 transition-all"
          title="Refresh"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Summary stat cards */}
      {!loading && !error && students.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard count={students.length} label="Total Students" icon={<Users size={18} />} />
          <StatCard count={totalPurchases} label="Total Purchases" icon={<ShoppingBag size={18} />} />
          <StatCard count={totalCompleted} label="Tests Completed" icon={<BookOpen size={18} />} />
          <StatCard count={`${overallAvg}%`} label="Avg Score" icon={<Trophy size={18} />} />
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 font-sans"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
          <button
            onClick={fetchStudents}
            className="ml-auto text-xs font-bold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-bold font-heading text-slate-600">
                No students found
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Students appear here once they purchase a test
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {[
                        { label: "Student", field: "name" as const },
                        { label: "Joined", field: "joinedAt" as const },
                        { label: "Purchased", field: "purchasedTests" as const },
                        { label: "Attempts", field: "totalAttempts" as const },
                        { label: "Completed", field: "completedTests" as const },
                        { label: "Avg Score", field: "avgScore" as const },
                      ].map((col) => (
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
                    {filtered.map((s) => (
                      <tr
                        key={s.userId}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 font-sans">
                            {s.name}
                          </p>
                          <p className="text-xs text-slate-400 font-sans truncate max-w-[220px]">
                            {s.email}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-sans text-xs whitespace-nowrap">
                          {s.joinedAt}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold font-heading text-indigo-600">
                            {s.purchasedTests}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold font-heading text-slate-700">
                            {s.totalAttempts}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold font-heading text-emerald-600">
                            {s.completedTests}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {s.completedTests > 0 ? (
                            <span
                              className={cn(
                                "font-bold font-heading",
                                s.avgScore >= 60
                                  ? "text-green-600"
                                  : "text-red-500",
                              )}
                            >
                              {s.avgScore}%
                            </span>
                          ) : (
                            <span className="text-slate-400 font-sans">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {filtered.map((s) => (
                  <div key={s.userId} className="p-4 space-y-3">
                    <div>
                      <p className="font-bold font-heading text-slate-800">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-400 font-sans">
                        {s.email}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-indigo-50 rounded-lg p-2">
                        <p className="font-bold font-heading text-indigo-600 text-base">
                          {s.purchasedTests}
                        </p>
                        <p className="text-slate-500">Purchased</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2">
                        <p className="font-bold font-heading text-emerald-600 text-base">
                          {s.completedTests}
                        </p>
                        <p className="text-slate-500">Completed</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-2">
                        <p
                          className={cn(
                            "font-bold font-heading text-base",
                            s.avgScore >= 60
                              ? "text-green-600"
                              : s.completedTests === 0
                                ? "text-slate-400"
                                : "text-red-500",
                          )}
                        >
                          {s.completedTests > 0 ? `${s.avgScore}%` : "—"}
                        </p>
                        <p className="text-slate-500">Avg Score</p>
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
