import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionResponsibility } from '../data/questionnaires.data';

export type Answer = 'yes' | 'no' | 'na' | null;
export type Criticality = 'baja' | 'media' | 'alta' | 'critica' | null;

export interface ExtraQuestion {
  id: string;
  text: string;
  riskRefs: string[];
  safeguardRefs: string[];
}

interface QuestionnaireStore {
  answers: Record<string, Record<string, Answer>>;
  criticality: Record<string, Criticality>;
  customQuestions: Record<string, Record<string, string>>;
  customRiskRefs: Record<string, Record<string, string[]>>;
  customSafeguardRefs: Record<string, Record<string, string[]>>;
  customResponsibility: Record<string, Record<string, QuestionResponsibility>>;
  extraQuestions: Record<string, ExtraQuestion[]>;
  setAnswer: (categoryId: string, questionId: string, answer: Answer) => void;
  setCriticality: (categoryId: string, value: Criticality) => void;
  setCustomQuestion: (categoryId: string, questionId: string, text: string) => void;
  resetCustomQuestion: (categoryId: string, questionId: string) => void;
  setCustomRiskRefs: (categoryId: string, questionId: string, codes: string[]) => void;
  resetCustomRiskRefs: (categoryId: string, questionId: string) => void;
  setCustomSafeguardRefs: (categoryId: string, questionId: string, codes: string[]) => void;
  resetCustomSafeguardRefs: (categoryId: string, questionId: string) => void;
  setCustomResponsibility: (categoryId: string, questionId: string, value: QuestionResponsibility) => void;
  addExtraQuestion: (categoryId: string) => void;
  updateExtraQuestion: (categoryId: string, questionId: string, updates: Partial<ExtraQuestion>) => void;
  removeExtraQuestion: (categoryId: string, questionId: string) => void;
  clearAnswers: (categoryId: string) => void;
  resetCategory: (categoryId: string) => void;
  loadState: (state: {
    answers: Record<string, Record<string, Answer>>;
    criticality: Record<string, Criticality>;
    customQuestions: Record<string, Record<string, string>>;
    customRiskRefs: Record<string, Record<string, string[]>>;
    customSafeguardRefs: Record<string, Record<string, string[]>>;
    customResponsibility: Record<string, Record<string, QuestionResponsibility>>;
    extraQuestions: Record<string, ExtraQuestion[]>;
  }) => void;
}

export const useQuestionnaireStore = create<QuestionnaireStore>()(
  persist(
    (set) => ({
      answers: {},
      criticality: {},
      customQuestions: {},
      customRiskRefs: {},
      customSafeguardRefs: {},
      customResponsibility: {},
      extraQuestions: {},

      setAnswer(categoryId, questionId, answer) {
        set(s => ({
          answers: {
            ...s.answers,
            [categoryId]: { ...(s.answers[categoryId] ?? {}), [questionId]: answer },
          },
        }));
      },

      setCriticality(categoryId, value) {
        set(s => ({ criticality: { ...s.criticality, [categoryId]: value } }));
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

      setCustomResponsibility(categoryId, questionId, value) {
        set(s => ({
          customResponsibility: {
            ...s.customResponsibility,
            [categoryId]: { ...(s.customResponsibility[categoryId] ?? {}), [questionId]: value },
          },
        }));
      },

      addExtraQuestion(categoryId) {
        set(s => {
          const existing = s.extraQuestions[categoryId] ?? [];
          const newQ: ExtraQuestion = {
            id: `extra-${categoryId}-${Date.now()}`,
            text: '',
            riskRefs: [],
            safeguardRefs: [],
          };
          return { extraQuestions: { ...s.extraQuestions, [categoryId]: [...existing, newQ] } };
        });
      },

      updateExtraQuestion(categoryId, questionId, updates) {
        set(s => ({
          extraQuestions: {
            ...s.extraQuestions,
            [categoryId]: (s.extraQuestions[categoryId] ?? []).map(q =>
              q.id === questionId ? { ...q, ...updates } : q
            ),
          },
        }));
      },

      removeExtraQuestion(categoryId, questionId) {
        set(s => ({
          extraQuestions: {
            ...s.extraQuestions,
            [categoryId]: (s.extraQuestions[categoryId] ?? []).filter(q => q.id !== questionId),
          },
        }));
      },

      clearAnswers(categoryId) {
        set(s => {
          const nextA = { ...s.answers };
          const nextC = { ...s.criticality };
          delete nextA[categoryId];
          delete nextC[categoryId];
          return { answers: nextA, criticality: nextC };
        });
      },

      loadState(state) {
        set(() => ({ ...state }));
      },

      resetCategory(categoryId) {
        set(s => {
          const nextA    = { ...s.answers };
          const nextC    = { ...s.criticality };
          const nextQ    = { ...s.customQuestions };
          const nextRR   = { ...s.customRiskRefs };
          const nextSR   = { ...s.customSafeguardRefs };
          const nextResp = { ...s.customResponsibility };
          const nextEQ   = { ...s.extraQuestions };
          delete nextA[categoryId];
          delete nextC[categoryId];
          delete nextQ[categoryId];
          delete nextRR[categoryId];
          delete nextSR[categoryId];
          delete nextResp[categoryId];
          delete nextEQ[categoryId];
          return { answers: nextA, criticality: nextC, customQuestions: nextQ, customRiskRefs: nextRR, customSafeguardRefs: nextSR, customResponsibility: nextResp, extraQuestions: nextEQ };
        });
      },
    }),
    { name: 'magerit-questionnaires-v1' }
  )
);
