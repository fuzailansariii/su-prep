import * as XLSX from "xlsx";
import { NextResponse } from "next/server";

// Column layout for the template:
// question | type | marks | explanation | option_a | option_b | option_c | option_d | correct_options
export async function GET() {
  const ws_data = [
    // Header row
    [
      "question",
      "type",
      "marks",
      "explanation",
      "option_a",
      "option_b",
      "option_c",
      "option_d",
      "correct_options",
    ],
    // Example row 1 — MCQ
    [
      "What is the SI unit of force?",
      "mcq",
      1,
      "Newton is the SI unit of force (kg·m/s²).",
      "Joule",
      "Newton",
      "Pascal",
      "Watt",
      "B",
    ],
    // Example row 2 — Multi correct
    [
      "Which of the following are noble gases?",
      "multi",
      2,
      "Helium and Neon are noble gases.",
      "Helium",
      "Oxygen",
      "Neon",
      "Hydrogen",
      "A,C",
    ],
    // Example row 3 — True/False
    [
      "The Earth revolves around the Sun.",
      "truefalse",
      1,
      "",
      "True",
      "False",
      "",
      "",
      "A",
    ],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Column widths
  ws["!cols"] = [
    { wch: 50 }, // question
    { wch: 12 }, // type
    { wch: 8 },  // marks
    { wch: 40 }, // explanation
    { wch: 20 }, // option_a
    { wch: 20 }, // option_b
    { wch: 20 }, // option_c
    { wch: 20 }, // option_d
    { wch: 18 }, // correct_options
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Questions");

  // Add notes sheet
  const notes_data = [
    ["Field", "Required", "Allowed Values", "Notes"],
    ["question", "Yes", "Any text", "The question text"],
    ["type", "Yes", "mcq | multi | truefalse", "mcq = single correct, multi = multiple correct, truefalse = True/False"],
    ["marks", "No", "Integer ≥ 1", "Defaults to 1"],
    ["explanation", "No", "Any text", "Shown to students after submission"],
    ["option_a", "Yes", "Any text", "First option"],
    ["option_b", "Yes", "Any text", "Second option"],
    ["option_c", "No", "Any text", "Third option (leave blank for True/False)"],
    ["option_d", "No", "Any text", "Fourth option (leave blank for True/False)"],
    ["correct_options", "Yes", "A, B, C, D (comma-separated)", "e.g. A for MCQ, A,C for multi"],
  ];
  const ws_notes = XLSX.utils.aoa_to_sheet(notes_data);
  ws_notes["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 30 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws_notes, "Instructions");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="questions_template.xlsx"',
    },
  });
}
