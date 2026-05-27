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
    { id: 'li-01', domain: 'organizativo', text: '¿Se definen responsabilidades de seguridad para la solución adquirida?',               riskRefs: ['E.7'],          safeguardRefs: ['iso-5.2'],  responsibility: 'ambos'     },
    { id: 'li-02', domain: 'organizativo', text: '¿Existe procedimiento para gestión de incidentes relacionados con la solución?',        riskRefs: ['E.7'],          safeguardRefs: ['iso-5.24'], responsibility: 'ambos'     },
    { id: 'li-03', domain: 'organizativo', text: '¿La solución contempla requisitos mínimos de seguridad antes de puesta en producción?', riskRefs: ['E.20'],         safeguardRefs: ['iso-5.8'],  responsibility: 'proveedor' },
    { id: 'li-04', domain: 'personas',     text: '¿Los usuarios reciben concienciación básica sobre uso seguro de la solución?',          riskRefs: ['E.1', 'A.30'],  safeguardRefs: ['iso-6.1'],  responsibility: 'cliente'   },
    { id: 'li-05', domain: 'personas',     text: '¿El personal con privilegios administrativos está identificado y autorizado?',          riskRefs: ['A.6'],          safeguardRefs: ['iso-5.18'], responsibility: 'cliente'   },
    { id: 'li-06', domain: 'fisico',       text: '¿Los equipos asociados a la solución están protegidos físicamente?',                    riskRefs: ['A.25', 'N.1'],  safeguardRefs: ['iso-7.1'],  responsibility: 'cliente'   },
    { id: 'li-07', domain: 'fisico',       text: '¿La solución contempla protección frente a daños ambientales o eléctricos?',            riskRefs: ['I.6', 'I.*'],   safeguardRefs: ['iso-7.11'], responsibility: 'cliente'   },
    { id: 'li-08', domain: 'tecnologico',  text: '¿La solución incorpora autenticación segura?',                                          riskRefs: ['A.5', 'A.11'],  safeguardRefs: ['iso-5.16'], responsibility: 'proveedor' },
    { id: 'li-09', domain: 'tecnologico',  text: '¿La solución registra eventos y actividades relevantes?',                               riskRefs: ['A.13', 'E.3'],  safeguardRefs: ['iso-8.15'], responsibility: 'proveedor' },
    { id: 'li-10', domain: 'tecnologico',  text: '¿La solución permite gestión de usuarios y permisos?',                                  riskRefs: ['A.6'],          safeguardRefs: ['iso-5.15'], responsibility: 'ambos'     },
    { id: 'li-11', domain: 'tecnologico',  text: '¿La solución incorpora configuraciones seguras por defecto?',                           riskRefs: ['E.4'],          safeguardRefs: ['iso-8.9'],  responsibility: 'proveedor' },
    { id: 'li-12', domain: 'tecnologico',  text: '¿La solución protege la información mediante cifrado?',                                  riskRefs: ['A.14', 'A.19'], safeguardRefs: ['iso-8.24'], responsibility: 'proveedor' },
    { id: 'li-13', domain: 'tecnologico',  text: '¿La solución dispone de backup y recuperación?',                                        riskRefs: ['E.18', 'I.5'],  safeguardRefs: ['iso-8.13'], responsibility: 'proveedor' },
    { id: 'li-14', domain: 'tecnologico',  text: '¿La solución permite aplicar actualizaciones de seguridad?',                            riskRefs: ['E.20', 'E.21'], safeguardRefs: ['iso-8.8'],  responsibility: 'proveedor' },
    { id: 'li-15', domain: 'tecnologico',  text: '¿La solución contempla eliminación segura de información?',                             riskRefs: ['E.19'],         safeguardRefs: ['iso-8.10'], responsibility: 'proveedor' },
  ],

  // ── SaaS ────────────────────────────────────────────────────────────────────
  'saas': [
    { id: 'ss-01', domain: 'organizativo', text: '¿Existen responsabilidades de seguridad definidas entre cliente y proveedor?', riskRefs: ['E.7'],          safeguardRefs: ['iso-5.2'],  responsibility: 'ambos'     },
    { id: 'ss-02', domain: 'organizativo', text: '¿El proveedor dispone de gestión de incidentes de seguridad?',                 riskRefs: ['E.7'],          safeguardRefs: ['iso-5.24'], responsibility: 'proveedor' },
    { id: 'ss-03', domain: 'organizativo', text: '¿Existe acuerdo de disponibilidad y continuidad del servicio?',               riskRefs: ['I.8', 'A.24'],  safeguardRefs: ['iso-5.29'], responsibility: 'proveedor' },
    { id: 'ss-04', domain: 'personas',     text: '¿Los usuarios reciben formación sobre uso seguro del SaaS?',                  riskRefs: ['E.1', 'A.30'],  safeguardRefs: ['iso-6.1'],  responsibility: 'cliente'   },
    { id: 'ss-05', domain: 'personas',     text: '¿El acceso administrativo está restringido a personal autorizado?',           riskRefs: ['A.6'],          safeguardRefs: ['iso-5.18'], responsibility: 'ambos'     },
    { id: 'ss-06', domain: 'fisico',       text: '¿El proveedor protege físicamente los centros de datos?',                     riskRefs: ['N.1', 'A.25'],  safeguardRefs: ['iso-7.1'],  responsibility: 'proveedor' },
    { id: 'ss-07', domain: 'fisico',       text: '¿La infraestructura contempla redundancia eléctrica y ambiental?',           riskRefs: ['I.6', 'I.7'],   safeguardRefs: ['iso-7.11'], responsibility: 'proveedor' },
    { id: 'ss-08', domain: 'tecnologico',  text: '¿El servicio incorpora MFA?',                                                 riskRefs: ['A.5'],          safeguardRefs: ['iso-5.16'], responsibility: 'ambos'     },
    { id: 'ss-09', domain: 'tecnologico',  text: '¿La solución permite RBAC o mínimo privilegio?',                              riskRefs: ['A.6'],          safeguardRefs: ['iso-5.15'], responsibility: 'ambos'     },
    { id: 'ss-10', domain: 'tecnologico',  text: '¿La información se cifra en tránsito y reposo?',                              riskRefs: ['A.14', 'A.19'], safeguardRefs: ['iso-8.24'], responsibility: 'proveedor' },
    { id: 'ss-11', domain: 'tecnologico',  text: '¿La solución registra logs de actividad?',                                    riskRefs: ['A.13'],         safeguardRefs: ['iso-8.15'], responsibility: 'proveedor' },
    { id: 'ss-12', domain: 'tecnologico',  text: '¿Existen backups automáticos?',                                               riskRefs: ['E.18'],         safeguardRefs: ['iso-8.13'], responsibility: 'proveedor' },
    { id: 'ss-13', domain: 'tecnologico',  text: '¿Existe monitorización de incidentes?',                                       riskRefs: ['A.24'],         safeguardRefs: ['iso-8.16'], responsibility: 'proveedor' },
    { id: 'ss-14', domain: 'tecnologico',  text: '¿La solución contempla segregación entre clientes?',                          riskRefs: ['A.11'],         safeguardRefs: ['iso-8.22'], responsibility: 'proveedor' },
    { id: 'ss-15', domain: 'tecnologico',  text: '¿Existe gestión de vulnerabilidades?',                                        riskRefs: ['E.20'],         safeguardRefs: ['iso-8.8'],  responsibility: 'proveedor' },
  ],

  // ── SaaS con IA ─────────────────────────────────────────────────────────────
  'saas-ai': [
    { id: 'sa-01', domain: 'organizativo', text: '¿Se definen responsabilidades sobre uso y supervisión de IA?',               riskRefs: ['E.7'],          safeguardRefs: ['iso-5.2'],  responsibility: 'ambos'     },
    { id: 'sa-02', domain: 'organizativo', text: '¿Existe procedimiento de gestión de incidentes relacionados con IA?',        riskRefs: ['E.7'],          safeguardRefs: ['iso-5.24'], responsibility: 'proveedor' },
    { id: 'sa-03', domain: 'organizativo', text: '¿Existen requisitos legales y de privacidad definidos para IA?',             riskRefs: ['A.19'],         safeguardRefs: ['iso-5.31'], responsibility: 'ambos'     },
    { id: 'sa-04', domain: 'personas',     text: '¿Los usuarios reciben formación sobre riesgos del uso de IA?',               riskRefs: ['A.30', 'E.1'],  safeguardRefs: ['iso-6.1'],  responsibility: 'cliente'   },
    { id: 'sa-05', domain: 'personas',     text: '¿Existe revisión humana de resultados generados por IA?',                    riskRefs: ['E.15'],         safeguardRefs: ['iso-8.29'], responsibility: 'cliente'   },
    { id: 'sa-06', domain: 'fisico',       text: '¿El proveedor protege físicamente la infraestructura utilizada por IA?',     riskRefs: ['N.1', 'A.25'],  safeguardRefs: ['iso-7.1'],  responsibility: 'proveedor' },
    { id: 'sa-07', domain: 'fisico',       text: '¿La infraestructura IA contempla redundancia y disponibilidad?',             riskRefs: ['I.6', 'I.8'],   safeguardRefs: ['iso-7.11'], responsibility: 'proveedor' },
    { id: 'sa-08', domain: 'tecnologico',  text: '¿La solución limita envío de información sensible a IA?',                    riskRefs: ['E.19', 'A.19'], safeguardRefs: ['iso-8.11'], responsibility: 'ambos'     },
    { id: 'sa-09', domain: 'tecnologico',  text: '¿La plataforma registra prompts e interacciones IA?',                        riskRefs: ['A.13'],         safeguardRefs: ['iso-8.15'], responsibility: 'proveedor' },
    { id: 'sa-10', domain: 'tecnologico',  text: '¿La solución controla qué usuarios utilizan IA?',                            riskRefs: ['A.6'],          safeguardRefs: ['iso-5.15'], responsibility: 'ambos'     },
    { id: 'sa-11', domain: 'tecnologico',  text: '¿Existen controles contra fugas vía prompts?',                               riskRefs: ['E.14'],         safeguardRefs: ['iso-8.11'], responsibility: 'proveedor' },
    { id: 'sa-12', domain: 'tecnologico',  text: '¿La solución detecta respuestas manipuladas o anómalas?',                    riskRefs: ['A.22'],         safeguardRefs: ['iso-8.28'], responsibility: 'proveedor' },
    { id: 'sa-13', domain: 'tecnologico',  text: '¿La IA puede deshabilitarse?',                                               riskRefs: ['A.7'],          safeguardRefs: ['iso-8.9'],  responsibility: 'cliente'   },
    { id: 'sa-14', domain: 'tecnologico',  text: '¿Existe segregación de datos entre usuarios?',                               riskRefs: ['A.11'],         safeguardRefs: ['iso-8.22'], responsibility: 'proveedor' },
    { id: 'sa-15', domain: 'tecnologico',  text: '¿Existe monitorización de uso abusivo?',                                     riskRefs: ['A.30'],         safeguardRefs: ['iso-8.16'], responsibility: 'proveedor' },
  ],

  // ── PaaS / IaaS ─────────────────────────────────────────────────────────────
  'paas-iaas': [
    { id: 'pi-01', domain: 'organizativo', text: '¿Existen responsabilidades definidas para la seguridad cloud?',          riskRefs: ['E.7'],         safeguardRefs: ['iso-5.2'],  responsibility: 'ambos'     },
    { id: 'pi-02', domain: 'organizativo', text: '¿Existe gestión formal de incidentes cloud?',                            riskRefs: ['E.7'],         safeguardRefs: ['iso-5.24'], responsibility: 'proveedor' },
    { id: 'pi-03', domain: 'organizativo', text: '¿Existen acuerdos de continuidad y disponibilidad?',                    riskRefs: ['I.8'],         safeguardRefs: ['iso-5.29'], responsibility: 'proveedor' },
    { id: 'pi-04', domain: 'personas',     text: '¿El personal administrador recibe formación de seguridad cloud?',        riskRefs: ['E.1'],         safeguardRefs: ['iso-6.1'],  responsibility: 'ambos'     },
    { id: 'pi-05', domain: 'personas',     text: '¿El acceso privilegiado está limitado a personal autorizado?',           riskRefs: ['A.6'],         safeguardRefs: ['iso-5.18'], responsibility: 'ambos'     },
    { id: 'pi-06', domain: 'fisico',       text: '¿Los datacenters cloud poseen controles físicos adecuados?',             riskRefs: ['A.25', 'N.1'], safeguardRefs: ['iso-7.1'],  responsibility: 'proveedor' },
    { id: 'pi-07', domain: 'fisico',       text: '¿La infraestructura contempla redundancia eléctrica y ambiental?',      riskRefs: ['I.6', 'I.7'],  safeguardRefs: ['iso-7.11'], responsibility: 'proveedor' },
    { id: 'pi-08', domain: 'tecnologico',  text: '¿La infraestructura incorpora segmentación de red?',                    riskRefs: ['A.11'],        safeguardRefs: ['iso-8.22'], responsibility: 'proveedor' },
    { id: 'pi-09', domain: 'tecnologico',  text: '¿Existe acceso administrativo seguro?',                                  riskRefs: ['A.5'],         safeguardRefs: ['iso-5.16'], responsibility: 'ambos'     },
    { id: 'pi-10', domain: 'tecnologico',  text: '¿La plataforma registra eventos de seguridad?',                          riskRefs: ['A.13'],        safeguardRefs: ['iso-8.15'], responsibility: 'proveedor' },
    { id: 'pi-11', domain: 'tecnologico',  text: '¿Existen backups y recuperación?',                                       riskRefs: ['E.18'],        safeguardRefs: ['iso-8.13'], responsibility: 'proveedor' },
    { id: 'pi-12', domain: 'tecnologico',  text: '¿La información está cifrada?',                                          riskRefs: ['A.14'],        safeguardRefs: ['iso-8.24'], responsibility: 'proveedor' },
    { id: 'pi-13', domain: 'tecnologico',  text: '¿Existe protección frente a DoS/DDoS?',                                  riskRefs: ['A.24'],        safeguardRefs: ['iso-8.20'], responsibility: 'proveedor' },
    { id: 'pi-14', domain: 'tecnologico',  text: '¿Existe gestión de vulnerabilidades cloud?',                             riskRefs: ['E.20'],        safeguardRefs: ['iso-8.8'],  responsibility: 'ambos'     },
    { id: 'pi-15', domain: 'tecnologico',  text: '¿La infraestructura permite aislamiento entre entornos?',                riskRefs: ['A.11'],        safeguardRefs: ['iso-8.22'], responsibility: 'proveedor' },
  ],

  // ── IT Outsourcing ──────────────────────────────────────────────────────────
  'it-outsourcing': [
    { id: 'io-01', domain: 'organizativo', text: '¿Se definen responsabilidades de seguridad entre cliente y proveedor?', riskRefs: ['E.7'],          safeguardRefs: ['iso-5.2'],  responsibility: 'ambos'     },
    { id: 'io-02', domain: 'organizativo', text: '¿Existen acuerdos de seguridad y confidencialidad?',                   riskRefs: ['A.19'],         safeguardRefs: ['iso-5.19'], responsibility: 'ambos'     },
    { id: 'io-03', domain: 'organizativo', text: '¿Existe gestión formal de incidentes del proveedor?',                  riskRefs: ['E.7'],          safeguardRefs: ['iso-5.24'], responsibility: 'proveedor' },
    { id: 'io-04', domain: 'personas',     text: '¿El personal del proveedor recibe formación en seguridad?',            riskRefs: ['E.1', 'A.30'],  safeguardRefs: ['iso-6.1'],  responsibility: 'proveedor' },
    { id: 'io-05', domain: 'personas',     text: '¿El acceso del personal externo está limitado y autorizado?',          riskRefs: ['A.6'],          safeguardRefs: ['iso-5.18'], responsibility: 'ambos'     },
    { id: 'io-06', domain: 'fisico',       text: '¿Las instalaciones del proveedor poseen controles físicos adecuados?', riskRefs: ['A.25'],         safeguardRefs: ['iso-7.1'],  responsibility: 'proveedor' },
    { id: 'io-07', domain: 'fisico',       text: '¿Existe protección física frente a incendios o daños ambientales?',   riskRefs: ['N.1', 'I.7'],   safeguardRefs: ['iso-7.11'], responsibility: 'proveedor' },
    { id: 'io-08', domain: 'tecnologico',  text: '¿El proveedor utiliza autenticación fuerte?',                          riskRefs: ['A.5'],          safeguardRefs: ['iso-5.16'], responsibility: 'proveedor' },
    { id: 'io-09', domain: 'tecnologico',  text: '¿Existe trazabilidad de acciones realizadas por terceros?',            riskRefs: ['A.13'],         safeguardRefs: ['iso-8.15'], responsibility: 'proveedor' },
    { id: 'io-10', domain: 'tecnologico',  text: '¿La información compartida está cifrada?',                             riskRefs: ['A.14', 'A.19'], safeguardRefs: ['iso-8.24'], responsibility: 'ambos'     },
    { id: 'io-11', domain: 'tecnologico',  text: '¿Existen backups y recuperación de información?',                      riskRefs: ['E.18'],         safeguardRefs: ['iso-8.13'], responsibility: 'proveedor' },
    { id: 'io-12', domain: 'tecnologico',  text: '¿Existe gestión de vulnerabilidades?',                                  riskRefs: ['E.20'],         safeguardRefs: ['iso-8.8'],  responsibility: 'proveedor' },
    { id: 'io-13', domain: 'tecnologico',  text: '¿La comunicación con terceros está protegida?',                        riskRefs: ['A.14'],         safeguardRefs: ['iso-8.20'], responsibility: 'ambos'     },
    { id: 'io-14', domain: 'tecnologico',  text: '¿Existen controles frente a fuga de información?',                     riskRefs: ['E.19'],         safeguardRefs: ['iso-8.11'], responsibility: 'ambos'     },
    { id: 'io-15', domain: 'tecnologico',  text: '¿Se realizan auditorías periódicas de seguridad?',                     riskRefs: ['E.20'],         safeguardRefs: ['iso-5.35'], responsibility: 'ambos'     },
  ],

};
