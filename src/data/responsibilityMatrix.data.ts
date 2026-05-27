export type Responsibility = 'proveedor' | 'cliente' | 'compartido' | 'na';
export type CategoryKey = 'adq_basica' | 'saas' | 'saas_ia' | 'paas_iaas' | 'outsourcing';

export const CATEGORY_LABELS: Record<CategoryKey, { short: string; full: string }> = {
  adq_basica:  { short: 'Adq. Básica',  full: 'Adquisición IT de Bajo Impacto – Adquisición básica' },
  saas:        { short: 'SaaS',          full: 'SaaS – Aplicación estándar gestionada por proveedor' },
  saas_ia:     { short: 'SaaS con IA',   full: 'SaaS con IA – Aplicación SaaS con capacidades cognitivas' },
  paas_iaas:   { short: 'PaaS / IaaS',   full: 'PaaS / IaaS – Plataforma o infraestructura cloud' },
  outsourcing: { short: 'IT Outsourcing',full: 'IT Outsourcing – Externalización de procesos o infraestructura' },
};

export const CATEGORY_KEYS: CategoryKey[] = ['adq_basica', 'saas', 'saas_ia', 'paas_iaas', 'outsourcing'];

export const RESPONSIBILITY_LABELS: Record<Responsibility, string> = {
  proveedor:  'Proveedor',
  cliente:    'Cliente',
  compartido: 'Compartido',
  na:         'N/A',
};

export interface ControlEntry {
  id: string;
  control: string;
  nivelMadurez: number;
  resp: Record<CategoryKey, Responsibility>;
}

// Responsibility logic per category type:
// adq_basica  → client owns/manages the product themselves → almost always 'cliente'
// saas        → provider manages stack/infra/physical; client manages users, data, policies
// saas_ia     → same as saas + extra client oversight for AI/data governance
// paas_iaas   → provider manages physical/hypervisor; client manages OS upward
// outsourcing → provider operates IT; client retains governance/policy
//
// Shorthand used below: C=cliente  P=proveedor  CO=compartido  NA=na

const C:  Responsibility = 'cliente';
const P:  Responsibility = 'proveedor';
const CO: Responsibility = 'compartido';
const NA: Responsibility = 'na';

function r(a: Responsibility, s: Responsibility, si: Responsibility, pi: Responsibility, o: Responsibility): Record<CategoryKey, Responsibility> {
  return { adq_basica: a, saas: s, saas_ia: si, paas_iaas: pi, outsourcing: o };
}

export const RESPONSIBILITY_MATRIX: ControlEntry[] = [
  // ── 5.x Organizational Controls ──────────────────────────────────────────────
  { id:'5.1',  nivelMadurez:5, control:'Políticas de seguridad de la información',                                          resp: r(C,  C,  C,  C,  CO) },
  { id:'5.2',  nivelMadurez:4, control:'Funciones y responsabilidades en seguridad de la información',                      resp: r(C,  C,  C,  C,  CO) },
  { id:'5.3',  nivelMadurez:4, control:'Segregación de tareas',                                                              resp: r(C,  CO, CO, CO, CO) },
  { id:'5.4',  nivelMadurez:5, control:'Responsabilidades de gestión',                                                       resp: r(C,  C,  C,  C,  CO) },
  { id:'5.5',  nivelMadurez:3, control:'Contacto con las autoridades',                                                       resp: r(C,  C,  C,  C,  CO) },
  { id:'5.6',  nivelMadurez:3, control:'Contacto con grupos de interés especial',                                            resp: r(C,  C,  C,  C,  C)  },
  { id:'5.7',  nivelMadurez:5, control:'Información sobre amenazas',                                                         resp: r(C,  CO, CO, CO, CO) },
  { id:'5.8',  nivelMadurez:5, control:'Seguridad de la información en la gestión de proyectos',                            resp: r(C,  C,  C,  C,  CO) },
  { id:'5.9',  nivelMadurez:4, control:'Inventario de información y otros activos asociados',                                resp: r(C,  CO, CO, C,  CO) },
  { id:'5.10', nivelMadurez:5, control:'Uso aceptable de la información y otros activos asociados',                         resp: r(C,  C,  C,  C,  CO) },
  { id:'5.11', nivelMadurez:5, control:'Devolución de activos',                                                              resp: r(C,  NA, NA, NA, CO) },
  { id:'5.12', nivelMadurez:4, control:'Clasificación de la información',                                                    resp: r(C,  C,  C,  C,  CO) },
  { id:'5.13', nivelMadurez:4, control:'Etiquetado de la información',                                                       resp: r(C,  C,  C,  C,  CO) },
  { id:'5.14', nivelMadurez:3, control:'Transferencia de la información',                                                    resp: r(C,  CO, CO, CO, CO) },
  { id:'5.15', nivelMadurez:4, control:'Control de acceso',                                                                  resp: r(C,  CO, CO, CO, CO) },
  { id:'5.16', nivelMadurez:4, control:'Gestión de la identidad',                                                            resp: r(C,  CO, CO, CO, CO) },
  { id:'5.17', nivelMadurez:4, control:'Información de autenticación',                                                       resp: r(C,  CO, CO, CO, CO) },
  { id:'5.18', nivelMadurez:4, control:'Derechos de acceso',                                                                 resp: r(C,  CO, CO, CO, CO) },
  { id:'5.19', nivelMadurez:4, control:'Seguridad de la información en las relaciones con los proveedores',                  resp: r(C,  C,  C,  C,  C)  },
  { id:'5.20', nivelMadurez:3, control:'Abordar la seguridad de la información en los acuerdos con los proveedores',        resp: r(C,  C,  C,  C,  C)  },
  { id:'5.21', nivelMadurez:4, control:'Gestión de la SI en la cadena de suministro de las TIC',                            resp: r(C,  CO, CO, CO, CO) },
  { id:'5.22', nivelMadurez:4, control:'Seguimiento, revisión y gestión de cambio de los servicios de los proveedores',     resp: r(C,  C,  C,  C,  C)  },
  { id:'5.23', nivelMadurez:4, control:'Seguridad de la información para el uso de servicios en la nube',                   resp: r(NA, C,  C,  C,  CO) },
  { id:'5.24', nivelMadurez:3, control:'Planificación y preparación en la gestión de incidentes de SI',                     resp: r(C,  CO, CO, CO, CO) },
  { id:'5.25', nivelMadurez:3, control:'Evaluación y decisión sobre eventos de seguridad de la información',                resp: r(C,  CO, CO, CO, CO) },
  { id:'5.26', nivelMadurez:3, control:'Respuesta a los incidentes de seguridad de la información',                         resp: r(C,  CO, CO, CO, CO) },
  { id:'5.27', nivelMadurez:3, control:'Aprender de los incidentes de seguridad de la información',                         resp: r(C,  CO, CO, CO, CO) },
  { id:'5.28', nivelMadurez:3, control:'Recopilación de pruebas',                                                            resp: r(C,  CO, CO, CO, CO) },
  { id:'5.29', nivelMadurez:3, control:'Seguridad de la información durante la interrupción',                                resp: r(C,  CO, CO, CO, CO) },
  { id:'5.30', nivelMadurez:3, control:'Preparación de las TIC para la continuidad de la actividad',                        resp: r(C,  P,  P,  CO, CO) },
  { id:'5.31', nivelMadurez:4, control:'Identificación de los requisitos legales, reglamentarios y contractuales',          resp: r(C,  C,  C,  C,  CO) },
  { id:'5.32', nivelMadurez:4, control:'Derechos de propiedad intelectual (DPI)',                                            resp: r(C,  C,  C,  C,  CO) },
  { id:'5.33', nivelMadurez:4, control:'Protección de los registros',                                                        resp: r(C,  CO, CO, CO, CO) },
  { id:'5.34', nivelMadurez:4, control:'Protección de datos y privacidad de la información de carácter personal',           resp: r(C,  CO, CO, CO, CO) },
  { id:'5.35', nivelMadurez:5, control:'Revisión independiente de la seguridad de la información',                          resp: r(C,  C,  C,  C,  CO) },
  { id:'5.36', nivelMadurez:4, control:'Cumplimiento de las políticas y normas de seguridad de la información',             resp: r(C,  CO, CO, CO, CO) },
  { id:'5.37', nivelMadurez:4, control:'Procedimientos de trabajo documentados',                                             resp: r(C,  CO, CO, CO, CO) },

  // ── 6.x People Controls ───────────────────────────────────────────────────────
  { id:'6.1',  nivelMadurez:3, control:'Investigación de antecedentes',                                                      resp: r(C,  C,  C,  C,  CO) },
  { id:'6.2',  nivelMadurez:3, control:'Términos y condiciones del empleo',                                                   resp: r(C,  C,  C,  C,  CO) },
  { id:'6.3',  nivelMadurez:5, control:'Sensibilización, educación y formación en materia de SI',                            resp: r(C,  CO, CO, CO, CO) },
  { id:'6.4',  nivelMadurez:3, control:'Proceso disciplinario',                                                               resp: r(C,  C,  C,  C,  CO) },
  { id:'6.5',  nivelMadurez:3, control:'Responsabilidad tras el cese o el cambio de empleo',                                 resp: r(C,  C,  C,  C,  CO) },
  { id:'6.6',  nivelMadurez:3, control:'Acuerdos de confidencialidad o no revelación',                                       resp: r(C,  CO, CO, CO, CO) },
  { id:'6.7',  nivelMadurez:4, control:'Trabajo remoto',                                                                     resp: r(C,  CO, CO, CO, CO) },
  { id:'6.8',  nivelMadurez:4, control:'Informes de eventos de seguridad de la información',                                 resp: r(C,  CO, CO, CO, CO) },

  // ── 7.x Physical Controls ─────────────────────────────────────────────────────
  { id:'7.1',  nivelMadurez:3, control:'Perímetro de seguridad física',                                                      resp: r(C,  P,  P,  P,  CO) },
  { id:'7.2',  nivelMadurez:4, control:'Controles físicos de entrada',                                                       resp: r(C,  P,  P,  P,  CO) },
  { id:'7.3',  nivelMadurez:3, control:'Asegurar las oficinas, salas e instalaciones',                                       resp: r(C,  P,  P,  P,  CO) },
  { id:'7.4',  nivelMadurez:4, control:'Vigilancia de la seguridad física',                                                  resp: r(C,  P,  P,  P,  CO) },
  { id:'7.5',  nivelMadurez:3, control:'Protección contra las amenazas físicas y medioambientales',                          resp: r(C,  P,  P,  P,  CO) },
  { id:'7.6',  nivelMadurez:4, control:'Trabajo en áreas seguras',                                                           resp: r(C,  P,  P,  P,  CO) },
  { id:'7.7',  nivelMadurez:3, control:'Escritorio y pantalla despejados',                                                   resp: r(C,  C,  C,  C,  CO) },
  { id:'7.8',  nivelMadurez:3, control:'Ubicación y protección de los equipos',                                              resp: r(C,  P,  P,  P,  CO) },
  { id:'7.9',  nivelMadurez:4, control:'Seguridad de los activos fuera de las instalaciones',                                resp: r(C,  C,  C,  C,  CO) },
  { id:'7.10', nivelMadurez:3, control:'Medios de almacenamiento',                                                           resp: r(C,  P,  P,  CO, CO) },
  { id:'7.11', nivelMadurez:3, control:'Servicios de apoyo',                                                                  resp: r(C,  P,  P,  P,  P)  },
  { id:'7.12', nivelMadurez:3, control:'Seguridad del cableado',                                                             resp: r(C,  P,  P,  P,  P)  },
  { id:'7.13', nivelMadurez:4, control:'Mantenimiento de equipos',                                                           resp: r(C,  P,  P,  P,  P)  },
  { id:'7.14', nivelMadurez:3, control:'Eliminación segura o reutilización de los equipos',                                  resp: r(C,  P,  P,  P,  CO) },

  // ── 8.x Technical Controls ────────────────────────────────────────────────────
  { id:'8.1',  nivelMadurez:2, control:'Dispositivos finales del usuario',                                                   resp: r(C,  C,  C,  C,  CO) },
  { id:'8.2',  nivelMadurez:5, control:'Derechos de acceso privilegiados',                                                   resp: r(C,  CO, CO, CO, CO) },
  { id:'8.3',  nivelMadurez:4, control:'Restricción del acceso a la información',                                            resp: r(C,  CO, CO, CO, CO) },
  { id:'8.4',  nivelMadurez:5, control:'Acceso al código fuente',                                                            resp: r(C,  P,  P,  CO, CO) },
  { id:'8.5',  nivelMadurez:2, control:'Autenticación segura',                                                               resp: r(C,  CO, CO, CO, CO) },
  { id:'8.6',  nivelMadurez:5, control:'Gestión de la capacidad',                                                            resp: r(C,  P,  P,  CO, CO) },
  { id:'8.7',  nivelMadurez:5, control:'Protección contra el malware',                                                       resp: r(C,  CO, CO, CO, CO) },
  { id:'8.8',  nivelMadurez:4, control:'Gestión de las vulnerabilidades técnicas',                                           resp: r(C,  CO, CO, CO, CO) },
  { id:'8.9',  nivelMadurez:5, control:'Gestión de la configuración',                                                        resp: r(C,  CO, CO, CO, CO) },
  { id:'8.10', nivelMadurez:4, control:'Borrado de información',                                                             resp: r(C,  CO, CO, CO, CO) },
  { id:'8.11', nivelMadurez:3, control:'Enmascaramiento de datos',                                                           resp: r(C,  CO, CO, CO, CO) },
  { id:'8.12', nivelMadurez:4, control:'Prevención de fuga de datos',                                                        resp: r(C,  CO, CO, CO, CO) },
  { id:'8.13', nivelMadurez:4, control:'Copias de seguridad',                                                                resp: r(C,  P,  P,  CO, CO) },
  { id:'8.14', nivelMadurez:4, control:'Redundancia de las instalaciones de tratamiento de la información',                  resp: r(C,  P,  P,  P,  P)  },
  { id:'8.15', nivelMadurez:5, control:'Registros',                                                                          resp: r(C,  CO, CO, CO, CO) },
  { id:'8.16', nivelMadurez:5, control:'Actividades de supervisión',                                                         resp: r(C,  CO, CO, CO, CO) },
  { id:'8.17', nivelMadurez:5, control:'Sincronización del reloj',                                                           resp: r(C,  P,  P,  P,  P)  },
  { id:'8.18', nivelMadurez:5, control:'Uso de programas de utilidades privilegiados',                                       resp: r(C,  CO, CO, CO, CO) },
  { id:'8.19', nivelMadurez:4, control:'Instalación de software en sistemas operativos',                                     resp: r(C,  P,  P,  CO, CO) },
  { id:'8.20', nivelMadurez:5, control:'Controles de red',                                                                   resp: r(C,  P,  P,  CO, CO) },
  { id:'8.21', nivelMadurez:5, control:'Seguridad de los servicios de red',                                                  resp: r(C,  P,  P,  CO, CO) },
  { id:'8.22', nivelMadurez:5, control:'Segmentación de red',                                                                resp: r(C,  P,  P,  CO, CO) },
  { id:'8.23', nivelMadurez:5, control:'Filtrado web',                                                                       resp: r(C,  P,  P,  CO, CO) },
  { id:'8.24', nivelMadurez:5, control:'Uso de criptografía',                                                                resp: r(C,  CO, CO, CO, CO) },
  { id:'8.25', nivelMadurez:4, control:'Ciclo de vida del desarrollo seguro',                                                resp: r(NA, P,  P,  CO, CO) },
  { id:'8.26', nivelMadurez:4, control:'Requisitos de seguridad de las aplicaciones',                                        resp: r(C,  P,  P,  CO, CO) },
  { id:'8.27', nivelMadurez:3, control:'Arquitectura de sistemas seguros y principios de ingeniería',                        resp: r(C,  P,  P,  CO, CO) },
  { id:'8.28', nivelMadurez:4, control:'Código seguro',                                                                      resp: r(NA, P,  P,  CO, CO) },
  { id:'8.29', nivelMadurez:3, control:'Pruebas de seguridad en desarrollo y aceptación',                                    resp: r(NA, P,  P,  CO, CO) },
  { id:'8.30', nivelMadurez:5, control:'Desarrollo subcontratado',                                                           resp: r(NA, P,  P,  CO, CO) },
  { id:'8.31', nivelMadurez:3, control:'Separación de los entornos de desarrollo, prueba y producción',                     resp: r(C,  P,  P,  CO, CO) },
  { id:'8.32', nivelMadurez:3, control:'Gestión de cambios',                                                                 resp: r(C,  CO, CO, CO, CO) },
  { id:'8.33', nivelMadurez:3, control:'Información de prueba',                                                              resp: r(C,  CO, CO, CO, CO) },
  { id:'8.34', nivelMadurez:3, control:'Protección de los sistemas de información durante la auditoría y las pruebas',      resp: r(C,  CO, CO, CO, CO) },
];

export type DomainKey = '5' | '6' | '7' | '8';

export const DOMAIN_LABELS: Record<DomainKey, string> = {
  '5': 'Controles Organizativos (5.x)',
  '6': 'Controles de Personas (6.x)',
  '7': 'Controles Físicos (7.x)',
  '8': 'Controles Tecnológicos (8.x)',
};

export function getDomain(id: string): DomainKey {
  return id.split('.')[0] as DomainKey;
}
