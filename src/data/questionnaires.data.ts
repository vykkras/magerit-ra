export type QuestionResponsibility = 'proveedor' | 'cliente' | 'ambos';
export type QuestionDomain = 'organizativo' | 'personas' | 'fisico' | 'tecnologico';

export interface Question {
  id: string;
  text: string;
  domain: QuestionDomain;
  riskRefs: string[];
  safeguardRefs: string[];         // ISO 27001:2022 catalog IDs (iso-X.Y)
  responsibility: QuestionResponsibility;
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

export const CATEGORY_QUESTIONNAIRES: Record<string, Question[]> = {

  // ── Adquisición IT de Bajo Impacto ──────────────────────────────────────────
  'low-impact-it': [
    { id: 'li-01', domain: 'tecnologico',  text: '¿La solución incorpora autenticación segura, control de acceso basado en roles y gestión de privilegios administrativos?', riskRefs: ['A.5','A.6','A.11'],       safeguardRefs: ['iso-8.5','iso-5.15','iso-5.18'],       responsibility: 'ambos'     },
    { id: 'li-02', domain: 'tecnologico',  text: '¿La solución genera, protege y monitoriza registros de actividad y eventos de seguridad?',                                 riskRefs: ['A.13','E.3'],              safeguardRefs: ['iso-8.15','iso-8.16','iso-5.24'],       responsibility: 'proveedor' },
    { id: 'li-03', domain: 'tecnologico',  text: '¿La solución contempla configuraciones seguras, actualización de software y gestión de vulnerabilidades?',                  riskRefs: ['E.4','E.20','E.21'],       safeguardRefs: ['iso-8.8','iso-8.9','iso-8.32'],         responsibility: 'proveedor' },
    { id: 'li-04', domain: 'tecnologico',  text: '¿La solución protege la información mediante cifrado, control de accesos y eliminación segura de datos?',                  riskRefs: ['A.14','A.19','E.19'],      safeguardRefs: ['iso-8.24','iso-8.10','iso-8.12'],       responsibility: 'ambos'     },
    { id: 'li-05', domain: 'tecnologico',  text: '¿La solución dispone de mecanismos de backup, recuperación y continuidad operativa?',                                      riskRefs: ['E.18','I.5','I.8'],        safeguardRefs: ['iso-8.13','iso-8.14','iso-5.30'],       responsibility: 'proveedor' },
    { id: 'li-06', domain: 'organizativo', text: '¿Existen responsabilidades de seguridad claramente definidas entre cliente y proveedor?',                                  riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.2','iso-5.19'],                   responsibility: 'ambos'     },
    { id: 'li-07', domain: 'personas',     text: '¿El personal con acceso a la solución recibe formación y concienciación en seguridad?',                                    riskRefs: ['E.1','A.30'],              safeguardRefs: ['iso-6.3','iso-6.8'],                    responsibility: 'ambos'     },
    { id: 'li-08', domain: 'fisico',       text: '¿La infraestructura o equipos asociados poseen controles físicos y ambientales adecuados?',                                riskRefs: ['N.1','I.6','A.25'],        safeguardRefs: ['iso-7.1','iso-7.11'],                   responsibility: 'cliente'   },
    { id: 'li-09', domain: 'tecnologico',  text: '¿La solución protege frente a malware y actividades anómalas?',                                                            riskRefs: ['A.8','A.24'],              safeguardRefs: ['iso-8.7','iso-8.16'],                   responsibility: 'proveedor' },
    { id: 'li-10', domain: 'organizativo', text: '¿La solución contempla auditorías, revisiones periódicas y trazabilidad de acciones?',                                    riskRefs: ['A.13','E.20'],             safeguardRefs: ['iso-5.35','iso-5.36','iso-8.15'],       responsibility: 'ambos'     },
    { id: 'li-11', domain: 'tecnologico',  text: '¿La solución permite gestión segura del ciclo de vida de usuarios y accesos?',                                             riskRefs: ['A.11','A.6'],              safeguardRefs: ['iso-5.16','iso-5.18'],                  responsibility: 'ambos'     },
    { id: 'li-12', domain: 'organizativo', text: '¿La solución contempla gestión y notificación de incidentes de seguridad?',                                               riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.24','iso-5.25','iso-5.26'],       responsibility: 'ambos'     },
    { id: 'li-13', domain: 'tecnologico',  text: '¿La solución garantiza disponibilidad mínima y recuperación ante fallos?',                                                 riskRefs: ['I.5','I.8'],               safeguardRefs: ['iso-8.14','iso-5.30'],                  responsibility: 'proveedor' },
    { id: 'li-14', domain: 'tecnologico',  text: '¿La solución contempla protección de comunicaciones y servicios conectados?',                                              riskRefs: ['A.9','A.14'],              safeguardRefs: ['iso-8.20','iso-8.22'],                  responsibility: 'proveedor' },
    { id: 'li-15', domain: 'organizativo', text: '¿La solución permite exportación o recuperación de información al finalizar su uso?',                                     riskRefs: ['E.18'],                    safeguardRefs: ['iso-5.30','iso-8.13'],                  responsibility: 'proveedor' },
  ],

  // ── SaaS ────────────────────────────────────────────────────────────────────
  'saas': [
    { id: 'ss-01', domain: 'tecnologico',  text: '¿La solución incorpora autenticación segura, MFA y control de privilegios administrativos?',                               riskRefs: ['A.5','A.6','A.11'],       safeguardRefs: ['iso-8.5','iso-5.15','iso-5.18'],        responsibility: 'ambos'     },
    { id: 'ss-02', domain: 'tecnologico',  text: '¿La solución genera, protege y monitoriza logs y eventos de seguridad?',                                                   riskRefs: ['A.13','E.3'],              safeguardRefs: ['iso-8.15','iso-8.16','iso-5.24'],       responsibility: 'proveedor' },
    { id: 'ss-03', domain: 'tecnologico',  text: '¿La solución protege la información mediante cifrado y protección de comunicaciones?',                                     riskRefs: ['A.14','A.19'],             safeguardRefs: ['iso-8.24','iso-8.20'],                  responsibility: 'proveedor' },
    { id: 'ss-04', domain: 'tecnologico',  text: '¿La solución contempla segregación lógica entre clientes y entornos?',                                                    riskRefs: ['A.11'],                    safeguardRefs: ['iso-8.22','iso-5.15'],                  responsibility: 'proveedor' },
    { id: 'ss-05', domain: 'tecnologico',  text: '¿La solución contempla backup, recuperación y continuidad operativa?',                                                     riskRefs: ['E.18','I.5','I.8'],        safeguardRefs: ['iso-8.13','iso-8.14','iso-5.29','iso-5.30'], responsibility: 'proveedor' },
    { id: 'ss-06', domain: 'tecnologico',  text: '¿La solución incorpora gestión de vulnerabilidades y configuraciones seguras?',                                            riskRefs: ['E.4','E.20'],              safeguardRefs: ['iso-8.8','iso-8.9'],                    responsibility: 'proveedor' },
    { id: 'ss-07', domain: 'organizativo', text: '¿Existen responsabilidades de seguridad definidas entre cliente y proveedor?',                                             riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.2','iso-5.19'],                   responsibility: 'ambos'     },
    { id: 'ss-08', domain: 'personas',     text: '¿El personal con acceso al servicio recibe formación en seguridad?',                                                       riskRefs: ['E.1','A.30'],              safeguardRefs: ['iso-6.3','iso-6.8'],                    responsibility: 'ambos'     },
    { id: 'ss-09', domain: 'fisico',       text: '¿La infraestructura física del proveedor posee controles ambientales y de acceso adecuados?',                             riskRefs: ['N.1','I.6','A.25'],        safeguardRefs: ['iso-7.1','iso-7.11'],                   responsibility: 'proveedor' },
    { id: 'ss-10', domain: 'tecnologico',  text: '¿La solución protege frente a malware, accesos externos y actividad anómala?',                                            riskRefs: ['A.8','A.24'],              safeguardRefs: ['iso-8.7','iso-8.16','iso-8.20'],        responsibility: 'proveedor' },
    { id: 'ss-11', domain: 'organizativo', text: '¿La solución contempla gestión y notificación de incidentes de seguridad?',                                               riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.24','iso-5.25','iso-5.26'],       responsibility: 'proveedor' },
    { id: 'ss-12', domain: 'tecnologico',  text: '¿La solución contempla privacidad, protección y eliminación segura de datos?',                                            riskRefs: ['A.19','E.19'],             safeguardRefs: ['iso-5.34','iso-8.10','iso-8.12'],       responsibility: 'ambos'     },
    { id: 'ss-13', domain: 'organizativo', text: '¿La solución permite auditoría, revisiones y trazabilidad de acciones?',                                                  riskRefs: ['A.13'],                    safeguardRefs: ['iso-5.35','iso-5.36','iso-8.15'],       responsibility: 'ambos'     },
    { id: 'ss-14', domain: 'tecnologico',  text: '¿La solución permite gestión segura del ciclo de vida de accesos y usuarios?',                                            riskRefs: ['A.6','A.11'],              safeguardRefs: ['iso-5.16','iso-5.18'],                  responsibility: 'ambos'     },
    { id: 'ss-15', domain: 'tecnologico',  text: '¿La solución contempla controles sobre APIs o integraciones externas?',                                                   riskRefs: ['A.11','A.14'],             safeguardRefs: ['iso-5.19','iso-5.21','iso-8.20'],       responsibility: 'ambos'     },
  ],

  // ── SaaS con IA ─────────────────────────────────────────────────────────────
  'saas-ai': [
    { id: 'sa-01', domain: 'tecnologico',  text: '¿La solución incorpora autenticación robusta (MFA, políticas de contraseñas, SSO)?',                                      riskRefs: ['A.5','A.6'],               safeguardRefs: ['iso-5.15','iso-5.16','iso-5.18'],       responsibility: 'ambos'     },
    { id: 'sa-02', domain: 'tecnologico',  text: '¿Existe segregación lógica de datos entre clientes o usuarios?',                                                           riskRefs: ['A.11'],                    safeguardRefs: ['iso-8.22','iso-8.20'],                  responsibility: 'proveedor' },
    { id: 'sa-03', domain: 'tecnologico',  text: '¿La información se cifra durante el tránsito y almacenamiento?',                                                           riskRefs: ['A.14','A.19'],             safeguardRefs: ['iso-8.24'],                             responsibility: 'ambos'     },
    { id: 'sa-04', domain: 'tecnologico',  text: '¿Existen copias de seguridad verificadas y procedimientos de recuperación?',                                               riskRefs: ['E.18','I.8'],              safeguardRefs: ['iso-8.13','iso-5.30'],                  responsibility: 'proveedor' },
    { id: 'sa-05', domain: 'tecnologico',  text: '¿Se realiza gestión periódica de vulnerabilidades y actualizaciones de seguridad?',                                        riskRefs: ['E.20','A.22'],             safeguardRefs: ['iso-8.8','iso-8.9'],                    responsibility: 'proveedor' },
    { id: 'sa-06', domain: 'tecnologico',  text: '¿Se registran y monitorizan eventos relevantes de seguridad?',                                                             riskRefs: ['A.13','E.3'],              safeguardRefs: ['iso-8.15','iso-8.16'],                  responsibility: 'proveedor' },
    { id: 'sa-07', domain: 'organizativo', text: '¿Existe un procedimiento formal de gestión de incidentes?',                                                                riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.24'],                             responsibility: 'proveedor' },
    { id: 'sa-08', domain: 'organizativo', text: '¿Se han definido roles y responsabilidades de seguridad para usuarios y administradores?',                                 riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.2'],                              responsibility: 'ambos'     },
    { id: 'sa-09', domain: 'personas',     text: '¿Los usuarios reciben formación en ciberseguridad y protección de datos?',                                                 riskRefs: ['E.1','A.30'],              safeguardRefs: ['iso-6.3','iso-6.8'],                    responsibility: 'ambos'     },
    { id: 'sa-10', domain: 'organizativo', text: '¿La organización evalúa la seguridad de proveedores y terceros integrados?',                                               riskRefs: ['A.11','E.7'],              safeguardRefs: ['iso-5.19'],                             responsibility: 'ambos'     },
    { id: 'sa-11', domain: 'fisico',       text: '¿La infraestructura dispone de controles físicos adecuados?',                                                              riskRefs: ['N.1','I.6','A.25'],        safeguardRefs: ['iso-7.1','iso-7.11'],                   responsibility: 'proveedor' },
    { id: 'sa-12', domain: 'tecnologico',  text: '¿Existen procedimientos para la eliminación segura de información?',                                                       riskRefs: ['A.19','E.19'],             safeguardRefs: ['iso-8.10'],                             responsibility: 'ambos'     },
    { id: 'sa-13', domain: 'tecnologico',  text: '¿La solución permite trazabilidad y auditoría de acciones realizadas por usuarios y administradores?',                     riskRefs: ['A.13'],                    safeguardRefs: ['iso-8.15','iso-5.35'],                  responsibility: 'ambos'     },
    { id: 'sa-14', domain: 'tecnologico',  text: '¿La solución utiliza modelos de IA generativa o predictiva para procesar información?',                                    riskRefs: ['E.15','A.22'],             safeguardRefs: ['iso-5.23','iso-8.28'],                  responsibility: 'ambos'     },
    { id: 'sa-15', domain: 'tecnologico',  text: '¿Existen controles para evitar que datos sensibles sean enviados a modelos de IA no autorizados?',                         riskRefs: ['E.14','A.19'],             safeguardRefs: ['iso-5.34','iso-8.12','iso-8.24'],       responsibility: 'ambos'     },
    { id: 'sa-16', domain: 'tecnologico',  text: '¿Se conservan registros de prompts, respuestas y acciones realizadas por la IA cuando resulte aplicable?',                riskRefs: ['A.13','E.3'],              safeguardRefs: ['iso-8.15','iso-8.16'],                  responsibility: 'proveedor' },
    { id: 'sa-17', domain: 'organizativo', text: '¿Existe supervisión humana sobre decisiones relevantes generadas por la IA?',                                              riskRefs: ['E.15','E.7'],              safeguardRefs: ['iso-5.2'],                              responsibility: 'ambos'     },
  ],

  // ── PaaS / IaaS ─────────────────────────────────────────────────────────────
  'paas-iaas': [
    { id: 'pi-01', domain: 'tecnologico',  text: '¿La infraestructura incorpora autenticación segura y gestión de privilegios administrativos?',                             riskRefs: ['A.5','A.6'],               safeguardRefs: ['iso-8.5','iso-5.15','iso-5.18'],        responsibility: 'ambos'     },
    { id: 'pi-02', domain: 'tecnologico',  text: '¿La plataforma registra y monitoriza eventos y actividades de seguridad?',                                                 riskRefs: ['A.13','E.3'],              safeguardRefs: ['iso-8.15','iso-8.16'],                  responsibility: 'proveedor' },
    { id: 'pi-03', domain: 'tecnologico',  text: '¿La infraestructura protege comunicaciones, redes y segmentación de entornos?',                                           riskRefs: ['A.9','A.14'],              safeguardRefs: ['iso-8.20','iso-8.22','iso-8.24'],       responsibility: 'proveedor' },
    { id: 'pi-04', domain: 'tecnologico',  text: '¿La plataforma contempla backup, redundancia y recuperación ante desastre?',                                              riskRefs: ['E.18','I.5','N.1'],        safeguardRefs: ['iso-8.13','iso-8.14','iso-5.29','iso-5.30'], responsibility: 'proveedor' },
    { id: 'pi-05', domain: 'tecnologico',  text: '¿La infraestructura contempla gestión de vulnerabilidades y configuraciones seguras?',                                    riskRefs: ['E.4','E.20'],              safeguardRefs: ['iso-8.8','iso-8.9'],                    responsibility: 'ambos'     },
    { id: 'pi-06', domain: 'organizativo', text: '¿Existen responsabilidades de seguridad definidas entre proveedor y cliente?',                                            riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.2','iso-5.19'],                   responsibility: 'ambos'     },
    { id: 'pi-07', domain: 'personas',     text: '¿Los administradores y usuarios reciben formación de seguridad cloud?',                                                    riskRefs: ['E.1','A.30'],              safeguardRefs: ['iso-6.3','iso-6.8'],                    responsibility: 'ambos'     },
    { id: 'pi-08', domain: 'fisico',       text: '¿La infraestructura física posee controles de acceso y protección ambiental adecuados?',                                  riskRefs: ['N.1','I.6','A.25'],        safeguardRefs: ['iso-7.1','iso-7.11'],                   responsibility: 'proveedor' },
    { id: 'pi-09', domain: 'tecnologico',  text: '¿La solución protege frente a malware, accesos externos y ataques DoS/DDoS?',                                             riskRefs: ['A.8','A.24'],              safeguardRefs: ['iso-8.7','iso-8.16','iso-8.20'],        responsibility: 'proveedor' },
    { id: 'pi-10', domain: 'organizativo', text: '¿La plataforma contempla gestión y notificación de incidentes cloud?',                                                    riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.24','iso-5.25','iso-5.26'],       responsibility: 'proveedor' },
    { id: 'pi-11', domain: 'tecnologico',  text: '¿La infraestructura contempla privacidad, protección y eliminación segura de información?',                               riskRefs: ['A.19','E.19'],             safeguardRefs: ['iso-5.34','iso-8.10','iso-8.12'],       responsibility: 'ambos'     },
    { id: 'pi-12', domain: 'organizativo', text: '¿La solución permite auditoría, revisión y trazabilidad de acciones administrativas?',                                    riskRefs: ['A.13'],                    safeguardRefs: ['iso-5.35','iso-5.36','iso-8.15'],       responsibility: 'ambos'     },
    { id: 'pi-13', domain: 'tecnologico',  text: '¿La plataforma contempla gestión segura del ciclo de vida de accesos?',                                                   riskRefs: ['A.11'],                    safeguardRefs: ['iso-5.16','iso-5.18'],                  responsibility: 'ambos'     },
    { id: 'pi-14', domain: 'tecnologico',  text: '¿La solución contempla controles sobre APIs, integraciones y terceros?',                                                  riskRefs: ['A.11','A.14'],             safeguardRefs: ['iso-5.19','iso-5.21','iso-8.20'],       responsibility: 'ambos'     },
    { id: 'pi-15', domain: 'tecnologico',  text: '¿La solución garantiza disponibilidad y continuidad de servicios críticos?',                                              riskRefs: ['I.8','A.24'],              safeguardRefs: ['iso-5.30','iso-8.14'],                  responsibility: 'proveedor' },
  ],

  // ── IT Outsourcing ───────────────────────────────────────────────────────────
  'it-outsourcing': [
    { id: 'io-01', domain: 'organizativo', text: '¿Existen responsabilidades y acuerdos de seguridad definidos entre cliente y proveedor?',                                 riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.2','iso-5.19','iso-5.20'],        responsibility: 'ambos'     },
    { id: 'io-02', domain: 'tecnologico',  text: '¿El proveedor utiliza autenticación segura y gestión de privilegios?',                                                     riskRefs: ['A.5','A.6'],               safeguardRefs: ['iso-8.5','iso-5.15','iso-5.18'],        responsibility: 'proveedor' },
    { id: 'io-03', domain: 'tecnologico',  text: '¿Las acciones realizadas por terceros son registradas y monitorizadas?',                                                   riskRefs: ['A.13','E.3'],              safeguardRefs: ['iso-8.15','iso-8.16'],                  responsibility: 'proveedor' },
    { id: 'io-04', domain: 'tecnologico',  text: '¿La información compartida se protege mediante cifrado y controles de comunicación segura?',                              riskRefs: ['A.14','A.19'],             safeguardRefs: ['iso-8.24','iso-8.20'],                  responsibility: 'ambos'     },
    { id: 'io-05', domain: 'tecnologico',  text: '¿El proveedor contempla backup, recuperación y continuidad del servicio?',                                                riskRefs: ['E.18','I.8'],              safeguardRefs: ['iso-8.13','iso-8.14','iso-5.30'],       responsibility: 'proveedor' },
    { id: 'io-06', domain: 'tecnologico',  text: '¿El proveedor contempla gestión de vulnerabilidades y configuraciones seguras?',                                          riskRefs: ['E.4','E.20'],              safeguardRefs: ['iso-8.8','iso-8.9'],                    responsibility: 'proveedor' },
    { id: 'io-07', domain: 'personas',     text: '¿El personal del proveedor recibe formación y concienciación en seguridad?',                                              riskRefs: ['E.1','A.30'],              safeguardRefs: ['iso-6.3','iso-6.8'],                    responsibility: 'proveedor' },
    { id: 'io-08', domain: 'fisico',       text: '¿Las instalaciones del proveedor poseen controles físicos y ambientales adecuados?',                                      riskRefs: ['N.1','A.25'],              safeguardRefs: ['iso-7.1','iso-7.11'],                   responsibility: 'proveedor' },
    { id: 'io-09', domain: 'tecnologico',  text: '¿El proveedor protege frente a malware, accesos externos y actividad anómala?',                                           riskRefs: ['A.8','A.24'],              safeguardRefs: ['iso-8.7','iso-8.16','iso-8.20'],        responsibility: 'proveedor' },
    { id: 'io-10', domain: 'organizativo', text: '¿Existen procedimientos de gestión y notificación de incidentes de seguridad?',                                           riskRefs: ['E.7'],                     safeguardRefs: ['iso-5.24','iso-5.25','iso-5.26'],       responsibility: 'proveedor' },
    { id: 'io-11', domain: 'tecnologico',  text: '¿La solución contempla privacidad, protección y eliminación segura de información?',                                      riskRefs: ['A.19','E.19'],             safeguardRefs: ['iso-5.34','iso-8.10','iso-8.12'],       responsibility: 'ambos'     },
    { id: 'io-12', domain: 'organizativo', text: '¿La solución permite auditoría, revisión y trazabilidad de actividades realizadas por terceros?',                         riskRefs: ['A.13'],                    safeguardRefs: ['iso-5.35','iso-5.36','iso-8.15'],       responsibility: 'ambos'     },
    { id: 'io-13', domain: 'tecnologico',  text: '¿La solución contempla gestión segura del ciclo de vida de accesos externos?',                                            riskRefs: ['A.11'],                    safeguardRefs: ['iso-5.16','iso-5.18'],                  responsibility: 'ambos'     },
    { id: 'io-14', domain: 'tecnologico',  text: '¿Existen controles sobre proveedores secundarios, APIs o servicios externos integrados?',                                 riskRefs: ['A.11','A.14'],             safeguardRefs: ['iso-5.19','iso-5.21','iso-8.20'],       responsibility: 'ambos'     },
    { id: 'io-15', domain: 'tecnologico',  text: '¿La solución garantiza disponibilidad y continuidad de servicios externalizados críticos?',                               riskRefs: ['I.8','A.24'],              safeguardRefs: ['iso-5.30','iso-8.14'],                  responsibility: 'proveedor' },
  ],
};
