import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CATEGORY_QUESTIONNAIRES } from '../data/questionnaires.data';
import { CATEGORY_RISK_CODES } from '../data/riskControlMapping';

export interface RiskEntry {
  threatCode: string;
  safeguardCodes: string[];
}

export interface Category {
  id: string;
  name: string;
  risks: RiskEntry[];
}

// Códigos de riesgo por categoría: fuente única en riskControlMapping.
const BARE_CATEGORIES: { id: keyof typeof CATEGORY_RISK_CODES; name: string }[] = [
  { id: 'low-impact-it',  name: 'Adquisición de IT de bajo impacto' },
  { id: 'saas',           name: 'SaaS' },
  { id: 'saas-ai',        name: 'SaaS con IA' },
  { id: 'paas-iaas',      name: 'PaaS / IaaS' },
  { id: 'it-outsourcing', name: 'IT Outsourcing' },
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
      risks: (CATEGORY_RISK_CODES[cat.id] ?? []).map(threatCode => ({
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
    { name: 'magerit-categories-v7' }
  )
);

export function getCategorySafeguards(category: Category): string[] {
  const seen = new Set<string>();
  category.risks.forEach(r => r.safeguardCodes.forEach(sc => seen.add(sc)));
  return [...seen];
}
