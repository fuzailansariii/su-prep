"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export type QuestionBreakdownAnswer = {
  id: string;
  questionId: string;
  selectedOptionIds: string[] | null;
  isCorrect: boolean;
  marksAwarded: number;
  question: {
    id: string;
    questionText: string;
    explanation: string | null;
    marks: number;
    order: number;
    section?: {
      id: string;
      name: string;
      order: number;
    } | null;
    options: {
      id: string;
      optionText: string;
      isCorrect: boolean;
      order: number;
    }[];
  };
};

type QuestionBreakdownProps = {
  answers: QuestionBreakdownAnswer[];
};

export default function QuestionBreakdownAccordion({
  answers,
}: QuestionBreakdownProps) {
  const [filter, setFilter] = useState<"all" | "correct" | "wrong" | "skipped">(
    "all",
  );

  const sortedAnswers = useMemo(() => {
    return [...answers].sort((a, b) => a.question.order - b.question.order);
  }, [answers]);

  const counts = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    sortedAnswers.forEach((item) => {
      const selected = item.selectedOptionIds || [];
      if (selected.length === 0) {
        skipped++;
      } else if (item.isCorrect) {
        correct++;
      } else {
        wrong++;
      }
    });

    return {
      all: sortedAnswers.length,
      correct,
      wrong,
      skipped,
    };
  }, [sortedAnswers]);

  const filteredAnswers = useMemo(() => {
    return sortedAnswers.filter((item) => {
      const isSkipped =
        !item.selectedOptionIds || item.selectedOptionIds.length === 0;
      if (filter === "correct") return item.isCorrect && !isSkipped;
      if (filter === "wrong") return !item.isCorrect && !isSkipped;
      if (filter === "skipped") return isSkipped;
      return true;
    });
  }, [sortedAnswers, filter]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col gap-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-heading font-bold text-xl text-slate-800">
            Detailed Solutions & Answer Key
          </h2>
          <p className="text-sm font-sans text-slate-500 mt-0.5">
            Review your answers, correct options, and step-by-step explanations.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1 self-start sm:self-auto overflow-x-auto max-w-full">
          {(["all", "correct", "wrong", "skipped"] as const).map((tab) => {
            const count = counts[tab];
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold capitalize transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredAnswers.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center gap-2">
          <HelpCircle className="w-8 h-8 text-slate-400" />
          <p className="font-heading font-bold text-slate-700">
            No questions found
          </p>
          <p className="text-xs font-sans text-slate-500">
            There are no questions matching the &quot;{filter}&quot; filter.
          </p>
        </div>
      ) : (
        /* Questions Accordion List */
        <Accordion type="multiple" className="space-y-3">
          {filteredAnswers.map((item) => {
            const { question, isCorrect, marksAwarded } = item;
            const selectedOptionIds = item.selectedOptionIds || [];
            const isSkipped = selectedOptionIds.length === 0;

            return (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="border border-slate-200/80 rounded-xl px-4 overflow-hidden bg-slate-50/40 data-[state=open]:bg-white transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center justify-between w-full pr-4 text-left gap-3">
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-heading font-bold text-xs sm:text-sm text-slate-500 min-w-2">
                        Q.
                      </span>

                      {/* Question Status Icon & Badge */}
                      {isSkipped ? (
                        <Badge
                          variant="outline"
                          className="bg-slate-100 text-slate-600 border-slate-300 flex gap-1 items-center font-heading text-xs"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                          <span className="hidden md:block">Skipped</span>
                        </Badge>
                      ) : isCorrect ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex gap-1 items-center font-heading text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />{" "}
                          <span className="hidden md:block">Correct</span>
                          (+{marksAwarded})
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border border-red-200 hover:bg-red-100 flex gap-1 items-center font-heading text-xs">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          <span className="hidden md:block">Wrong</span>(
                          {marksAwarded})
                        </Badge>
                      )}
                    </div>

                    <p className="font-heading font-semibold text-slate-800 text-xs sm:text-sm line-clamp-1 flex-1">
                      {question.questionText}
                    </p>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-2 pb-6 space-y-4">
                  {/* Section Label if present */}
                  {question.section && (
                    <div className="inline-block bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-heading font-bold px-2.5 py-0.5 rounded-md">
                      Section: {question.section.name}
                    </div>
                  )}

                  {/* Full Question Text */}
                  <div className="p-4 bg-slate-100/80 rounded-xl border border-slate-200/80">
                    <p className="font-sans text-slate-900 font-medium text-sm sm:text-base leading-relaxed">
                      {question.questionText}
                    </p>
                  </div>

                  {/* Options List with Color Highlights */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-heading font-bold text-slate-500 uppercase tracking-wider">
                      Options Breakdown
                    </p>

                    {[...question.options]
                      .sort((a, b) => a.order - b.order)
                      .map((opt) => {
                        const isUserSelected = selectedOptionIds.includes(
                          opt.id,
                        );
                        const isOptionCorrect = opt.isCorrect;

                        let optionBg =
                          "bg-white border-slate-200 text-slate-700";
                        let badgeLabel = null;

                        if (isUserSelected && isOptionCorrect) {
                          // User picked CORRECT answer ✅
                          optionBg =
                            "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold";
                          badgeLabel = (
                            <span className="text-[11px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3 h-3" /> Your Choice
                              (Correct)
                            </span>
                          );
                        } else if (isUserSelected && !isOptionCorrect) {
                          // User picked WRONG answer ❌
                          optionBg =
                            "bg-red-50 border-red-300 text-red-900 font-semibold";
                          badgeLabel = (
                            <span className="text-[11px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                              <XCircle className="w-3 h-3" /> Your Choice
                              (Incorrect)
                            </span>
                          );
                        } else if (isOptionCorrect) {
                          // Correct option when user picked wrong or skipped ✅
                          optionBg =
                            "bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium";
                          badgeLabel = (
                            <span className="text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                              Correct Answer
                            </span>
                          );
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${optionBg}`}
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <span className="font-heading font-bold text-xs w-6 h-6 rounded-full bg-slate-200/70 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 text-slate-700">
                                {String.fromCharCode(65 + opt.order)}
                              </span>
                              <span className="text-xs sm:text-sm font-sans leading-relaxed">
                                {opt.optionText}
                              </span>
                            </div>
                            {badgeLabel}
                          </div>
                        );
                      })}
                  </div>

                  {/* Explanation Section */}
                  {question.explanation && (
                    <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-heading font-bold text-sm text-blue-900 mb-1">
                          Explanation & Solution
                        </h4>
                        <p className="text-xs sm:text-sm font-sans text-blue-800 leading-relaxed whitespace-pre-line">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
