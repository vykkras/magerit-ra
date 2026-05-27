export type QuestionResponsibility = 'proveedor' | 'cliente' | 'ambos';

export interface Question {
  id: string;
  text: string;
  riskRefs: string[];
  safeguardRefs: string[];         // ISO 27001:2022 catalog IDs (iso-X.Y)
  responsibility: QuestionResponsibility;
}

export interface CategoryQuestionnaire {
  categoryId: string;
  questions: Question[];
}

export const CATEGORY_QUESTIONNAIRES: Record<string, Question[]> = {

  // ── Adquisición IT de Bajo Impacto ──────────────────────────────────────────
  'low-impact-it': [
    { id: 'li-01', text: '¿La solución incorpora autenticación para usuarios administrativos?',  riskRefs: ['A.5', 'A.11'],     safeguardRefs: ['iso-5.16'],        responsibility: 'proveedor' },
    { id: 'li-02', text: '¿La solución permite gestión de usuarios y permisos?',                 riskRefs: ['A.6'],             safeguardRefs: ['iso-5.15'],        responsibility: 'ambos'     },
    { id: 'li-03', text: '¿La solución genera registros de actividad?',                          riskRefs: ['A.13', 'E.3'],     safeguardRefs: ['iso-8.15'],        responsibility: 'proveedor' },
    { id: 'li-04', text: '¿La solución permite aplicar actualizaciones de seguridad?',           riskRefs: ['E.20', 'E.21'],    safeguardRefs: ['iso-8.8'],         responsibility: 'proveedor' },
    { id: 'li-05', text: '¿La solución incorpora configuración segura por defecto?',             riskRefs: ['E.4'],             safeguardRefs: ['iso-8.9'],         responsibility: 'proveedor' },
    { id: 'li-06', text: '¿La solución protege la información almacenada?',                      riskRefs: ['A.19'],            safeguardRefs: ['iso-8.24'],        responsibility: 'proveedor' },
    { id: 'li-07', text: '¿La solución dispone de backup o recuperación?',                       riskRefs: ['E.18', 'I.5'],     safeguardRefs: ['iso-8.13'],        responsibility: 'proveedor' },
    { id: 'li-08', text: '¿La solución permite revocar accesos fácilmente?',                     riskRefs: ['A.11'],            safeguardRefs: ['iso-5.18'],        responsibility: 'cliente'   },
    { id: 'li-09', text: '¿La solución dispone de soporte/mantenimiento definido?',              riskRefs: ['E.21', 'E.23'],    safeguardRefs: ['iso-5.37'],        responsibility: 'ambos'     },
    { id: 'li-10', text: '¿La solución contempla eliminación segura de información?',            riskRefs: ['E.19'],            safeguardRefs: ['iso-8.10'],        responsibility: 'proveedor' },
    { id: 'li-11', text: '¿La solución limita privilegios administrativos?',                     riskRefs: ['A.6'],             safeguardRefs: ['iso-5.18'],        responsibility: 'ambos'     },
    { id: 'li-12', text: '¿La solución protege frente a malware?',                               riskRefs: ['A.8'],             safeguardRefs: ['iso-8.7'],         responsibility: 'proveedor' },
    { id: 'li-13', text: '¿La solución permite trazabilidad de acciones?',                       riskRefs: ['A.13'],            safeguardRefs: ['iso-8.15'],        responsibility: 'proveedor' },
    { id: 'li-14', text: '¿La solución contempla continuidad mínima del servicio?',              riskRefs: ['I.8'],             safeguardRefs: ['iso-5.29'],        responsibility: 'proveedor' },
    { id: 'li-15', text: '¿La solución permite recuperar información tras fallo?',               riskRefs: ['I.5'],             safeguardRefs: ['iso-8.13'],        responsibility: 'proveedor' },
  ],

  // ── SaaS ────────────────────────────────────────────────────────────────────
  'saas': [
    { id: 'ss-01', text: '¿El servicio SaaS incorpora MFA?',                               riskRefs: ['A.5'],             safeguardRefs: ['iso-5.16'],        responsibility: 'ambos'     },
    { id: 'ss-02', text: '¿La solución permite RBAC o mínimo privilegio?',                 riskRefs: ['A.6'],             safeguardRefs: ['iso-5.15'],        responsibility: 'ambos'     },
    { id: 'ss-03', text: '¿La información se cifra en tránsito y reposo?',                 riskRefs: ['A.14', 'A.19'],    safeguardRefs: ['iso-8.24'],        responsibility: 'proveedor' },
    { id: 'ss-04', text: '¿La solución registra logs de actividad?',                       riskRefs: ['A.13'],            safeguardRefs: ['iso-8.15'],        responsibility: 'proveedor' },
    { id: 'ss-05', text: '¿Existe SLA de disponibilidad?',                                 riskRefs: ['A.24', 'I.8'],     safeguardRefs: ['iso-5.29'],        responsibility: 'proveedor' },
    { id: 'ss-06', text: '¿La solución permite revocar accesos inmediatamente?',           riskRefs: ['A.11'],            safeguardRefs: ['iso-5.18'],        responsibility: 'cliente'   },
    { id: 'ss-07', text: '¿Existen backups automáticos?',                                  riskRefs: ['E.18'],            safeguardRefs: ['iso-8.13'],        responsibility: 'proveedor' },
    { id: 'ss-08', text: '¿La solución protege frente a accesos externos?',                riskRefs: ['A.11'],            safeguardRefs: ['iso-8.20'],        responsibility: 'proveedor' },
    { id: 'ss-09', text: '¿Existe monitorización de incidentes?',                          riskRefs: ['A.24'],            safeguardRefs: ['iso-8.16'],        responsibility: 'proveedor' },
    { id: 'ss-10', text: '¿El proveedor notifica incidentes de seguridad?',                riskRefs: ['E.7'],             safeguardRefs: ['iso-5.24'],        responsibility: 'proveedor' },
    { id: 'ss-11', text: '¿La solución permite exportación de datos?',                     riskRefs: ['E.18'],            safeguardRefs: ['iso-5.29'],        responsibility: 'proveedor' },
    { id: 'ss-12', text: '¿Existen controles frente a malware?',                           riskRefs: ['A.8'],             safeguardRefs: ['iso-8.7'],         responsibility: 'proveedor' },
    { id: 'ss-13', text: '¿La solución contempla segregación entre clientes?',             riskRefs: ['A.11'],            safeguardRefs: ['iso-8.22'],        responsibility: 'proveedor' },
    { id: 'ss-14', text: '¿La solución permite auditoría y trazabilidad?',                 riskRefs: ['A.13'],            safeguardRefs: ['iso-8.15'],        responsibility: 'proveedor' },
    { id: 'ss-15', text: '¿Existe gestión de vulnerabilidades?',                           riskRefs: ['E.20'],            safeguardRefs: ['iso-8.8'],         responsibility: 'proveedor' },
  ],

  // ── SaaS con IA ─────────────────────────────────────────────────────────────
  'saas-ai': [
    { id: 'sa-01', text: '¿La solución limita envío de información sensible a IA?',          riskRefs: ['E.19', 'A.19'],    safeguardRefs: ['iso-8.11'],        responsibility: 'ambos'     },
    { id: 'sa-02', text: '¿La plataforma registra prompts e interacciones IA?',              riskRefs: ['A.13'],            safeguardRefs: ['iso-8.15'],        responsibility: 'proveedor' },
    { id: 'sa-03', text: '¿La solución controla qué usuarios usan IA?',                      riskRefs: ['A.6'],             safeguardRefs: ['iso-5.15'],        responsibility: 'ambos'     },
    { id: 'sa-04', text: '¿Existe revisión humana de resultados IA?',                        riskRefs: ['E.15'],            safeguardRefs: ['iso-8.29'],        responsibility: 'cliente'   },
    { id: 'sa-05', text: '¿El proveedor especifica uso de datos enviados?',                  riskRefs: ['A.19'],            safeguardRefs: ['iso-5.19'],        responsibility: 'proveedor' },
    { id: 'sa-06', text: '¿La solución evita entrenamiento con datos corporativos?',         riskRefs: ['A.19'],            safeguardRefs: ['iso-5.31'],        responsibility: 'proveedor' },
    { id: 'sa-07', text: '¿Existen controles contra fugas vía prompts?',                     riskRefs: ['E.14'],            safeguardRefs: ['iso-8.11'],        responsibility: 'proveedor' },
    { id: 'sa-08', text: '¿La IA puede deshabilitarse?',                                     riskRefs: ['A.7'],             safeguardRefs: ['iso-8.9'],         responsibility: 'cliente'   },
    { id: 'sa-09', text: '¿Existe monitorización de uso abusivo?',                           riskRefs: ['A.30'],            safeguardRefs: ['iso-8.16'],        responsibility: 'proveedor' },
    { id: 'sa-10', text: '¿La solución detecta respuestas manipuladas o anómalas?',          riskRefs: ['A.22'],            safeguardRefs: ['iso-8.28'],        responsibility: 'proveedor' },
    { id: 'sa-11', text: '¿Existe segregación de datos entre usuarios?',                     riskRefs: ['A.19'],            safeguardRefs: ['iso-8.22'],        responsibility: 'proveedor' },
    { id: 'sa-12', text: '¿La solución cumple requisitos legales y privacidad?',             riskRefs: ['LOPD/GDPR'],       safeguardRefs: ['iso-5.31'],        responsibility: 'ambos'     },
    { id: 'sa-13', text: '¿Existen controles sobre APIs/modelos externos?',                  riskRefs: ['A.11'],            safeguardRefs: ['iso-5.19'],        responsibility: 'proveedor' },
    { id: 'sa-14', text: '¿La solución registra cambios de configuración IA?',               riskRefs: ['A.4'],             safeguardRefs: ['iso-8.9'],         responsibility: 'proveedor' },
    { id: 'sa-15', text: '¿La solución contempla continuidad del servicio IA?',              riskRefs: ['I.8'],             safeguardRefs: ['iso-5.29'],        responsibility: 'proveedor' },
  ],

  // ── PaaS / IaaS ─────────────────────────────────────────────────────────────
  'paas-iaas': [
    { id: 'pi-01', text: '¿La infraestructura incorpora segmentación de red?',              riskRefs: ['A.11'],            safeguardRefs: ['iso-8.22'],        responsibility: 'proveedor' },
    { id: 'pi-02', text: '¿Existe acceso administrativo seguro?',                            riskRefs: ['A.5'],             safeguardRefs: ['iso-5.16'],        responsibility: 'ambos'     },
    { id: 'pi-03', text: '¿La plataforma registra eventos de seguridad?',                    riskRefs: ['A.13'],            safeguardRefs: ['iso-8.15'],        responsibility: 'proveedor' },
    { id: 'pi-04', text: '¿Existen backups y recuperación?',                                 riskRefs: ['E.18'],            safeguardRefs: ['iso-8.13'],        responsibility: 'proveedor' },
    { id: 'pi-05', text: '¿La información está cifrada?',                                    riskRefs: ['A.14'],            safeguardRefs: ['iso-8.24'],        responsibility: 'proveedor' },
    { id: 'pi-06', text: '¿La solución permite parcheado continuo?',                         riskRefs: ['E.20'],            safeguardRefs: ['iso-8.8'],         responsibility: 'ambos'     },
    { id: 'pi-07', text: '¿Existen configuraciones seguras por defecto?',                    riskRefs: ['E.4'],             safeguardRefs: ['iso-8.9'],         responsibility: 'proveedor' },
    { id: 'pi-08', text: '¿La infraestructura dispone de redundancia?',                      riskRefs: ['I.6'],             safeguardRefs: ['iso-8.14'],        responsibility: 'proveedor' },
    { id: 'pi-09', text: '¿Existe protección frente a DoS/DDoS?',                            riskRefs: ['A.24'],            safeguardRefs: ['iso-8.20'],        responsibility: 'proveedor' },
    { id: 'pi-10', text: '¿La solución limita privilegios administrativos?',                 riskRefs: ['A.6'],             safeguardRefs: ['iso-5.15'],        responsibility: 'ambos'     },
    { id: 'pi-11', text: '¿Existe monitorización continua?',                                 riskRefs: ['A.24'],            safeguardRefs: ['iso-8.16'],        responsibility: 'proveedor' },
    { id: 'pi-12', text: '¿La solución protege APIs y comunicaciones?',                      riskRefs: ['A.14'],            safeguardRefs: ['iso-8.20'],        responsibility: 'proveedor' },
    { id: 'pi-13', text: '¿La infraestructura permite aislamiento entre entornos?',          riskRefs: ['A.11'],            safeguardRefs: ['iso-8.22'],        responsibility: 'proveedor' },
    { id: 'pi-14', text: '¿Existe gestión de vulnerabilidades cloud?',                       riskRefs: ['E.20'],            safeguardRefs: ['iso-8.8'],         responsibility: 'ambos'     },
    { id: 'pi-15', text: '¿La solución contempla continuidad ante desastre?',                riskRefs: ['N.1', 'N.2'],      safeguardRefs: ['iso-5.29'],        responsibility: 'proveedor' },
  ],

  // ── IT Outsourcing ──────────────────────────────────────────────────────────
  'it-outsourcing': [
    { id: 'io-01', text: '¿Se definen responsabilidades de seguridad entre partes?',         riskRefs: ['E.7'],             safeguardRefs: ['iso-5.2'],         responsibility: 'ambos'     },
    { id: 'io-02', text: '¿El proveedor limita accesos de su personal?',                     riskRefs: ['A.6'],             safeguardRefs: ['iso-5.15'],        responsibility: 'proveedor' },
    { id: 'io-03', text: '¿Existe trazabilidad de acciones del proveedor?',                  riskRefs: ['A.13'],            safeguardRefs: ['iso-8.15'],        responsibility: 'proveedor' },
    { id: 'io-04', text: '¿Existen SLA de disponibilidad?',                                  riskRefs: ['I.8'],             safeguardRefs: ['iso-5.29'],        responsibility: 'proveedor' },
    { id: 'io-05', text: '¿La información compartida está protegida?',                       riskRefs: ['A.19'],            safeguardRefs: ['iso-5.14'],        responsibility: 'ambos'     },
    { id: 'io-06', text: '¿El proveedor dispone de gestión de incidentes?',                  riskRefs: ['E.7'],             safeguardRefs: ['iso-5.24'],        responsibility: 'proveedor' },
    { id: 'io-07', text: '¿Existe revocación inmediata de accesos externos?',                riskRefs: ['A.11'],            safeguardRefs: ['iso-5.18'],        responsibility: 'ambos'     },
    { id: 'io-08', text: '¿El proveedor utiliza autenticación fuerte?',                      riskRefs: ['A.5'],             safeguardRefs: ['iso-5.16'],        responsibility: 'proveedor' },
    { id: 'io-09', text: '¿Existen backups y recuperación?',                                 riskRefs: ['E.18'],            safeguardRefs: ['iso-8.13'],        responsibility: 'proveedor' },
    { id: 'io-10', text: '¿Se realizan auditorías periódicas?',                              riskRefs: ['E.20'],            safeguardRefs: ['iso-5.35'],        responsibility: 'ambos'     },
    { id: 'io-11', text: '¿La solución contempla segregación de funciones?',                 riskRefs: ['A.6'],             safeguardRefs: ['iso-5.2'],         responsibility: 'ambos'     },
    { id: 'io-12', text: '¿El proveedor aplica gestión de vulnerabilidades?',                riskRefs: ['E.20'],            safeguardRefs: ['iso-8.8'],         responsibility: 'proveedor' },
    { id: 'io-13', text: '¿La solución contempla continuidad del proveedor?',                riskRefs: ['I.9'],             safeguardRefs: ['iso-5.29'],        responsibility: 'proveedor' },
    { id: 'io-14', text: '¿La comunicación con terceros está protegida?',                    riskRefs: ['A.14'],            safeguardRefs: ['iso-8.24'],        responsibility: 'ambos'     },
    { id: 'io-15', text: '¿Existen controles frente a fuga de información?',                 riskRefs: ['E.19'],            safeguardRefs: ['iso-8.11'],        responsibility: 'ambos'     },
  ],

};
