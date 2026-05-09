import { relations } from "drizzle-orm";
import { tests } from "./tests";
import { questions, options } from "./questions";
import { purchases } from "./purchases";
import { attempts, attemptAnswers } from "./attempts";
import { results, leaderboard } from "./results";
import { sets } from "./sets";
import { sections } from "./sections";

// ── TESTS ──
// A test has many purchases and many sets
export const testsRelations = relations(tests, ({ many }) => ({
  purchases: many(purchases),
  sets: many(sets),
}));

// ── SETS ──
// A set belongs to ONE test, and has MANY questions, and has MANY sections
export const setsRelations = relations(sets, ({ one, many }) => ({
  test: one(tests, {
    fields: [sets.testId],
    references: [tests.id],
  }),
  questions: many(questions),
  sections: many(sections),
  attempts: many(attempts),
  results: many(results),
  leaderboard: many(leaderboard),
}));

// ── SECTIONS ──
// A section belongs to ONE set, and has MANY questions
export const sectionsRelations = relations(sections, ({ one, many }) => ({
  set: one(sets, {
    fields: [sections.setId],
    references: [sets.id],
  }),
  questions: many(questions),
}));

// ── QUESTIONS ──
// A question belongs to ONE set, and has MANY options, and has MANY attemptAnswers
export const questionsRelations = relations(questions, ({ one, many }) => ({
  set: one(sets, {
    fields: [questions.setId],
    references: [sets.id],
  }),
  section: one(sections, {
    fields: [questions.sectionId],
    references: [sections.id],
  }),
  options: many(options),
  attemptAnswers: many(attemptAnswers),
}));

// ── OPTIONS ──
// An option belongs to ONE question
export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}));

// ── PURCHASES ──
// A purchase belongs to ONE test
export const purchasesRelations = relations(purchases, ({ one }) => ({
  test: one(tests, {
    fields: [purchases.testId],
    references: [tests.id],
  }),
}));

// ── ATTEMPTS ──
// An attempt belongs to ONE test, has MANY answers, and has ONE result
export const attemptsRelations = relations(attempts, ({ one, many }) => ({
  set: one(sets, {
    fields: [attempts.setId],
    references: [sets.id],
  }),
  result: one(results, {
    fields: [attempts.id],
    references: [results.attemptId],
  }),
  answers: many(attemptAnswers),
}));

// ── ATTEMPT ANSWERS ──
// An answer belongs to ONE attempt, and belongs to ONE question
export const attemptAnswersRelations = relations(attemptAnswers, ({ one }) => ({
  attempt: one(attempts, {
    fields: [attemptAnswers.attemptId],
    references: [attempts.id],
  }),
  question: one(questions, {
    fields: [attemptAnswers.questionId],
    references: [questions.id],
  }),
}));

// ── RESULTS ──
// A result belongs to ONE test, belongs to ONE attempt, has ONE leaderboard entry
export const resultsRelations = relations(results, ({ one }) => ({
  set: one(sets, {
    fields: [results.setId],
    references: [sets.id],
  }),
  attempt: one(attempts, {
    fields: [results.attemptId],
    references: [attempts.id],
  }),
  leaderboard: one(leaderboard, {
    fields: [results.id],
    references: [leaderboard.resultId],
  }),
}));

// ── LEADERBOARD ──
// A leaderboard entry belongs to ONE test, belongs to ONE result
export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
  set: one(sets, {
    fields: [leaderboard.setId],
    references: [sets.id],
  }),
  result: one(results, {
    fields: [leaderboard.resultId],
    references: [results.id],
  }),
}));
