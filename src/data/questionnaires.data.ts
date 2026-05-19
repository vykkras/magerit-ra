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

// First question is always the criticality — handled separately in the UI/export.
// These are the substantive safeguard-gap questions.

export const CATEGORY_QUESTIONNAIRES: Record<string, Question[]> = {

  'low-impact-it': [
    {
      id: 'li-01',
      text: '¿Existe un contrato de garantía o mantenimiento con el proveedor del equipo?',
      riskRefs: ['I.5'],
      safeguardRefs: ['HW.A', 'NEW.HW'],
    },
    {
      id: 'li-02',
      text: '¿Los usuarios reciben formación antes de operar los equipos adquiridos?',
      riskRefs: ['E.1'],
      safeguardRefs: ['PS.AT'],
    },
    {
      id: 'li-03',
      text: '¿Existen procedimientos documentados para la administración de los equipos?',
      riskRefs: ['E.2'],
      safeguardRefs: ['HW.op'],
    },
    {
      id: 'li-04',
      text: '¿Se verifica la configuración de los equipos antes de ponerlos en producción?',
      riskRefs: ['E.4'],
      safeguardRefs: ['HW.start', 'HW.SC'],
    },
    {
      id: 'li-05',
      text: '¿Se aplican actualizaciones y parches de software de forma periódica y controlada?',
      riskRefs: ['E.20'],
      safeguardRefs: ['SW.CM', 'H.VM'],
    },
    {
      id: 'li-06',
      text: '¿Existe un proceso de gestión de cambios para las actualizaciones de software?',
      riskRefs: ['E.21'],
      safeguardRefs: ['SW.CM', 'S.CM'],
    },
    {
      id: 'li-07',
      text: '¿Se realiza mantenimiento preventivo del hardware con periodicidad definida?',
      riskRefs: ['E.23'],
      safeguardRefs: ['HW.CM', 'HW.A'],
    },
    {
      id: 'li-08',
      text: '¿Los equipos están inventariados con número de serie, modelo y ubicación documentados?',
      riskRefs: ['E.25'],
      safeguardRefs: ['HW.op'],
    },
    {
      id: 'li-09',
      text: '¿Los equipos cuentan con etiquetado físico con datos de la organización?',
      riskRefs: ['E.25'],
      safeguardRefs: ['HW.op', 'L.AC'],
    },
    {
      id: 'li-10',
      text: '¿Se requiere autenticación (contraseña / PIN / biometría) para acceder a los equipos?',
      riskRefs: ['A.11'],
      safeguardRefs: ['H.IA'],
    },
  ],

  'saas': [
    {
      id: 'sa-01',
      text: '¿El proveedor SaaS cuenta con SLA documentado con garantías de disponibilidad?',
      riskRefs: ['I.5'],
      safeguardRefs: ['S.A', 'E.3'],
    },
    {
      id: 'sa-02',
      text: '¿Existe conectividad redundante o alternativa para acceder al servicio?',
      riskRefs: ['I.8'],
      safeguardRefs: ['COM.A'],
    },
    {
      id: 'sa-03',
      text: '¿Los usuarios reciben formación sobre el uso correcto y seguro de la plataforma?',
      riskRefs: ['E.1'],
      safeguardRefs: ['PS.AT'],
    },
    {
      id: 'sa-04',
      text: '¿Existe un responsable interno para la administración y configuración del servicio?',
      riskRefs: ['E.2'],
      safeguardRefs: ['G.plan'],
    },
    {
      id: 'sa-05',
      text: '¿Las configuraciones del servicio son revisadas y validadas periódicamente?',
      riskRefs: ['E.4'],
      safeguardRefs: ['S.SC', 'S.CM'],
    },
    {
      id: 'sa-06',
      text: '¿Se han configurado controles de compartición y exportación de datos en la plataforma?',
      riskRefs: ['E.19'],
      safeguardRefs: ['H.tools.DLP', 'D.C'],
    },
    {
      id: 'sa-07',
      text: '¿Se hace seguimiento de los boletines de seguridad y CVEs del proveedor?',
      riskRefs: ['E.20'],
      safeguardRefs: ['H.VM'],
    },
    {
      id: 'sa-08',
      text: '¿Se monitorizan el consumo y los límites de uso del servicio para evitar saturación?',
      riskRefs: ['E.24'],
      safeguardRefs: ['S.A', 'H.tools.TM'],
    },
    {
      id: 'sa-09',
      text: '¿Se exige autenticación multifactor (MFA) para todos los usuarios de la plataforma?',
      riskRefs: ['A.5'],
      safeguardRefs: ['H.IA'],
    },
    {
      id: 'sa-10',
      text: '¿Los permisos de usuario siguen el principio de mínimo privilegio?',
      riskRefs: ['A.6'],
      safeguardRefs: ['H.AC', 'H.ST'],
    },
    {
      id: 'sa-11',
      text: '¿Se realiza una revisión periódica de las cuentas y accesos activos?',
      riskRefs: ['A.11'],
      safeguardRefs: ['H.AC', 'H.AU'],
    },
    {
      id: 'sa-12',
      text: '¿Todas las comunicaciones con el servicio usan cifrado TLS / HTTPS?',
      riskRefs: ['A.14'],
      safeguardRefs: ['COM.C', 'K.comms'],
    },
    {
      id: 'sa-13',
      text: '¿Se ha firmado un acuerdo de protección de datos (DPA) con el proveedor?',
      riskRefs: ['A.19'],
      safeguardRefs: ['E.3', 'E.1'],
    },
    {
      id: 'sa-14',
      text: '¿El proveedor dispone de mecanismos anti-DDoS documentados en su SLA?',
      riskRefs: ['A.24'],
      safeguardRefs: ['S.A', 'IP.SPP'],
    },
  ],

  'saas-ai': [
    {
      id: 'ai-01',
      text: '¿Existe una política de uso aceptable de herramientas de IA aprobada por la organización?',
      riskRefs: ['E.7'],
      safeguardRefs: ['G.plan', 'PS.AT'],
    },
    {
      id: 'ai-02',
      text: '¿El proveedor de IA cuenta con SLA documentado con garantías de disponibilidad?',
      riskRefs: ['I.5'],
      safeguardRefs: ['S.A', 'E.3'],
    },
    {
      id: 'ai-03',
      text: '¿Existe conectividad redundante o alternativa para acceder al servicio?',
      riskRefs: ['I.8'],
      safeguardRefs: ['COM.A'],
    },
    {
      id: 'ai-04',
      text: '¿Los usuarios y administradores reciben formación específica sobre el uso seguro de la IA?',
      riskRefs: ['E.1', 'E.2'],
      safeguardRefs: ['PS.AT'],
    },
    {
      id: 'ai-05',
      text: '¿Las configuraciones del servicio de IA son revisadas y validadas periódicamente?',
      riskRefs: ['E.4'],
      safeguardRefs: ['S.SC', 'S.CM'],
    },
    {
      id: 'ai-06',
      text: '¿Se controla y clasifica la información enviada al modelo para evitar fugas de datos sensibles?',
      riskRefs: ['E.15', 'E.19'],
      safeguardRefs: ['H.tools.DLP', 'D.C'],
    },
    {
      id: 'ai-07',
      text: '¿Se hace seguimiento de avisos de seguridad y actualizaciones del proveedor de IA?',
      riskRefs: ['E.20'],
      safeguardRefs: ['H.VM'],
    },
    {
      id: 'ai-08',
      text: '¿Se monitorizan los límites de uso y cuotas del servicio para evitar saturación?',
      riskRefs: ['E.24'],
      safeguardRefs: ['S.A', 'H.tools.TM'],
    },
    {
      id: 'ai-09',
      text: '¿Se han implementado controles para detectar o prevenir ataques de prompt injection?',
      riskRefs: ['A.4'],
      safeguardRefs: ['S.www', 'S.SC'],
    },
    {
      id: 'ai-10',
      text: '¿Se exige autenticación multifactor (MFA) para todos los usuarios de la plataforma?',
      riskRefs: ['A.5'],
      safeguardRefs: ['H.IA'],
    },
    {
      id: 'ai-11',
      text: '¿Los permisos de usuario siguen el principio de mínimo privilegio?',
      riskRefs: ['A.6'],
      safeguardRefs: ['H.AC', 'H.ST'],
    },
    {
      id: 'ai-12',
      text: '¿Se realiza una revisión periódica de las cuentas y accesos activos?',
      riskRefs: ['A.11'],
      safeguardRefs: ['H.AC', 'H.AU'],
    },
    {
      id: 'ai-13',
      text: '¿Todas las comunicaciones con el servicio de IA usan cifrado TLS / HTTPS?',
      riskRefs: ['A.14'],
      safeguardRefs: ['COM.C', 'K.comms'],
    },
    {
      id: 'ai-14',
      text: '¿Se verifica la integridad y procedencia de los datos usados para entrenar o ajustar modelos?',
      riskRefs: ['A.15'],
      safeguardRefs: ['D.I'],
    },
    {
      id: 'ai-15',
      text: '¿Se ha firmado un acuerdo de protección de datos (DPA) con el proveedor de IA?',
      riskRefs: ['A.19'],
      safeguardRefs: ['E.3', 'E.1'],
    },
    {
      id: 'ai-16',
      text: '¿El proveedor dispone de mecanismos anti-DDoS documentados en su SLA?',
      riskRefs: ['A.24'],
      safeguardRefs: ['S.A', 'IP.SPP'],
    },
    {
      id: 'ai-17',
      text: '¿El personal está formado en riesgos de contenido generado por IA (deepfakes, phishing con IA)?',
      riskRefs: ['A.30'],
      safeguardRefs: ['PS.AT'],
    },
  ],

  'paas-iaas': [
    {
      id: 'pi-01',
      text: '¿La infraestructura está desplegada en al menos dos zonas de disponibilidad (multi-AZ / región)?',
      riskRefs: ['I.5', 'I.6'],
      safeguardRefs: ['S.A', 'AUX.power', 'HW.A'],
    },
    {
      id: 'pi-02',
      text: '¿Existe conectividad redundante hacia los servicios cloud?',
      riskRefs: ['I.8'],
      safeguardRefs: ['COM.A'],
    },
    {
      id: 'pi-03',
      text: '¿Existe un responsable técnico designado para la administración de la plataforma cloud?',
      riskRefs: ['E.2'],
      safeguardRefs: ['G.plan'],
    },
    {
      id: 'pi-04',
      text: '¿Existe monitorización centralizada de logs con alertas automáticas configuradas?',
      riskRefs: ['E.3'],
      safeguardRefs: ['H.AU', 'H.tools.LA'],
    },
    {
      id: 'pi-05',
      text: '¿Las configuraciones de infraestructura se gestionan mediante IaC (Terraform, CloudFormation…) con control de versiones?',
      riskRefs: ['E.4', 'A.4'],
      safeguardRefs: ['S.CM', 'SW.CM'],
    },
    {
      id: 'pi-06',
      text: '¿Las reglas de red (VPC, subnets, routing, firewall) están documentadas y revisadas periódicamente?',
      riskRefs: ['E.9'],
      safeguardRefs: ['COM.DS', 'IP.SPP'],
    },
    {
      id: 'pi-07',
      text: '¿Existen copias de seguridad automáticas con pruebas de restauración verificadas periódicamente?',
      riskRefs: ['E.18'],
      safeguardRefs: ['D.A'],
    },
    {
      id: 'pi-08',
      text: '¿Se aplican parches de seguridad de forma periódica sobre imágenes, contenedores y sistemas operativos?',
      riskRefs: ['E.20', 'E.21'],
      safeguardRefs: ['SW.CM', 'H.VM'],
    },
    {
      id: 'pi-09',
      text: '¿Existen alertas y límites de gasto configurados para prevenir la caída por agotamiento de recursos?',
      riskRefs: ['E.24'],
      safeguardRefs: ['S.A', 'H.tools.TM'],
    },
    {
      id: 'pi-10',
      text: '¿Los logs de auditoría se almacenan en un sistema separado e inmutable (Object Lock, WORM…)?',
      riskRefs: ['A.3'],
      safeguardRefs: ['H.AU'],
    },
    {
      id: 'pi-11',
      text: '¿Se exige MFA para el acceso a la consola de administración cloud?',
      riskRefs: ['A.5', 'A.11'],
      safeguardRefs: ['H.IA'],
    },
    {
      id: 'pi-12',
      text: '¿Los permisos de IAM siguen el principio de mínimo privilegio con revisiones periódicas?',
      riskRefs: ['A.6'],
      safeguardRefs: ['H.AC', 'H.ST'],
    },
    {
      id: 'pi-13',
      text: '¿Todas las comunicaciones internas y externas usan cifrado en tránsito (TLS / IPSec)?',
      riskRefs: ['A.14'],
      safeguardRefs: ['COM.C', 'K.comms'],
    },
    {
      id: 'pi-14',
      text: '¿Existen controles para prevenir el borrado masivo de datos (soft delete, versionado de objetos)?',
      riskRefs: ['A.18'],
      safeguardRefs: ['D.A', 'D.I'],
    },
    {
      id: 'pi-15',
      text: '¿El proveedor cloud dispone de mecanismos anti-DDoS documentados (AWS Shield, Azure DDoS Protection…)?',
      riskRefs: ['A.24'],
      safeguardRefs: ['S.A', 'IP.SPP', 'IP.BS'],
    },
  ],

  'it-outsourcing': [
    {
      id: 'io-01',
      text: '¿Existe un responsable designado internamente para la supervisión y gestión del proveedor?',
      riskRefs: ['E.7'],
      safeguardRefs: ['G.plan', 'G.exam'],
    },
    {
      id: 'io-02',
      text: '¿El personal externo recibe formación sobre las políticas de seguridad de la organización?',
      riskRefs: ['E.1'],
      safeguardRefs: ['PS.AT', 'E.4'],
    },
    {
      id: 'io-03',
      text: '¿Existen procedimientos documentados que el proveedor debe seguir para las tareas de administración?',
      riskRefs: ['E.2'],
      safeguardRefs: ['E.4'],
    },
    {
      id: 'io-04',
      text: '¿Se realizan auditorías o revisiones periódicas de las actividades del proveedor?',
      riskRefs: ['E.3'],
      safeguardRefs: ['G.exam', 'H.AU'],
    },
    {
      id: 'io-05',
      text: '¿El contrato incluye cláusulas de confidencialidad y protección de datos (NDA / DPA)?',
      riskRefs: ['E.19', 'A.19'],
      safeguardRefs: ['E.1', 'E.3'],
    },
    {
      id: 'io-06',
      text: '¿El contrato incluye cláusulas de continuidad y sustitución de personal clave del proveedor?',
      riskRefs: ['E.28'],
      safeguardRefs: ['PS.A', 'BC.DRP'],
    },
    {
      id: 'io-07',
      text: '¿Se exige MFA al personal externo para acceder a sistemas internos?',
      riskRefs: ['A.5'],
      safeguardRefs: ['H.IA', 'E.2'],
    },
    {
      id: 'io-08',
      text: '¿Los accesos del proveedor siguen el principio de mínimo privilegio y son revisados periódicamente?',
      riskRefs: ['A.6', 'A.11'],
      safeguardRefs: ['H.AC', 'E.2'],
    },
    {
      id: 'io-09',
      text: '¿El contrato restringe expresamente el uso no autorizado de recursos y datos del cliente?',
      riskRefs: ['A.7'],
      safeguardRefs: ['E.4', 'H.ST'],
    },
    {
      id: 'io-10',
      text: '¿Se mantienen registros de auditoría de todas las acciones realizadas por el personal externo?',
      riskRefs: ['A.13'],
      safeguardRefs: ['H.AU', 'E.2'],
    },
    {
      id: 'io-11',
      text: '¿Existe un plan de contingencia documentado ante una ruptura de relación con el proveedor?',
      riskRefs: ['A.28'],
      safeguardRefs: ['BC.DRP', 'PS.A'],
    },
    {
      id: 'io-12',
      text: '¿El personal está formado en detección y reporte de intentos de extorsión o coacción?',
      riskRefs: ['A.29'],
      safeguardRefs: ['PS.AT'],
    },
    {
      id: 'io-13',
      text: '¿Existe formación y concienciación periódica sobre riesgos de ingeniería social y phishing?',
      riskRefs: ['A.30'],
      safeguardRefs: ['PS.AT'],
    },
  ],
};
