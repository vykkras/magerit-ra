import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Answer = 'yes' | 'no' | 'na' | null;
export type Criticality = 'baja' | 'media' | 'alta' | 'critica' | null;

interface QuestionnaireStore {
  answers: Record<string, Record<string, Answer>>;
  criticality: Record<string, Criticality>;
  setAnswer: (categoryId: string, questionId: string, answer: Answer) => void;
  setCriticality: (categoryId: string, value: Criticality) => void;
  resetCategory: (categoryId: string) => void;
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set) => ({
      answers: {},
      criticality: {},

      setAnswer(categoryId, questionId, answer) {
        set(s => ({
          answers: {
            ...s.answers,
            [categoryId]: { ...(s.answers[categoryId] ?? {}), [questionId]: answer },
          },
        }));
      },

      setCriticality(categoryId, value) {
        set(s => ({
          criticality: { ...s.criticality, [categoryId]: value },
        }));
      },

      resetCategory(categoryId) {
        set(s => {
          const nextA = { ...s.answers };
          const nextC = { ...s.criticality };
          delete nextA[categoryId];
          delete nextC[categoryId];
          return { answers: nextA, criticality: nextC };
        });
      },
    }),
    { name: 'magerit-questionnaires-v1' }
  )
);
