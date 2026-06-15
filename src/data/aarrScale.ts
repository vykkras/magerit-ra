/**
 * Motor de cálculo de la Apreciación del Riesgo (AARR) corporativo.
 * Fuente: "MS01.MA01 — Metodología Apreciación del Riesgo BPO CC v7.3"
 *   · METODOLOGIA INV ACT (ELEMENTOS) — dimensiones, criticidad
 *   · METODOLOGIA DE AARR             — probabilidad, impacto, zonas, residual
 *   · METODOLOGIA DE CONTROLES        — madurez de controles (C1–C13)
 *
 * Reemplaza el modelo simplificado anterior (Probabilidad 1–5 × Impacto 1–5 = 1–25).
 */

import type {
  Zone,
  AppliedControl,
  ControlTipo,
  ControlImplementacion,
  ControlGrado,
  ControlFrecuencia,
} from '../types/control.types';

export type { Zone, AppliedControl } from '../types/control.types';

// ── Niveles 1–5 (etiquetas comunes a dimensiones) ───────────────────────────
export const LEVEL_NAMES = ['', 'Muy bajo', 'Bajo', 'Medio', 'Alto', 'Muy alto'] as const;

// ── A1 · Probabilidad inherente ─────────────────────────────────────────────
export interface ScaleLevel {
  level: number;   // 1..5
  name: string;
  value: number;   // valor de cálculo
  desc: string;
}

/** Índice 1..5 (la posición 0 queda vacía para alinear nivel↔índice). */
export const PROB_LEVELS: (ScaleLevel | null)[] = [
  null,
  { level: 1, name: 'Muy improbable', value: 0.1, desc: '10 años o nunca' },
  { level: 2, name: 'Improbable',     value: 0.3, desc: 'Cada varios años' },
  { level: 3, name: 'Normal',         value: 1,   desc: 'Anual' },
  { level: 4, name: 'Frecuente',      value: 2,   desc: 'Mensual' },
  { level: 5, name: 'Muy frecuente',  value: 3,   desc: 'Semanal' },
];

// ── A2 · Impacto (degradación) ──────────────────────────────────────────────
export const DEGRAD_LEVELS: (ScaleLevel | null)[] = [
  null,
  { level: 1, name: 'Muy bajo',  value: 5,   desc: '≤10%' },
  { level: 2, name: 'Bajo',      value: 15,  desc: '11–25%' },
  { level: 3, name: 'Medio',     value: 50,  desc: '26–50%' },
  { level: 4, name: 'Alto',      value: 80,  desc: '51–90%' },
  { level: 5, name: 'Muy alto',  value: 100, desc: '90–100%' },
];

// ── Dimensiones C/I/D/A/T (1–5) ─────────────────────────────────────────────
export type DimensionKey = 'C' | 'I' | 'D' | 'A' | 'T';

export const DIMENSIONS: { key: DimensionKey; name: string; alias: string }[] = [
  { key: 'C', name: 'Confidencialidad', alias: 'I9' },
  { key: 'I', name: 'Integridad',       alias: 'I10' },
  { key: 'D', name: 'Disponibilidad',   alias: 'I11' },
  { key: 'A', name: 'Autenticidad',     alias: 'I13' },
  { key: 'T', name: 'Trazabilidad',     alias: 'I14' },
];

/** Descripciones literales por dimensión y nivel (INV ACT R30–R70). */
export const DIMENSION_DESC: Record<DimensionKey, string[]> = {
  C: [
    '',
    'El activo es público. No es necesario controlar la confidencialidad del activo.',
    'El conocimiento o divulgación no autorizada no produce ningún impacto negativo en el negocio.',
    'El conocimiento o divulgación no autorizada impacta de manera leve al negocio.',
    'El conocimiento o divulgación no autorizada impacta notablemente al negocio. Daño a la imagen y pérdida de confianza del cliente.',
    'El conocimiento o divulgación no autorizada impacta severamente al negocio. Falta total de confianza y/o pérdida de clientes.',
  ],
  I: [
    '',
    'El no funcionamiento de este activo no afecta al servicio. No aplica la exactitud y completitud.',
    'Produce errores despreciables que no afectan prácticamente al servicio. La exactitud no es relevante.',
    'Se producen errores leves de funcionamiento. La exactitud puede resolverse posteriormente.',
    'Ralentización y mal funcionamiento del servicio. La exactitud es importante aunque no crítica.',
    'No se puede funcionar sin este activo. La exactitud y completitud es crítica para el servicio.',
  ],
  D: [
    '',
    'No es relevante la disponibilidad de este activo.',
    'El activo debe ser accesible en 1 mes.',
    'El activo debe ser accesible en 1 semana.',
    'El activo debe ser accesible en 24/48h.',
    'Alta disponibilidad. El activo debe ser accesible 24x7 / 8x5.',
  ],
  A: [
    '',
    'No es relevante la autenticidad de este activo.',
    'La falsedad en origen o destinatario causaría un daño leve a la Organización.',
    'La falsedad causaría un daño importante aunque subsanable / incumplimiento de norma.',
    'La falsedad causaría un grave daño, de difícil o imposible reparación.',
    'La falsedad causaría pérdidas o daño reputacional muy graves / protestas masivas.',
  ],
  T: [
    '',
    'No es relevante la trazabilidad de este activo.',
    'La incapacidad de rastrear accesos impediría subsanar un error grave o perseguir delitos.',
    'Dificultaría gravemente subsanar errores y perseguir delitos; facilitaría su comisión.',
    'Impediría subsanar errores graves y perseguir delitos.',
    'Facilitaría enormemente la comisión de delitos graves.',
  ],
};

// ── Criticidad (I15 / A5) — criterio más restrictivo ────────────────────────
// Fórmula acumulativa: 10^C + 10^I + 10^D + 10^A + 10^T → nivel 1..5
const CRIT_MAX = [99, 999, 9999, 99999, 999999];

export function criticidadRaw(c: number, i: number, d: number, a: number, t: number): number {
  return [c, i, d, a, t].reduce((acc, v) => acc + Math.pow(10, v), 0);
}

export function criticidadLevel(c: number, i: number, d: number, a: number, t: number): number {
  const raw = criticidadRaw(c, i, d, a, t);
  for (let lvl = 0; lvl < CRIT_MAX.length; lvl++) {
    if (raw <= CRIT_MAX[lvl]) return lvl + 1;
  }
  return 5;
}

/** Impacto del activo (I6/I12) = media de las cinco dimensiones. */
export function impactoActivo(c: number, i: number, d: number, a: number, t: number): number {
  return (c + i + d + a + t) / 5;
}

// ── Impacto inherente (A10) = Criticidad × Degradación/100 → nivel 1..5 ──────
const IMPACT_MAX = [1.5, 2.5, 3.5, 4.5, 5.5];

/** Valor numérico crudo del impacto inherente (A11). */
export function impactoInherenteRaw(critLevel: number, degradValue: number): number {
  return (critLevel * degradValue) / 100;
}

function levelFromImpact(raw: number): number {
  for (let lvl = 0; lvl < IMPACT_MAX.length; lvl++) {
    if (raw <= IMPACT_MAX[lvl]) return lvl + 1;
  }
  return 5;
}

/** Nivel 1..5 del impacto inherente (A10). */
export function impactoInherenteLevel(critLevel: number, degradLevel: number): number {
  const degradValue = DEGRAD_LEVELS[degradLevel]?.value ?? 0;
  return levelFromImpact(impactoInherenteRaw(critLevel, degradValue));
}

// ── Zonas de riesgo (4 zonas) ───────────────────────────────────────────────
export interface ZoneMeta {
  zone: Zone;
  label: string;          // p. ej. "Zona 3"
  treatment: string;      // Aceptable / Tolerable / A tratar / Inaceptable
  bg: string;
  color: string;
  fill: string;           // sin # para docx
  requiereTratamiento: boolean;
}

export const ZONE_META: Record<Zone, ZoneMeta> = {
  Z3: { zone: 'Z3', label: 'Zona 3', treatment: 'Aceptable',   bg: '#dcfce7', color: '#166534', fill: 'DCFCE7', requiereTratamiento: false },
  Z4: { zone: 'Z4', label: 'Zona 4', treatment: 'Tolerable',   bg: '#ecfccb', color: '#3f6212', fill: 'ECFCCB', requiereTratamiento: false },
  Z2: { zone: 'Z2', label: 'Zona 2', treatment: 'A tratar',    bg: '#fed7aa', color: '#9a3412', fill: 'FED7AA', requiereTratamiento: true },
  Z1: { zone: 'Z1', label: 'Zona 1', treatment: 'Inaceptable', bg: '#fee2e2', color: '#991b1b', fill: 'FEE2E2', requiereTratamiento: true },
};

/** Orden de severidad de peor a mejor (para leyendas y resúmenes). */
export const ZONE_ORDER: Zone[] = ['Z1', 'Z2', 'Z4', 'Z3'];

/**
 * Zona a partir del producto Probabilidad × Impacto.
 * Umbrales (METODOLOGIA DE AARR): ≤0,7 Z3 · ≤1,6 Z4 · ≤9,9 Z2 · resto Z1.
 */
export function zoneFromProduct(product: number): Zone {
  if (product <= 0.7) return 'Z3';
  if (product <= 1.6) return 'Z4';
  if (product <= 9.9) return 'Z2';
  return 'Z1';
}

// ── Madurez de controles (C1–C13) ───────────────────────────────────────────
export const TIPO_VALUE: Record<ControlTipo, number> = {
  Correctivo: 1, Detectivo: 2, Preventivo: 3,
};
export const IMPL_VALUE: Record<ControlImplementacion, number> = {
  Manual: 1, Semiautomatico: 2, Automatizado: 3,
};
export const GRADO_VALUE: Record<ControlGrado, number> = {
  L0: 0, L1: 0.1, L2: 0.25, L3: 0.5, L4: 0.8, L5: 1,
};
export const GRADO_DESC: Record<ControlGrado, string> = {
  L0: 'Inexistente',
  L1: 'Inicial / Ad-Hoc',
  L2: 'Reproducible pero intuitivo',
  L3: 'Proceso definido',
  L4: 'Gestionado y medible',
  L5: 'Optimizado',
};
export const FRECUENCIA_VALUE: Record<ControlFrecuencia, number> = {
  AdHoc: 0, Anual: 0.5, Semestral: 1, Trimestral: 1.5, Mensual: 2, Diario: 3,
};
export const FRECUENCIA_LABEL: Record<ControlFrecuencia, string> = {
  AdHoc: 'Ad-Hoc', Anual: 'Anual', Semestral: 'Semestral',
  Trimestral: 'Trimestral', Mensual: 'Mensual', Diario: 'Diario',
};

/** C5 — Madurez/eficacia (niveles) = (C1+C2+C4)/3 → 0.1/0.3/1/2/3 */
const C5_MAX = [0.76, 1.26, 1.76, 2.26, 3.1];
const C5_VALUE = [0.1, 0.3, 1, 2, 3];

export function madurezC5(ctrl: AppliedControl): number {
  const raw = (TIPO_VALUE[ctrl.tipo] + IMPL_VALUE[ctrl.implementacion] + FRECUENCIA_VALUE[ctrl.frecuencia]) / 3;
  for (let lvl = 0; lvl < C5_MAX.length; lvl++) {
    if (raw <= C5_MAX[lvl]) return C5_VALUE[lvl];
  }
  return 3;
}

/** C13 / eficacia tras implantación = C5 × C3 (grado de implantación). */
export function eficaciaControl(ctrl: AppliedControl): number {
  return madurezC5(ctrl) * GRADO_VALUE[ctrl.grado];
}

/** C9 — madurez aplicada al impacto (eficacia si mitiga impacto, si no 0). */
export function c9(ctrl: AppliedControl): number {
  return ctrl.mitigaImpacto ? eficaciaControl(ctrl) : 0;
}
/** C10 — madurez aplicada a la probabilidad. */
export function c10(ctrl: AppliedControl): number {
  return ctrl.mitigaProbabilidad ? eficaciaControl(ctrl) : 0;
}

/** Media de C9 sobre los controles que efectivamente mitigan impacto (C11). */
function avgImpactMitigation(controls: AppliedControl[]): number {
  const vals = controls.map(c9).filter(v => v > 0);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
function avgProbMitigation(controls: AppliedControl[]): number {
  const vals = controls.map(c10).filter(v => v > 0);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// ── Resultado de cálculo de un riesgo ───────────────────────────────────────
export interface RiskInput {
  /** Dimensiones del activo 1..5 */
  C: number; I: number; D: number; A: number; T: number;
  /** Nivel de degradación 1..5 (A2) */
  degradacion: number;
  /** Nivel de probabilidad inherente 1..5 (A1) */
  probabilidad: number;
  /** Controles aplicados */
  controls: AppliedControl[];
}

export interface RiskResult {
  criticidad: number;            // A5 nivel 1..5
  impactoActivo: number;         // media dimensiones
  probValue: number;             // A1 valor (0.1..3)
  impactoInherente: number;      // A10 nivel 1..5
  riesgoInherente: number;       // A4 = A1 × A10
  zonaInherente: Zone;
  impactoResidual: number;       // A6
  probResidual: number;          // A7 valor
  riesgoResidual: number;        // A8 = A7 × A6
  zonaResidual: Zone;
}

export function computeRisk(input: RiskInput): RiskResult {
  const { C, I, D, A, T, degradacion, probabilidad, controls } = input;
  const crit = criticidadLevel(C, I, D, A, T);
  const probValue = PROB_LEVELS[probabilidad]?.value ?? 0;
  const impInh = impactoInherenteLevel(crit, degradacion);
  const riesgoInh = probValue * impInh;

  const avgImp = avgImpactMitigation(controls);
  const avgProb = avgProbMitigation(controls);
  const impRes = avgImp > 0 ? Math.max(0, impInh - avgImp) : impInh;
  const probRes = avgProb > 0 ? Math.max(0, probValue - avgProb) : probValue;
  const riesgoRes = probRes * impRes;

  return {
    criticidad: crit,
    impactoActivo: impactoActivo(C, I, D, A, T),
    probValue,
    impactoInherente: impInh,
    riesgoInherente: riesgoInh,
    zonaInherente: zoneFromProduct(riesgoInh),
    impactoResidual: impRes,
    probResidual: probRes,
    riesgoResidual: riesgoRes,
    zonaResidual: zoneFromProduct(riesgoRes),
  };
}

// ── Mapa de calor 5×5 (Probabilidad × Impacto inherente) ────────────────────
/** Zona de la celda (probabilidad nivel p, impacto inherente nivel imp). */
export function zoneOfCell(probLevel: number, impactLevel: number): Zone {
  const pv = PROB_LEVELS[probLevel]?.value ?? 0;
  return zoneFromProduct(pv * impactLevel);
}

// ── Conversión valor → nivel 1..5 ───────────────────────────────────────────
/** Aproxima un nivel 1..5 a partir de un valor de probabilidad (0.1..3). */
export function probLevelFromValue(v: number): number {
  if (v <= 0.1) return 1;
  if (v <= 0.3) return 2;
  if (v <= 1) return 3;
  if (v <= 2) return 4;
  return 5;
}
/** Nivel 1..5 a partir de un impacto (residual o inherente). */
export function impactLevelFromValue(v: number): number {
  return Math.min(5, Math.max(1, Math.round(v)));
}

// ── Resumen agregado de un conjunto de riesgos ──────────────────────────────
export interface ZoneCounts { Z1: number; Z2: number; Z3: number; Z4: number; }

export function emptyZoneCounts(): ZoneCounts {
  return { Z1: 0, Z2: 0, Z3: 0, Z4: 0 };
}

export interface EnrichedRisk {
  id: string;
  activo: string;
  amenaza: string;
  result: RiskResult;
  /** Zona residual */
  zone: Zone;
  zoneLabel: string;       // "Zona 2 · A tratar"
  zoneTreatment: string;   // "A tratar"
  score: number;           // riesgo residual
  probLabel: string;       // etiqueta de probabilidad residual
}

export interface RiskSummary {
  rows: EnrichedRisk[];
  /** grid[impacto-1][prob-1] con la zona residual */
  grid: number[][];
  zoneCounts: ZoneCounts;
  total: number;
  /** Z1 + Z2 (requieren tratamiento) */
  riesgosATratar: number;
}

type RiskLike = RiskInput & { id?: string; activo?: string; amenaza?: string };

export function computeRiskSummary(risks: RiskLike[]): RiskSummary {
  const rows: EnrichedRisk[] = risks.map((r, idx) => {
    const result = computeRisk(r);
    const zone = result.zonaResidual;
    const meta = ZONE_META[zone];
    return {
      id: r.id ?? `r-${idx}`,
      activo: r.activo ?? '',
      amenaza: r.amenaza ?? '',
      result,
      zone,
      zoneLabel: `${meta.label} · ${meta.treatment}`,
      zoneTreatment: meta.treatment,
      score: result.riesgoResidual,
      probLabel: PROB_LEVELS[probLevelFromValue(result.probResidual)]?.name ?? '',
    };
  });

  const zoneCounts = emptyZoneCounts();
  const grid: number[][] = [1, 2, 3, 4, 5].map(() => [0, 0, 0, 0, 0]);
  rows.forEach(({ result, zone }) => {
    zoneCounts[zone]++;
    const impLvl = impactLevelFromValue(result.impactoResidual);
    const probLvl = probLevelFromValue(result.probResidual);
    grid[impLvl - 1][probLvl - 1]++;
  });

  return {
    rows,
    grid,
    zoneCounts,
    total: rows.length,
    riesgosATratar: zoneCounts.Z1 + zoneCounts.Z2,
  };
}
