/**
 * Mapeo general Riesgo ↔ Control — 17 grupos temáticos (definición corporativa).
 *
 * Cada grupo agrupa varias amenazas MAGERIT v3 relacionadas y los controles que las
 * mitigan. Es el mapeo de referencia de la herramienta; el usuario puede añadir o
 * quitar controles por grupo (persistido en riskControlStore).
 */

export interface RiskControlGroup {
  id: string;
  title: string;
  /** Códigos de amenaza MAGERIT (catálogo riesgos). */
  riskCodes: string[];
  /** Controles que mitigan las amenazas del grupo (por nombre). */
  controls: string[];
}

export const RISK_CONTROL_GROUPS: RiskControlGroup[] = [
  {
    id: 'acceso-identidad',
    title: 'Control de acceso e identidad',
    riskCodes: ['A.5', 'A.6', 'A.11'],
    controls: [
      'Identificación y autenticación',
      'Control de acceso lógico',
      'Segregación de tareas',
      'Registro y auditoría',
      'IDS/IPS',
      'Protección del directorio',
      'Gestión de vulnerabilidades',
      'Herramienta de análisis de logs',
    ],
  },
  {
    id: 'confidencialidad',
    title: 'Confidencialidad de la información',
    riskCodes: ['A.12', 'A.14', 'A.19', 'E.19'],
    controls: [
      'Cifrado de la información',
      'Protección de las comunicaciones',
      'DLP',
      'Herramienta de monitorización de tráfico',
      'Registro y auditoría',
      'Protección de soportes',
      'Protección del correo electrónico',
    ],
  },
  {
    id: 'integridad',
    title: 'Integridad de la información',
    riskCodes: ['A.10', 'E.10', 'A.15', 'E.15', 'A.13'],
    controls: [
      'Aseguramiento de la integridad',
      'Uso de firmas electrónicas',
      'Time Stamping',
      'Registro y auditoría',
      'Gestión de cambios',
      'Protección de la información',
    ],
  },
  {
    id: 'disponibilidad-continuidad',
    title: 'Disponibilidad y continuidad',
    riskCodes: ['A.24', 'E.24', 'I.8', 'I.9'],
    controls: [
      'Protección de los servicios',
      'Aseguramiento de la disponibilidad',
      'Herramienta de monitorización de tráfico',
      'IDS/IPS',
      'Continuidad de negocio',
      'Copias de seguridad',
      'Gestión de incidencias',
    ],
  },
  {
    id: 'software-malicioso',
    title: 'Software malicioso',
    riskCodes: ['E.8', 'A.8'],
    controls: [
      'Herramienta contra código dañino',
      'IDS/IPS',
      'Gestión de vulnerabilidades',
      'Protección de aplicaciones',
      'Herramientas de seguridad',
      'Formación y concienciación',
    ],
  },
  {
    id: 'vulnerabilidades-software',
    title: 'Vulnerabilidades y software',
    riskCodes: ['E.20', 'E.21', 'A.22'],
    controls: [
      'Gestión de cambios',
      'Protección de aplicaciones informáticas',
      'Análisis de vulnerabilidades',
      'Gestión de vulnerabilidades',
      'Puesta en producción',
      'Verificación de funciones de seguridad',
      'Copias de seguridad',
    ],
  },
  {
    id: 'configuracion-logs',
    title: 'Configuración y logs',
    riskCodes: ['E.3', 'E.4', 'A.3', 'A.4'],
    controls: [
      'Registro y auditoría',
      'Herramienta de análisis de logs',
      'Herramienta de chequeo de configuración',
      'Gestión de cambios',
      'Verificación de funciones de seguridad',
      'Segregación de tareas',
    ],
  },
  {
    id: 'comunicaciones',
    title: 'Comunicaciones',
    riskCodes: ['E.9', 'A.9'],
    controls: [
      'Protección de comunicaciones',
      'Gestión de cambios',
      'Monitorización de tráfico',
      'IDS/IPS',
      'Registro y auditoría',
    ],
  },
  {
    id: 'errores-operacionales',
    title: 'Errores operacionales',
    riskCodes: ['E.1', 'E.2'],
    controls: [
      'Formación y concienciación',
      'Segregación de tareas',
      'Gestión de incidencias',
      'Gestión de cambios',
      'Registro y auditoría',
    ],
  },
  {
    id: 'organizacion-personal',
    title: 'Organización y personal',
    riskCodes: ['E.7', 'E.28', 'A.28'],
    controls: [
      'Gestión del personal',
      'Continuidad del negocio',
      'Planes de contingencia',
      'Segregación de tareas',
      'Formación',
    ],
  },
  {
    id: 'ingenieria-social',
    title: 'Ingeniería social y fraude',
    riskCodes: ['A.29', 'A.30'],
    controls: [
      'Formación y concienciación',
      'Gestión de incidencias',
      'Identificación y autenticación',
      'Control de acceso lógico',
      'Registro y auditoría',
    ],
  },
  {
    id: 'soportes',
    title: 'Soportes de información',
    riskCodes: ['I.10', 'A.18', 'E.18'],
    controls: [
      'Protección de soportes',
      'Copias de seguridad',
      'Cifrado',
      'Gestión de incidencias',
      'Aseguramiento de la integridad',
    ],
  },
  {
    id: 'hardware',
    title: 'Hardware',
    riskCodes: ['E.23', 'E.25', 'A.23'],
    controls: [
      'Protección de equipos informáticos',
      'Inventario de activos',
      'Gestión de cambios',
      'Protección física',
      'Registro y auditoría',
    ],
  },
  {
    id: 'robo-sabotaje',
    title: 'Robo y sabotaje',
    riskCodes: ['A.25', 'A.26', 'A.27'],
    controls: [
      'Control de acceso físico',
      'Protección de instalaciones',
      'Videovigilancia',
      'Continuidad de negocio',
      'Gestión de incidencias',
      'Copias de seguridad',
    ],
  },
  {
    id: 'incendio-desastres',
    title: 'Incendio y desastres',
    riskCodes: ['N.1', 'I.1', 'N.2', 'I.2', 'N.*', 'I.*'],
    controls: [
      'Protección de instalaciones',
      'Sistemas antiincendios',
      'Continuidad de negocio',
      'Copias de seguridad',
      'Recuperación ante desastres',
      'Redundancia',
    ],
  },
  {
    id: 'entorno-fisico',
    title: 'Entorno físico',
    riskCodes: ['I.3', 'I.4', 'I.6', 'I.7', 'I.11'],
    controls: [
      'Protección de instalaciones',
      'Suministro eléctrico redundante',
      'SAI/UPS',
      'Climatización',
      'Protección electromagnética',
      'Monitorización ambiental',
    ],
  },
  {
    id: 'averias',
    title: 'Averías',
    riskCodes: ['I.5'],
    controls: [
      'Protección de equipos',
      'Gestión de incidencias',
      'Gestión de cambios',
      'Copias de seguridad',
      'Continuidad de negocio',
    ],
  },
];
