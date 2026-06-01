/**
 * Escala de riesgo de 5 niveles (alineada con la plantilla Word y GlobalSuite).
 * El análisis de riesgos es manual: los valores de probabilidad e impacto
 * residual se introducen a mano (datos procedentes de GlobalSuite) y la zona de
 * riesgo se deriva del producto Probabilidad × Impacto.
 */

import type { ManualRisk } from '../store/manualRiskStore';

// Índices 1..5
export const PROB_LABELS = ['', 'Muy improbable', 'Improbable', 'Normal', 'Frecuente', 'Muy frecuente'];
export const IMP_LABELS  = ['', 'Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto'];

export type ZoneLevel = 'muy_bajo' | 'bajo' | 'medio' | 'alto' | 'muy_alto';

export const ZONE_LABEL: Record<ZoneLevel, string> = {
  muy_bajo: 'Muy bajo',
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
  muy_alto: 'Muy alto',
};

export const ZONE_ORDER: ZoneLevel[] = ['muy_alto', 'alto', 'medio', 'bajo', 'muy_bajo'];

/** Color de fondo (CSS) por nivel de zona — degradado verde → rojo. */
export const ZONE_BG: Record<ZoneLevel, string> = {
  muy_bajo: '#dcfce7',
  bajo: '#ecfccb',
  medio: '#fef9c3',
  alto: '#fed7aa',
  muy_alto: '#fee2e2',
};

/** Color de texto (CSS) por nivel de zona. */
export const ZONE_COLOR: Record<ZoneLevel, string> = {
  muy_bajo: '#166534',
  bajo: '#3f6212',
  medio: '#854d0e',
  alto: '#9a3412',
  muy_alto: '#991b1b',
};

/** Relleno para Word (.docx), sin almohadilla. */
export const ZONE_FILL: Record<ZoneLevel, string> = {
  muy_bajo: 'DCFCE7',
  bajo: 'ECFCCB',
  medio: 'FEF9C3',
  alto: 'FED7AA',
  muy_alto: 'FEE2E2',
};

/** Zona de riesgo a partir del producto Probabilidad × Impacto (escala 1..25). */
export function zoneFromScore(score: number): ZoneLevel {
  if (score >= 17) return 'muy_alto';   // 17–25
  if (score >= 13) return 'alto';       // 13–16
  if (score >= 9)  return 'medio';      // 9–12
  if (score >= 5)  return 'bajo';       // 5–8
  return 'muy_bajo';                    // 1–4
}

export function zoneFromPI(prob: number, imp: number): ZoneLevel {
  return zoneFromScore(prob * imp);
}

// ── Resumen derivado de los riesgos manuales ─────────────────────────────────

export interface EnrichedRisk extends ManualRisk {
  score: number;
  zoneLevel: ZoneLevel;
  zoneLabel: string;
  probLabel: string;
  impLabel: string;
}

export interface RiskSummary {
  rows: EnrichedRisk[];
  /** Conteo por celda: grid[impacto-1][probabilidad-1] */
  mapCounts: number[][];
  zoneCounts: Record<ZoneLevel, number>;
  total: number;
}

export function enrichRisk(r: ManualRisk): EnrichedRisk {
  const score = r.probabilidad * r.impacto;
  const zoneLevel = zoneFromScore(score);
  return {
    ...r,
    score,
    zoneLevel,
    zoneLabel: ZONE_LABEL[zoneLevel],
    probLabel: PROB_LABELS[r.probabilidad] ?? String(r.probabilidad),
    impLabel: IMP_LABELS[r.impacto] ?? String(r.impacto),
  };
}

export function computeRiskSummary(risks: ManualRisk[]): RiskSummary {
  const rows = risks.map(enrichRisk);
  const mapCounts: number[][] = [0, 1, 2, 3, 4].map(() => [0, 0, 0, 0, 0]);
  const zoneCounts: Record<ZoneLevel, number> = {
    muy_bajo: 0, bajo: 0, medio: 0, alto: 0, muy_alto: 0,
  };
  rows.forEach(r => {
    mapCounts[r.impacto - 1][r.probabilidad - 1]++;
    zoneCounts[r.zoneLevel]++;
  });
  return { rows, mapCounts, zoneCounts, total: rows.length };
}
