/**
 * Cuestionarios por categoría de solución — definición corporativa curada.
 *
 * Cada categoría tiene su propio cuestionario (pregunta cerrada Sí/No), con las
 * amenazas MAGERIT que cubre, los controles asociados y la responsabilidad
 * (cliente / proveedor / ambos). El usuario puede editar todo en CategoriesPage.
 * La descarga por categoría es sólo Pregunta + Respuesta (Sí/No/N/A).
 */

import type { ControlCatalogTipo, ControlDominio } from './controlesCatalog';

export type QuestionResponsibility = 'proveedor' | 'cliente' | 'ambos';
export type QuestionDomain = ControlDominio;

export interface Question {
  id: string;
  text: string;
  domain: QuestionDomain;
  riskRefs: string[];
  /** Controles asociados (nombre). */
  safeguardRefs: string[];
  responsibility: QuestionResponsibility;
  controlId: string;
  familia: string;
  tipo: ControlCatalogTipo;
  mitigaImpacto: boolean;
  mitigaProbabilidad: boolean;
}

export interface CategoryQuestionnaire {
  categoryId: string;
  questions: Question[];
}

export const DOMAIN_LABELS: Record<QuestionDomain, string> = {
  organizativo: 'Organizativo',
  personas:     'Personas',
  fisico:       'Físico',
  tecnologico:  'Tecnológico',
};

export const RESPONSIBILITY_LABELS: Record<QuestionResponsibility, string> = {
  proveedor: 'Proveedor',
  cliente:   'Cliente',
  ambos:     'Ambos',
};

// ── Definición curada ────────────────────────────────────────────────────────
// risks: códigos de amenaza MAGERIT (vacío = riesgo transversal / no específico).
// controls: nombres de control asociados.  resp: responsabilidad por defecto.

type Resp = QuestionResponsibility;

interface CuratedQuestion {
  q: string;
  risks: string[];
  controls: string[];
  resp: Resp;
}

const CURATED: Record<string, CuratedQuestion[]> = {
  // SaaS — el proveedor opera la plataforma; el cliente gobierna datos/uso.
  'saas': [
    { q: '¿La solución soporta MFA?', risks: ['A.5', 'A.6', 'A.11'], controls: ['Identificación y autenticación', 'Control de acceso lógico'], resp: 'proveedor' },
    { q: '¿Permite integración SSO?', risks: ['A.5', 'A.11'], controls: ['Identificación y autenticación'], resp: 'proveedor' },
    { q: '¿Registra trazas de auditoría?', risks: ['A.13', 'A.11'], controls: ['Registro y auditoría'], resp: 'proveedor' },
    { q: '¿La información se cifra en tránsito y reposo?', risks: ['A.14', 'A.19', 'E.19'], controls: ['Cifrado', 'Protección de comunicaciones'], resp: 'proveedor' },
    { q: '¿Existen copias de seguridad?', risks: ['E.18', 'I.5'], controls: ['Backup'], resp: 'proveedor' },
    { q: '¿Existe gestión de vulnerabilidades?', risks: ['E.20'], controls: ['Gestión de vulnerabilidades'], resp: 'proveedor' },
    { q: '¿Se realizan pruebas de seguridad?', risks: ['E.20', 'A.22'], controls: ['Análisis de vulnerabilidades'], resp: 'proveedor' },
    { q: '¿Existe segregación de funciones?', risks: ['A.6'], controls: ['Segregación de tareas'], resp: 'proveedor' },
    { q: '¿Existe plan de continuidad?', risks: ['I.8', 'I.9', 'A.24'], controls: ['Continuidad de negocio'], resp: 'proveedor' },
    { q: '¿Existe plan DRP?', risks: ['I.5', 'I.8', 'N.1'], controls: ['Recuperación ante desastres'], resp: 'proveedor' },
    { q: '¿Se monitorizan eventos de seguridad?', risks: ['A.11', 'A.24'], controls: ['IDS/IPS', 'Monitorización'], resp: 'proveedor' },
    { q: '¿Existe retención de datos configurable?', risks: ['E.18', 'A.19'], controls: ['Protección de la información'], resp: 'ambos' },
    { q: '¿Se notifican incidentes?', risks: [], controls: ['Gestión de incidencias'], resp: 'proveedor' },
    { q: '¿Puede exportarse la información?', risks: ['E.18', 'A.19'], controls: ['Protección de la información'], resp: 'ambos' },
    { q: '¿Dispone de certificaciones?', risks: [], controls: ['Gobierno y cumplimiento'], resp: 'proveedor' },
  ],

  // SaaS con IA — proveedor opera la pila IA; cliente gobierna riesgos/uso de IA.
  'saas-ai': [
    { q: '¿Puede deshabilitarse el entrenamiento con datos del cliente?', risks: ['A.19', 'E.19'], controls: ['Protección de la información'], resp: 'proveedor' },
    { q: '¿Existe separación lógica entre clientes?', risks: ['A.11', 'A.19'], controls: ['Control de acceso'], resp: 'proveedor' },
    { q: '¿Los prompts se cifran en tránsito?', risks: ['A.14'], controls: ['Protección de comunicaciones'], resp: 'proveedor' },
    { q: '¿Los datos almacenados se cifran?', risks: ['A.19'], controls: ['Cifrado'], resp: 'proveedor' },
    { q: '¿Existen controles anti fuga de datos?', risks: ['E.19'], controls: ['DLP'], resp: 'proveedor' },
    { q: '¿Se registran las interacciones con IA?', risks: ['A.13'], controls: ['Registro y auditoría'], resp: 'proveedor' },
    { q: '¿Puede auditarse el uso de la IA?', risks: ['A.13', 'A.11'], controls: ['Auditoría'], resp: 'ambos' },
    { q: '¿Existe evaluación de riesgos IA?', risks: [], controls: ['Gestión de riesgos'], resp: 'cliente' },
    { q: '¿Existe control de acceso RBAC?', risks: ['A.11', 'A.6'], controls: ['Control de acceso'], resp: 'ambos' },
    { q: '¿Se restringen tipos de datos enviados?', risks: ['A.19'], controls: ['Protección información'], resp: 'cliente' },
    { q: '¿Existe detección de uso indebido?', risks: ['A.30'], controls: ['Monitorización'], resp: 'proveedor' },
    { q: '¿Existe transparencia sobre entrenamiento?', risks: [], controls: ['Gobierno IA'], resp: 'proveedor' },
    { q: '¿Hay mitigación de alucinaciones?', risks: ['E.1'], controls: ['Control de calidad IA'], resp: 'proveedor' },
    { q: '¿Existe supervisión humana?', risks: ['E.1', 'E.2'], controls: ['Gobierno IA'], resp: 'cliente' },
    { q: '¿Existe gestión de incidentes IA?', risks: [], controls: ['Gestión de incidencias'], resp: 'proveedor' },
  ],

  // PaaS/IaaS — modelo compartido: proveedor plataforma/físico, cliente del SO arriba.
  'paas-iaas': [
    { q: '¿MFA para administradores?', risks: ['A.5', 'A.6', 'A.11'], controls: ['Autenticación'], resp: 'ambos' },
    { q: '¿Existe separación de entornos?', risks: ['E.21'], controls: ['Gestión de cambios'], resp: 'cliente' },
    { q: '¿Se generan logs detallados?', risks: ['A.13'], controls: ['Auditoría'], resp: 'ambos' },
    { q: '¿Se monitorizan accesos privilegiados?', risks: ['A.6'], controls: ['Auditoría'], resp: 'ambos' },
    { q: '¿Existe cifrado en tránsito?', risks: ['A.14'], controls: ['Protección comunicaciones'], resp: 'ambos' },
    { q: '¿Existe cifrado en reposo?', risks: ['A.19'], controls: ['Cifrado'], resp: 'ambos' },
    { q: '¿Protección frente a DDoS?', risks: ['A.24'], controls: ['Protección servicios'], resp: 'proveedor' },
    { q: '¿Monitorización continua?', risks: ['A.24', 'I.8'], controls: ['Monitorización'], resp: 'ambos' },
    { q: '¿Gestión de vulnerabilidades?', risks: ['E.20'], controls: ['Vulnerability Management'], resp: 'ambos' },
    { q: '¿Backup automatizado?', risks: ['E.18'], controls: ['Backup'], resp: 'cliente' },
    { q: '¿Recuperación ante desastres?', risks: ['I.5', 'N.1'], controls: ['DRP'], resp: 'ambos' },
    { q: '¿Segmentación de red?', risks: ['A.11'], controls: ['Control acceso red'], resp: 'cliente' },
    { q: '¿Monitorización SIEM?', risks: ['A.11', 'A.24'], controls: ['SIEM'], resp: 'cliente' },
    { q: '¿Protección APIs?', risks: ['A.22'], controls: ['Protección aplicaciones'], resp: 'cliente' },
    { q: '¿Detección de configuraciones inseguras?', risks: ['E.4'], controls: ['Hardening'], resp: 'cliente' },
  ],

  // IT Outsourcing — proveedor opera la TI; el cliente retiene gobierno.
  'it-outsourcing': [
    { q: '¿Existe política de seguridad?', risks: ['E.7'], controls: ['Gobierno'], resp: 'cliente' },
    { q: '¿Existen acuerdos de confidencialidad?', risks: ['A.19'], controls: ['Gestión personal'], resp: 'ambos' },
    { q: '¿Se gestionan altas y bajas?', risks: ['A.11'], controls: ['Gestión identidades'], resp: 'proveedor' },
    { q: '¿Se aplica mínimo privilegio?', risks: ['A.6'], controls: ['Control acceso'], resp: 'proveedor' },
    { q: '¿Se auditan accesos privilegiados?', risks: ['A.6'], controls: ['Auditoría'], resp: 'proveedor' },
    { q: '¿Existe gestión de incidencias?', risks: [], controls: ['Gestión incidencias'], resp: 'proveedor' },
    { q: '¿Existe formación en seguridad?', risks: ['A.30', 'E.1'], controls: ['Concienciación'], resp: 'ambos' },
    { q: '¿Existe segregación de funciones?', risks: ['A.6'], controls: ['Segregación'], resp: 'proveedor' },
    { q: '¿Existe gestión de cambios?', risks: ['E.4', 'E.21'], controls: ['Gestión cambios'], resp: 'proveedor' },
    { q: '¿Existe inventario de activos?', risks: ['E.25'], controls: ['Inventario'], resp: 'proveedor' },
    { q: '¿Existe revocación inmediata de accesos?', risks: ['A.11'], controls: ['IAM'], resp: 'proveedor' },
    { q: '¿Existe continuidad de negocio?', risks: ['I.8', 'I.9'], controls: ['Continuidad'], resp: 'ambos' },
    { q: '¿Existe DRP?', risks: ['N.1', 'I.5'], controls: ['DRP'], resp: 'proveedor' },
    { q: '¿Se monitorizan actividades privilegiadas?', risks: ['A.6'], controls: ['Auditoría'], resp: 'proveedor' },
    { q: '¿Existen auditorías externas?', risks: [], controls: ['Compliance'], resp: 'cliente' },
  ],

  // IT de bajo impacto — el cliente adquiere y opera el producto.
  'low-impact-it': [
    { q: '¿Existe autenticación?', risks: ['A.11'], controls: ['Control acceso'], resp: 'cliente' },
    { q: '¿Se pueden revocar accesos?', risks: ['A.11'], controls: ['IAM'], resp: 'cliente' },
    { q: '¿Existen logs básicos?', risks: ['A.13'], controls: ['Auditoría'], resp: 'cliente' },
    { q: '¿Existe gestión de incidencias?', risks: [], controls: ['Gestión incidencias'], resp: 'cliente' },
    { q: '¿Se protege la integridad de los datos?', risks: ['E.15'], controls: ['Integridad'], resp: 'cliente' },
    { q: '¿Existen copias de seguridad?', risks: ['E.18'], controls: ['Backup'], resp: 'cliente' },
    { q: '¿Se aplican parches?', risks: ['E.20'], controls: ['Vulnerabilidades'], resp: 'ambos' },
    { q: '¿Se usa cifrado en comunicaciones?', risks: ['A.14'], controls: ['Comunicaciones'], resp: 'proveedor' },
    { q: '¿Existe protección antimalware?', risks: ['A.8'], controls: ['Antimalware'], resp: 'cliente' },
    { q: '¿Se identifican usuarios individualmente?', risks: ['A.11'], controls: ['IAM'], resp: 'cliente' },
    { q: '¿Existen controles administrativos?', risks: ['A.6'], controls: ['Control acceso'], resp: 'cliente' },
    { q: '¿Existe gestión de cambios?', risks: ['E.4'], controls: ['Gestión cambios'], resp: 'cliente' },
    { q: '¿Puede recuperarse información eliminada?', risks: ['E.18'], controls: ['Backup'], resp: 'cliente' },
    { q: '¿Existe monitorización de disponibilidad?', risks: ['I.8'], controls: ['Disponibilidad'], resp: 'cliente' },
    { q: '¿Existe contacto de seguridad?', risks: [], controls: ['Gestión incidencias'], resp: 'ambos' },
  ],
};

/** Orden y nombres de las categorías de solución. */
export const CATEGORY_ORDER: { id: string; name: string }[] = [
  { id: 'low-impact-it',  name: 'Adquisición de IT de bajo impacto' },
  { id: 'saas',           name: 'SaaS' },
  { id: 'saas-ai',        name: 'SaaS con IA' },
  { id: 'paas-iaas',      name: 'PaaS / IaaS' },
  { id: 'it-outsourcing', name: 'IT Outsourcing' },
];

// ── Construcción de Question[] por categoría ────────────────────────────────
function buildQuestionnaires(): Record<string, Question[]> {
  const out: Record<string, Question[]> = {};
  for (const [catId, items] of Object.entries(CURATED)) {
    out[catId] = items.map((it, i) => ({
      id: `${catId}-q${i + 1}`,
      text: it.q,
      domain: 'tecnologico',
      riskRefs: it.risks,
      safeguardRefs: it.controls,
      responsibility: it.resp,
      controlId: '',
      familia: '',
      tipo: 'Preventivo',
      mitigaImpacto: false,
      mitigaProbabilidad: true,
    }));
  }
  return out;
}

export const CATEGORY_QUESTIONNAIRES: Record<string, Question[]> = buildQuestionnaires();
