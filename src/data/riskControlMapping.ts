/**
 * Mapeo canónico RIESGO ↔ CONTROL — derivado EXCLUSIVAMENTE del Excel corporativo
 * MS01.MA01 (Metodología Apreciación del Riesgo BPO CC v7.3).
 *
 * El Excel NO contiene una matriz directa riesgo × control. El único vínculo que
 * aporta es la CATEGORÍA DE ACTIVO:
 *   - hoja "riesgos": cada riesgo lista las categorías de activo que afecta
 *     (Comunicaciones, Hardware, Información, Instalaciones, Personal, Servicios,
 *     Software, Soportes).
 *   - hoja "Gestion de Controles": cada control pertenece a una familia de
 *     Salvaguarda que, por la taxonomía MAGERIT, protege un tipo de activo.
 *
 * Por tanto: un control mitiga un riesgo cuando la familia del control protege
 * alguna de las categorías de activo que el riesgo afecta.
 *
 * Familias TRANSVERSALES: el Excel las define sin vínculo a un tipo de activo
 * concreto (protecciones horizontales, gobierno/organización y medidas ENS). Se
 * consideran aplicables a TODOS los riesgos y se listan una sola vez.
 */

import { CONTROLES_CATALOG, type ControlCatalogEntry } from './controlesCatalog';
import { RIESGOS_CATALOG } from './riesgosCatalog';
import { type CategoryId } from './controlResponsibility';

// ── Categorías de activo (hoja "riesgos") ───────────────────────────────────
export const ASSET_CATEGORIES = [
  'Comunicaciones', 'Hardware', 'Información', 'Instalaciones',
  'Personal', 'Servicios', 'Software', 'Soportes',
] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

// ── Familias transversales (sin vínculo a un tipo de activo en el Excel) ─────
// Aplican a todos los riesgos.
export const FAMILIAS_TRANSVERSALES = new Set<string>([
  'Protecciones generales u horizontales',
  'Salvaguardas de tipo organizativo',
  'ENS_MARCO ORGANIZATIVO',
  'ENS_MEDIDAS DE PROTECCIÓN',
]);

// ── Familias específicas → categorías de activo que protegen ────────────────
// Derivado del nombre de la familia de Salvaguarda (taxonomía MAGERIT v3).
export const FAMILIA_ASSET_CATEGORIES: Record<string, AssetCategory[]> = {
  'Protección de los datos - información':                          ['Información'],
  'Protección de los servicios':                                    ['Servicios'],
  'Protección de las aplicaciones (software/hardware)':            ['Software', 'Hardware'],
  'Protección de las aplicaciones (hardware)':                      ['Hardware'],
  'Protección de las comunicaciones':                              ['Comunicaciones'],
  'Protección en los puntos de interconexión con otros sistemas':  ['Comunicaciones'],
  'Protección de los soportes de información':                      ['Soportes'],
  'Protección de los elementos auxiliares':                        ['Instalaciones'],
  'Seguridad física – Protección de las instalaciones':            ['Instalaciones'],
  'Salvaguardas relativas al personal':                            ['Personal'],
  'Continuidad de operaciones':                                    ['Servicios'],
  'Externalización':                                               ['Servicios'],
  'ENS_MARCO OPERACIONAL':                                         ['Servicios', 'Software'],
};

// Los nombres de familia provienen de varias fuentes con normalización Unicode
// distinta (NFC/NFD: «Protección» vs «Protección»). Se comparan normalizados.
const nfc = (s: string) => s.normalize('NFC');
const TRANSVERSAL_NFC = new Set([...FAMILIAS_TRANSVERSALES].map(nfc));
const FAMILIA_ASSET_NFC: Record<string, AssetCategory[]> = Object.fromEntries(
  Object.entries(FAMILIA_ASSET_CATEGORIES).map(([k, v]) => [nfc(k), v])
);

export function familiaEsTransversal(familia: string): boolean {
  return TRANSVERSAL_NFC.has(nfc(familia));
}

export function controlEsTransversal(control: ControlCatalogEntry): boolean {
  return familiaEsTransversal(control.familia);
}

/** Categorías de activo asociadas a una familia específica (no transversal). */
function familiaAssetCats(familia: string): AssetCategory[] {
  return FAMILIA_ASSET_NFC[nfc(familia)] ?? [];
}

/** Categorías de activo que protege la familia de un control ('all' si transversal). */
export function familiaAssetCategories(familia: string): AssetCategory[] | 'all' {
  if (familiaEsTransversal(familia)) return 'all';
  return familiaAssetCats(familia);
}

// ── Categorías de activo afectadas por cada riesgo ──────────────────────────
// Unión de todas las filas con el mismo código. 'Otra' (activo sin tipificar) se
// ignora: el riesgo sólo queda cubierto por controles transversales si no aporta
// ninguna categoría concreta.
export const RIESGO_ASSET_CATEGORIES: Record<string, AssetCategory[]> = (() => {
  const valid = new Set<string>(ASSET_CATEGORIES);
  const acc: Record<string, Set<AssetCategory>> = {};
  for (const r of RIESGOS_CATALOG) {
    (acc[r.code] ??= new Set());
    for (const c of r.categorias) if (valid.has(c)) acc[r.code].add(c as AssetCategory);
  }
  const out: Record<string, AssetCategory[]> = {};
  for (const code in acc) out[code] = [...acc[code]];
  return out;
})();

// ── ¿Un control mitiga un riesgo? ───────────────────────────────────────────
export function controlMitigaRiesgo(control: ControlCatalogEntry, riskCode: string): boolean {
  const cats = familiaAssetCategories(control.familia);
  if (cats === 'all') return true;                              // transversal
  const riskCats = RIESGO_ASSET_CATEGORIES[riskCode] ?? [];
  return cats.some(c => riskCats.includes(c));
}

/** ¿La familia de salvaguarda mitiga el riesgo? (transversal → siempre). */
export function familiaMitigaRiesgo(familia: string, riskCode: string): boolean {
  if (familiaEsTransversal(familia)) return true;
  const fam = familiaAssetCats(familia);
  const riskCats = RIESGO_ASSET_CATEGORIES[riskCode] ?? [];
  return fam.some(c => riskCats.includes(c));
}

/** Controles ESPECÍFICOS (familia con vínculo a activo) que mitigan el riesgo. */
export function specificControlsForRisk(riskCode: string): ControlCatalogEntry[] {
  return CONTROLES_CATALOG.filter(c => !controlEsTransversal(c) && controlMitigaRiesgo(c, riskCode));
}

/** Todos los controles (específicos + transversales) que mitigan el riesgo. */
export function controlsForRisk(riskCode: string): ControlCatalogEntry[] {
  return CONTROLES_CATALOG.filter(c => controlMitigaRiesgo(c, riskCode));
}

/** Controles transversales (aplican a todos los riesgos), listados una sola vez. */
export const TRANSVERSAL_CONTROLS: ControlCatalogEntry[] =
  CONTROLES_CATALOG.filter(controlEsTransversal);

// ── Categorías de solución (cuestionario) → riesgos aplicables ──────────────
// Curado del Excel: cada categoría de solución sólo se ve afectada por un
// subconjunto de riesgos (no todos). Fuente del subconjunto: criterio corporativo
// sobre los riesgos del catálogo aplicables a cada tipo de adquisición ICT.
export const CATEGORY_RISK_CODES: Record<CategoryId, string[]> = {
  'low-impact-it':  ['I.5','E.1','E.2','E.4','E.20','E.21','E.23','E.25','A.11'],
  'saas':           ['I.5','I.8','E.1','E.2','E.4','E.19','E.20','E.24','A.5','A.6','A.11','A.14','A.19','A.24'],
  'saas-ai':        ['I.5','I.8','E.1','E.2','E.4','E.7','E.15','E.19','E.20','E.24','A.4','A.5','A.6','A.11','A.14','A.15','A.19','A.24','A.30'],
  'paas-iaas':      ['I.5','I.6','I.8','E.2','E.3','E.4','E.9','E.18','E.20','E.21','E.24','A.3','A.4','A.5','A.6','A.11','A.14','A.18','A.24'],
  'it-outsourcing': ['E.1','E.2','E.3','E.7','E.19','E.28','A.5','A.6','A.7','A.11','A.13','A.19','A.28','A.29','A.30'],
};

/** Categorías de activo que toca una categoría de solución (unión de sus riesgos). */
export function categoryAssetCategories(catId: CategoryId): AssetCategory[] {
  const seen = new Set<AssetCategory>();
  for (const code of CATEGORY_RISK_CODES[catId] ?? []) {
    for (const c of RIESGO_ASSET_CATEGORIES[code] ?? []) seen.add(c);
  }
  return [...seen];
}

/**
 * ¿La familia de salvaguarda aplica a una categoría de solución?
 * Transversal → siempre. Específica → si protege alguna categoría de activo que
 * la categoría de solución toca (vía sus riesgos).
 */
export function familiaAplicaCategoria(familia: string, catId: CategoryId): boolean {
  if (familiaEsTransversal(familia)) return true;
  const fam = familiaAssetCats(familia);
  const cat = categoryAssetCategories(catId);
  return fam.some(c => cat.includes(c));
}
