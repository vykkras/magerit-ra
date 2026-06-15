import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppliedControl } from '../types/control.types';

/**
 * Riesgo de la matriz de Análisis de Riesgos, según la metodología corporativa
 * BPO CC v7.3. El riesgo inherente y residual se derivan con el motor `aarrScale`:
 *  - dimensiones C/I/D/A/T (1..5) → Criticidad
 *  - degradación (1..5) → Impacto inherente
 *  - probabilidad (1..5) → Probabilidad inherente
 *  - controles (madurez C1–C13) → riesgo residual
 */
export interface ManualRisk {
  id: string;
  activo: string;
  amenaza: string;        // código de amenaza del catálogo o texto libre
  C: number; I: number; D: number; A: number; T: number;
  degradacion: number;    // 1..5
  probabilidad: number;   // 1..5
  controls: AppliedControl[];
}

interface ManualRiskStore {
  risks: ManualRisk[];
  addRisk: () => void;
  updateRisk: (id: string, patch: Partial<Omit<ManualRisk, 'id' | 'controls'>>) => void;
  removeRisk: (id: string) => void;
  addControl: (riskId: string) => void;
  updateControl: (riskId: string, controlId: string, patch: Partial<Omit<AppliedControl, 'id'>>) => void;
  removeControl: (riskId: string, controlId: string) => void;
  clear: () => void;
  loadState: (risks: ManualRisk[]) => void;
}

function uid(prefix = 'MR'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function newRisk(): ManualRisk {
  return {
    id: uid(),
    activo: '',
    amenaza: '',
    C: 3, I: 3, D: 3, A: 3, T: 3,
    degradacion: 3,
    probabilidad: 3,
    controls: [],
  };
}

function newControl(): AppliedControl {
  return {
    id: uid('C'),
    nombre: '',
    tipo: 'Preventivo',
    implementacion: 'Manual',
    grado: 'L3',
    frecuencia: 'Anual',
    mitigaImpacto: true,
    mitigaProbabilidad: false,
  };
}

export const useManualRiskStore = create<ManualRiskStore>()(
  persist(
    (set) => ({
      risks: [],

      addRisk: () => set((s) => ({ risks: [...s.risks, newRisk()] })),

      updateRisk: (id, patch) =>
        set((s) => ({
          risks: s.risks.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      removeRisk: (id) =>
        set((s) => ({ risks: s.risks.filter((r) => r.id !== id) })),

      addControl: (riskId) =>
        set((s) => ({
          risks: s.risks.map((r) =>
            r.id === riskId ? { ...r, controls: [...r.controls, newControl()] } : r
          ),
        })),

      updateControl: (riskId, controlId, patch) =>
        set((s) => ({
          risks: s.risks.map((r) =>
            r.id === riskId
              ? { ...r, controls: r.controls.map((c) => (c.id === controlId ? { ...c, ...patch } : c)) }
              : r
          ),
        })),

      removeControl: (riskId, controlId) =>
        set((s) => ({
          risks: s.risks.map((r) =>
            r.id === riskId ? { ...r, controls: r.controls.filter((c) => c.id !== controlId) } : r
          ),
        })),

      clear: () => set({ risks: [] }),

      loadState: (risks) => set({ risks: risks.map(normalizeRisk) }),
    }),
    { name: 'magerit-manual-risks-v2' }
  )
);

/** Tolera datos antiguos (sin dimensiones/controles) rellenando valores por defecto. */
function normalizeRisk(r: Partial<ManualRisk> & { id: string }): ManualRisk {
  return {
    id: r.id,
    activo: r.activo ?? '',
    amenaza: r.amenaza ?? '',
    C: r.C ?? 3, I: r.I ?? 3, D: r.D ?? 3, A: r.A ?? 3, T: r.T ?? 3,
    degradacion: r.degradacion ?? 3,
    probabilidad: r.probabilidad ?? 3,
    controls: r.controls ?? [],
  };
}
