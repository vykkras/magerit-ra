/**
 * Cuestionarios por categoría de solución — definición corporativa curada.
 *
 * Cada categoría tiene su propio cuestionario (pregunta cerrada Sí/No), con las
 * amenazas MAGERIT que cubre y los controles asociados. El usuario puede editar el
 * texto, las amenazas y los controles, y añadir preguntas (ver CategoriesPage).
 * La descarga es sólo Pregunta + Respuesta (Sí/No/N/A).
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

// ── Definición curada ────────────────────────────────────────────────────────
// risks: códigos de amenaza MAGERIT (vacío = riesgo transversal / no específico).
// controls: nombres de control asociados.

interface CuratedQuestion {
  q: string;
  risks: string[];
  controls: string[];
}

const CURATED: Record<string, CuratedQuestion[]> = {
  'saas': [
    { q: '¿La solución soporta MFA?', risks: ['A.5', 'A.6', 'A.11'], controls: ['Identificación y autenticación', 'Control de acceso lógico'] },
    { q: '¿Permite integración SSO?', risks: ['A.5', 'A.11'], controls: ['Identificación y autenticación'] },
    { q: '¿Registra trazas de auditoría?', risks: ['A.13', 'A.11'], controls: ['Registro y auditoría'] },
    { q: '¿La información se cifra en tránsito y reposo?', risks: ['A.14', 'A.19', 'E.19'], controls: ['Cifrado', 'Protección de comunicaciones'] },
    { q: '¿Existen copias de seguridad?', risks: ['E.18', 'I.5'], controls: ['Backup'] },
    { q: '¿Existe gestión de vulnerabilidades?', risks: ['E.20'], controls: ['Gestión de vulnerabilidades'] },
    { q: '¿Se realizan pruebas de seguridad?', risks: ['E.20', 'A.22'], controls: ['Análisis de vulnerabilidades'] },
    { q: '¿Existe segregación de funciones?', risks: ['A.6'], controls: ['Segregación de tareas'] },
    { q: '¿Existe plan de continuidad?', risks: ['I.8', 'I.9', 'A.24'], controls: ['Continuidad de negocio'] },
    { q: '¿Existe plan DRP?', risks: ['I.5', 'I.8', 'N.1'], controls: ['Recuperación ante desastres'] },
    { q: '¿Se monitorizan eventos de seguridad?', risks: ['A.11', 'A.24'], controls: ['IDS/IPS', 'Monitorización'] },
    { q: '¿Existe retención de datos configurable?', risks: ['E.18', 'A.19'], controls: ['Protección de la información'] },
    { q: '¿Se notifican incidentes?', risks: [], controls: ['Gestión de incidencias'] },
    { q: '¿Puede exportarse la información?', risks: ['E.18', 'A.19'], controls: ['Protección de la información'] },
    { q: '¿Dispone de certificaciones?', risks: [], controls: ['Gobierno y cumplimiento'] },
  ],

  'saas-ai': [
    { q: '¿Puede deshabilitarse el entrenamiento con datos del cliente?', risks: ['A.19', 'E.19'], controls: ['Protección de la información'] },
    { q: '¿Existe separación lógica entre clientes?', risks: ['A.11', 'A.19'], controls: ['Control de acceso'] },
    { q: '¿Los prompts se cifran en tránsito?', risks: ['A.14'], controls: ['Protección de comunicaciones'] },
    { q: '¿Los datos almacenados se cifran?', risks: ['A.19'], controls: ['Cifrado'] },
    { q: '¿Existen controles anti fuga de datos?', risks: ['E.19'], controls: ['DLP'] },
    { q: '¿Se registran las interacciones con IA?', risks: ['A.13'], controls: ['Registro y auditoría'] },
    { q: '¿Puede auditarse el uso de la IA?', risks: ['A.13', 'A.11'], controls: ['Auditoría'] },
    { q: '¿Existe evaluación de riesgos IA?', risks: [], controls: ['Gestión de riesgos'] },
    { q: '¿Existe control de acceso RBAC?', risks: ['A.11', 'A.6'], controls: ['Control de acceso'] },
    { q: '¿Se restringen tipos de datos enviados?', risks: ['A.19'], controls: ['Protección información'] },
    { q: '¿Existe detección de uso indebido?', risks: ['A.30'], controls: ['Monitorización'] },
    { q: '¿Existe transparencia sobre entrenamiento?', risks: [], controls: ['Gobierno IA'] },
    { q: '¿Hay mitigación de alucinaciones?', risks: ['E.1'], controls: ['Control de calidad IA'] },
    { q: '¿Existe supervisión humana?', risks: ['E.1', 'E.2'], controls: ['Gobierno IA'] },
    { q: '¿Existe gestión de incidentes IA?', risks: [], controls: ['Gestión de incidencias'] },
  ],

  'paas-iaas': [
    { q: '¿MFA para administradores?', risks: ['A.5', 'A.6', 'A.11'], controls: ['Autenticación'] },
    { q: '¿Existe separación de entornos?', risks: ['E.21'], controls: ['Gestión de cambios'] },
    { q: '¿Se generan logs detallados?', risks: ['A.13'], controls: ['Auditoría'] },
    { q: '¿Se monitorizan accesos privilegiados?', risks: ['A.6'], controls: ['Auditoría'] },
    { q: '¿Existe cifrado en tránsito?', risks: ['A.14'], controls: ['Protección comunicaciones'] },
    { q: '¿Existe cifrado en reposo?', risks: ['A.19'], controls: ['Cifrado'] },
    { q: '¿Protección frente a DDoS?', risks: ['A.24'], controls: ['Protección servicios'] },
    { q: '¿Monitorización continua?', risks: ['A.24', 'I.8'], controls: ['Monitorización'] },
    { q: '¿Gestión de vulnerabilidades?', risks: ['E.20'], controls: ['Vulnerability Management'] },
    { q: '¿Backup automatizado?', risks: ['E.18'], controls: ['Backup'] },
    { q: '¿Recuperación ante desastres?', risks: ['I.5', 'N.1'], controls: ['DRP'] },
    { q: '¿Segmentación de red?', risks: ['A.11'], controls: ['Control acceso red'] },
    { q: '¿Monitorización SIEM?', risks: ['A.11', 'A.24'], controls: ['SIEM'] },
    { q: '¿Protección APIs?', risks: ['A.22'], controls: ['Protección aplicaciones'] },
    { q: '¿Detección de configuraciones inseguras?', risks: ['E.4'], controls: ['Hardening'] },
  ],

  'it-outsourcing': [
    { q: '¿Existe política de seguridad?', risks: ['E.7'], controls: ['Gobierno'] },
    { q: '¿Existen acuerdos de confidencialidad?', risks: ['A.19'], controls: ['Gestión personal'] },
    { q: '¿Se gestionan altas y bajas?', risks: ['A.11'], controls: ['Gestión identidades'] },
    { q: '¿Se aplica mínimo privilegio?', risks: ['A.6'], controls: ['Control acceso'] },
    { q: '¿Se auditan accesos privilegiados?', risks: ['A.6'], controls: ['Auditoría'] },
    { q: '¿Existe gestión de incidencias?', risks: [], controls: ['Gestión incidencias'] },
    { q: '¿Existe formación en seguridad?', risks: ['A.30', 'E.1'], controls: ['Concienciación'] },
    { q: '¿Existe segregación de funciones?', risks: ['A.6'], controls: ['Segregación'] },
    { q: '¿Existe gestión de cambios?', risks: ['E.4', 'E.21'], controls: ['Gestión cambios'] },
    { q: '¿Existe inventario de activos?', risks: ['E.25'], controls: ['Inventario'] },
    { q: '¿Existe revocación inmediata de accesos?', risks: ['A.11'], controls: ['IAM'] },
    { q: '¿Existe continuidad de negocio?', risks: ['I.8', 'I.9'], controls: ['Continuidad'] },
    { q: '¿Existe DRP?', risks: ['N.1', 'I.5'], controls: ['DRP'] },
    { q: '¿Se monitorizan actividades privilegiadas?', risks: ['A.6'], controls: ['Auditoría'] },
    { q: '¿Existen auditorías externas?', risks: [], controls: ['Compliance'] },
  ],

  'low-impact-it': [
    { q: '¿Existe autenticación?', risks: ['A.11'], controls: ['Control acceso'] },
    { q: '¿Se pueden revocar accesos?', risks: ['A.11'], controls: ['IAM'] },
    { q: '¿Existen logs básicos?', risks: ['A.13'], controls: ['Auditoría'] },
    { q: '¿Existe gestión de incidencias?', risks: [], controls: ['Gestión incidencias'] },
    { q: '¿Se protege la integridad de los datos?', risks: ['E.15'], controls: ['Integridad'] },
    { q: '¿Existen copias de seguridad?', risks: ['E.18'], controls: ['Backup'] },
    { q: '¿Se aplican parches?', risks: ['E.20'], controls: ['Vulnerabilidades'] },
    { q: '¿Se usa cifrado en comunicaciones?', risks: ['A.14'], controls: ['Comunicaciones'] },
    { q: '¿Existe protección antimalware?', risks: ['A.8'], controls: ['Antimalware'] },
    { q: '¿Se identifican usuarios individualmente?', risks: ['A.11'], controls: ['IAM'] },
    { q: '¿Existen controles administrativos?', risks: ['A.6'], controls: ['Control acceso'] },
    { q: '¿Existe gestión de cambios?', risks: ['E.4'], controls: ['Gestión cambios'] },
    { q: '¿Puede recuperarse información eliminada?', risks: ['E.18'], controls: ['Backup'] },
    { q: '¿Existe monitorización de disponibilidad?', risks: ['I.8'], controls: ['Disponibilidad'] },
    { q: '¿Existe contacto de seguridad?', risks: [], controls: ['Gestión incidencias'] },
  ],
};

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
      responsibility: 'ambos',
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
