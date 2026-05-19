import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RiskEntry {
  threatCode: string;
  safeguardCodes: string[];
}

export interface Category {
  id: string;
  name: string;
  risks: RiskEntry[];
}

function r(threatCode: string): RiskEntry {
  return { threatCode, safeguardCodes: [] };
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'low-impact-it',
    name: 'Adquisición de IT de bajo impacto',
    risks: [
      r('I.5'),   // Avería de origen físico o lógico
      r('E.1'),   // Errores de los usuarios
      r('E.2'),   // Errores del administrador
      r('E.4'),   // Errores de configuración
      r('E.20'),  // Vulnerabilidades del software
      r('E.21'),  // Errores de mantenimiento de SW
      r('E.23'),  // Errores de mantenimiento de HW
      r('E.25'),  // Pérdida de equipos
      r('A.11'),  // Acceso no autorizado
    ],
  },
  {
    id: 'saas',
    name: 'SaaS',
    risks: [
      r('I.5'),   // Avería de origen físico o lógico (proveedor)
      r('I.8'),   // Fallo de servicios de comunicaciones
      r('E.1'),   // Errores de los usuarios
      r('E.2'),   // Errores del administrador
      r('E.4'),   // Errores de configuración
      r('E.19'),  // Fugas de información
      r('E.20'),  // Vulnerabilidades del software
      r('E.24'),  // Caída por agotamiento de recursos
      r('A.5'),   // Suplantación de identidad
      r('A.6'),   // Abuso de privilegios
      r('A.11'),  // Acceso no autorizado
      r('A.14'),  // Interceptación de información
      r('A.19'),  // Divulgación de información
      r('A.24'),  // Denegación de servicio
    ],
  },
  {
    id: 'saas-ai',
    name: 'SaaS con IA',
    risks: [
      r('I.5'),   // Avería de origen físico o lógico (proveedor)
      r('I.8'),   // Fallo de servicios de comunicaciones
      r('E.1'),   // Errores de los usuarios
      r('E.2'),   // Errores del administrador
      r('E.4'),   // Errores de configuración
      r('E.7'),   // Deficiencias en la organización (gobernanza de IA)
      r('E.15'),  // Alteración accidental de la información (inputs al modelo)
      r('E.19'),  // Fugas de información (datos enviados al modelo)
      r('E.20'),  // Vulnerabilidades del software
      r('E.24'),  // Caída por agotamiento de recursos
      r('A.4'),   // Manipulación de la configuración (prompt injection)
      r('A.5'),   // Suplantación de identidad
      r('A.6'),   // Abuso de privilegios
      r('A.11'),  // Acceso no autorizado
      r('A.14'),  // Interceptación de información
      r('A.15'),  // Modificación deliberada de información (envenenamiento)
      r('A.19'),  // Divulgación de información
      r('A.24'),  // Denegación de servicio
      r('A.30'),  // Ingeniería social (contenido generado por IA)
    ],
  },
  {
    id: 'paas-iaas',
    name: 'PaaS / IaaS',
    risks: [
      r('I.5'),   // Avería de origen físico o lógico
      r('I.6'),   // Corte del suministro eléctrico
      r('I.8'),   // Fallo de servicios de comunicaciones
      r('E.2'),   // Errores del administrador
      r('E.3'),   // Errores de monitorización
      r('E.4'),   // Errores de configuración (misconfiguration cloud)
      r('E.9'),   // Errores de encaminamiento
      r('E.18'),  // Destrucción de información
      r('E.20'),  // Vulnerabilidades del software
      r('E.21'),  // Errores de mantenimiento de SW
      r('E.24'),  // Caída por agotamiento de recursos
      r('A.3'),   // Manipulación de logs
      r('A.4'),   // Manipulación de la configuración
      r('A.5'),   // Suplantación de identidad
      r('A.6'),   // Abuso de privilegios
      r('A.11'),  // Acceso no autorizado
      r('A.14'),  // Interceptación de información
      r('A.18'),  // Destrucción deliberada de información
      r('A.24'),  // Denegación de servicio
    ],
  },
  {
    id: 'it-outsourcing',
    name: 'IT Outsourcing',
    risks: [
      r('E.1'),   // Errores de los usuarios (personal externo)
      r('E.2'),   // Errores del administrador (proveedor)
      r('E.3'),   // Errores de monitorización
      r('E.7'),   // Deficiencias en la organización
      r('E.19'),  // Fugas de información
      r('E.28'),  // Indisponibilidad del personal
      r('A.5'),   // Suplantación de identidad
      r('A.6'),   // Abuso de privilegios (acceso del proveedor)
      r('A.7'),   // Uso no previsto de recursos
      r('A.11'),  // Acceso no autorizado
      r('A.13'),  // Repudio
      r('A.19'),  // Divulgación de información
      r('A.28'),  // Indisponibilidad deliberada del personal
      r('A.29'),  // Extorsión
      r('A.30'),  // Ingeniería social
    ],
  },
];

interface CategoryStore {
  categories: Category[];
  addRisk:           (categoryId: string, threatCode: string) => void;
  removeRisk:        (categoryId: string, threatCode: string) => void;
  addSafeguard:      (categoryId: string, threatCode: string, safeguardCode: string) => void;
  removeSafeguard:   (categoryId: string, threatCode: string, safeguardCode: string) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      categories: INITIAL_CATEGORIES,

      addRisk(categoryId, threatCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId || c.risks.some(r => r.threatCode === threatCode)
              ? c
              : { ...c, risks: [...c.risks, { threatCode, safeguardCodes: [] }] }
          ),
        }));
      },

      removeRisk(categoryId, threatCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId ? c : { ...c, risks: c.risks.filter(r => r.threatCode !== threatCode) }
          ),
        }));
      },

      addSafeguard(categoryId, threatCode, safeguardCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId ? c : {
              ...c,
              risks: c.risks.map(r =>
                r.threatCode !== threatCode || r.safeguardCodes.includes(safeguardCode)
                  ? r
                  : { ...r, safeguardCodes: [...r.safeguardCodes, safeguardCode] }
              ),
            }
          ),
        }));
      },

      removeSafeguard(categoryId, threatCode, safeguardCode) {
        set(s => ({
          categories: s.categories.map(c =>
            c.id !== categoryId ? c : {
              ...c,
              risks: c.risks.map(r =>
                r.threatCode !== threatCode ? r
                  : { ...r, safeguardCodes: r.safeguardCodes.filter(sc => sc !== safeguardCode) }
              ),
            }
          ),
        }));
      },
    }),
    { name: 'magerit-categories-v2' }
  )
);

/** Returns the deduplicated union of all safeguard codes across all risks in a category */
export function getCategorySafeguards(category: Category): string[] {
  const seen = new Set<string>();
  category.risks.forEach(r => r.safeguardCodes.forEach(sc => seen.add(sc)));
  return [...seen];
}
