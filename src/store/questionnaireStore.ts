import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Answer = 'yes' | 'no' | 'na' | null;
export type Criticality = 'baja' | 'media' | 'alta' | 'critica' | null;

interface QuestionnaireStore {
  answers: Record<string, Record<string, Answer>>;
  criticality: Record<string, Criticality>;
  customQuestions: Record<string, Record<string, string>>; // categoryId → questionId → custom text
  setAnswer: (categoryId: string, questionId: string, answer: Answer) => void;
  setCriticality: (categoryId: string, value: Criticality) => void;
  setCustomQuestion: (categoryId: string, questionId: string, text: string) => void;
  resetCustomQuestion: (categoryId: string, questionId: string) => void;
  resetCategory: (categoryId: string) => void;
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set) => ({
      answers: {},
      criticality: {},
      customQuestions: {},

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

      setCustomQuestion(categoryId, questionId, text) {
        set(s => ({
          customQuestions: {
            ...s.customQuestions,
            [categoryId]: { ...(s.customQuestions[categoryId] ?? {}), [questionId]: text },
          },
        }));
      },

      resetCustomQuestion(categoryId, questionId) {
        set(s => {
          const catQ = { ...(s.customQuestions[categoryId] ?? {}) };
          delete catQ[questionId];
          return { customQuestions: { ...s.customQuestions, [categoryId]: catQ } };
        });
      },

      resetCategory(categoryId) {
        set(s => {
          const nextA = { ...s.answers };
          const nextC = { ...s.criticality };
          const nextQ = { ...s.customQuestions };
          delete nextA[categoryId];
          delete nextC[categoryId];
          delete nextQ[categoryId];
          return { answers: nextA, criticality: nextC, customQuestions: nextQ };
        });
      },
    }),
    { name: 'magerit-questionnaires-v1' }
  )
);
