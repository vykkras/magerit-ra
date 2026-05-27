// Questionnaires are sent to the person who requested the service.
// Each question evaluates whether the provider or the shared-responsibility
// controls are in place. Answers feed the risk analysis engine.
//
// riskRefs    → MAGERIT threat codes associated with the control being evaluated.
// safeguardRefs → ISO 27001:2022 control IDs (iso-X.Y) that the question covers.
//
// Responsibility matrix source: responsibilityMatrix.data.ts

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

export const CATEGORY_QUESTIONNAIRES: Record<string, Question[]> = {

  // ────────────────────────────────────────────────────────────────────────────
  // ADQUISICIÓN IT DE BAJO IMPACTO
  // Responsibility: client manages and operates the product. Questions validate
  // that the acquired product meets baseline security requirements the client
  // can verify before or shortly after purchase.
  // ────────────────────────────────────────────────────────────────────────────
  'low-impact-it': [
    // Organizational (5.x)
    {
      id: 'li-01',
      text: '¿El proveedor publica documentación sobre el ciclo de vida del producto (fechas de soporte, EOL/EOS)?',
      riskRefs: ['E.21', 'E.23'],
      safeguardRefs: ['iso-5.37'],
    },
    {
      id: 'li-02',
      text: '¿La solución adquirida cumple con la normativa de protección de datos aplicable (RGPD/LOPDGDD)?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-5.31'],
    },
    {
      id: 'li-03',
      text: '¿El proveedor dispone de un canal de soporte técnico con SLA de respuesta definido?',
      riskRefs: ['E.21', 'E.23'],
      safeguardRefs: ['iso-5.37'],
    },
    {
      id: 'li-04',
      text: '¿El proveedor notifica proactivamente vulnerabilidades críticas detectadas en el producto?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.8'],
    },
    {
      id: 'li-05',
      text: '¿La solución permite la exportación completa de los datos en formatos estándar al finalizar su uso?',
      riskRefs: ['E.18'],
      safeguardRefs: ['iso-5.29'],
    },
    // People (6.x)
    {
      id: 'li-06',
      text: '¿El proveedor proporciona documentación y materiales de formación para el uso seguro de la solución?',
      riskRefs: ['E.1', 'E.2'],
      safeguardRefs: ['iso-6.3'],
    },
    // Physical (7.x)
    {
      id: 'li-07',
      text: '¿La solución adquirida puede instalarse y operarse en el entorno físico controlado de la organización?',
      riskRefs: ['E.25', 'A.11'],
      safeguardRefs: ['iso-7.8', 'iso-7.9'],
    },
    // Technical (8.x)
    {
      id: 'li-08',
      text: '¿La solución incorpora mecanismos de autenticación para el acceso de usuarios (contraseña, MFA)?',
      riskRefs: ['A.5', 'A.11'],
      safeguardRefs: ['iso-5.16'],
    },
    {
      id: 'li-09',
      text: '¿La solución permite gestionar permisos de acceso diferenciados por usuario o rol?',
      riskRefs: ['A.6'],
      safeguardRefs: ['iso-5.15', 'iso-5.18'],
    },
    {
      id: 'li-10',
      text: '¿La solución admite la generación o exportación de registros de actividad (logs) para auditoría?',
      riskRefs: ['E.3', 'A.13'],
      safeguardRefs: ['iso-8.15'],
    },
    {
      id: 'li-11',
      text: '¿La solución permite aplicar actualizaciones y parches de seguridad de forma controlada?',
      riskRefs: ['E.20', 'E.21'],
      safeguardRefs: ['iso-8.8'],
    },
    {
      id: 'li-12',
      text: '¿La información gestionada por la solución se almacena cifrada en el dispositivo o sistema?',
      riskRefs: ['A.14', 'A.19'],
      safeguardRefs: ['iso-8.24'],
    },
    {
      id: 'li-13',
      text: '¿La solución incorpora configuraciones seguras por defecto y no expone servicios innecesarios?',
      riskRefs: ['E.4', 'A.4'],
      safeguardRefs: ['iso-8.9'],
    },
    {
      id: 'li-14',
      text: '¿La solución incluye mecanismos de copia de seguridad o puede integrarse con sistemas de backup corporativos?',
      riskRefs: ['E.18', 'I.5'],
      safeguardRefs: ['iso-8.13'],
    },
    {
      id: 'li-15',
      text: '¿La solución permite la eliminación segura e irreversible de los datos al finalizar su uso?',
      riskRefs: ['E.19', 'A.19'],
      safeguardRefs: ['iso-8.10'],
    },
    {
      id: 'li-16',
      text: '¿Se ha verificado que la solución no presenta vulnerabilidades conocidas graves (CVE críticos) antes de su adquisición?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.8'],
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // SaaS – Aplicación estándar gestionada por proveedor
  // Provider responsibility: physical, infrastructure, platform, development.
  // Shared: identity, access, monitoring, incident response.
  // Questions verify provider security posture and what the client can rely on.
  // ────────────────────────────────────────────────────────────────────────────
  'saas': [
    // Organizational (5.x)
    {
      id: 'ss-01',
      text: '¿El proveedor SaaS dispone de certificaciones de seguridad reconocidas (ISO 27001, SOC 2, ENS)?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-5.35'],
    },
    {
      id: 'ss-02',
      text: '¿El proveedor especifica contractualmente cómo gestiona, protege y elimina los datos del cliente?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-5.19', 'iso-5.20'],
    },
    {
      id: 'ss-03',
      text: '¿El proveedor dispone de un proceso formal de gestión y notificación de incidentes de seguridad al cliente?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.24', 'iso-5.26'],
    },
    {
      id: 'ss-04',
      text: '¿El proveedor garantiza niveles de disponibilidad del servicio mediante SLA formalmente definidos?',
      riskRefs: ['I.8', 'A.24'],
      safeguardRefs: ['iso-5.29'],
    },
    {
      id: 'ss-05',
      text: '¿El proveedor dispone de un plan de continuidad de negocio y recuperación ante desastres (BCP/DRP)?',
      riskRefs: ['I.5', 'I.8'],
      safeguardRefs: ['iso-5.29', 'iso-5.30'],
    },
    {
      id: 'ss-06',
      text: '¿El proveedor informa sobre sus subcontratistas o procesadores de datos que acceden a la información del cliente?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-5.21', 'iso-5.22'],
    },
    {
      id: 'ss-07',
      text: '¿El servicio contempla mecanismos de exportación y portabilidad de datos al finalizar el contrato?',
      riskRefs: ['E.18'],
      safeguardRefs: ['iso-5.29'],
    },
    // People (6.x)
    {
      id: 'ss-08',
      text: '¿El proveedor verifica antecedentes del personal con acceso a los sistemas que alojan datos del cliente?',
      riskRefs: ['A.5', 'A.6'],
      safeguardRefs: ['iso-6.1'],
    },
    {
      id: 'ss-09',
      text: '¿El personal del proveedor con acceso a datos del cliente firma acuerdos de confidencialidad?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-6.6'],
    },
    // Physical (7.x)
    {
      id: 'ss-10',
      text: '¿La infraestructura del proveedor está alojada en centros de datos con controles físicos certificados (Tier III/IV)?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-7.1', 'iso-7.3'],
    },
    {
      id: 'ss-11',
      text: '¿El proveedor dispone de sistemas de alimentación ininterrumpida (SAI) y generadores en sus instalaciones?',
      riskRefs: ['I.5'],
      safeguardRefs: ['iso-7.11'],
    },
    // Technical (8.x)
    {
      id: 'ss-12',
      text: '¿El servicio SaaS incorpora autenticación multifactor (MFA)?',
      riskRefs: ['A.5', 'A.11'],
      safeguardRefs: ['iso-5.16'],
    },
    {
      id: 'ss-13',
      text: '¿El servicio permite gestionar permisos de acceso basados en roles (RBAC) de forma granular?',
      riskRefs: ['A.6'],
      safeguardRefs: ['iso-5.15', 'iso-5.18'],
    },
    {
      id: 'ss-14',
      text: '¿La información almacenada y en tránsito en el servicio se cifra mediante estándares robustos (AES-256, TLS 1.2+)?',
      riskRefs: ['A.14', 'A.19'],
      safeguardRefs: ['iso-8.24'],
    },
    {
      id: 'ss-15',
      text: '¿El servicio genera registros de acceso y actividad accesibles para el cliente con fines de auditoría?',
      riskRefs: ['A.13', 'E.3'],
      safeguardRefs: ['iso-8.15'],
    },
    {
      id: 'ss-16',
      text: '¿El proveedor gestiona activamente las vulnerabilidades técnicas de la plataforma y aplica parches de forma oportuna?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.8'],
    },
    {
      id: 'ss-17',
      text: '¿El proveedor realiza pruebas de penetración periódicas sobre la plataforma y comparte los resultados?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.29', 'iso-5.35'],
    },
    {
      id: 'ss-18',
      text: '¿El servicio incorpora protección activa contra ataques de denegación de servicio (DDoS)?',
      riskRefs: ['A.24'],
      safeguardRefs: ['iso-8.20', 'iso-8.14'],
    },
    {
      id: 'ss-19',
      text: '¿El proveedor realiza copias de seguridad periódicas y permite la recuperación de datos ante pérdidas?',
      riskRefs: ['E.18', 'I.5'],
      safeguardRefs: ['iso-8.13'],
    },
    {
      id: 'ss-20',
      text: '¿El servicio permite revocar accesos de usuarios de forma inmediata y sin dependencia del proveedor?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-5.18'],
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // SaaS CON IA – Aplicación SaaS con capacidades cognitivas
  // All SaaS controls apply plus AI-specific: data governance for model input,
  // transparency of AI processing, adversarial attack controls, regulatory
  // compliance (EU AI Act), and AI output oversight.
  // ────────────────────────────────────────────────────────────────────────────
  'saas-ai': [
    // Organizational (5.x)
    {
      id: 'sa-01',
      text: '¿El proveedor dispone de certificaciones de seguridad reconocidas (ISO 27001, SOC 2) para la plataforma de IA?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-5.35'],
    },
    {
      id: 'sa-02',
      text: '¿El proveedor especifica contractualmente si los datos enviados al modelo de IA se usan para su entrenamiento?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-5.19', 'iso-5.20'],
    },
    {
      id: 'sa-03',
      text: '¿El proveedor garantiza que los datos del cliente permanecen aislados y no son accesibles a otros usuarios del servicio?',
      riskRefs: ['A.19', 'E.19'],
      safeguardRefs: ['iso-5.19', 'iso-8.22'],
    },
    {
      id: 'sa-04',
      text: '¿El proveedor dispone de un proceso formal de notificación de incidentes de seguridad y brechas de datos?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.24', 'iso-5.26'],
    },
    {
      id: 'sa-05',
      text: '¿El proveedor garantiza disponibilidad del servicio de IA mediante SLA formalmente definidos?',
      riskRefs: ['I.8', 'A.24'],
      safeguardRefs: ['iso-5.29', 'iso-5.30'],
    },
    {
      id: 'sa-06',
      text: '¿El proveedor declara el cumplimiento con el Reglamento Europeo de IA (EU AI Act) y la normativa de protección de datos?',
      riskRefs: [],
      safeguardRefs: ['iso-5.31'],
    },
    {
      id: 'sa-07',
      text: '¿El proveedor informa de forma transparente sobre el modelo de IA utilizado, su versión y sus limitaciones?',
      riskRefs: ['A.30'],
      safeguardRefs: ['iso-5.19'],
    },
    // People (6.x)
    {
      id: 'sa-08',
      text: '¿El personal del proveedor con acceso a datos del cliente firma acuerdos de confidencialidad específicos para entornos de IA?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-6.6'],
    },
    {
      id: 'sa-09',
      text: '¿El proveedor forma a su personal en el uso ético y seguro de los modelos de IA que desarrolla u opera?',
      riskRefs: ['E.1', 'E.2'],
      safeguardRefs: ['iso-6.3'],
    },
    // Physical (7.x)
    {
      id: 'sa-10',
      text: '¿La infraestructura que soporta el modelo de IA está alojada en centros de datos con controles físicos certificados?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-7.1', 'iso-7.3'],
    },
    // Technical (8.x)
    {
      id: 'sa-11',
      text: '¿La solución de IA incorpora autenticación multifactor (MFA) y controles de acceso granulares por rol?',
      riskRefs: ['A.5', 'A.6', 'A.11'],
      safeguardRefs: ['iso-5.16', 'iso-5.18'],
    },
    {
      id: 'sa-12',
      text: '¿La plataforma permite limitar o filtrar qué información sensible puede enviarse al modelo de IA (DLP a nivel de prompt)?',
      riskRefs: ['E.14', 'E.19', 'A.19'],
      safeguardRefs: ['iso-8.11', 'iso-8.12'],
    },
    {
      id: 'sa-13',
      text: '¿La plataforma registra las interacciones de los usuarios con la IA (prompts y respuestas) para su auditoría?',
      riskRefs: ['A.13'],
      safeguardRefs: ['iso-8.15'],
    },
    {
      id: 'sa-14',
      text: '¿Existe un mecanismo de supervisión humana o revisión de los resultados generados por la IA antes de su uso?',
      riskRefs: ['E.15'],
      safeguardRefs: ['iso-8.29'],
    },
    {
      id: 'sa-15',
      text: '¿La solución monitoriza usos anómalos o abusos de las capacidades de IA (prompt injection, jailbreaking)?',
      riskRefs: ['A.30', 'A.15'],
      safeguardRefs: ['iso-8.16'],
    },
    {
      id: 'sa-16',
      text: '¿El proveedor aplica controles técnicos contra ataques adversariales y manipulación del modelo?',
      riskRefs: ['A.15', 'A.22'],
      safeguardRefs: ['iso-8.28'],
    },
    {
      id: 'sa-17',
      text: '¿La información en tránsito hacia el modelo de IA y en reposo se cifra mediante estándares robustos?',
      riskRefs: ['A.14', 'A.19'],
      safeguardRefs: ['iso-8.24'],
    },
    {
      id: 'sa-18',
      text: '¿El proveedor realiza pruebas de seguridad específicas para IA (red-teaming) y comparte los resultados?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.29', 'iso-5.35'],
    },
    {
      id: 'sa-19',
      text: '¿La solución permite desactivar o restringir las funcionalidades de IA de forma controlada sin afectar al resto del servicio?',
      riskRefs: ['A.7'],
      safeguardRefs: ['iso-8.9'],
    },
    {
      id: 'sa-20',
      text: '¿El proveedor gestiona activamente las vulnerabilidades técnicas de la plataforma que soporta la IA?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.8'],
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // PaaS / IaaS – Plataforma o infraestructura cloud
  // Provider: physical layer, hypervisor, base network, power/cooling.
  // Shared: network config, OS-level monitoring, identity.
  // Client: OS, applications, data, app-level network rules.
  // Questions verify provider security posture at infrastructure level.
  // ────────────────────────────────────────────────────────────────────────────
  'paas-iaas': [
    // Organizational (5.x)
    {
      id: 'pi-01',
      text: '¿El proveedor cloud cuenta con certificaciones de seguridad reconocidas (ISO 27001, CSA STAR, ENS Alto)?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-5.35'],
    },
    {
      id: 'pi-02',
      text: '¿El proveedor dispone de un proceso formal de notificación de incidentes de seguridad al cliente con plazos definidos?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.24', 'iso-5.26'],
    },
    {
      id: 'pi-03',
      text: '¿El proveedor define contractualmente el modelo de responsabilidad compartida y sus límites?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.19', 'iso-5.20'],
    },
    {
      id: 'pi-04',
      text: '¿El proveedor garantiza niveles de disponibilidad de la infraestructura mediante SLA con penalizaciones?',
      riskRefs: ['I.5', 'I.6', 'I.8'],
      safeguardRefs: ['iso-5.29', 'iso-8.14'],
    },
    {
      id: 'pi-05',
      text: '¿El proveedor informa sobre sus subcontratistas de infraestructura y las regiones donde se alojan los datos?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-5.21', 'iso-5.22'],
    },
    {
      id: 'pi-06',
      text: '¿El proveedor gestiona activamente las vulnerabilidades de la capa de hipervisor e infraestructura base?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.8'],
    },
    {
      id: 'pi-07',
      text: '¿El proveedor publica informes de cumplimiento (SOC 2 Type II, pen tests) accesibles para clientes bajo NDA?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-5.35', 'iso-8.29'],
    },
    // People (6.x)
    {
      id: 'pi-08',
      text: '¿El proveedor verifica antecedentes del personal con acceso físico o privilegiado a la infraestructura compartida?',
      riskRefs: ['A.5', 'A.6'],
      safeguardRefs: ['iso-6.1'],
    },
    {
      id: 'pi-09',
      text: '¿El personal del proveedor con acceso a infraestructura compartida firma acuerdos de confidencialidad?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-6.6'],
    },
    // Physical (7.x)
    {
      id: 'pi-10',
      text: '¿Los centros de datos del proveedor disponen de controles de acceso físico certificados (biometría, guardas, CCTV)?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-7.1', 'iso-7.2', 'iso-7.3'],
    },
    {
      id: 'pi-11',
      text: '¿El proveedor dispone de protección frente a amenazas físicas y ambientales (incendio, inundación, temperatura)?',
      riskRefs: ['I.5'],
      safeguardRefs: ['iso-7.5', 'iso-7.11'],
    },
    {
      id: 'pi-12',
      text: '¿El proveedor garantiza suministro eléctrico ininterrumpido (SAI y generadores) en sus centros de datos?',
      riskRefs: ['I.6', 'I.5'],
      safeguardRefs: ['iso-7.11'],
    },
    // Technical (8.x)
    {
      id: 'pi-13',
      text: '¿La consola de administración del proveedor requiere autenticación multifactor (MFA) obligatoria?',
      riskRefs: ['A.5'],
      safeguardRefs: ['iso-5.16'],
    },
    {
      id: 'pi-14',
      text: '¿La plataforma permite la segmentación de red mediante redes virtuales privadas (VPC/VNet) con control granular?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-8.22'],
    },
    {
      id: 'pi-15',
      text: '¿El proveedor garantiza la separación lógica de los entornos de diferentes clientes (aislamiento multi-tenant)?',
      riskRefs: ['A.11', 'A.4'],
      safeguardRefs: ['iso-8.22'],
    },
    {
      id: 'pi-16',
      text: '¿La plataforma cifra los datos almacenados y en tránsito mediante estándares robustos con gestión de claves del cliente?',
      riskRefs: ['A.14', 'A.19'],
      safeguardRefs: ['iso-8.24'],
    },
    {
      id: 'pi-17',
      text: '¿El proveedor ofrece herramientas nativas de gestión de logs y eventos de seguridad (SIEM/SIEM-ready)?',
      riskRefs: ['E.3'],
      safeguardRefs: ['iso-8.15', 'iso-8.16'],
    },
    {
      id: 'pi-18',
      text: '¿La plataforma incluye protección nativa contra ataques DDoS y permite configurar reglas de firewall?',
      riskRefs: ['A.24'],
      safeguardRefs: ['iso-8.20', 'iso-8.14'],
    },
    {
      id: 'pi-19',
      text: '¿El proveedor ofrece herramientas de gestión de configuración segura y detección de desviaciones (CSPM)?',
      riskRefs: ['E.4'],
      safeguardRefs: ['iso-8.9'],
    },
    {
      id: 'pi-20',
      text: '¿La plataforma ofrece opciones de backup gestionado y recuperación ante desastres (DR) en regiones geográficas distintas?',
      riskRefs: ['I.5', 'E.18', 'E.9'],
      safeguardRefs: ['iso-8.13', 'iso-8.14'],
    },
  ],

  // ────────────────────────────────────────────────────────────────────────────
  // IT OUTSOURCING – Externalización de procesos o infraestructura
  // Provider operates IT on behalf of client. Provider has high operational
  // responsibility; client retains governance, policy and oversight.
  // Questions verify provider's operational security and governance maturity.
  // ────────────────────────────────────────────────────────────────────────────
  'it-outsourcing': [
    // Organizational (5.x)
    {
      id: 'io-01',
      text: '¿El proveedor dispone de una política de seguridad de la información documentada, aprobada por la dirección y vigente?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.1', 'iso-5.2'],
    },
    {
      id: 'io-02',
      text: '¿Las responsabilidades de seguridad del proveedor están definidas formalmente en el contrato y los SLA?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.2', 'iso-5.20'],
    },
    {
      id: 'io-03',
      text: '¿El proveedor dispone de un proceso formal de gestión y notificación de incidentes de seguridad con plazos contractuales?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.24', 'iso-5.26', 'iso-5.27'],
    },
    {
      id: 'io-04',
      text: '¿El proveedor dispone de un plan de continuidad de negocio (BCP) y recuperación ante desastres (DRP) probado periódicamente?',
      riskRefs: ['E.28', 'I.5'],
      safeguardRefs: ['iso-5.29', 'iso-5.30'],
    },
    {
      id: 'io-05',
      text: '¿Los subcontratistas del proveedor están sujetos a los mismos requisitos de seguridad que el proveedor principal?',
      riskRefs: ['A.28', 'A.29'],
      safeguardRefs: ['iso-5.21', 'iso-5.22'],
    },
    {
      id: 'io-06',
      text: '¿Se realizan auditorías de seguridad periódicas (internas o externas) sobre los servicios externalizados?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.35', 'iso-5.22'],
    },
    {
      id: 'io-07',
      text: '¿El proveedor cuenta con certificaciones de seguridad reconocidas (ISO 27001, ENS, SOC 2)?',
      riskRefs: ['E.7'],
      safeguardRefs: ['iso-5.35'],
    },
    {
      id: 'io-08',
      text: '¿El proveedor dispone de indicadores de seguridad (KPIs/KRIs) que reporta periódicamente al cliente?',
      riskRefs: ['E.3'],
      safeguardRefs: ['iso-5.22', 'iso-8.16'],
    },
    {
      id: 'io-09',
      text: '¿El proveedor tiene procedimientos documentados para cada proceso crítico externalizado?',
      riskRefs: ['E.2'],
      safeguardRefs: ['iso-5.37'],
    },
    // People (6.x)
    {
      id: 'io-10',
      text: '¿El proveedor verifica antecedentes del personal que accede a sistemas o datos del cliente?',
      riskRefs: ['A.5', 'A.6'],
      safeguardRefs: ['iso-6.1'],
    },
    {
      id: 'io-11',
      text: '¿El personal del proveedor con acceso a datos del cliente ha firmado acuerdos de confidencialidad?',
      riskRefs: ['A.19'],
      safeguardRefs: ['iso-6.6'],
    },
    {
      id: 'io-12',
      text: '¿El proveedor forma y conciencia a su personal en seguridad de la información de forma periódica?',
      riskRefs: ['E.1', 'E.2'],
      safeguardRefs: ['iso-6.3'],
    },
    // Physical (7.x)
    {
      id: 'io-13',
      text: '¿El proveedor aplica controles de acceso físico en las instalaciones donde opera los sistemas del cliente?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-7.1', 'iso-7.2'],
    },
    {
      id: 'io-14',
      text: '¿Las instalaciones del proveedor disponen de protección frente a amenazas físicas y ambientales?',
      riskRefs: ['I.5'],
      safeguardRefs: ['iso-7.5', 'iso-7.11'],
    },
    // Technical (8.x)
    {
      id: 'io-15',
      text: '¿El proveedor emplea autenticación reforzada (MFA) para acceder a los sistemas del cliente?',
      riskRefs: ['A.5'],
      safeguardRefs: ['iso-5.16'],
    },
    {
      id: 'io-16',
      text: '¿El proveedor aplica el principio de mínimo privilegio: el personal solo accede a lo estrictamente necesario?',
      riskRefs: ['A.6'],
      safeguardRefs: ['iso-5.15', 'iso-5.18'],
    },
    {
      id: 'io-17',
      text: '¿Existe trazabilidad completa y auditable de todas las acciones realizadas por el personal del proveedor en los sistemas?',
      riskRefs: ['A.13'],
      safeguardRefs: ['iso-8.15'],
    },
    {
      id: 'io-18',
      text: '¿Existe un proceso formal y rápido de revocación de accesos del personal del proveedor al finalizar el contrato o en caso de incidente?',
      riskRefs: ['A.11'],
      safeguardRefs: ['iso-5.18'],
    },
    {
      id: 'io-19',
      text: '¿El proveedor gestiona activamente las vulnerabilidades técnicas de los sistemas que opera para el cliente?',
      riskRefs: ['E.20'],
      safeguardRefs: ['iso-8.8'],
    },
    {
      id: 'io-20',
      text: '¿El proveedor realiza copias de seguridad periódicas y ha probado los procedimientos de restauración?',
      riskRefs: ['E.19', 'E.28'],
      safeguardRefs: ['iso-8.13'],
    },
    {
      id: 'io-21',
      text: '¿El proveedor aplica protección antimalware actualizada en todos los sistemas que opera para el cliente?',
      riskRefs: ['E.1', 'E.2'],
      safeguardRefs: ['iso-8.7'],
    },
    {
      id: 'io-22',
      text: '¿El proveedor segmenta la red de forma que los sistemas del cliente estén aislados de otros entornos?',
      riskRefs: ['A.11', 'A.30'],
      safeguardRefs: ['iso-8.22'],
    },
  ],

};
