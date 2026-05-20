import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Answer = 'yes' | 'no' | 'na' | null;
export type Criticality = 'baja' | 'media' | 'alta' | 'critica' | null;

interface QuestionnaireStore {
  answers: Record<string, Record<string, Answer>>;
  criticality: Record<string, Criticality>;
  customQuestions: Record<string, Record<string, string>>;
  customRiskRefs: Record<string, Record<string, string[]>>;
  customSafeguardRefs: Record<string, Record<string, string[]>>;
  setAnswer: (categoryId: string, questionId: string, answer: Answer) => void;
  setCriticality: (categoryId: string, value: Criticality) => void;
  setCustomQuestion: (categoryId: string, questionId: string, text: string) => void;
  resetCustomQuestion: (categoryId: string, questionId: string) => void;
  setCustomRiskRefs: (categoryId: string, questionId: string, codes: string[]) => void;
  resetCustomRiskRefs: (categoryId: string, questionId: string) => void;
  setCustomSafeguardRefs: (categoryId: string, questionId: string, codes: string[]) => void;
  resetCustomSafeguardRefs: (categoryId: string, questionId: string) => void;
  resetCategory: (categoryId: string) => void;
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set) => ({
      answers: {},
      criticality: {},
      customQuestions: {},
      customRiskRefs: {},
      customSafeguardRefs: {},

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

      setCustomRiskRefs(categoryId, questionId, codes) {
        set(s => ({
          customRiskRefs: {
            ...s.customRiskRefs,
            [categoryId]: { ...(s.customRiskRefs[categoryId] ?? {}), [questionId]: codes },
          },
        }));
      },

      resetCustomRiskRefs(categoryId, questionId) {
        set(s => {
          const cat = { ...(s.customRiskRefs[categoryId] ?? {}) };
          delete cat[questionId];
          return { customRiskRefs: { ...s.customRiskRefs, [categoryId]: cat } };
        });
      },

      setCustomSafeguardRefs(categoryId, questionId, codes) {
        set(s => ({
          customSafeguardRefs: {
            ...s.customSafeguardRefs,
            [categoryId]: { ...(s.customSafeguardRefs[categoryId] ?? {}), [questionId]: codes },
          },
        }));
      },

      resetCustomSafeguardRefs(categoryId, questionId) {
        set(s => {
          const cat = { ...(s.customSafeguardRefs[categoryId] ?? {}) };
          delete cat[questionId];
          return { customSafeguardRefs: { ...s.customSafeguardRefs, [categoryId]: cat } };
        });
      },

      resetCategory(categoryId) {
        set(s => {
          const nextA  = { ...s.answers };
          const nextC  = { ...s.criticality };
          const nextQ  = { ...s.customQuestions };
          const nextRR = { ...s.customRiskRefs };
          const nextSR = { ...s.customSafeguardRefs };
          delete nextA[categoryId];
          delete nextC[categoryId];
          delete nextQ[categoryId];
          delete nextRR[categoryId];
          delete nextSR[categoryId];
          return { answers: nextA, criticality: nextC, customQuestions: nextQ, customRiskRefs: nextRR, customSafeguardRefs: nextSR };
        });
      },
    }),
    { name: 'magerit-questionnaires-v1' }
  )
);
