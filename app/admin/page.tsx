"use client";
import { Column, Table } from "@/components/data-table";
import { InsightCard } from "@/components/insight-card";
import { ProgressCard } from "@/components/progress-card";
import StatCard from "@/components/stat-card";
import { Banknote, CircleCheckBig, ClipboardList, Users } from "lucide-react";

export default function AdminTests() {
  type ExamRow = {
    id: string;
    user_email: string;
    test_name: string;
    score: string;
    date: string;
    status: string;
  };

  const data: ExamRow[] = [
    {
      id: "1",
      user_email: "fuzail@email.com",
      test_name: "Calculus I",
      score: "92",
      date: "2026-04-10",
      status: "Active",
    },
    {
      id: "1",
      user_email: "fuzail@email.com",
      test_name: "Calculus I",
      score: "92",
      date: "2026-04-10",
      status: "Active",
    },
    {
      id: "1",
      user_email: "fuzail@email.com",
      test_name: "Calculus I",
      score: "92",
      date: "2026-04-10",
      status: "Active",
    },
    {
      id: "1",
      user_email: "fuzail@email.com",
      test_name: "Calculus I",
      score: "92",
      date: "2026-04-10",
      status: "Active",
    },
    {
      id: "1",
      user_email: "fuzail@email.com",
      test_name: "Calculus I",
      score: "92",
      date: "2026-04-10",
      status: "Active",
    },
  ];

  const columns: Column<ExamRow>[] = [
    {
      label: "User Email",
      accessor: (row) => row.user_email,
    },
    {
      label: "Test Name",
      accessor: (row) => row.test_name,
    },
    {
      label: "Score",
      accessor: (row) => row.score,
    },
    {
      label: "Date",
      accessor: (row) => row.date,
    },
    {
      label: "Status",
      accessor: (row) => row.status,
      render: (value) => (
        <span className="text-green-600 font-medium">{String(value)}</span>
      ),
    },
  ];
  return (
    <div className="md:px-[40px] md:py-[48px] space-y-7">
      <div className="flex flex-col text-center md:text-start">
        <p className="font-heading tracking-tight text-xl font-semibold text-black">
          Exam Analytics
        </p>
        <p className="text-sm text-[#545F73] font-sans tracking-tights">
          Real-time performance metrics
        </p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <StatCard count="12" label="Total Tests" icon={<ClipboardList />} />
        <StatCard count="8" label="Published Tests" icon={<CircleCheckBig />} />
        <StatCard count="134" label="Total Attempts" icon={<Users />} />
        <StatCard count="5000" label="Gross Revenue" icon={<Banknote />} />
      </div>
      <div>
        <Table data={data} columns={columns} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProgressCard
          title="Test Popularity"
          data={[
            { label: "Navigation Tier II", value: 45 },
            { label: "Cargo Handling", value: 30 },
            { label: "Engine Ops", value: 25 },
          ]}
        />

        <InsightCard
          title="Deep Insight: Certification Trend"
          description="System data shows a 12% increase in Navigation Tier II certifications across your active vessel rosters this quarter."
        />
      </div>
    </div>
  );
}
