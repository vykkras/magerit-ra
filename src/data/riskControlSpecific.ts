/**
 * Mapeo específico Riesgo ↔ Control — una entrada por amenaza MAGERIT individual.
 *
 * A diferencia del mapeo por grupos (riskControlGroups.ts), aquí cada amenaza tiene
 * su propia lista de salvaguardas y su responsable (Cliente / Proveedor / Compartido).
 * Definición corporativa. El usuario puede editar los controles por riesgo
 * (persistido en riskControlStore).
 */

export type Responsable = 'Cliente' | 'Proveedor' | 'Compartido';

export interface SpecificRiskEntry {
  code: string;
  name: string;
  controls: string[];
  responsable: Responsable;
}

export const RISK_CONTROL_SPECIFIC: SpecificRiskEntry[] = [
  { code: 'A.5',  name: 'Suplantación de identidad del usuario', controls: ['Identificación y autenticación', 'Control de acceso lógico', 'Registro y auditoría', 'Protección del directorio'], responsable: 'Compartido' },
  { code: 'A.6',  name: 'Abuso de privilegios de acceso', controls: ['Control de acceso lógico', 'Segregación de tareas', 'Registro y auditoría', 'Análisis de logs'], responsable: 'Compartido' },
  { code: 'A.11', name: 'Acceso no autorizado', controls: ['Identificación y autenticación', 'Control de acceso lógico', 'IDS/IPS', 'Registro y auditoría'], responsable: 'Compartido' },
  { code: 'A.12', name: 'Análisis de tráfico', controls: ['Cifrado', 'Protección de comunicaciones', 'Monitorización de tráfico'], responsable: 'Proveedor' },
  { code: 'A.14', name: 'Interceptación de información', controls: ['Cifrado', 'Protección de comunicaciones', 'Protección correo electrónico'], responsable: 'Proveedor' },
  { code: 'A.19', name: 'Divulgación de información', controls: ['Cifrado', 'DLP', 'Protección de soportes', 'Auditoría'], responsable: 'Compartido' },
  { code: 'E.19', name: 'Fuga de información', controls: ['DLP', 'Auditoría', 'Protección correo electrónico'], responsable: 'Compartido' },
  { code: 'A.10', name: 'Alteración de secuencia', controls: ['Integridad', 'Firma electrónica', 'Timestamp', 'Auditoría'], responsable: 'Proveedor' },
  { code: 'E.10', name: 'Errores de secuencia', controls: ['Integridad', 'Gestión de cambios', 'Auditoría'], responsable: 'Compartido' },
  { code: 'A.15', name: 'Modificación deliberada de la información', controls: ['Integridad', 'Firma electrónica', 'Auditoría', 'Gestión de cambios'], responsable: 'Compartido' },
  { code: 'E.15', name: 'Alteración accidental de la información', controls: ['Integridad', 'Backup', 'Gestión de cambios'], responsable: 'Compartido' },
  { code: 'A.13', name: 'Repudio', controls: ['Registro y auditoría', 'Firma electrónica', 'Timestamp'], responsable: 'Proveedor' },
  { code: 'A.24', name: 'Denegación de servicio', controls: ['Protección de servicios', 'IDS/IPS', 'Continuidad de negocio'], responsable: 'Proveedor' },
  { code: 'E.24', name: 'Agotamiento de recursos', controls: ['Disponibilidad', 'Monitorización', 'Continuidad'], responsable: 'Proveedor' },
  { code: 'I.8',  name: 'Fallo de servicios de comunicaciones', controls: ['Continuidad', 'Disponibilidad', 'Gestión incidencias'], responsable: 'Proveedor' },
  { code: 'I.9',  name: 'Interrupción de suministros esenciales', controls: ['Continuidad', 'Recuperación ante desastres'], responsable: 'Proveedor' },
  { code: 'A.8',  name: 'Difusión de software dañino', controls: ['Antimalware', 'IDS/IPS', 'Gestión vulnerabilidades'], responsable: 'Compartido' },
  { code: 'E.8',  name: 'Difusión de software dañino', controls: ['Antimalware', 'Formación', 'Gestión vulnerabilidades'], responsable: 'Compartido' },
  { code: 'E.20', name: 'Vulnerabilidades software', controls: ['Gestión vulnerabilidades', 'Análisis vulnerabilidades', 'Hardening'], responsable: 'Compartido' },
  { code: 'E.21', name: 'Errores mantenimiento software', controls: ['Gestión cambios', 'Puesta en producción', 'Verificación seguridad'], responsable: 'Compartido' },
  { code: 'A.22', name: 'Manipulación de programas', controls: ['Protección aplicaciones', 'Gestión cambios', 'Auditoría'], responsable: 'Compartido' },
  { code: 'E.3',  name: 'Errores de monitorización', controls: ['Auditoría', 'Análisis de logs', 'Monitorización'], responsable: 'Compartido' },
  { code: 'E.4',  name: 'Errores de configuración', controls: ['Gestión cambios', 'Chequeo configuración', 'Hardening'], responsable: 'Compartido' },
  { code: 'A.3',  name: 'Manipulación de logs', controls: ['Registro y auditoría', 'Análisis de logs', 'Segregación tareas'], responsable: 'Proveedor' },
  { code: 'A.4',  name: 'Manipulación de configuración', controls: ['Gestión cambios', 'Auditoría', 'Segregación tareas'], responsable: 'Compartido' },
  { code: 'E.9',  name: 'Errores de reencaminamiento', controls: ['Protección comunicaciones', 'Monitorización tráfico'], responsable: 'Proveedor' },
  { code: 'A.9',  name: 'Reencaminamiento de mensajes', controls: ['Protección comunicaciones', 'IDS/IPS', 'Auditoría'], responsable: 'Proveedor' },
  { code: 'E.1',  name: 'Errores de usuarios', controls: ['Formación', 'Gestión incidencias'], responsable: 'Cliente' },
  { code: 'E.2',  name: 'Errores del administrador', controls: ['Formación', 'Segregación tareas', 'Gestión cambios'], responsable: 'Compartido' },
  { code: 'E.7',  name: 'Deficiencias organizativas', controls: ['Gestión personal', 'Formación', 'Continuidad'], responsable: 'Cliente' },
  { code: 'E.28', name: 'Indisponibilidad del personal', controls: ['Gestión personal', 'Continuidad', 'Contingencia'], responsable: 'Cliente' },
  { code: 'A.28', name: 'Indisponibilidad del personal', controls: ['Gestión personal', 'Continuidad', 'Contingencia'], responsable: 'Cliente' },
  { code: 'A.29', name: 'Extorsión', controls: ['Formación', 'Gestión incidencias', 'Auditoría'], responsable: 'Cliente' },
  { code: 'A.30', name: 'Ingeniería social', controls: ['Formación', 'MFA', 'Control acceso', 'Auditoría'], responsable: 'Compartido' },
  { code: 'I.10', name: 'Degradación soportes almacenamiento', controls: ['Protección soportes', 'Backup', 'Integridad'], responsable: 'Compartido' },
  { code: 'A.18', name: 'Destrucción información', controls: ['Backup', 'Integridad', 'Gestión incidencias'], responsable: 'Compartido' },
  { code: 'E.18', name: 'Destrucción información', controls: ['Backup', 'Integridad', 'Gestión incidencias'], responsable: 'Compartido' },
  { code: 'E.23', name: 'Errores mantenimiento hardware', controls: ['Inventario', 'Gestión cambios', 'Protección equipos'], responsable: 'Compartido' },
  { code: 'E.25', name: 'Pérdida de equipos', controls: ['Inventario', 'Protección física', 'Cifrado'], responsable: 'Compartido' },
  { code: 'A.23', name: 'Manipulación de equipos', controls: ['Protección física', 'Inventario', 'Auditoría'], responsable: 'Compartido' },
  { code: 'A.25', name: 'Robo', controls: ['Control acceso físico', 'Videovigilancia', 'Inventario'], responsable: 'Compartido' },
  { code: 'A.26', name: 'Ataque destructivo', controls: ['Protección instalaciones', 'Continuidad', 'DRP'], responsable: 'Proveedor' },
  { code: 'A.27', name: 'Ocupación enemiga', controls: ['Continuidad', 'Recuperación desastres'], responsable: 'Proveedor' },
  { code: 'N.1',  name: 'Fuego', controls: ['Protección instalaciones', 'Antiincendios', 'DRP'], responsable: 'Proveedor' },
  { code: 'I.1',  name: 'Fuego', controls: ['Protección instalaciones', 'Antiincendios', 'DRP'], responsable: 'Proveedor' },
  { code: 'N.2',  name: 'Daños por agua', controls: ['Protección instalaciones', 'Continuidad'], responsable: 'Proveedor' },
  { code: 'I.2',  name: 'Daños por agua', controls: ['Protección instalaciones', 'Continuidad'], responsable: 'Proveedor' },
  { code: 'N.*',  name: 'Desastres naturales', controls: ['Continuidad', 'DRP', 'Redundancia'], responsable: 'Proveedor' },
  { code: 'I.*',  name: 'Desastres industriales', controls: ['Continuidad', 'DRP', 'Redundancia'], responsable: 'Proveedor' },
  { code: 'I.3',  name: 'Contaminación mecánica', controls: ['Protección instalaciones', 'Monitorización ambiental'], responsable: 'Proveedor' },
  { code: 'I.4',  name: 'Contaminación electromagnética', controls: ['Protección electromagnética'], responsable: 'Proveedor' },
  { code: 'I.6',  name: 'Corte suministro eléctrico', controls: ['UPS', 'SAI', 'Redundancia eléctrica'], responsable: 'Proveedor' },
  { code: 'I.7',  name: 'Temperatura/Humedad inadecuada', controls: ['Climatización', 'Monitorización ambiental'], responsable: 'Proveedor' },
  { code: 'I.11', name: 'Emanaciones electromagnéticas', controls: ['Protección electromagnética'], responsable: 'Proveedor' },
  { code: 'I.5',  name: 'Avería física o lógica', controls: ['Protección equipos', 'Backup', 'Continuidad', 'Gestión incidencias'], responsable: 'Compartido' },
];
