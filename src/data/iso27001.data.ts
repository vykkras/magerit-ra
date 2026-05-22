/**
 * Catálogo de controles ISO/IEC 27001:2022.
 * Basado en el mapeo ENS ↔ ISO 27001 del documento de trabajo interno.
 * 12 categorías · 59 controles agrupados.
 */

export type ISO27001Category =
  | 'Gobierno y Organización'
  | 'Clasificación y Protección de la Información'
  | 'Gestión de Accesos e Identidades'
  | 'Proveedores y Servicios Externos'
  | 'Gestión de Incidentes y Continuidad'
  | 'Cumplimiento y Obligaciones'
  | 'Personal y Recursos Humanos'
  | 'Seguridad Física y del Entorno'
  | 'Operación, Hardening y Redes'
  | 'Monitorización y Registro'
  | 'Seguridad Técnica y Red'
  | 'Desarrollo Seguro';

export const ISO27001_CATEGORIES: ISO27001Category[] = [
  'Gobierno y Organización',
  'Clasificación y Protección de la Información',
  'Gestión de Accesos e Identidades',
  'Proveedores y Servicios Externos',
  'Gestión de Incidentes y Continuidad',
  'Cumplimiento y Obligaciones',
  'Personal y Recursos Humanos',
  'Seguridad Física y del Entorno',
  'Operación, Hardening y Redes',
  'Monitorización y Registro',
  'Seguridad Técnica y Red',
  'Desarrollo Seguro',
];

export const CATEGORY_ABBREV: Record<ISO27001Category, string> = {
  'Gobierno y Organización':                     'GOB',
  'Clasificación y Protección de la Información': 'CPI',
  'Gestión de Accesos e Identidades':             'IAM',
  'Proveedores y Servicios Externos':             'PSE',
  'Gestión de Incidentes y Continuidad':          'GIC',
  'Cumplimiento y Obligaciones':                  'CUM',
  'Personal y Recursos Humanos':                  'RHH',
  'Seguridad Física y del Entorno':               'FIS',
  'Operación, Hardening y Redes':                 'OHR',
  'Monitorización y Registro':                    'MON',
  'Seguridad Técnica y Red':                      'TEC',
  'Desarrollo Seguro':                            'DEV',
};

export interface ISO27001Control {
  id: string;
  category: ISO27001Category;
  name: string;
  description: string;
  isoIds: string[];
}

export const ISO27001_CONTROLS: ISO27001Control[] = [
  // ── Gobierno y Organización ─────────────────────────────────────────────────
  { id: 'iso-5.1',  category: 'Gobierno y Organización', name: 'Política de seguridad de la información',       isoIds: ['5.1'],                    description: 'Establecer y mantener la política de seguridad de la información.' },
  { id: 'iso-5.2',  category: 'Gobierno y Organización', name: 'Roles y responsabilidades de seguridad',        isoIds: ['5.2', '5.3', '5.4'],      description: 'Asignar roles, responsabilidades y cumplimiento de seguridad.' },
  { id: 'iso-5.5',  category: 'Gobierno y Organización', name: 'Contacto con autoridades y grupos especializados', isoIds: ['5.5', '5.6'],           description: 'Mantener contacto con autoridades y grupos especializados de seguridad.' },
  { id: 'iso-5.7',  category: 'Gobierno y Organización', name: 'Inteligencia de amenazas',                      isoIds: ['5.7'],                    description: 'Gestionar inteligencia de amenazas y riesgos emergentes.' },
  { id: 'iso-5.8',  category: 'Gobierno y Organización', name: 'Seguridad en gestión de proyectos',             isoIds: ['5.8'],                    description: 'Integrar la seguridad en la gestión de proyectos.' },
  { id: 'iso-5.9',  category: 'Gobierno y Organización', name: 'Inventario y gestión de activos',               isoIds: ['5.9', '5.10', '5.11'],    description: 'Gestionar inventario, uso aceptable y devolución de activos de información.' },

  // ── Clasificación y Protección de la Información ────────────────────────────
  { id: 'iso-5.12', category: 'Clasificación y Protección de la Información', name: 'Clasificación y etiquetado de información',    isoIds: ['5.12', '5.13'], description: 'Clasificar, etiquetar y proteger la información según su sensibilidad.' },
  { id: 'iso-5.14', category: 'Clasificación y Protección de la Información', name: 'Transferencia segura de información',          isoIds: ['5.14'],         description: 'Transferir información de forma segura entre partes.' },

  // ── Gestión de Accesos e Identidades ────────────────────────────────────────
  { id: 'iso-5.15', category: 'Gestión de Accesos e Identidades', name: 'Control de acceso físico y lógico',         isoIds: ['5.15', '8.3'],        description: 'Definir y aplicar políticas de control de acceso físico y lógico.' },
  { id: 'iso-5.16', category: 'Gestión de Accesos e Identidades', name: 'Gestión de identidades y autenticación',    isoIds: ['5.16', '5.17', '8.5'], description: 'Gestionar identidades de usuario y garantizar autenticación segura.' },
  { id: 'iso-5.18', category: 'Gestión de Accesos e Identidades', name: 'Derechos de acceso y privilegios',          isoIds: ['5.18', '8.2'],        description: 'Gestionar derechos de acceso, incluidos los privilegiados.' },
  { id: 'iso-8.4',  category: 'Gestión de Accesos e Identidades', name: 'Control de acceso a código fuente y entornos', isoIds: ['8.4'],             description: 'Controlar el acceso a código fuente y entornos de desarrollo.' },

  // ── Proveedores y Servicios Externos ────────────────────────────────────────
  { id: 'iso-5.19', category: 'Proveedores y Servicios Externos', name: 'Seguridad en proveedores y terceros',      isoIds: ['5.19', '5.20', '5.21'], description: 'Gestionar riesgos de seguridad de proveedores y terceros.' },
  { id: 'iso-5.22', category: 'Proveedores y Servicios Externos', name: 'Supervisión de servicios externos',        isoIds: ['5.22'],                 description: 'Supervisar la seguridad y los cambios en servicios gestionados externamente.' },
  { id: 'iso-5.23', category: 'Proveedores y Servicios Externos', name: 'Seguridad en servicios en la nube',        isoIds: ['5.23'],                 description: 'Gestionar la seguridad en la adquisición, uso y salida de servicios cloud.' },

  // ── Gestión de Incidentes y Continuidad ─────────────────────────────────────
  { id: 'iso-5.24', category: 'Gestión de Incidentes y Continuidad', name: 'Gestión de incidentes de seguridad',     isoIds: ['5.24', '5.25', '5.26'], description: 'Preparar, evaluar y responder a incidentes de seguridad de la información.' },
  { id: 'iso-5.27', category: 'Gestión de Incidentes y Continuidad', name: 'Aprendizaje y evidencias de incidentes', isoIds: ['5.27', '5.28'],         description: 'Aprender de los incidentes y gestionar correctamente las evidencias.' },
  { id: 'iso-5.29', category: 'Gestión de Incidentes y Continuidad', name: 'Continuidad de la seguridad y TIC',      isoIds: ['5.29', '5.30'],         description: 'Mantener la seguridad de la información durante interrupciones y garantizar la continuidad TIC.' },

  // ── Cumplimiento y Obligaciones ──────────────────────────────────────────────
  { id: 'iso-5.31', category: 'Cumplimiento y Obligaciones', name: 'Cumplimiento legal, regulatorio y contractual', isoIds: ['5.31', '5.34'], description: 'Identificar y cumplir los requisitos legales, regulatorios y contractuales aplicables.' },
  { id: 'iso-5.32', category: 'Cumplimiento y Obligaciones', name: 'Protección de DPI y registros',                isoIds: ['5.32', '5.33'], description: 'Proteger los derechos de propiedad intelectual y los registros de información.' },
  { id: 'iso-5.35', category: 'Cumplimiento y Obligaciones', name: 'Revisiones independientes y verificación',      isoIds: ['5.35', '5.36'], description: 'Realizar revisiones independientes de seguridad y verificar el cumplimiento.' },
  { id: 'iso-5.37', category: 'Cumplimiento y Obligaciones', name: 'Documentación de procedimientos operativos',    isoIds: ['5.37'],         description: 'Documentar los procedimientos operativos de seguridad y asegurar su disponibilidad.' },

  // ── Personal y Recursos Humanos ─────────────────────────────────────────────
  { id: 'iso-6.1',  category: 'Personal y Recursos Humanos', name: 'Gestión del ciclo de vida del personal',       isoIds: ['6.1', '6.2', '6.3', '6.4'], description: 'Gestionar antecedentes, contratos, formación y disciplina del personal.' },
  { id: 'iso-6.5',  category: 'Personal y Recursos Humanos', name: 'Obligaciones post-cese y confidencialidad',    isoIds: ['6.5', '6.6'],               description: 'Mantener las obligaciones de seguridad tras el cese y los acuerdos de confidencialidad.' },
  { id: 'iso-6.7',  category: 'Personal y Recursos Humanos', name: 'Teletrabajo y reporte de incidentes',          isoIds: ['6.7', '6.8'],               description: 'Proteger la seguridad en entornos de teletrabajo y facilitar el reporte de incidentes.' },

  // ── Seguridad Física y del Entorno ──────────────────────────────────────────
  { id: 'iso-7.1',  category: 'Seguridad Física y del Entorno', name: 'Perímetros y control de acceso físico',              isoIds: ['7.1', '7.2'],  description: 'Definir perímetros de seguridad física y controlar el acceso a instalaciones.' },
  { id: 'iso-7.3',  category: 'Seguridad Física y del Entorno', name: 'Seguridad de instalaciones y vigilancia',             isoIds: ['7.3', '7.4'],  description: 'Asegurar oficinas e instalaciones y mantener vigilancia física adecuada.' },
  { id: 'iso-7.5',  category: 'Seguridad Física y del Entorno', name: 'Protección frente a amenazas físicas y ambientales',  isoIds: ['7.5'],         description: 'Proteger frente a amenazas físicas y ambientales (incendio, inundación, etc.).' },
  { id: 'iso-7.6',  category: 'Seguridad Física y del Entorno', name: 'Áreas seguras y escritorio limpio',                   isoIds: ['7.6', '7.7'],  description: 'Aplicar políticas de áreas seguras y normas de escritorio y pantalla limpia.' },
  { id: 'iso-7.8',  category: 'Seguridad Física y del Entorno', name: 'Ubicación y mantenimiento de equipos',                isoIds: ['7.8', '7.13'], description: 'Ubicar, proteger y mantener correctamente los equipos.' },
  { id: 'iso-7.9',  category: 'Seguridad Física y del Entorno', name: 'Activos fuera de instalaciones y gestión de medios',  isoIds: ['7.9', '7.10'], description: 'Proteger activos fuera de las instalaciones y gestionar los medios de almacenamiento.' },
  { id: 'iso-7.11', category: 'Seguridad Física y del Entorno', name: 'Servicios de apoyo y cableado',                       isoIds: ['7.11', '7.12'], description: 'Proteger los servicios de apoyo (electricidad, climatización) y el cableado.' },
  { id: 'iso-7.14', category: 'Seguridad Física y del Entorno', name: 'Eliminación y reutilización segura de equipos',       isoIds: ['7.14'],        description: 'Eliminar o reutilizar equipos de forma segura garantizando el borrado de datos.' },

  // ── Operación, Hardening y Redes ────────────────────────────────────────────
  { id: 'iso-8.1',  category: 'Operación, Hardening y Redes', name: 'Protección de dispositivos de usuario final',    isoIds: ['8.1'],         description: 'Proteger los dispositivos finales del usuario frente a amenazas.' },
  { id: 'iso-8.6',  category: 'Operación, Hardening y Redes', name: 'Monitorización de capacidad y rendimiento',      isoIds: ['8.6'],         description: 'Monitorizar la capacidad y el rendimiento de los sistemas de información.' },
  { id: 'iso-8.7',  category: 'Operación, Hardening y Redes', name: 'Protección antimalware',                         isoIds: ['8.7'],         description: 'Implementar protección contra software malicioso (antimalware).' },
  { id: 'iso-8.8',  category: 'Operación, Hardening y Redes', name: 'Gestión de vulnerabilidades técnicas',           isoIds: ['8.8'],         description: 'Identificar, evaluar y remediar vulnerabilidades técnicas.' },
  { id: 'iso-8.9',  category: 'Operación, Hardening y Redes', name: 'Configuración segura y gestión de cambios',      isoIds: ['8.9', '8.32'], description: 'Establecer configuraciones seguras y gestionar los cambios de forma controlada.' },
  { id: 'iso-8.10', category: 'Operación, Hardening y Redes', name: 'Eliminación segura de información',              isoIds: ['8.10'],        description: 'Borrar información de forma segura cuando ya no sea necesaria.' },
  { id: 'iso-8.11', category: 'Operación, Hardening y Redes', name: 'Enmascaramiento y prevención de fugas de datos', isoIds: ['8.11', '8.12'], description: 'Aplicar enmascaramiento de datos y medidas de prevención de fugas (DLP).' },
  { id: 'iso-8.13', category: 'Operación, Hardening y Redes', name: 'Copias de seguridad',                            isoIds: ['8.13'],        description: 'Implementar y verificar procedimientos de copia de seguridad de la información.' },
  { id: 'iso-8.14', category: 'Operación, Hardening y Redes', name: 'Redundancia y alta disponibilidad',              isoIds: ['8.14'],        description: 'Asegurar la redundancia de sistemas e infraestructura según los niveles de disponibilidad requeridos.' },

  // ── Monitorización y Registro ────────────────────────────────────────────────
  { id: 'iso-8.15', category: 'Monitorización y Registro', name: 'Gestión de registros de auditoría',    isoIds: ['8.15'], description: 'Generar, proteger y analizar registros (logs) de actividad y eventos de seguridad.' },
  { id: 'iso-8.16', category: 'Monitorización y Registro', name: 'Monitorización de redes y sistemas',  isoIds: ['8.16'], description: 'Monitorizar continuamente redes, sistemas y aplicaciones para detectar anomalías.' },
  { id: 'iso-8.17', category: 'Monitorización y Registro', name: 'Sincronización de relojes',            isoIds: ['8.17'], description: 'Sincronizar los relojes de todos los sistemas de información.' },

  // ── Seguridad Técnica y Red ──────────────────────────────────────────────────
  { id: 'iso-8.18', category: 'Seguridad Técnica y Red', name: 'Utilidades privilegiadas y control de software', isoIds: ['8.18', '8.19'], description: 'Controlar el uso de utilidades privilegiadas y el software instalado en sistemas.' },
  { id: 'iso-8.20', category: 'Seguridad Técnica y Red', name: 'Seguridad de redes y servicios de red',          isoIds: ['8.20', '8.21'], description: 'Proteger las redes y los servicios de red frente a accesos no autorizados.' },
  { id: 'iso-8.22', category: 'Seguridad Técnica y Red', name: 'Segmentación de red',                             isoIds: ['8.22'],         description: 'Segmentar la red según las necesidades de seguridad y de negocio.' },
  { id: 'iso-8.23', category: 'Seguridad Técnica y Red', name: 'Filtrado web y control de navegación',            isoIds: ['8.23'],         description: 'Implementar filtrado web y controlar la navegación de los usuarios.' },
  { id: 'iso-8.24', category: 'Seguridad Técnica y Red', name: 'Criptografía segura',                             isoIds: ['8.24'],         description: 'Usar criptografía de forma segura en comunicaciones y almacenamiento de datos.' },

  // ── Desarrollo Seguro ────────────────────────────────────────────────────────
  { id: 'iso-8.25', category: 'Desarrollo Seguro', name: 'Ciclo de vida de desarrollo seguro',          isoIds: ['8.25'],  description: 'Aplicar principios y reglas de desarrollo seguro en todo el ciclo de vida del software.' },
  { id: 'iso-8.26', category: 'Desarrollo Seguro', name: 'Requisitos de seguridad en aplicaciones',    isoIds: ['8.26'],  description: 'Definir y aplicar requisitos de seguridad en el desarrollo de aplicaciones.' },
  { id: 'iso-8.27', category: 'Desarrollo Seguro', name: 'Arquitectura e ingeniería segura',            isoIds: ['8.27'],  description: 'Aplicar principios de arquitectura e ingeniería segura en el diseño de sistemas.' },
  { id: 'iso-8.28', category: 'Desarrollo Seguro', name: 'Codificación segura',                         isoIds: ['8.28'],  description: 'Aplicar prácticas de codificación segura en el desarrollo de software.' },
  { id: 'iso-8.29', category: 'Desarrollo Seguro', name: 'Pruebas de seguridad en desarrollo',          isoIds: ['8.29'],  description: 'Realizar pruebas de seguridad durante el proceso de desarrollo del software.' },
  { id: 'iso-8.30', category: 'Desarrollo Seguro', name: 'Desarrollo subcontratado',                    isoIds: ['8.30'],  description: 'Gestionar la seguridad del desarrollo de software subcontratado a terceros.' },
  { id: 'iso-8.31', category: 'Desarrollo Seguro', name: 'Separación de entornos',                      isoIds: ['8.31'],  description: 'Separar los entornos de desarrollo, pruebas (QA) y producción.' },
  { id: 'iso-8.33', category: 'Desarrollo Seguro', name: 'Protección de información de pruebas',        isoIds: ['8.33'],  description: 'Seleccionar, proteger y gestionar la información utilizada en los entornos de prueba.' },
  { id: 'iso-8.34', category: 'Desarrollo Seguro', name: 'Seguridad en auditorías y pruebas',           isoIds: ['8.34'],  description: 'Proteger los sistemas de información durante actividades de auditoría y prueba.' },
];

export const CONTROLS_BY_ID: Record<string, ISO27001Control> =
  Object.fromEntries(ISO27001_CONTROLS.map(c => [c.id, c]));

export const STATUS_LABELS: Record<string, string> = {
  implemented:    'Implementado',
  partial:        'Parcial',
  planned:        'Planificado',
  not_applicable: 'No aplica',
  missing:        'No implementado',
};
