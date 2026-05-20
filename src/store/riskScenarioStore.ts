import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildDefaultScenarios, type ScenarioRow } from '../data/scenarios.data';

const CAT_IDS = ['low-impact-it', 'saas', 'saas-ai', 'paas-iaas', 'it-outsourcing'];

type RowUpdate = Partial<Pick<ScenarioRow, 'threatCode' | 'probability' | 'inherentImpact' | 'applicableSafeguard' | 'residualImpact'>>;

interface RiskScenarioStore {
  scenarios: Record<string, ScenarioRow[]>;
  updateRow: (categoryId: string, rowId: string, updates: RowUpdate) => void;
  resetCategory: (categoryId: string) => void;
}

const INITIAL: Record<string, ScenarioRow[]> = Object.fromEntries(
  CAT_IDS.map(id => [id, buildDefaultScenarios(id)])
);

export const useRiskScenarioStore = create<RiskScenarioStore>()(
  persist(
    (set) => ({
      scenarios: INITIAL,

      updateRow(categoryId, rowId, updates) {
        set(s => ({
          scenarios: {
            ...s.scenarios,
            [categoryId]: (s.scenarios[categoryId] ?? INITIAL[categoryId] ?? []).map(r =>
              r.id === rowId ? { ...r, ...updates } : r
            ),
          },
        }));
      },

      resetCategory(categoryId) {
        set(s => ({
          scenarios: { ...s.scenarios, [categoryId]: buildDefaultScenarios(categoryId) },
        }));
      },
    }),
    { name: 'magerit-risk-scenarios-v1' }
  )
);
