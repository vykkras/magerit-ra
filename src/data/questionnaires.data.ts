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
  // Adquisición de IT de bajo impacto — cuestionario al proveedor de la solución.
  'low-impact-it': [
    { q: '¿La solución soporta autenticación mediante usuario y contraseña?', risks: ['A.5', 'A.11'], controls: ['Identificación y autenticación'], resp: 'proveedor' },
    { q: '¿La solución permite asignar diferentes perfiles de acceso?', risks: ['A.6'], controls: ['Control acceso'], resp: 'proveedor' },
    { q: '¿Las comunicaciones utilizan TLS?', risks: ['A.14'], controls: ['Protección comunicaciones'], resp: 'proveedor' },
    { q: '¿La información almacenada se encuentra protegida frente a accesos no autorizados?', risks: ['A.19'], controls: ['Protección información'], resp: 'proveedor' },
    { q: '¿La solución registra eventos relevantes de seguridad?', risks: ['A.11'], controls: ['Auditoría'], resp: 'proveedor' },
    { q: '¿Se aplican actualizaciones de seguridad periódicas?', risks: ['E.20'], controls: ['Gestión vulnerabilidades'], resp: 'ambos' },
    { q: '¿Existe protección frente a malware?', risks: ['A.8'], controls: ['Antimalware'], resp: 'proveedor' },
    { q: '¿Existe procedimiento de gestión de incidencias?', risks: ['E.1'], controls: ['Gestión incidencias'], resp: 'ambos' },
    { q: '¿Se realizan copias de seguridad?', risks: ['E.19'], controls: ['Backup'], resp: 'proveedor' },
    { q: '¿Existen mecanismos para recuperar información eliminada accidentalmente?', risks: ['E.19'], controls: ['Backup'], resp: 'proveedor' },
  ],

  // SaaS
  'saas': [
    { q: '¿La solución soporta MFA?', risks: ['A.5', 'A.11'], controls: ['Identificación y autenticación'], resp: 'proveedor' },
    { q: '¿Permite integración SSO?', risks: ['A.5'], controls: ['IAM'], resp: 'ambos' },
    { q: '¿Existe cifrado en reposo?', risks: ['A.19'], controls: ['Cifrado'], resp: 'proveedor' },
    { q: '¿Existe cifrado en tránsito?', risks: ['A.14'], controls: ['Protección comunicaciones'], resp: 'proveedor' },
    { q: '¿Los eventos son auditables?', risks: ['A.13'], controls: ['Auditoría'], resp: 'proveedor' },
    { q: '¿Existe segregación de funciones?', risks: ['A.6'], controls: ['Segregación tareas'], resp: 'ambos' },
    { q: '¿Existe monitorización de seguridad?', risks: ['A.11'], controls: ['Monitorización'], resp: 'proveedor' },
    { q: '¿Existe protección frente a DDoS?', risks: ['A.24'], controls: ['Protección servicios'], resp: 'proveedor' },
    { q: '¿Existe backup automatizado?', risks: ['E.19'], controls: ['Backup'], resp: 'proveedor' },
    { q: '¿Existe continuidad de negocio?', risks: ['I.8'], controls: ['Continuidad'], resp: 'proveedor' },
    { q: '¿Existe DRP?', risks: ['I.8'], controls: ['Recuperación desastres'], resp: 'proveedor' },
    { q: '¿Se gestionan vulnerabilidades?', risks: ['E.20'], controls: ['Gestión vulnerabilidades'], resp: 'proveedor' },
    { q: '¿Se realizan pruebas de seguridad?', risks: ['E.20'], controls: ['Análisis vulnerabilidades'], resp: 'proveedor' },
    { q: '¿Existe gestión formal de cambios?', risks: ['E.4'], controls: ['Gestión cambios'], resp: 'ambos' },
    { q: '¿Se notifican incidentes de seguridad?', risks: [], controls: ['Gestión incidencias'], resp: 'ambos' },
  ],

  // SaaS con IA
  'saas-ai': [
    { q: '¿Los datos enviados a la IA se utilizan para entrenar modelos?', risks: ['A.19'], controls: ['Protección información'], resp: 'proveedor' },
    { q: '¿Puede deshabilitarse dicho entrenamiento?', risks: ['A.19'], controls: ['Protección información'], resp: 'proveedor' },
    { q: '¿Existe aislamiento lógico entre clientes?', risks: ['A.11'], controls: ['Control acceso'], resp: 'proveedor' },
    { q: '¿Las conversaciones son auditables?', risks: ['A.13'], controls: ['Auditoría'], resp: 'proveedor' },
    { q: '¿Existe RBAC?', risks: ['A.6'], controls: ['Control acceso'], resp: 'ambos' },
    { q: '¿Existe cifrado en tránsito?', risks: ['A.14'], controls: ['Protección comunicaciones'], resp: 'proveedor' },
    { q: '¿Existe cifrado en reposo?', risks: ['A.19'], controls: ['Cifrado'], resp: 'proveedor' },
    { q: '¿Existen controles DLP?', risks: ['E.19'], controls: ['DLP'], resp: 'proveedor' },
    { q: '¿Se monitoriza uso indebido de la IA?', risks: ['A.30'], controls: ['Monitorización'], resp: 'proveedor' },
    { q: '¿Existe gestión de vulnerabilidades?', risks: ['E.20'], controls: ['Gestión vulnerabilidades'], resp: 'proveedor' },
    { q: '¿Existe trazabilidad de prompts y respuestas?', risks: ['A.13'], controls: ['Auditoría'], resp: 'proveedor' },
    { q: '¿Existe gestión de incidentes IA?', risks: ['E.1'], controls: ['Gestión incidencias'], resp: 'ambos' },
    { q: '¿Existe revisión humana de cambios significativos del modelo?', risks: ['E.15'], controls: ['Gestión cambios'], resp: 'ambos' },
    { q: '¿Existe continuidad del servicio?', risks: ['I.8'], controls: ['Continuidad'], resp: 'proveedor' },
    { q: '¿Existe recuperación ante desastres?', risks: ['I.8'], controls: ['DRP'], resp: 'proveedor' },
  ],

  // PaaS / IaaS
  'paas-iaas': [
    { q: '¿La plataforma soporta MFA?', risks: ['A.11'], controls: ['Autenticación'], resp: 'proveedor' },
    { q: '¿Existe segmentación de red?', risks: ['A.11'], controls: ['Seguridad red'], resp: 'ambos' },
    { q: '¿Existe cifrado en reposo?', risks: ['A.19'], controls: ['Cifrado'], resp: 'ambos' },
    { q: '¿Existe cifrado en tránsito?', risks: ['A.14'], controls: ['Comunicaciones'], resp: 'ambos' },
    { q: '¿Existe protección DDoS?', risks: ['A.24'], controls: ['Protección servicios'], resp: 'proveedor' },
    { q: '¿Existe monitorización continua?', risks: ['I.8'], controls: ['Monitorización'], resp: 'ambos' },
    { q: '¿Existe gestión vulnerabilidades?', risks: ['E.20'], controls: ['Gestión vulnerabilidades'], resp: 'ambos' },
    { q: '¿Existe análisis vulnerabilidades?', risks: ['E.20'], controls: ['Análisis vulnerabilidades'], resp: 'ambos' },
    { q: '¿Existe backup automatizado?', risks: ['E.19'], controls: ['Backup'], resp: 'ambos' },
    { q: '¿Existe redundancia eléctrica?', risks: ['I.6'], controls: ['Redundancia'], resp: 'proveedor' },
    { q: '¿Existe protección contra incendios?', risks: ['N.1'], controls: ['Protección instalaciones'], resp: 'proveedor' },
    { q: '¿Existe control ambiental?', risks: ['I.7'], controls: ['Climatización'], resp: 'proveedor' },
    { q: '¿Existe inventario de activos?', risks: ['E.25'], controls: ['Inventario'], resp: 'ambos' },
    { q: '¿Existe continuidad de negocio?', risks: ['I.5'], controls: ['Continuidad'], resp: 'proveedor' },
    { q: '¿Existe DRP probado periódicamente?', risks: ['N.1', 'I.5'], controls: ['Recuperación desastres'], resp: 'proveedor' },
  ],

  // IT Outsourcing
  'it-outsourcing': [
    { q: '¿El personal firma acuerdos de confidencialidad?', risks: ['A.19'], controls: ['Gestión personal'], resp: 'proveedor' },
    { q: '¿Existe control de accesos privilegiados?', risks: ['A.6'], controls: ['Control acceso'], resp: 'proveedor' },
    { q: '¿Existe segregación de funciones?', risks: ['A.6'], controls: ['Segregación tareas'], resp: 'proveedor' },
    { q: '¿Existe gestión formal de cambios?', risks: ['E.2'], controls: ['Gestión cambios'], resp: 'proveedor' },
    { q: '¿Las actividades privilegiadas son auditadas?', risks: ['A.6'], controls: ['Auditoría'], resp: 'proveedor' },
    { q: '¿Existe formación periódica en seguridad?', risks: ['A.30'], controls: ['Formación'], resp: 'ambos' },
    { q: '¿Existe procedimiento de gestión de incidencias?', risks: ['E.2'], controls: ['Gestión incidencias'], resp: 'proveedor' },
    { q: '¿Existe proceso de altas y bajas?', risks: ['A.11'], controls: ['Gestión identidades'], resp: 'ambos' },
    { q: '¿Existe revocación inmediata de accesos?', risks: ['A.11'], controls: ['Gestión identidades'], resp: 'proveedor' },
    { q: '¿Existe monitorización de actividades administrativas?', risks: ['A.6'], controls: ['Auditoría'], resp: 'proveedor' },
    { q: '¿Existe continuidad de negocio?', risks: ['E.7'], controls: ['Continuidad'], resp: 'proveedor' },
    { q: '¿Existe plan de contingencia de personal?', risks: ['E.28'], controls: ['Contingencia'], resp: 'proveedor' },
    { q: '¿Existe evaluación periódica de privilegios?', risks: ['A.6'], controls: ['Control acceso'], resp: 'ambos' },
    { q: '¿Existe inventario de activos gestionados?', risks: ['E.25'], controls: ['Inventario'], resp: 'proveedor' },
    { q: '¿Existe auditoría externa de seguridad?', risks: ['E.7'], controls: ['Auditoría'], resp: 'ambos' },
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
