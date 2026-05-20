import { CATEGORY_QUESTIONNAIRES } from './questionnaires.data';

export interface ScenarioRow {
  id: string;
  threatCode: string;
  probability: 1|2|3|4|null;
  inherentImpact: 1|2|3|4|null;
  applicableSafeguard: string;
  residualImpact: 1|2|3|4|null;
}

const THREAT_PROB: Record<string, 1|2|3|4> = {
  'I.5': 2, 'I.6': 1, 'I.8': 2,
  'E.1': 3, 'E.2': 2, 'E.3': 2, 'E.4': 2, 'E.7': 2, 'E.9': 1,
  'E.15': 2, 'E.18': 1, 'E.19': 2, 'E.20': 3, 'E.21': 2, 'E.23': 2,
  'E.24': 2, 'E.25': 1, 'E.28': 2,
  'A.3': 1, 'A.4': 1, 'A.5': 2, 'A.6': 2, 'A.7': 2, 'A.11': 2,
  'A.13': 1, 'A.14': 1, 'A.15': 1, 'A.18': 1, 'A.19': 2, 'A.24': 2,
  'A.28': 2, 'A.29': 1, 'A.30': 2,
};

const THREAT_IMPACT: Record<string, 1|2|3|4> = {
  'I.5': 2, 'I.6': 3, 'I.8': 3,
  'E.1': 2, 'E.2': 3, 'E.3': 2, 'E.4': 2, 'E.7': 2, 'E.9': 3,
  'E.15': 3, 'E.18': 4, 'E.19': 3, 'E.20': 3, 'E.21': 2, 'E.23': 2,
  'E.24': 3, 'E.25': 3, 'E.28': 3,
  'A.3': 4, 'A.4': 4, 'A.5': 3, 'A.6': 3, 'A.7': 2, 'A.11': 3,
  'A.13': 2, 'A.14': 3, 'A.15': 4, 'A.18': 4, 'A.19': 3, 'A.24': 3,
  'A.28': 3, 'A.29': 4, 'A.30': 3,
};

const CAT_THREATS: Record<string, string[]> = {
  'low-impact-it':  ['I.5','E.1','E.2','E.4','E.20','E.21','E.23','E.25','A.11'],
  'saas':           ['I.5','I.8','E.1','E.2','E.4','E.19','E.20','E.24','A.5','A.6','A.11','A.14','A.19','A.24'],
  'saas-ai':        ['I.5','I.8','E.1','E.2','E.4','E.7','E.15','E.19','E.20','E.24','A.4','A.5','A.6','A.11','A.14','A.15','A.19','A.24','A.30'],
  'paas-iaas':      ['I.5','I.6','I.8','E.2','E.3','E.4','E.9','E.18','E.20','E.21','E.24','A.3','A.4','A.5','A.6','A.11','A.14','A.18','A.24'],
  'it-outsourcing': ['E.1','E.2','E.3','E.7','E.19','E.28','A.5','A.6','A.7','A.11','A.13','A.19','A.28','A.29','A.30'],
};

function clamp(n: number): 1|2|3|4 {
  return Math.min(4, Math.max(1, Math.round(n))) as 1|2|3|4;
}

export function buildDefaultScenarios(categoryId: string): ScenarioRow[] {
  const threats = CAT_THREATS[categoryId] ?? [];
  const qs = CATEGORY_QUESTIONNAIRES[categoryId] ?? [];

  const riskToSg = new Map<string, string[]>();
  qs.forEach(q => {
    q.riskRefs.forEach(rc => {
      if (!riskToSg.has(rc)) riskToSg.set(rc, []);
      q.safeguardRefs.forEach(sc => {
        if (!riskToSg.get(rc)!.includes(sc)) riskToSg.get(rc)!.push(sc);
      });
    });
  });

  const rows: ScenarioRow[] = threats.map((tc, i) => {
    const sgs  = riskToSg.get(tc) ?? [];
    const sg   = sgs[0] ?? '';
    const prob = (THREAT_PROB[tc] ?? 2) as 1|2|3|4;
    const imp  = (THREAT_IMPACT[tc] ?? 2) as 1|2|3|4;
    return {
      id: `${categoryId}-${i}`,
      threatCode: tc,
      probability: prob,
      inherentImpact: imp,
      applicableSafeguard: sg,
      residualImpact: sg ? clamp(imp - 1) : imp,
    };
  });

  // Pad to 20 with secondary sub-scenarios (alternate safeguard, +1 probability variant)
  let padIdx = 0;
  while (rows.length < 20) {
    const tc  = threats[padIdx % threats.length];
    const sgs = riskToSg.get(tc) ?? [];
    const sg  = sgs.length > 1 ? sgs[1] : (sgs[0] ?? '');
    const imp = (THREAT_IMPACT[tc] ?? 2) as 1|2|3|4;
    rows.push({
      id: `${categoryId}-x${padIdx}`,
      threatCode: tc,
      probability: clamp((THREAT_PROB[tc] ?? 2) + 1),
      inherentImpact: imp,
      applicableSafeguard: sg,
      residualImpact: sg ? clamp(imp - 1) : imp,
    });
    padIdx++;
  }

  return rows;
}
