import type { Question } from "@/src/db/schema";
import { ExamStore, QuestionStatus } from "./exam-type";

export function deriveStatus(
  hasAnswer: boolean,
  isReview: boolean,
): QuestionStatus {
  if (hasAnswer && isReview) return "answered_review";
  if (hasAnswer) return "answered";
  if (isReview) return "marked_for_review";
  return "skipped";
}

export function buildInitialStatuses(
  questions: Question[],
): Record<string, QuestionStatus> {
  return Object.fromEntries(
    questions.map((q) => [q.id, "not_visited" as QuestionStatus]),
  );
}

export function getLocalStorageKey(attemptId: string) {
  return `exam_${attemptId}`;
}

export function syncToLocalStorage(state: ExamStore) {
  if (!state.attemptId) return;
  try {
    localStorage.setItem(
      getLocalStorageKey(state.attemptId),
      JSON.stringify({
        answers: state.answers,
        markedForReview: state.markedForReview,
        questionStatus: state.questionStatus,
        currentQuestionIndex: state.currentQuestionIndex,
        timeRemaining: state.timeRemaining,
        timeTaken: state.timeTaken,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.warn("[examStore] Failed to sync to localStorage:", error);
  }
}

export function clearLocalStorage(attemptId: string) {
  try {
    localStorage.removeItem(getLocalStorageKey(attemptId));
  } catch (error) {
    console.warn("[examStore] Failed to clear localStorage:", error);
  }
}
