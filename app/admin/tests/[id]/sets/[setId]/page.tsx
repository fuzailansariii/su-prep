import { db } from "@/src/db";
import { sections, sets, tests } from "@/src/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { MiniStat } from "@/components/ui/mini-stat";
import { SectionsList } from "@/components/admin/sections-list";

export default async function SetDetailsPage({
  params,
}: {
  params: Promise<{ id: string; setId: string }>;
}) {
  const { id: testId, setId } = await params;

  const [test, set, rawSections] = await Promise.all([
    db.query.tests.findFirst({
      where: and(eq(tests.id, testId), isNull(tests.deletedAt)),
    }),
    db.query.sets.findFirst({
      where: and(eq(sets.id, setId), eq(sets.testId, testId)),
    }),
    db.query.sections.findMany({
      where: eq(sections.setId, setId),
      orderBy: (s, { asc }) => [asc(s.order)],
      with: { questions: { columns: { id: true } } },
    }),
  ]);

  if (!test || !set) notFound();

  const initialSections = rawSections.map((s) => ({
    ...s,
    questionCount: s.questions.length,
  }));

  return (
    <Container className="py-8 md:py-10 px-0 max-w-4xl mx-auto flex flex-col gap-5">

      {/* Top nav */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          asChild
          className="inline-flex items-center gap-1.5 text-sm font-heading font-bold text-slate-500 hover:text-slate-900"
        >
          <Link href={`/admin/tests/${testId}`}>
            <ChevronLeft size={16} /> Back to Test
          </Link>
        </Button>
        <Button
          asChild
          className="h-9 rounded-xl font-heading font-bold text-sm bg-brand-primary hover:bg-brand-primary/90 text-white"
        >
          <Link href={`/admin/tests/${testId}/sets/${setId}/edit`}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit Set
          </Link>
        </Button>
      </div>

      {/* Main info card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-start gap-6">

          {/* Left: title + description + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusBadge status={set.status} />
              <span className="text-xs font-heading font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                #{set.order}
              </span>
              <span className="text-xs text-slate-500 font-sans bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                Part of <span className="font-bold text-slate-700">{test.title}</span>
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 leading-tight mb-2">
              {set.title}
            </h1>
            <p className="text-sm font-sans text-slate-500 leading-relaxed">
              {set.description || "No description provided."}
            </p>
          </div>

          {/* Right: key stats */}
          <div className="flex items-center gap-5 shrink-0">
            <MiniStat label="Questions" value={set.totalQuestions} />
            <div className="w-px h-8 bg-slate-100" />
            <MiniStat label="Marks" value={set.totalMarks} />
            <div className="w-px h-8 bg-slate-100" />
            <MiniStat label="Duration" value={`${set.duration}m`} />
          </div>
        </div>

        {/* Config strip */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-6 md:px-8 py-4 flex flex-wrap items-center gap-5 text-sm font-sans text-slate-600">
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <strong className="font-heading font-bold">{set.duration}</strong> min
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-slate-400" />
            <strong className="font-heading font-bold">{set.totalQuestions}</strong> questions
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-slate-400" />
            <strong className="font-heading font-bold">{set.totalMarks}</strong> marks
          </span>
          {set.negativeMarking && (
            <>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5 text-red-500">
                <AlertCircle size={14} />
                −{((set.negativeMarkFraction ?? 25) / 100).toFixed(2)} per wrong
              </span>
            </>
          )}
        </div>
      </div>

      {/* Sections */}
      <SectionsList
        testId={testId}
        setId={setId}
        initialSections={initialSections}
      />

    </Container>
  );
}
