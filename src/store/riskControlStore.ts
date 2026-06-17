/**
 * Ediciones manuales del mapeo Riesgo ↔ Control (por grupo temático).
 *
 * El mapeo por defecto vive en riskControlGroups.ts. Aquí se guardan, por grupo,
 * los controles que el usuario AÑADE o QUITA a mano. Persistido en localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GroupOverride {
  add: string[];     // controles añadidos manualmente
  remove: string[];  // controles quitados del set por defecto
}

interface RiskControlStore {
  // Ediciones del mapeo por grupos (clave = id de grupo).
  overrides: Record<string, GroupOverride>;
  addControl: (groupId: string, control: string) => void;
  removeControl: (groupId: string, control: string) => void;
  resetGroup: (groupId: string) => void;

  // Ediciones del mapeo por riesgo específico (clave = código de amenaza).
  specificOverrides: Record<string, GroupOverride>;
  addSpecificControl: (riskCode: string, control: string) => void;
  removeSpecificControl: (riskCode: string, control: string) => void;
  resetSpecificRisk: (riskCode: string) => void;
}

export const useRiskControlStore = create<RiskControlStore>()(
  persist(
    (set) => ({
      overrides: {},

      addControl(groupId, control) {
        const c = control.trim();
        if (!c) return;
        set(st => {
          const ov = st.overrides[groupId] ?? { add: [], remove: [] };
          return {
            overrides: {
              ...st.overrides,
              [groupId]: {
                add: ov.add.includes(c) ? ov.add : [...ov.add, c],
                remove: ov.remove.filter(x => x !== c),
              },
            },
          };
        });
      },

      removeControl(groupId, control) {
        set(st => {
          const ov = st.overrides[groupId] ?? { add: [], remove: [] };
          return {
            overrides: {
              ...st.overrides,
              [groupId]: {
                add: ov.add.filter(x => x !== control),
                remove: ov.remove.includes(control) ? ov.remove : [...ov.remove, control],
              },
            },
          };
        });
      },

      resetGroup(groupId) {
        set(st => {
          const next = { ...st.overrides };
          delete next[groupId];
          return { overrides: next };
        });
      },

      specificOverrides: {},

      addSpecificControl(riskCode, control) {
        const c = control.trim();
        if (!c) return;
        set(st => {
          const ov = st.specificOverrides[riskCode] ?? { add: [], remove: [] };
          return {
            specificOverrides: {
              ...st.specificOverrides,
              [riskCode]: {
                add: ov.add.includes(c) ? ov.add : [...ov.add, c],
                remove: ov.remove.filter(x => x !== c),
              },
            },
          };
        });
      },

      removeSpecificControl(riskCode, control) {
        set(st => {
          const ov = st.specificOverrides[riskCode] ?? { add: [], remove: [] };
          return {
            specificOverrides: {
              ...st.specificOverrides,
              [riskCode]: {
                add: ov.add.filter(x => x !== control),
                remove: ov.remove.includes(control) ? ov.remove : [...ov.remove, control],
              },
            },
          };
        });
      },

      resetSpecificRisk(riskCode) {
        set(st => {
          const next = { ...st.specificOverrides };
          delete next[riskCode];
          return { specificOverrides: next };
        });
      },
    }),
    { name: 'magerit-risk-control-groups-v1' }
  )
);

/** Controles efectivos de un grupo = (por defecto ∪ añadidos) − quitados. */
export function effectiveControls(
  defaultControls: string[],
  override: { add: string[]; remove: string[] } | undefined,
): string[] {
  if (!override) return defaultControls;
  const removed = new Set(override.remove);
  const result = defaultControls.filter(c => !removed.has(c));
  for (const c of override.add) if (!result.includes(c)) result.push(c);
  return result;
}
