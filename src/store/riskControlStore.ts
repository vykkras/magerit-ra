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
  overrides: Record<string, GroupOverride>;
  addControl: (groupId: string, control: string) => void;
  removeControl: (groupId: string, control: string) => void;
  resetGroup: (groupId: string) => void;
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
