"use client";
import { Column, Table } from "@/components/data-table";
import { InsightCard } from "@/components/insight-card";
import { ProgressCard } from "@/components/progress-card";
import StatCard from "@/components/stat-card";
import { Banknote, CircleCheckBig, ClipboardList, Users } from "lucide-react";

import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function AdminTests() {
  type ExamRow = {
    id: string;
    user_email: string;
    test_name: string;
    score: string;
    date: string;
    status: string;
  };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/admin/dashboard");
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <StatCard
              count={data.stats.totalTests}
              label="Total Tests"
              icon={<ClipboardList />}
            />
            <StatCard
              count={data.stats.publishedTests}
              label="Published Tests"
              icon={<CircleCheckBig />}
            />
            <StatCard
              count={data.stats.totalAttempts}
              label="Total Attempts"
              icon={<Users />}
            />
            <StatCard
              count={`₹${data.stats.grossRevenue}`}
              label="Gross Revenue"
              icon={<Banknote />}
            />
          </div>
          <div>
            <Table data={data.recentAttempts} columns={columns} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressCard
              title="Test Popularity"
              data={
                data.testPopularity.length > 0
                  ? data.testPopularity
                  : [{ label: "No data yet", value: 0 }]
              }
            />

            <InsightCard
              title="Deep Insight: Platform Activity"
              description={`You have a total of ${data.stats.totalAttempts} attempts across ${data.stats.publishedTests} published tests. Keep adding more mock tests to increase engagement!`}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-red-500 font-medium">
          Failed to load dashboard data.
        </div>
      )}

      <InsightCard
        title="Deep Insight: Certification Trend"
        description="System data shows a 12% increase in Navigation Tier II certifications across your active vessel rosters this quarter."
      />
    </div>
  );
}
