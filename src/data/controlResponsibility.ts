/**
 * Modelo de responsabilidad (cliente / proveedor) de los controles, por categoría
 * de solución.
 *
 * El Excel MS01.MA01 no asigna responsabilidad por control: la ownership vive a
 * nivel de activo (INTERNO = cliente / EXTERNO = proveedor; Personal_ui = usuarios
 * internos / Personal_Pro = proveedores). Aquí la derivamos en dos pasos:
 *
 *  1) A cada control se le asigna un ARQUETIPO según su familia y su nombre:
 *       - gov    : gobierno, políticas, personas internas, externalización → lo
 *                  retiene el CLIENTE.
 *       - infra  : infraestructura, red, físico, plataforma, desarrollo, operación
 *                  técnica → lo opera el PROVEEDOR.
 *       - shared : datos, accesos, cifrado, registro, incidentes, monitorización →
 *                  responsabilidad COMPARTIDA.
 *  2) El arquetipo se traduce a responsabilidad según la categoría de solución
 *     (quién opera realmente la pila en cada modelo).
 */

import { CONTROL_FAMILIAS, type ControlCatalogEntry } from './controlesCatalog';

/** Categorías de solución (ids canónicos, alineados con categoryStore). */
export type CategoryId = 'low-impact-it' | 'saas' | 'saas-ai' | 'paas-iaas' | 'it-outsourcing';

export const CATEGORY_IDS: CategoryId[] = ['low-impact-it', 'saas', 'saas-ai', 'paas-iaas', 'it-outsourcing'];

export type Responsibility = 'cliente' | 'proveedor' | 'compartido' | 'na';

export const RESPONSIBILITY_LABELS: Record<Responsibility, string> = {
  cliente: 'Cliente',
  proveedor: 'Proveedor',
  compartido: 'Compartido',
  na: 'N/A',
};

type Archetype = 'gov' | 'infra' | 'shared';

const C: Responsibility = 'cliente';
const P: Responsibility = 'proveedor';
const X: Responsibility = 'compartido';
const N: Responsibility = 'na';

// ── Arquetipo → responsabilidad por categoría ───────────────────────────────
const ARCHETYPE_RESP: Record<CategoryId, Record<Archetype, Responsibility>> = {
  // El cliente adquiere y opera el producto: lo asume todo.
  'low-impact-it':  { gov: C, infra: C, shared: C },
  // SaaS: proveedor opera la pila/infra; cliente gobierna; datos/accesos compartidos.
  'saas':           { gov: C, infra: P, shared: X },
  'saas-ai':        { gov: C, infra: P, shared: X },
  // PaaS/IaaS: proveedor opera plataforma/físico; cliente del SO hacia arriba.
  'paas-iaas':      { gov: C, infra: P, shared: X },
  // Outsourcing: proveedor opera la TI; el cliente retiene gobierno (compartido).
  'it-outsourcing': { gov: X, infra: P, shared: X },
};

// ── Clasificación de arquetipo por familia ──────────────────────────────────
const FAM_GOV = new Set([
  'Salvaguardas de tipo organizativo',
  'ENS_MARCO ORGANIZATIVO',
  'Externalización',
  'Salvaguardas relativas al personal',
]);
const FAM_INFRA = new Set([
  'Protección de los servicios',
  'Protección de las aplicaciones (software/hardware)',
  'Protección de las aplicaciones (hardware)',
  'Protección de las comunicaciones',
  'Protección en los puntos de interconexión con otros sistemas',
  'Protección de los soportes de información',
  'Protección de los elementos auxiliares',
  'Seguridad física – Protección de las instalaciones',
  'Continuidad de operaciones',
  'ENS_MARCO OPERACIONAL',
]);
const FAM_SHARED = new Set([
  'Protección de los datos - información',
  'Protecciones generales u horizontales',
]);

// Palabras clave para la familia heterogénea "ENS_MEDIDAS DE PROTECCIÓN" y otras.
const KW_GOV = /pol[íi]tic|normativ|procedimiento|concienciaci|formaci|capacitaci|gesti[óo]n de riesgos|privacidad|consentimiento|minimizaci|uso aceptable|auditor|inspecci|ingenier[íi]a social|simulacro/i;
const KW_INFRA = /\bred\b|perimetr|frontera|firewall|cable|el[ée]ctric|climatiz|instalaci|f[íi]sic|hardware|m[óo]vil|\bmdm\b|nube|cloud|correo|\bdns\b|filtrado web|denegaci[óo]n|malware|c[óo]digo|codificaci|parche|actualizaci|configuraci|copia de seguridad|backup|monitor|continuidad|\bweb\b/i;

function archetype(control: ControlCatalogEntry): Archetype {
  const fam = control.familia;
  if (FAM_GOV.has(fam)) return 'gov';
  if (FAM_INFRA.has(fam)) return 'infra';
  if (FAM_SHARED.has(fam)) return 'shared';
  // Familia heterogénea (p. ej. ENS_MEDIDAS DE PROTECCIÓN): por palabra clave.
  const n = control.nombre;
  if (KW_GOV.test(n)) return 'gov';
  if (KW_INFRA.test(n)) return 'infra';
  return 'shared';
}

/** Responsabilidad de un control en una categoría concreta. */
export function controlResponsabilidad(control: ControlCatalogEntry, categoryId: CategoryId): Responsibility {
  // En adquisiciones de bajo impacto no hay tercero: la externalización no aplica.
  if (categoryId === 'low-impact-it' && control.familia === 'Externalización') return N;
  return ARCHETYPE_RESP[categoryId][archetype(control)];
}

/** Arquetipo expuesto (para depuración / informes). */
export function controlArquetipo(control: ControlCatalogEntry): Archetype {
  return archetype(control);
}

// Aviso en desarrollo si alguna familia del catálogo no está clasificada.
if (import.meta.env?.DEV) {
  const classified = new Set([...FAM_GOV, ...FAM_INFRA, ...FAM_SHARED, 'ENS_MEDIDAS DE PROTECCIÓN']);
  const missing = CONTROL_FAMILIAS.filter(f => !classified.has(f));
  if (missing.length) console.warn('[controlResponsibility] Familias sin clasificar (usan palabra clave):', missing);
}
