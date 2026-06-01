import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Riesgo introducido manualmente en la matriz de Análisis de Riesgos.
 * Probabilidad e impacto residual en escala 1..5 (datos de GlobalSuite).
 */
export interface ManualRisk {
  id: string;
  activo: string;
  amenaza: string;
  probabilidad: number; // 1..5
  impacto: number;      // 1..5
}

interface ManualRiskStore {
  risks: ManualRisk[];
  addRisk: () => void;
  updateRisk: (id: string, patch: Partial<Omit<ManualRisk, 'id'>>) => void;
  removeRisk: (id: string) => void;
  clear: () => void;
  loadState: (risks: ManualRisk[]) => void;
}

function uid(): string {
  return `MR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useManualRiskStore = create<ManualRiskStore>()(
  persist(
    (set) => ({
      risks: [],

      addRisk: () =>
        set((s) => ({
          risks: [...s.risks, { id: uid(), activo: '', amenaza: '', probabilidad: 3, impacto: 3 }],
        })),

      updateRisk: (id, patch) =>
        set((s) => ({
          risks: s.risks.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      removeRisk: (id) =>
        set((s) => ({ risks: s.risks.filter((r) => r.id !== id) })),

      clear: () => set({ risks: [] }),

      loadState: (risks) => set({ risks }),
    }),
    { name: 'magerit-manual-risks' }
  )
);
