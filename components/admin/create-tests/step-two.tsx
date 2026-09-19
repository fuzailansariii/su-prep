import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Layers,
  ListTree,
} from "lucide-react";
import { CreatedTest } from "../create-test-wizard";

// Questions live under Test → Set → Section and are imported per section
// from Excel, so after creating a test the admin continues by adding a set.
const nextSteps = [
  {
    icon: Layers,
    title: "Create a set",
    text: "Each test contains one or more sets (e.g. Set 1, Set 2).",
  },
  {
    icon: ListTree,
    title: "Add sections to the set",
    text: "Group questions into sections like English, GK, Maths.",
  },
  {
    icon: FileSpreadsheet,
    title: "Import questions from Excel",
    text: "Upload an .xlsx / .xls file into each section.",
  },
];

export function AddQuestionsStep({
  test,
  onComplete,
}: {
  test: CreatedTest;
  onComplete: () => void;
}) {
  return (
    <div className="w-full flex flex-col gap-4 sm:gap-5 min-w-0 px-2 sm:px-0">
      {/* Test badge */}
      <div className="flex items-center gap-3 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl px-3 sm:px-4 py-3">
        <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs text-brand-primary/80 font-heading font-semibold mb-0.5">
            Test Created Successfully
          </p>
          <p className="text-sm sm:text-base font-bold font-heading text-brand-primary truncate">
            {test.title}
          </p>
        </div>
      </div>

      {/* How questions are added */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <p className="text-sm font-bold font-heading text-slate-700">
            How to add questions
          </p>
          <a
            href="/api/admin/questions/template"
            download
            className="flex items-center justify-center gap-1.5 text-xs font-bold font-heading text-brand-primary bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 transition-all shadow-sm w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            Excel Template
          </a>
        </div>

        <ol className="flex flex-col gap-2">
          {nextSteps.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="flex items-start gap-3 bg-white border border-slate-100 rounded-xl p-3"
            >
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-brand-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold font-heading text-slate-800">
                  {i + 1}. {title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          asChild
          size="lg"
          className="w-full sm:flex-1 h-12 rounded-2xl font-bold font-heading text-sm"
        >
          <Link
            href={`/admin/tests/${test.id}/sets/create`}
            onClick={() => {
              // clear the saved wizard state so it doesn't reopen on step 2
              sessionStorage.removeItem("wizard_step");
              sessionStorage.removeItem("wizard_test");
            }}
          >
            Create First Set
          </Link>
        </Button>

        <Button
          onClick={onComplete}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto h-12 rounded-2xl font-bold font-heading text-slate-600"
        >
          Do it later
        </Button>
      </div>
    </div>
  );
}
