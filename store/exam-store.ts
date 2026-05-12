import { create } from "zustand";
import { ExamStore } from "./exam-type";
import {
  buildInitialStatuses,
  clearLocalStorage,
  deriveStatus,
  syncToLocalStorage,
} from "./store-helper";

export const useExamStore = create<ExamStore>((set, get) => ({
  attemptId: null,
  setId: null,
  testId: null,
  setTitle: null,
  testTitle: null,
  status: "idle",
  questions: [],
  sections: [],
  currentQuestionIndex: 0,
  answers: {},
  markedForReview: {},
  questionStatus: {},
  timeRemaining: 0,
  timeTaken: 0,
  lastSyncedAt: null,
  isDirty: false,
  isSubmitting: false,
  networkStatus: "online",

  // fresh start
  initExam: (data) => {
    const initialStatuses = buildInitialStatuses(data.questions);

    set({
      attemptId: data.attemptId,
      setId: data.setId,
      testId: data.testId,
      setTitle: data.setTitle,
      testTitle: data.testTitle,
      status: "in_progress",
      questions: data.questions,
      sections: data.sections,
      currentQuestionIndex: 0,
      answers: {},
      markedForReview: {},
      questionStatus: initialStatuses,
      timeRemaining: data.timeRemaining,
      timeTaken: 0,
      lastSyncedAt: null,
      isDirty: false,
      isSubmitting: false,
    });
  },

  // resuming exam
  rehydrate: (data) => {
    const savedStatuses =
      data.savedStatuses ?? buildInitialStatuses(data.questions);

    set({
      attemptId: data.attemptId,
      setId: data.setId,
      testId: data.testId,
      setTitle: data.setTitle,
      testTitle: data.testTitle,
      status: "in_progress",
      questions: data.questions,
      sections: data.sections,
      currentQuestionIndex: data.savedIndex ?? 0,
      answers: data.savedAnswers ?? {},
      markedForReview: {},
      questionStatus: savedStatuses,
      timeRemaining: data.timeRemaining,
      timeTaken: 0,
      lastSyncedAt: null,
      isDirty: false,
      isSubmitting: false,
    });
  },

  selectAnswer: (questionId, optionIds) => {
    set((state) => {
      const isReview = state.markedForReview[questionId] ?? false;
      const hasAnswer = optionIds.length > 0;
      const newStatus = deriveStatus(hasAnswer, isReview);

      const newState = {
        answers: { ...state.answers, [questionId]: optionIds },
        questionStatus: { ...state.questionStatus, [questionId]: newStatus },
        isDirty: true,
      };
      //   sync to localStorage on every answer change
      syncToLocalStorage({ ...state, ...newState });

      return newState;
    });
  },

  // toggle review mark for question
  toggleReview: (questionId) => {
    set((state) => {
      const isNowReview = !(state.markedForReview[questionId] ?? false);
      const hasAnswer = (state.answers[questionId]?.length ?? 0) > 0;
      const newStatus = deriveStatus(hasAnswer, isNowReview);

      const newState = {
        markedForReview: {
          ...state.markedForReview,
          [questionId]: isNowReview,
        },
        questionStatus: {
          ...state.questionStatus,
          [questionId]: newStatus,
        },
        isDirty: true,
      };

      syncToLocalStorage({ ...state, ...newState });

      return newState;
    });
  },

  // ── goToQuestion ──
  goToQuestion: (index) => {
    set((state) => {
      const question = state.questions[index];
      if (!question) return {};
      // mark as skipped if not visited and no answer
      const currentStatus = state.questionStatus[question.id];
      const shouldMarkSkipped = currentStatus === "not_visited";

      return {
        currentQuestionIndex: index,
        questionStatus: shouldMarkSkipped
          ? { ...state.questionStatus, [question.id]: "skipped" }
          : state.questionStatus,
      };
    });
  },

  // go to next question
  goToNext: () => {
    const { currentQuestionIndex, questions, goToQuestion } = get();
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  },
  // go to prev question
  goToPrev: () => {
    const { currentQuestionIndex, goToQuestion } = get();
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  },

  // tick every second
  tickTimer: () => {
    set((state) => {
      if (state.timeRemaining <= 0) return {};
      const newTimeRemaining = state.timeRemaining - 1;
      const newTimeTaken = state.timeTaken + 1;

      // sync localStorage every 30second
      if (newTimeRemaining % 30 === 0) {
        syncToLocalStorage({
          ...state,
          timeRemaining: newTimeRemaining,
          timeTaken: newTimeTaken,
        });
      }
      return {
        timeRemaining: newTimeRemaining,
        timeTaken: newTimeTaken,
      };
    });
  },

  // pause exam
  pauseExam: () => {
    const state = get();
    if (!state.attemptId) return;

    // save last update before pausing
    syncToLocalStorage(state);
    set({
      status: "paused",
    });
  },

  // submit exam
  submitExam: () => {
    const state = get();
    if (!state.attemptId || state.isSubmitting) return;
    // clear localStorage on submit
    clearLocalStorage(state.attemptId);
    set({
      status: "submitted",
      isSubmitting: true,
    });
  },

  // mark exam as dirty
  markDirty: () => {
    set({ isDirty: true });
  },

  // mark exam as synced
  markSynced: () => {
    set(() => ({
      isDirty: false,
      lastSyncedAt: new Date(),
    }));
  },
}));
