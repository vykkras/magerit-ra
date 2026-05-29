import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SolicitudState } from './solicitudStore';
import type { Answer, Criticality, ExtraQuestion } from './questionnaireStore';
import type { QuestionResponsibility } from '../data/questionnaires.data';
import type { ScenarioRow } from '../data/scenarios.data';

export interface CompletedEvaluation {
  id: string;
  completedAt: string;
  // Summary stats (for dashboard)
  solicitante: string;
  proveedor: string;
  departamento: string;
  referenciaPST: string;
  categoriaId: string | null;
  totalAnswered: number;
  totalQuestions: number;
  compliance: number;
  totalInherent: number;
  totalResidual: number;
  reduction: number;
  // Full state snapshot (for reopening)
  snapshot: {
    solicitud: SolicitudState;
    answers: Record<string, Record<string, Answer>>;
    criticality: Record<string, Criticality>;
    customQuestions: Record<string, Record<string, string>>;
    customRiskRefs: Record<string, Record<string, string[]>>;
    customSafeguardRefs: Record<string, Record<string, string[]>>;
    customResponsibility: Record<string, Record<string, QuestionResponsibility>>;
    extraQuestions: Record<string, ExtraQuestion[]>;
    scenarios: Record<string, ScenarioRow[]>;
  };
}

interface CompletedStore {
  evaluations: CompletedEvaluation[];
  add:    (ev: CompletedEvaluation) => void;
  update: (id: string, ev: CompletedEvaluation) => void;
  remove: (id: string) => void;
}

export const useCompletedStore = create<CompletedStore>()(
  persist(
    (set) => ({
      evaluations: [],
      add:    (ev) => set(s => ({ evaluations: [ev, ...s.evaluations] })),
      update: (id, ev) => set(s => ({ evaluations: s.evaluations.map(e => e.id === id ? ev : e) })),
      remove: (id) => set(s => ({ evaluations: s.evaluations.filter(e => e.id !== id) })),
    }),
    { name: 'magerit-completed-v2' }
  )
);
