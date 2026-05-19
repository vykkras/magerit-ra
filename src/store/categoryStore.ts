import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CATEGORY_QUESTIONNAIRES } from '../data/questionnaires.data';

export interface RiskEntry {
  threatCode: string;
  safeguardCodes: string[];
}

export interface Category {
  id: string;
  name: string;
  risks: RiskEntry[];
}

const BARE_CATEGORIES: { id: string; name: string; risks: string[] }[] = [
  {
    id: 'low-impact-it',
    name: 'Adquisición de IT de bajo impacto',
    risks: ['I.5','E.1','E.2','E.4','E.20','E.21','E.23','E.25','A.11'],
  },
  {
    id: 'saas',
    name: 'SaaS',
    risks: ['I.5','I.8','E.1','E.2','E.4','E.19','E.20','E.24','A.5','A.6','A.11','A.14','A.19','A.24'],
  },
  {
    id: 'saas-ai',
    name: 'SaaS con IA',
    risks: ['I.5','I.8','E.1','E.2','E.4','E.7','E.15','E.19','E.20','E.24','A.4','A.5','A.6','A.11','A.14','A.15','A.19','A.24','A.30'],
  },
  {
    id: 'paas-iaas',
    name: 'PaaS / IaaS',
    risks: ['I.5','I.6','I.8','E.2','E.3','E.4','E.9','E.18','E.20','E.21','E.24','A.3','A.4','A.5','A.6','A.11','A.14','A.18','A.24'],
  },
  {
    id: 'it-outsourcing',
    name: 'IT Outsourcing',
    risks: ['E.1','E.2','E.3','E.7','E.19','E.28','A.5','A.6','A.7','A.11','A.13','A.19','A.28','A.29','A.30'],
  },
];

function buildInitialCategories(): Category[] {
  return BARE_CATEGORIES.map(cat => {
    const qs = CATEGORY_QUESTIONNAIRES[cat.id] ?? [];

    // Derive safeguard codes per risk from questionnaire data
    const riskToSafeguards = new Map<string, Set<string>>();
    qs.forEach(q => {
      q.riskRefs.forEach(riskCode => {
        if (!riskToSafeguards.has(riskCode)) riskToSafeguards.set(riskCode, new Set());
        q.safeguardRefs.forEach(sc => riskToSafeguards.get(riskCode)!.add(sc));
      });
    });

    return {
      id: cat.id,
      name: cat.name,
      risks: cat.risks.map(threatCode => ({
        threatCode,
        safeguardCodes: [...(riskToSafeguards.get(threatCode) ?? [])],
      })),
    };
  });
}

const INITIAL_CATEGORIES = buildInitialCategories();

interface CategoryStore {
  categories: Category[];
  addRisk:         (categoryId: string, threatCode: string) => void;
  removeRisk:      (categoryId: string, threatCode: string) => void;
  addSafeguard:    (categoryId: string, threatCode: string, safeguardCode: string) => void;
  removeSafeguard: (categoryId: string, threatCode: string, safeguardCode: string) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: INITIAL_CATEGORIES,

      addRisk(categoryId, threatCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId || c.risks.some(r => r.threatCode === threatCode) ? c
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
                r.threatCode !== threatCode || r.safeguardCodes.includes(safeguardCode) ? r
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
    { name: 'magerit-categories-v3' }
  )
);

export function getCategorySafeguards(category: Category): string[] {
  const seen = new Set<string>();
  category.risks.forEach(r => r.safeguardCodes.forEach(sc => seen.add(sc)));
  return [...seen];
}
