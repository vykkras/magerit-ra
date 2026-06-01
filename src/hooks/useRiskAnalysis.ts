import { useMemo } from 'react';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { useSolicitudStore } from '../store/solicitudStore';
import { CATEGORY_QUESTIONNAIRES } from '../data/questionnaires.data';
import { THREAT_PROB, THREAT_IMPACT, CAT_THREATS } from '../data/scenarios.data';
import { MAGERIT_THREATS } from '../data/threats.data';
import { avgMaturity, maturityReduction, MATURITY_LABEL, type MaturityLevel } from '../data/maturityLevels.data';

// ── Risk level helpers ─────────────────────────────────────────────────────

export type RiskLevel = 'critico' | 'alto' | 'medio' | 'bajo';

export function riskLevel(score: number): RiskLevel {
  if (score >= 9) return 'critico';
  if (score >= 6) return 'alto';
  if (score >= 4) return 'medio';
  return 'bajo';
}

export const LEVEL_LABEL: Record<RiskLevel, string> = {
  critico: 'Crítico', alto: 'Alto', medio: 'Medio', bajo: 'Bajo',
};

export const PROB_LABELS = ['', 'Muy rara', 'Poco frec.', 'Posible', 'Frecuente'];
export const IMP_LABELS  = ['', 'Mínimo', 'Bajo', 'Medio', 'Alto'];

export function heatBg(p: number, i: number): string {
  const sc = p * i;
  if (sc >= 9) return '#fee2e2';
  if (sc >= 6) return '#fed7aa';
  if (sc >= 4) return '#fef9c3';
  return '#dcfce7';
}

/** Maturity badge colour */
export function matColor(m: number): { bg: string; color: string } {
  if (m >= 5)   return { bg: '#dcfce7', color: '#166534' };
  if (m >= 4)   return { bg: '#dbeafe', color: '#1e40af' };
  if (m >= 3)   return { bg: '#fef9c3', color: '#854d0e' };
  if (m >= 2)   return { bg: '#fed7aa', color: '#9a3412' };
  return               { bg: '#fee2e2', color: '#991b1b' };
}

const THREAT_META: Record<string, { name: string; description: string }> = Object.fromEntries(
  MAGERIT_THREATS.map(t => [t.code, { name: t.name, description: t.description }])
);

// ── Types ──────────────────────────────────────────────────────────────────

export interface RiskRow {
  code: string;
  name: string;
  description: string;
  prob: number;
  // Raw MAGERIT inherent
  inherentImpact: number;
  inherentScore: number;
  inherentLevel: RiskLevel;
  // Internal control maturity
  avgMat: number;
  matLabel: string;
  matReduction: number;
  // Maturity-adjusted inherent (our controls applied)
  adjImpact: number;
  adjScore: number;
  adjLevel: RiskLevel;
  // Residual (after vendor answers)
  implementedSafeguards: string[];
  missingSafeguards: string[];
  residualImpact: number;
  residualScore: number;
  residualLevel: RiskLevel;
  reduction: number; // % from raw inherent → residual
  covered: boolean;
}

export interface RiskStats {
  total: number;
  avgInh: number;
  avgRes: number;
  avgMat: number;
  reduction: number;
  inherent: Record<RiskLevel, number>;
  residual: Record<RiskLevel, number>;
}

export type MatrixCell = { inherent: RiskRow[]; residual: RiskRow[] };

export interface RiskAnalysis {
  rows: RiskRow[];
  stats: RiskStats;
  matrix: Record<string, MatrixCell>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Calcula el análisis de riesgos de la categoría seleccionada (modelo de tres
 * niveles: inherente → ajustado por madurez → residual). Compartido entre la
 * página de Análisis de Riesgos y el Informe de Evaluación para garantizar que
 * ambos presentan exactamente las mismas cifras.
 */
export function useRiskAnalysis(): RiskAnalysis {
  const { categoriaId } = useSolicitudStore();
  const { answers, customResponsibility } = useQuestionnaireStore();
  const catId = categoriaId ?? '';

  const rows = useMemo<RiskRow[]>(() => {
    if (!catId) return [];
    const threats    = CAT_THREATS[catId] ?? [];
    const questions  = CATEGORY_QUESTIONNAIRES[catId] ?? [];
    const catAnswers = answers[catId] ?? {};
    const custResp   = customResponsibility[catId] ?? {};

    const visibleQs = questions.filter(q => {
      const resp = custResp[q.id] ?? q.responsibility;
      return resp !== 'cliente';
    });

    return threats.map(code => {
      const prob            = THREAT_PROB[code]   ?? 2;
      const inherentImpact  = THREAT_IMPACT[code] ?? 2;
      const inherentScore   = prob * inherentImpact;

      const covering  = visibleQs.filter(q => q.riskRefs.includes(code));
      const yesQs     = covering.filter(q => catAnswers[q.id] === 'yes');
      const noQs      = covering.filter(q => catAnswers[q.id] === 'no');

      // Maturity: average of safeguardRefs across all covering questions
      const allRefs = covering.flatMap(q => q.safeguardRefs);
      const mat     = avgMaturity(allRefs);
      const matRed  = maturityReduction(mat);
      const matRounded = Math.round(mat * 10) / 10;

      // Maturity-adjusted inherent (our controls applied)
      const adjImpact  = Math.max(1, inherentImpact - matRed);
      const adjScore   = prob * adjImpact;

      // Residual (vendor yes answers applied on top of maturity-adjusted)
      const residualImpact = Math.max(1, adjImpact - yesQs.length);
      const residualScore  = prob * residualImpact;

      const reduction = inherentScore > 0
        ? Math.round((1 - residualScore / inherentScore) * 100)
        : 0;

      const meta = THREAT_META[code] ?? { name: code, description: '' };

      return {
        code,
        name: meta.name,
        description: meta.description,
        prob,
        inherentImpact,
        inherentScore,
        inherentLevel: riskLevel(inherentScore),
        avgMat: matRounded,
        matLabel: MATURITY_LABEL[Math.round(mat) as MaturityLevel] ?? '',
        matReduction: matRed,
        adjImpact,
        adjScore,
        adjLevel: riskLevel(adjScore),
        implementedSafeguards: yesQs.map(q => q.text),
        missingSafeguards:     noQs.map(q => q.text),
        residualImpact,
        residualScore,
        residualLevel: riskLevel(residualScore),
        reduction,
        covered: covering.length > 0,
      };
    });
  }, [catId, answers, customResponsibility]);

  const stats = useMemo<RiskStats>(() => {
    const total  = rows.length;
    const avgInh = total ? rows.reduce((a, r) => a + r.inherentScore, 0) / total : 0;
    const avgRes = total ? rows.reduce((a, r) => a + r.residualScore, 0) / total : 0;
    const avgMat = total ? rows.reduce((a, r) => a + r.avgMat, 0) / total : 0;
    const reduction = avgInh > 0 ? Math.round((1 - avgRes / avgInh) * 100) : 0;
    const byLevel = (fn: (r: RiskRow) => RiskLevel) =>
      Object.fromEntries(
        (['critico','alto','medio','bajo'] as RiskLevel[]).map(lv => [
          lv, rows.filter(r => fn(r) === lv).length,
        ])
      ) as Record<RiskLevel, number>;
    return {
      total,
      avgInh: Math.round(avgInh * 10) / 10,
      avgRes: Math.round(avgRes * 10) / 10,
      avgMat: Math.round(avgMat * 10) / 10,
      reduction,
      inherent: byLevel(r => r.inherentLevel),
      residual:  byLevel(r => r.residualLevel),
    };
  }, [rows]);

  const matrix = useMemo<Record<string, MatrixCell>>(() => {
    const m: Record<string, MatrixCell> = {};
    rows.forEach(r => {
      const ki = `${r.prob}-${r.adjImpact}`;
      if (!m[ki]) m[ki] = { inherent: [], residual: [] };
      m[ki].inherent.push(r);
      const kr = `${r.prob}-${r.residualImpact}`;
      if (!m[kr]) m[kr] = { inherent: [], residual: [] };
      if (r.residualImpact !== r.adjImpact) m[kr].residual.push(r);
    });
    return m;
  }, [rows]);

  return { rows, stats, matrix };
}
