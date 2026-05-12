import type { Question, Section, Option } from "@/src/db/schema";

export type QuestionWithContent = Question & {
  options: Option[];
};

export type QuestionStatus =
  | "not_visited"
  | "answered"
  | "skipped"
  | "marked_for_review"
  | "answered_review";

// Exam init data
export type ExamInitData = {
  attemptId: string;
  setId: string;
  testId: string;
  setTitle: string;
  testTitle: string;
  questions: QuestionWithContent[];
  sections: Section[];
  timeRemaining: number; // seconds
  savedAnswers?: Record<string, string[]>;
  savedStatuses?: Record<string, QuestionStatus>;
  savedIndex?: number;
};

export type ExamStore = {
  // Identity
  attemptId: string | null;
  setId: string | null;
  testId: string | null;
  status: "idle" | "in_progress" | "paused" | "submitted";
  setTitle: string | null;
  testTitle: string | null;

  // Content
  questions: QuestionWithContent[];
  sections: Section[];

  // Navigation
  currentQuestionIndex: number;

  // Answers
  answers: Record<string, string[]>;
  markedForReview: Record<string, boolean>;
  questionStatus: Record<string, QuestionStatus>;

  // Timer
  timeRemaining: number;
  timeTaken: number;

  // Sync
  lastSyncedAt: Date | null;
  isDirty: boolean;
  isSubmitting: boolean;
  networkStatus: "online" | "offline";

  // Actions
  initExam: (data: ExamInitData) => void;
  rehydrate: (data: ExamInitData) => void;
  selectAnswer: (questionId: string, optionIds: string[]) => void;
  toggleReview: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  goToNext: () => void;
  goToPrev: () => void;
  tickTimer: () => void;
  pauseExam: () => void;
  submitExam: () => void;
  markDirty: () => void;
  markSynced: () => void;
};
