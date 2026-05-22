/**
 * Tipos para salvaguardas ISO/IEC 27001:2022.
 * Reemplaza el catálogo MAGERIT §6 por controles ISO 27001 agrupados en 12 categorías.
 */

import type { ISO27001Category } from '../data/iso27001.data';

export type { ISO27001Category as SafeguardFamily } from '../data/iso27001.data';

// ---------------------------------------------------------------------------
// Estado de implantación
// ---------------------------------------------------------------------------

export type SafeguardStatus =
  | 'implemented'    // implementado y operativo
  | 'partial'        // implementado parcialmente
  | 'planned'        // planificado
  | 'not_applicable' // no aplica
  | 'missing';       // identificado como necesario pero no implementado

// ---------------------------------------------------------------------------
// Responsable del control
// ---------------------------------------------------------------------------

export type SafeguardResponsable = 'proveedor' | 'empresa';

// ---------------------------------------------------------------------------
// Entidad Salvaguarda (control ISO 27001 instanciado)
// ---------------------------------------------------------------------------

export interface Safeguard {
  id: string;
  /** ID del control ISO 27001 del catálogo (ej. "iso-5.1") */
  controlId: string;
  /** Categoría ISO 27001 */
  category: ISO27001Category;
  /** Nombre del control */
  name: string;
  /** Descripción / contexto de implantación */
  description: string;
  /** IDs oficiales ISO 27001 (ej. ["5.1"] o ["5.2","5.3","5.4"]) */
  isoIds: string[];
  /** Quién implementa este control: el proveedor/solución evaluada o nuestra empresa */
  responsable: SafeguardResponsable | null;
  /** Amenazas MAGERIT §5 que este control ayuda a mitigar */
  threatsMitigated: string[];
  /** Eficacia del control (0-100%) */
  effectiveness: number;
  /** Estado de implantación */
  status: SafeguardStatus;
  /** Coste estimado (€, opcional) */
  cost?: number;
  /** Notas del analista */
  notes: string;
  createdAt: string;
  updatedAt: string;
}
