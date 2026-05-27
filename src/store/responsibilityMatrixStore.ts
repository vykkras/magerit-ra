import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Responsibility, type CategoryKey, RESPONSIBILITY_MATRIX } from '../data/responsibilityMatrix.data';

type Overrides = Record<string, Partial<Record<CategoryKey, Responsibility>>>;

interface ResponsibilityMatrixState {
  overrides: Overrides;
  setResponsibility: (controlId: string, category: CategoryKey, value: Responsibility) => void;
  resetControl: (controlId: string) => void;
  resetAll: () => void;
  getResponsibility: (controlId: string, category: CategoryKey) => Responsibility;
}

export const useResponsibilityMatrixStore = create<ResponsibilityMatrixState>()(
  persist(
    (set, get) => ({
      overrides: {},

      setResponsibility: (controlId, category, value) =>
        set(state => ({
          overrides: {
            ...state.overrides,
            [controlId]: { ...state.overrides[controlId], [category]: value },
          },
        })),

      resetControl: (controlId) =>
        set(state => {
          const next = { ...state.overrides };
          delete next[controlId];
          return { overrides: next };
        }),

      resetAll: () => set({ overrides: {} }),

      getResponsibility: (controlId, category) => {
        const override = get().overrides[controlId]?.[category];
        if (override !== undefined) return override;
        const entry = RESPONSIBILITY_MATRIX.find(e => e.id === controlId);
        return entry ? entry.resp[category] : 'na';
      },
    }),
    { name: 'magerit-responsibility-matrix' }
  )
);
