/**
 * Re-exporta el catálogo ISO 27001 con alias legacy para compatibilidad
 * con CategoriesPage y MappingsPage.
 *
 * Los códigos de catálogo son ahora IDs ISO 27001 (ej. "iso-5.1").
 * El campo `family` del catálogo antiguo equivale al campo `category` ISO.
 */

export {
  ISO27001_CONTROLS   as SAFEGUARD_CATALOG,
  ISO27001_CATEGORIES as SAFEGUARD_FAMILIES,
  CONTROLS_BY_ID      as CATALOG_BY_CODE,
  STATUS_LABELS,
  type ISO27001Category as SafeguardFamily,
  type ISO27001Control  as SafeguardCatalogEntry,
} from './iso27001.data';

// FAMILY_META legacy shim: MappingsPage uses FAMILY_META[f].label
// We return the category name directly as label.
import { ISO27001_CATEGORIES, type ISO27001Category } from './iso27001.data';
export const FAMILY_META: Record<ISO27001Category, { label: string }> =
  Object.fromEntries(ISO27001_CATEGORIES.map(cat => [cat, { label: cat }])) as
  Record<ISO27001Category, { label: string }>;
