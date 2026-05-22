export interface Question {
  id: string;
  text: string;
  riskRefs: string[];
  safeguardRefs: string[];
}

export interface CategoryQuestionnaire {
  categoryId: string;
  questions: Question[];
}

// safeguardRefs usa IDs del catálogo ISO 27001 (iso-5.x, iso-6.x, iso-7.x, iso-8.x).

export const CATEGORY_QUESTIONNAIRES: Record<string, Question[]> = {

  'saas': [
    {
      id: 'ss-01',
      text: '¿El servicio SaaS incorpora autenticación multifactor (MFA)?',
      riskRefs: ['A.5', 'A.11'],
      safeguardRefs: ['iso-5.16'],
    },
    {
      id: 'ss-02',
      text: '¿El servicio SaaS permite gestionar permisos por roles?',
      riskRefs: ['A.6'],
      safeguardRefs: ['iso-5.15', 'iso-5.18'],
    },
    {
      id: 'ss-03',
      text: '¿La información almacenada en el SaaS se cifra en tránsito y en reposo?',
      riskRefs: ['A.14', 'A.19'],
      safeguardRefs: ['iso-8.24'],
    },
    {
      id: 'ss-04',
      text: '¿La solución genera registros de acceso y actividad?',
      riskRefs: ['A.13', 'E.3'],
      safeguardRefs: ['iso-8.15'],
    },
    {
      id: 'ss-05',
      text: '¿El proveedor SaaS garantiza niveles mínimos de disponibilidad mediante SLA?',
      riskRefs: ['A.24', 'I.8'],
      safeguardRefs: ['iso-5.29'],
    },
    {
      id: 'ss-06',
      text: '¿La solución permite revocar accesos de forma inmediata?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-5.18'],
    },
    {
      id: 'ss-07',
      text: '¿El servicio dispone de mecanismos de backup y recuperación?',
      riskRefs: ['E.18', 'I.5'],
      safeguardRefs: ['iso-8.13'],
    },
    {
      id: 'ss-08',
      text: '¿La solución protege frente a accesos externos no autorizados?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-8.20'],
    },
    {
      id: 'ss-09',
      text: '¿El proveedor contempla notificación de incidentes de seguridad?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.24', 'iso-5.27'],
    },
    {
      id: 'ss-10',
      text: '¿La solución permite exportar datos al finalizar el servicio?',
      riskRefs: ['E.18'],
      safeguardRefs: ['iso-5.29'],
    },
  ],

  'saas-ai': [
    {
      id: 'sa-01',
      text: '¿La solución limita el envío de información sensible a la IA?',
      riskRefs: ['E.19', 'A.19'],
      safeguardRefs: ['iso-8.11'],
    },
    {
      id: 'sa-02',
      text: '¿La plataforma registra las interacciones con la IA?',
      riskRefs: ['A.13'],
      safeguardRefs: ['iso-8.15'],
    },
    {
      id: 'sa-03',
      text: '¿La solución controla qué usuarios pueden usar la IA?',
      riskRefs: ['A.6'],
      safeguardRefs: ['iso-5.15'],
    },
    {
      id: 'sa-04',
      text: '¿Existe revisión humana de los resultados generados por la IA?',
      riskRefs: ['E.15'],
      safeguardRefs: ['iso-8.29'],
    },
    {
      id: 'sa-05',
      text: '¿El proveedor especifica el uso que da a los datos enviados al modelo IA?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-5.19'],
    },
    {
      id: 'sa-06',
      text: '¿La solución protege frente a fugas de información mediante prompts?',
      riskRefs: ['E.14'],
      safeguardRefs: ['iso-8.11'],
    },
    {
      id: 'sa-07',
      text: '¿La IA incorpora controles contra respuestas manipuladas o adversariales?',
      riskRefs: ['A.22'],
      safeguardRefs: ['iso-8.28'],
    },
    {
      id: 'sa-08',
      text: '¿La solución permite desactivar la IA de forma controlada?',
      riskRefs: ['A.7'],
      safeguardRefs: ['iso-8.9'],
    },
    {
      id: 'sa-09',
      text: '¿La solución contempla cumplimiento legal y protección de la privacidad?',
      riskRefs: [],
      safeguardRefs: ['iso-5.31'],
    },
    {
      id: 'sa-10',
      text: '¿La plataforma monitoriza abusos o anomalías en el uso de la IA?',
      riskRefs: ['A.30'],
      safeguardRefs: ['iso-8.16'],
    },
  ],

  'paas-iaas': [
    {
      id: 'pi-01',
      text: '¿La infraestructura permite la segmentación de red?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-8.22'],
    },
    {
      id: 'pi-02',
      text: '¿Existe acceso administrativo seguro con autenticación reforzada?',
      riskRefs: ['A.5'],
      safeguardRefs: ['iso-5.16'],
    },
    {
      id: 'pi-03',
      text: '¿La plataforma monitoriza eventos de seguridad en tiempo real?',
      riskRefs: ['E.3'],
      safeguardRefs: ['iso-8.15', 'iso-8.16'],
    },
    {
      id: 'pi-04',
      text: '¿Existen mecanismos de backup y recuperación ante desastres?',
      riskRefs: ['I.5'],
      safeguardRefs: ['iso-8.13'],
    },
    {
      id: 'pi-05',
      text: '¿Los datos almacenados y en tránsito están cifrados?',
      riskRefs: ['A.14'],
      safeguardRefs: ['iso-8.24'],
    },
    {
      id: 'pi-06',
      text: '¿La plataforma permite la aplicación de parches y actualizaciones de seguridad?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.8'],
    },
    {
      id: 'pi-07',
      text: '¿Hay controles activos contra configuraciones inseguras?',
      riskRefs: ['E.4'],
      safeguardRefs: ['iso-8.9'],
    },
    {
      id: 'pi-08',
      text: '¿Existe redundancia y alta disponibilidad garantizada?',
      riskRefs: ['I.6'],
      safeguardRefs: ['iso-8.14'],
    },
    {
      id: 'pi-09',
      text: '¿Existe protección activa frente a ataques de denegación de servicio (DoS)?',
      riskRefs: ['A.24'],
      safeguardRefs: ['iso-8.20'],
    },
    {
      id: 'pi-10',
      text: '¿Se aplica el principio de mínimo privilegio en el acceso a la plataforma?',
      riskRefs: ['A.6'],
      safeguardRefs: ['iso-5.15'],
    },
  ],

  'it-outsourcing': [
    {
      id: 'io-01',
      text: '¿Se definen claramente las responsabilidades de seguridad del proveedor?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.2'],
    },
    {
      id: 'io-02',
      text: '¿El proveedor limita el acceso de su personal a lo estrictamente necesario?',
      riskRefs: ['A.6'],
      safeguardRefs: ['iso-5.15'],
    },
    {
      id: 'io-03',
      text: '¿Existe trazabilidad completa de las acciones realizadas por el proveedor?',
      riskRefs: ['A.13'],
      safeguardRefs: ['iso-8.15'],
    },
    {
      id: 'io-04',
      text: '¿Existen SLA de disponibilidad contractualmente definidos?',
      riskRefs: ['I.8'],
      safeguardRefs: ['iso-5.29'],
    },
    {
      id: 'io-05',
      text: '¿La información compartida con el proveedor está debidamente protegida?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-5.14'],
    },
    {
      id: 'io-06',
      text: '¿El proveedor dispone de un proceso formal de gestión de incidentes?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.24'],
    },
    {
      id: 'io-07',
      text: '¿Existe un proceso de revocación inmediata de accesos del proveedor?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-5.18'],
    },
    {
      id: 'io-08',
      text: '¿El proveedor emplea autenticación fuerte para acceder a los sistemas?',
      riskRefs: ['A.5'],
      safeguardRefs: ['iso-5.16'],
    },
    {
      id: 'io-09',
      text: '¿Existe un plan de recuperación y backup ante incidentes del proveedor?',
      riskRefs: ['E.18'],
      safeguardRefs: ['iso-8.13'],
    },
    {
      id: 'io-10',
      text: '¿Se realizan auditorías periódicas sobre los servicios externalizados?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-5.35'],
    },
  ],

  'low-impact-it': [
    {
      id: 'li-01',
      text: '¿La solución propuesta incorpora autenticación para usuarios administrativos?',
      riskRefs: ['A.5', 'A.11'],
      safeguardRefs: ['iso-5.16'],
    },
    {
      id: 'li-02',
      text: '¿La solución permite registrar eventos y actividades relevantes (logs)?',
      riskRefs: ['E.3', 'A.13'],
      safeguardRefs: ['iso-8.15'],
    },
    {
      id: 'li-03',
      text: '¿La solución incluye mecanismos de copia de seguridad o recuperación?',
      riskRefs: ['E.18', 'I.5'],
      safeguardRefs: ['iso-8.13'],
    },
    {
      id: 'li-04',
      text: '¿La solución permite aplicar actualizaciones y parches de seguridad?',
      riskRefs: ['E.20', 'E.21'],
      safeguardRefs: ['iso-8.8'],
    },
    {
      id: 'li-05',
      text: '¿La solución protege la información almacenada frente a accesos no autorizados?',
      riskRefs: ['A.11', 'A.19'],
      safeguardRefs: ['iso-5.15', 'iso-8.24'],
    },
    {
      id: 'li-06',
      text: '¿La solución incorpora configuraciones seguras por defecto?',
      riskRefs: ['E.4', 'A.4'],
      safeguardRefs: ['iso-8.9'],
    },
    {
      id: 'li-07',
      text: '¿La solución limita los privilegios administrativos según funciones o roles?',
      riskRefs: ['A.6'],
      safeguardRefs: ['iso-5.18'],
    },
    {
      id: 'li-08',
      text: '¿La solución protege frente a pérdida accidental de información?',
      riskRefs: ['E.15', 'E.18'],
      safeguardRefs: ['iso-8.13', 'iso-8.14'],
    },
    {
      id: 'li-09',
      text: '¿La solución dispone de soporte o mantenimiento definido por el proveedor?',
      riskRefs: ['E.21', 'E.23'],
      safeguardRefs: ['iso-5.37'],
    },
    {
      id: 'li-10',
      text: '¿La solución permite eliminar información de forma segura al finalizar su uso?',
      riskRefs: ['E.19', 'A.19'],
      safeguardRefs: ['iso-8.10'],
    },
  ],

};
