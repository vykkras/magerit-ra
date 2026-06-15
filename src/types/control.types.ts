/**
 * Tipos para el modelo de madurez de controles (salvaguardas) y zonas de riesgo,
 * según la metodología corporativa "MS01.MA01 — Apreciación del Riesgo BPO CC v7.3"
 * (hojas METODOLOGIA DE CONTROLES y METODOLOGIA DE AARR).
 */

// ── Zonas de riesgo (mapa de calor de 4 zonas) ──────────────────────────────
export type Zone = 'Z1' | 'Z2' | 'Z3' | 'Z4';

// ── Parámetros de un control (C1–C4) ────────────────────────────────────────

/** C1 — Tipo de control. Valor numérico: Correctivo 1 · Detectivo 2 · Preventivo 3 */
export type ControlTipo = 'Correctivo' | 'Detectivo' | 'Preventivo';

/** C2 — Tipo de implementación. Manual 1 · Semiautomático 2 · Automatizado 3 */
export type ControlImplementacion = 'Manual' | 'Semiautomatico' | 'Automatizado';

/** C3 — Grado de implantación. L0 0 · L1 0,1 · L2 0,25 · L3 0,5 · L4 0,8 · L5 1 */
export type ControlGrado = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

/** C4 — Frecuencia. Ad-Hoc 0 · Anual 0,5 · Semestral 1 · Trimestral 1,5 · Mensual 2 · Diario 3 */
export type ControlFrecuencia =
  | 'AdHoc' | 'Anual' | 'Semestral' | 'Trimestral' | 'Mensual' | 'Diario';

/**
 * Control aplicado a un riesgo, con sus parámetros de madurez (C1–C4) y las
 * banderas de mitigación (C7 ¿mitiga impacto? / C8 ¿mitiga probabilidad?).
 */
export interface AppliedControl {
  id: string;
  /** Nombre del control (puede provenir del catálogo de controles) */
  nombre: string;
  tipo: ControlTipo;
  implementacion: ControlImplementacion;
  grado: ControlGrado;
  frecuencia: ControlFrecuencia;
  /** C7 */
  mitigaImpacto: boolean;
  /** C8 */
  mitigaProbabilidad: boolean;
}
