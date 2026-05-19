import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RiskEntry {
  threatCode: string;
  safeguardCodes: string[];
}

export interface Category {
  id: string;
  name: string;
  risks: RiskEntry[];
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 'low-impact-it',  name: 'Adquisición de IT de bajo impacto', risks: [] },
  { id: 'saas',           name: 'SaaS',                              risks: [] },
  { id: 'saas-ai',        name: 'SaaS con IA',                       risks: [] },
  { id: 'paas-iaas',      name: 'PaaS / IaaS',                       risks: [] },
  { id: 'it-outsourcing', name: 'IT Outsourcing',                    risks: [] },
];

interface CategoryStore {
  categories: Category[];
  addRisk:           (categoryId: string, threatCode: string) => void;
  removeRisk:        (categoryId: string, threatCode: string) => void;
  addSafeguard:      (categoryId: string, threatCode: string, safeguardCode: string) => void;
  removeSafeguard:   (categoryId: string, threatCode: string, safeguardCode: string) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: INITIAL_CATEGORIES,

      addRisk(categoryId, threatCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId || c.risks.some(r => r.threatCode === threatCode)
              ? c
              : { ...c, risks: [...c.risks, { threatCode, safeguardCodes: [] }] }
          ),
        }));
      },

      removeRisk(categoryId, threatCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId ? c : { ...c, risks: c.risks.filter(r => r.threatCode !== threatCode) }
          ),
        }));
      },

      addSafeguard(categoryId, threatCode, safeguardCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId ? c : {
              ...c,
              risks: c.risks.map(r =>
                r.threatCode !== threatCode || r.safeguardCodes.includes(safeguardCode)
                  ? r
                  : { ...r, safeguardCodes: [...r.safeguardCodes, safeguardCode] }
              ),
            }
          ),
        }));
      },

      removeSafeguard(categoryId, threatCode, safeguardCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId ? c : {
              ...c,
              risks: c.risks.map(r =>
                r.threatCode !== threatCode ? r
                  : { ...r, safeguardCodes: r.safeguardCodes.filter(sc => sc !== safeguardCode) }
              ),
            }
          ),
        }));
      },
    }),
    { name: 'magerit-categories' }
  )
);

/** Returns the deduplicated union of all safeguard codes across all risks in a category */
export function getCategorySafeguards(category: Category): string[] {
  const seen = new Set<string>();
  category.risks.forEach(r => r.safeguardCodes.forEach(sc => seen.add(sc)));
  return [...seen];
}
