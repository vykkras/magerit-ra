// Nivel de Madurez Actual por control ISO 27001:2022
// Escala 1-5: 1=Inicial, 2=Repetible, 3=Definido, 4=Gestionado, 5=Optimizado
// Fuente: evaluación interna organizacional

export type MaturityLevel = 1 | 2 | 3 | 4 | 5;

export const MATURITY_LEVELS: Record<string, MaturityLevel> = {
  'iso-5.1':  5, 'iso-5.2':  4, 'iso-5.3':  4, 'iso-5.4':  5, 'iso-5.5':  3,
  'iso-5.6':  3, 'iso-5.7':  5, 'iso-5.8':  5, 'iso-5.9':  4, 'iso-5.10': 5,
  'iso-5.11': 5, 'iso-5.12': 4, 'iso-5.13': 4, 'iso-5.14': 3, 'iso-5.15': 4,
  'iso-5.16': 4, 'iso-5.17': 4, 'iso-5.18': 4, 'iso-5.19': 4, 'iso-5.20': 3,
  'iso-5.21': 4, 'iso-5.22': 4, 'iso-5.23': 4, 'iso-5.24': 3, 'iso-5.25': 3,
  'iso-5.26': 3, 'iso-5.27': 3, 'iso-5.28': 3, 'iso-5.29': 3, 'iso-5.30': 3,
  'iso-5.31': 4, 'iso-5.32': 4, 'iso-5.33': 4, 'iso-5.34': 4, 'iso-5.35': 5,
  'iso-5.36': 4, 'iso-5.37': 4,
  'iso-6.1':  3, 'iso-6.2':  3, 'iso-6.3':  5, 'iso-6.4':  3, 'iso-6.5':  3,
  'iso-6.6':  3, 'iso-6.7':  4, 'iso-6.8':  4,
  'iso-7.1':  3, 'iso-7.2':  4, 'iso-7.3':  3, 'iso-7.4':  4, 'iso-7.5':  3,
  'iso-7.6':  4, 'iso-7.7':  3, 'iso-7.8':  3, 'iso-7.9':  4, 'iso-7.10': 3,
  'iso-7.11': 3, 'iso-7.12': 3, 'iso-7.13': 4, 'iso-7.14': 3,
  'iso-8.1':  2, 'iso-8.2':  5, 'iso-8.3':  4, 'iso-8.4':  5, 'iso-8.5':  2,
  'iso-8.6':  5, 'iso-8.7':  5, 'iso-8.8':  4, 'iso-8.9':  5, 'iso-8.10': 4,
  'iso-8.11': 3, 'iso-8.12': 4, 'iso-8.13': 4, 'iso-8.14': 4, 'iso-8.15': 5,
  'iso-8.16': 5, 'iso-8.17': 5, 'iso-8.18': 5, 'iso-8.19': 4, 'iso-8.20': 5,
  'iso-8.21': 5, 'iso-8.22': 5, 'iso-8.23': 5, 'iso-8.24': 5, 'iso-8.25': 4,
  'iso-8.26': 4, 'iso-8.27': 3, 'iso-8.28': 4, 'iso-8.29': 3, 'iso-8.30': 5,
  'iso-8.31': 3, 'iso-8.32': 3, 'iso-8.33': 3, 'iso-8.34': 3,
};

export const MATURITY_LABEL: Record<MaturityLevel, string> = {
  1: 'Inicial',
  2: 'Repetible',
  3: 'Definido',
  4: 'Gestionado',
  5: 'Optimizado',
};

// Average maturity of a list of safeguard references
export function avgMaturity(refs: string[]): number {
  if (refs.length === 0) return 3;
  const vals = refs.map(r => MATURITY_LEVELS[r] ?? 3);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// How much inherent impact is reduced by internal maturity
// mat 1-2 → 0, mat 3-3.9 → 0, mat 4-4.9 → 1, mat 5 → 2
export function maturityReduction(avgMat: number): number {
  if (avgMat >= 5)   return 2;
  if (avgMat >= 4)   return 1;
  return 0;
}
