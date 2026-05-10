import { db } from "@/src/db";
import { questions, sections, sets } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import QuestionActions from "@/components/admin/tests/question-actions";

const TYPE_LABELS: Record<string, string> = {
  mcq: "MCQ",
  multi: "Multi-correct",
  truefalse: "True / False",
};

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export default async function SectionQuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; setId: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { id: testId, setId } = await params;
  const { section: sectionId } = await searchParams;

  if (!sectionId) notFound();

  const [set, section, allQuestions] = await Promise.all([
    db.query.sets.findFirst({
      where: and(eq(sets.id, setId), eq(sets.testId, testId)),
      columns: { title: true },
    }),
    db.query.sections.findFirst({
      where: and(eq(sections.id, sectionId), eq(sections.setId, setId)),
    }),
    db.query.questions.findMany({
      where: and(
        eq(questions.setId, setId),
        eq(questions.sectionId, sectionId),
      ),
      orderBy: (q, { asc }) => [asc(q.order)],
      with: {
        options: { orderBy: (o, { asc }) => [asc(o.order)] },
      },
    }),
  ]);

  if (!set || !section) notFound();

  return (
    <Container className="py-8 md:py-10 px-0 max-w-4xl mx-auto flex flex-col gap-5">
      {/* Top nav */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          asChild
          className="inline-flex items-center gap-1.5 text-sm font-heading font-bold text-slate-500 hover:text-slate-900"
        >
          <Link href={`/admin/tests/${testId}/sets/${setId}`}>
            <ChevronLeft size={16} /> Back to Set
          </Link>
        </Button>
      </div>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5">
        <p className="text-xs text-slate-400 font-sans mb-1">{set.title}</p>
        <h1 className="text-xl font-heading font-bold text-slate-900">
          {section.name}
        </h1>
        <p className="text-sm text-slate-500 font-sans mt-1">
          {allQuestions.length} question{allQuestions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Questions */}
      {allQuestions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 flex flex-col items-center gap-3 text-center">
          <BookOpen size={32} className="text-slate-200" />
          <p className="text-sm text-slate-400 font-sans">
            No questions yet. Import from the set detail page.
          </p>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-xl font-heading font-bold"
          >
            <Link href={`/admin/tests/${testId}/sets/${setId}`}>
              <ChevronLeft size={13} className="mr-1" /> Back to Set
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {allQuestions.map((q, i) => (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
            >
              {/* Question header */}
              <div className="flex justify-between gap-3 px-5 py-4">
                <div className="flex items-start gap-3 max-w-[80%]">
                  <span className="shrink-0 mt-0.5 text-xs font-heading font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Q{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-heading font-bold uppercase px-1.5 py-0.5 rounded ${
                          q.type === "mcq"
                            ? "bg-blue-50 text-blue-600"
                            : q.type === "multi"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {TYPE_LABELS[q.type]}
                      </span>
                      <span className="text-[10px] font-heading font-bold text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                        {q.marks} {q.marks === 1 ? "mark" : "marks"}
                      </span>
                    </div>
                    <p className="text-sm font-sans text-slate-800 leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <QuestionActions questionId={q.id} />
              </div>

              {/* Options */}
              <div className="px-5 pb-4 flex flex-col gap-2 pl-14">
                {q.options.map((opt, oi) => (
                  <div
                    key={opt.id}
                    className={`flex items-start gap-2.5 rounded-xl px-3 py-2.5 ${
                      opt.isCorrect
                        ? "bg-green-50 border border-green-200"
                        : "bg-slate-50 border border-slate-100"
                    }`}
                  >
                    <span
                      className={`shrink-0 text-xs font-heading font-bold mt-0.5 w-4 ${
                        opt.isCorrect ? "text-green-600" : "text-slate-400"
                      }`}
                    >
                      {OPTION_LABELS[oi]}.
                    </span>
                    <span
                      className={`text-sm font-sans leading-snug flex-1 ${
                        opt.isCorrect
                          ? "text-green-700 font-semibold"
                          : "text-slate-600"
                      }`}
                    >
                      {opt.optionText}
                    </span>
                    {opt.isCorrect && (
                      <CheckCircle2
                        size={15}
                        className="text-green-500 shrink-0 mt-0.5"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div className="border-t border-slate-100 px-5 py-3 pl-14 bg-slate-50/60">
                  <p className="text-[10px] font-heading font-bold text-slate-400 uppercase tracking-wide mb-1">
                    Explanation
                  </p>
                  <p className="text-xs text-slate-500 font-sans leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
