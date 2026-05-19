import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Answer = 'yes' | 'no' | 'na' | null;

interface QuestionnaireStore {
  answers: Record<string, Record<string, Answer>>; // categoryId -> questionId -> answer
  setAnswer: (categoryId: string, questionId: string, answer: Answer) => void;
  resetCategory: (categoryId: string) => void;
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set) => ({
      answers: {},

      setAnswer(categoryId, questionId, answer) {
        set(s => ({
          answers: {
            ...s.answers,
            [categoryId]: {
              ...(s.answers[categoryId] ?? {}),
              [questionId]: answer,
            },
          },
        }));
      },

      resetCategory(categoryId) {
        set(s => {
          const next = { ...s.answers };
          delete next[categoryId];
          return { answers: next };
        });
      },
    }),
    { name: 'magerit-questionnaires-v1' }
  )
);
