import { relations } from "drizzle-orm";
import { tests } from "./tests";
import { questions, options } from "./questions";
import { purchases } from "./purchases";
import { attempts, attemptAnswers } from "./attempts";
import { results, leaderboard } from "./results";

// ── TESTS ──
// A test has many questions, many purchases, many attempts, many results, many leaderboard entries
export const testsRelations = relations(tests, ({ many }) => ({
  questions: many(questions),
  leaderboard: many(leaderboard),
  results: many(results),
  purchases: many(purchases),
  attempts: many(attempts),
}));

// ── QUESTIONS ──
// A question belongs to ONE test, and has MANY options, and has MANY attemptAnswers
export const questionsRelations = relations(questions, ({ one, many }) => ({
  test: one(tests, {
    fields: [questions.testId],
    references: [tests.id],
  }),
  options: many(options),
  attemptAnswers: many(attemptAnswers),
}));

// ── OPTIONS ──
// An option belongs to ONE question
export const optionsRelations = relations(options, ({ one }) => ({
  questions: one(questions, {
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
  test: one(tests, {
    fields: [attempts.testId],
    references: [tests.id],
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
  test: one(tests, {
    fields: [results.testId],
    references: [tests.id],
  }),
  attempt: one(attempts, {
    fields: [results.testId],
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
  test: one(tests, {
    fields: [leaderboard.testId],
    references: [tests.id],
  }),
  result: one(results, {
    fields: [leaderboard.resultId],
    references: [results.id],
  }),
}));
