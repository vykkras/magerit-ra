import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompletedEvaluation {
  id: string;
  completedAt: string;
  solicitante: string;
  proveedor: string;
  departamento: string;
  referenciaPST: string;
  categoriaId: string | null;
  esHerramientaIA: boolean | null;
  totalAnswered: number;
  totalQuestions: number;
  compliance: number;
  totalInherent: number;
  totalResidual: number;
  reduction: number;
}

interface CompletedStore {
  evaluations: CompletedEvaluation[];
  add: (ev: CompletedEvaluation) => void;
  remove: (id: string) => void;
}

export const useCompletedStore = create<CompletedStore>()(
  persist(
    (set) => ({
      evaluations: [],
      add:    (ev) => set(s => ({ evaluations: [ev, ...s.evaluations] })),
      remove: (id) => set(s => ({ evaluations: s.evaluations.filter(e => e.id !== id) })),
    }),
    { name: 'magerit-completed-v1' }
  )
);
