export interface Question {
  id: string;
  text: string;
  riskRefs: string[];
}

export const CATEGORY_QUESTIONNAIRES: Record<string, Question[]> = {

  'low-impact-it': [
    { id: 'li-01', riskRefs: ['I.5'],  text: '¿Existe un contrato de garantía o mantenimiento con el proveedor del equipo?' },
    { id: 'li-02', riskRefs: ['E.1'],  text: '¿Los usuarios reciben formación antes de operar los equipos adquiridos?' },
    { id: 'li-03', riskRefs: ['E.2'],  text: '¿Existen procedimientos documentados para la administración de los equipos?' },
    { id: 'li-04', riskRefs: ['E.4'],  text: '¿Se verifica la configuración de los equipos antes de ponerlos en producción?' },
    { id: 'li-05', riskRefs: ['E.20'], text: '¿Se aplican actualizaciones y parches de software de forma periódica y controlada?' },
    { id: 'li-06', riskRefs: ['E.21'], text: '¿Existe un proceso de gestión de cambios para las actualizaciones de software?' },
    { id: 'li-07', riskRefs: ['E.23'], text: '¿Se realiza mantenimiento preventivo del hardware con periodicidad definida?' },
    { id: 'li-08', riskRefs: ['E.25'], text: '¿Los equipos están inventariados con número de serie, modelo y ubicación documentados?' },
    { id: 'li-09', riskRefs: ['E.25'], text: '¿Los equipos cuentan con etiquetado físico con datos de la organización?' },
    { id: 'li-10', riskRefs: ['A.11'], text: '¿Se requiere autenticación (contraseña/PIN/biometría) para acceder a los equipos?' },
  ],

  'saas': [
    { id: 'sa-01', riskRefs: ['I.5'],        text: '¿El proveedor SaaS cuenta con SLA documentado con garantías de disponibilidad?' },
    { id: 'sa-02', riskRefs: ['I.8'],        text: '¿Existe conectividad redundante o alternativa para acceder al servicio?' },
    { id: 'sa-03', riskRefs: ['E.1'],        text: '¿Los usuarios reciben formación sobre el uso correcto y seguro de la plataforma?' },
    { id: 'sa-04', riskRefs: ['E.2'],        text: '¿Existe un responsable interno para la administración y configuración del servicio?' },
    { id: 'sa-05', riskRefs: ['E.4'],        text: '¿Las configuraciones del servicio son revisadas y validadas periódicamente?' },
    { id: 'sa-06', riskRefs: ['E.19'],       text: '¿Se han configurado controles de compartición y exportación de datos en la plataforma?' },
    { id: 'sa-07', riskRefs: ['E.20'],       text: '¿Se hace seguimiento de los boletines de seguridad y CVEs del proveedor?' },
    { id: 'sa-08', riskRefs: ['E.24'],       text: '¿Se monitorizan el consumo y los límites de uso del servicio para evitar saturación?' },
    { id: 'sa-09', riskRefs: ['A.5'],        text: '¿Se exige autenticación multifactor (MFA) para todos los usuarios de la plataforma?' },
    { id: 'sa-10', riskRefs: ['A.6'],        text: '¿Los permisos de usuario siguen el principio de mínimo privilegio?' },
    { id: 'sa-11', riskRefs: ['A.11'],       text: '¿Se realiza una revisión periódica de las cuentas y accesos activos?' },
    { id: 'sa-12', riskRefs: ['A.14'],       text: '¿Todas las comunicaciones con el servicio usan cifrado TLS/HTTPS?' },
    { id: 'sa-13', riskRefs: ['A.19'],       text: '¿Se ha firmado un acuerdo de protección de datos (DPA) con el proveedor?' },
    { id: 'sa-14', riskRefs: ['A.24'],       text: '¿El proveedor dispone de mecanismos anti-DDoS documentados en su SLA?' },
  ],

  'saas-ai': [
    { id: 'ai-01', riskRefs: ['E.7'],        text: '¿Existe una política de uso aceptable de herramientas de IA aprobada por la organización?' },
    { id: 'ai-02', riskRefs: ['I.5'],        text: '¿El proveedor de IA cuenta con SLA documentado con garantías de disponibilidad?' },
    { id: 'ai-03', riskRefs: ['I.8'],        text: '¿Existe conectividad redundante o alternativa para acceder al servicio?' },
    { id: 'ai-04', riskRefs: ['E.1', 'E.2'], text: '¿Los usuarios y administradores reciben formación específica sobre el uso seguro de la IA?' },
    { id: 'ai-05', riskRefs: ['E.4'],        text: '¿Las configuraciones del servicio de IA son revisadas y validadas periódicamente?' },
    { id: 'ai-06', riskRefs: ['E.15', 'E.19'], text: '¿Se controla y clasifica la información enviada al modelo para evitar fugas de datos sensibles?' },
    { id: 'ai-07', riskRefs: ['E.20'],       text: '¿Se hace seguimiento de avisos de seguridad y actualizaciones del proveedor de IA?' },
    { id: 'ai-08', riskRefs: ['E.24'],       text: '¿Se monitorizan los límites de uso y cuotas del servicio para evitar saturación?' },
    { id: 'ai-09', riskRefs: ['A.4'],        text: '¿Se han implementado controles para detectar o prevenir ataques de prompt injection?' },
    { id: 'ai-10', riskRefs: ['A.5'],        text: '¿Se exige autenticación multifactor (MFA) para todos los usuarios de la plataforma?' },
    { id: 'ai-11', riskRefs: ['A.6'],        text: '¿Los permisos de usuario siguen el principio de mínimo privilegio?' },
    { id: 'ai-12', riskRefs: ['A.11'],       text: '¿Se realiza una revisión periódica de las cuentas y accesos activos?' },
    { id: 'ai-13', riskRefs: ['A.14'],       text: '¿Todas las comunicaciones con el servicio de IA usan cifrado TLS/HTTPS?' },
    { id: 'ai-14', riskRefs: ['A.15'],       text: '¿Se verifica la integridad y procedencia de los datos usados para entrenar o ajustar modelos?' },
    { id: 'ai-15', riskRefs: ['A.19'],       text: '¿Se ha firmado un acuerdo de protección de datos (DPA) con el proveedor de IA?' },
    { id: 'ai-16', riskRefs: ['A.24'],       text: '¿El proveedor dispone de mecanismos anti-DDoS documentados en su SLA?' },
    { id: 'ai-17', riskRefs: ['A.30'],       text: '¿El personal está formado en riesgos de contenido generado por IA (deepfakes, phishing con IA)?' },
  ],

  'paas-iaas': [
    { id: 'pi-01', riskRefs: ['I.5', 'I.6'], text: '¿La infraestructura está desplegada en al menos dos zonas de disponibilidad (multi-AZ/región)?' },
    { id: 'pi-02', riskRefs: ['I.8'],         text: '¿Existe conectividad redundante hacia los servicios cloud?' },
    { id: 'pi-03', riskRefs: ['E.2'],         text: '¿Existe un responsable técnico designado para la administración de la plataforma cloud?' },
    { id: 'pi-04', riskRefs: ['E.3'],         text: '¿Existe monitorización centralizada de logs con alertas automáticas configuradas?' },
    { id: 'pi-05', riskRefs: ['E.4', 'A.4'],  text: '¿Las configuraciones de infraestructura se gestionan mediante IaC (Terraform, CloudFormation, etc.) con control de versiones?' },
    { id: 'pi-06', riskRefs: ['E.9'],         text: '¿Las reglas de red (VPC, subnets, routing, firewall) están documentadas y revisadas periódicamente?' },
    { id: 'pi-07', riskRefs: ['E.18'],        text: '¿Existen copias de seguridad automáticas con pruebas de restauración verificadas periódicamente?' },
    { id: 'pi-08', riskRefs: ['E.20', 'E.21'], text: '¿Se aplican parches de seguridad de forma periódica sobre imágenes, contenedores y sistemas operativos?' },
    { id: 'pi-09', riskRefs: ['E.24'],        text: '¿Existen alertas y límites de gasto configurados para prevenir la caída por agotamiento de recursos?' },
    { id: 'pi-10', riskRefs: ['A.3'],         text: '¿Los logs de auditoría se almacenan en un sistema separado e inmutable (ej. S3 con Object Lock, WORM)?' },
    { id: 'pi-11', riskRefs: ['A.5', 'A.11'], text: '¿Se exige MFA para el acceso a la consola de administración cloud?' },
    { id: 'pi-12', riskRefs: ['A.6'],         text: '¿Los permisos de IAM siguen el principio de mínimo privilegio con revisiones periódicas?' },
    { id: 'pi-13', riskRefs: ['A.14'],        text: '¿Todas las comunicaciones internas y externas usan cifrado en tránsito (TLS)?' },
    { id: 'pi-14', riskRefs: ['A.18'],        text: '¿Existen controles para prevenir el borrado masivo de datos (soft delete, versionado de objetos)?' },
    { id: 'pi-15', riskRefs: ['A.24'],        text: '¿El proveedor cloud dispone de mecanismos anti-DDoS documentados (ej. AWS Shield, Azure DDoS Protection)?' },
  ],

  'it-outsourcing': [
    { id: 'io-01', riskRefs: ['E.7'],         text: '¿Existe un responsable designado internamente para la supervisión y gestión del proveedor?' },
    { id: 'io-02', riskRefs: ['E.1'],         text: '¿El personal externo recibe formación sobre las políticas de seguridad de la organización?' },
    { id: 'io-03', riskRefs: ['E.2'],         text: '¿Existen procedimientos documentados que el proveedor debe seguir para las tareas de administración?' },
    { id: 'io-04', riskRefs: ['E.3'],         text: '¿Se realizan auditorías o revisiones periódicas de las actividades del proveedor?' },
    { id: 'io-05', riskRefs: ['E.19', 'A.19'], text: '¿El contrato incluye cláusulas de confidencialidad y protección de datos (NDA/DPA)?' },
    { id: 'io-06', riskRefs: ['E.28'],        text: '¿El contrato incluye cláusulas de continuidad y sustitución de personal clave del proveedor?' },
    { id: 'io-07', riskRefs: ['A.5'],         text: '¿Se exige autenticación multifactor (MFA) al personal externo para acceder a sistemas internos?' },
    { id: 'io-08', riskRefs: ['A.6', 'A.11'], text: '¿Los accesos del proveedor siguen el principio de mínimo privilegio y son revisados periódicamente?' },
    { id: 'io-09', riskRefs: ['A.7'],         text: '¿El contrato restringe expresamente el uso no autorizado de recursos y datos del cliente?' },
    { id: 'io-10', riskRefs: ['A.13'],        text: '¿Se mantienen registros de auditoría de todas las acciones realizadas por el personal externo?' },
    { id: 'io-11', riskRefs: ['A.28'],        text: '¿Existe un plan de contingencia documentado ante una ruptura de relación con el proveedor?' },
    { id: 'io-12', riskRefs: ['A.29'],        text: '¿El personal está formado en detección y reporte de intentos de extorsión o coacción?' },
    { id: 'io-13', riskRefs: ['A.30'],        text: '¿Existe formación y concienciación periódica sobre riesgos de ingeniería social y phishing?' },
  ],
};
