/**
 * Contenido del Informe de Evaluación, Análisis de Riesgo y recomendación de
 * Solicitud Proveedor-Servicio ICT.
 *
 * Combina las secciones estáticas de la plantilla corporativa (introducción,
 * metodología MAINS, documentos de referencia) con los generadores dinámicos
 * de la RESOLUCIÓN para los tres resultados posibles:
 *   ok            → Recomendado
 *   ok-condiciones → Recomendado con plan de acción del proveedor
 *   ko            → No recomendado
 */

import type { ResultadoEval } from '../store/solicitudStore';

// ── Propiedades del documento ───────────────────────────────────────────────

export const DOC_PROPS = {
  nombre: 'Informe de Evaluación, Análisis de Riesgo y recomendación de Solicitud Proveedor-Servicio ICT',
  tipo: 'Informe',
  resumen: 'Evaluación para la recomendación de un servicio en el entorno corporativo a través del análisis de riesgos elaborado con la metodología MAINS.',
  propietario: 'Gerencia de Gestión de Riesgos Ciberseguridad y Cumplimiento',
  clasificacion: 'INTERNA',
  elaboradoPor: 'Oficina Técnica de Seguridad',
  revisadoPor: 'Gerencia de Gestión de Riesgos Ciberseguridad y Cumplimiento',
  aprobadoPor: 'Director Corporativo Infraestructura, Comunicaciones y Ciberseguridad',
};

export const DOCUMENTOS_REFERENCIA = [
  'UNE-ISO/IEC 27001: Estándar internacional que establece los requisitos para implantar, mantener y mejorar un Sistema de Gestión de Seguridad de la Información (SGSI), garantizando la confidencialidad, integridad y disponibilidad de la información.',
  'Reglamento General de Protección de Datos (RGPD): Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo de 27 de abril de 2016.',
  'MAGERIT: Metodología española para el análisis y gestión de riesgos de los sistemas de información.',
];

export const TERMINOS_DEFINICIONES = [
  'ISO/IEC 27001: Tecnología de la información. Técnicas de seguridad. Visión de conjunto y vocabulario.',
  'MAGERIT: Metodología española para el análisis y gestión de riesgos de los sistemas de información.',
];

export const VIGENCIA_PARRAFOS = [
  'La aprobación y publicación de la versión 1.0 o posteriores de este documento expresa el respaldo de la Organización a su contenido. Las versiones anteriores que hayan podido distribuirse constituyen borradores o versiones obsoletas, por lo que su vigencia queda anulada por la última versión de este documento. En cualquier caso, todas las referencias documentales, con información referente a versiones, modificaciones, etc., aparecen descritas en esta ficha de versiones.',
  'En el caso de conflicto con otras normas o procedimientos de seguridad vigentes, será la opción más restrictiva la que prevalezca.',
];

export const INDICE = [
  { n: '1', t: 'Introducción', sub: [
    { n: '1.1', t: 'Objetivo' },
    { n: '1.2', t: 'Documentos para consulta' },
    { n: '1.3', t: 'Términos y Definiciones' },
  ] },
  { n: '2', t: 'Metodología utilizada para la evaluación del impacto y análisis de riesgos', sub: [] },
  { n: '3', t: 'Resultados', sub: [] },
  { n: '4', t: 'Resolución', sub: [] },
];

export const METODOLOGIA_PARRAFOS = [
  'La evaluación del impacto y el análisis de riesgos de soluciones tecnológicas se realiza siguiendo la Metodología de Análisis e Implantación de Nuevas Soluciones (MAINS), orientada a identificar, analizar y valorar los riesgos asociados a su adopción en el entorno de la organización. Esta metodología se aplica de forma homogénea a todas las solicitudes de proveedor-servicio ICT y tiene como objetivo principal analizar su impacto desde la perspectiva de la seguridad de la información, el cumplimiento normativo y la gestión del riesgo, tomando como referencia los principios de la norma ISO/IEC 27001 y el modelo de amenazas definido en MAGERIT.',
  'El proceso de evaluación comienza con la categorización de la solución, cuyo objetivo es identificar el tipo de servicio tecnológico a evaluar. En esta fase, la solución se clasifica en una de las siguientes categorías: adquisición de IT de bajo impacto, soluciones SaaS, soluciones SaaS con capacidades de inteligencia artificial, servicios PaaS/IaaS o servicios de IT outsourcing. Esta clasificación permite establecer el marco de análisis aplicable en las fases posteriores, sin implicar en sí misma una valoración de riesgo, sino únicamente la tipología de la solución.',
  'A partir de esta categorización, se procede a la ejecución de un cuestionario avanzado basado en preguntas cerradas de tipo sí/no, orientado a evaluar el grado de cumplimiento de los controles de seguridad definidos en la norma ISO/IEC 27001. Cada una de las categorías cuenta con su cuestionario avanzado específico. Estos cuestionarios permiten verificar si la solución dispone de las medidas necesarias para mitigar las amenazas identificadas según MAGERIT, así como para garantizar la confidencialidad, integridad y disponibilidad de la información.',
  'De forma complementaria, en el caso de tratarse de un proveedor de nueva contratación, se facilita al proveedor un cuestionario específico orientado a evaluar su nivel de madurez en materia de seguridad de la información. Este análisis permite evaluar aspectos como el gobierno de la seguridad, la gestión de riesgos, la implantación de controles, la capacidad de respuesta ante incidentes y el grado de alineamiento con estándares y buenas prácticas.',
  'Sobre la base de la información obtenida en las fases anteriores, se lleva a cabo el análisis y valoración de los riesgos conforme a la metodología de gestión de riesgos MAINS, aplicada de manera homogénea a todos los activos corporativos. En este proceso, la solución se trata como un activo tecnológico, valorándose los riesgos en función de su impacto potencial y su probabilidad, teniendo en cuenta tanto las amenazas identificadas según MAGERIT como los controles existentes, tanto los propios de la solución como los controles técnicos y organizativos corporativos.',
  'Finalmente, los resultados del proceso se consolidan en el presente informe de evaluación, que recoge las conclusiones relativas al nivel de riesgo de la solución, el grado de cumplimiento de los controles de seguridad y el nivel de madurez del proveedor. En función del nivel de riesgo residual obtenido, se establece una decisión final sobre la idoneidad de la solución, que puede clasificarse como: Recomendado, cuando el riesgo residual se sitúa en niveles bajos y es aceptable conforme a los criterios corporativos; Recomendado con plan de acción al proveedor, cuando se identifican riesgos que requieren la implantación de medidas correctivas específicas por parte del proveedor; o No recomendado, cuando el nivel de riesgo no resulta aceptable.',
];

// ── RESOLUCIÓN: títulos y conclusiones dinámicas ────────────────────────────

export interface ResolucionContext {
  solucion: string;
  proveedor: string;
  /** % de cumplimiento del cuestionario avanzado (0-100) */
  compliance: number | null;
  /** Puntuación TPRM del proveedor (0-100) */
  tprm: number | null;
  /** Riesgos residuales en zona alta + muy alta (a tratar) */
  riesgosATratar: number;
  /** Total de riesgos evaluados */
  totalRiesgos: number;
  /** Salvaguardas pendientes (respuestas "No" del proveedor), sin duplicar */
  salvaguardasPendientes: string[];
}

export interface ResolucionTexto {
  titulo: string;
  parrafos: string[];
  /** Lista de acciones para el caso "con plan de acción" */
  acciones?: string[];
}

const RESOL_TITULO: Record<Exclude<ResultadoEval, null>, string> = {
  'ok': 'Recomendado',
  'ok-condiciones': 'Recomendado con plan de acción del proveedor',
  'ko': 'No recomendado',
};

export function resolucionTitulo(r: ResultadoEval): string {
  return r ? RESOL_TITULO[r] : '—';
}

const fb = (v: string) => v?.trim() || 'la solución';
const fbProv = (v: string) => v?.trim() || 'el proveedor';

function cumplimientoFrase(ctx: ResolucionContext): string {
  const parts: string[] = [];
  if (ctx.compliance !== null) parts.push(`un grado de cumplimiento del ${ctx.compliance}% sobre los controles de seguridad evaluados`);
  if (ctx.tprm !== null) parts.push(`una puntuación de madurez del proveedor de ${ctx.tprm}/100`);
  if (parts.length === 0) return '';
  return ` La evaluación arroja ${parts.join(' y ')}.`;
}

/** Genera el texto de la RESOLUCIÓN según el resultado seleccionado. */
export function buildResolucion(resultado: ResultadoEval, ctx: ResolucionContext): ResolucionTexto {
  const sol = fb(ctx.solucion);
  const prov = fbProv(ctx.proveedor);

  if (resultado === 'ok') {
    return {
      titulo: RESOL_TITULO.ok,
      parrafos: [
        `Tras analizar la solicitud de uso de ${sol}, evaluar la funcionalidad y el objetivo que se pretende cubrir, y realizar la correspondiente evaluación de impacto y análisis de riesgos conforme a la metodología corporativa MAINS, se ha valorado favorablemente su adopción en el entorno corporativo.`,
        `La evaluación ha tenido en cuenta, entre otros aspectos, las características y limitaciones de la solución, el modelo de gestión de la información asociado a su uso, así como los riesgos identificados en materia de seguridad de la información, cumplimiento normativo y gestión de riesgos. Dicho análisis se ha apoyado en la valoración de riesgos realizada con la metodología MAINS, considerando igualmente el nivel de control y protección proporcionado por los mecanismos de seguridad corporativos.${cumplimientoFrase(ctx)}`,
        `No se han identificado riesgos residuales relevantes que impidan la adopción de ${sol}. El nivel de riesgo residual obtenido se sitúa en valores aceptables conforme a los criterios corporativos, y los controles existentes —tanto los propios de la solución como los técnicos y organizativos de la organización— proporcionan una mitigación adecuada de las amenazas identificadas.`,
        `En consecuencia, se resuelve recomendar el uso de ${sol} para los fines analizados en el presente informe, sin perjuicio de las revisiones periódicas que correspondan conforme a los procedimientos de gestión de riesgos de la organización.`,
      ],
    };
  }

  if (resultado === 'ok-condiciones') {
    const acciones = ctx.salvaguardasPendientes.length > 0
      ? ctx.salvaguardasPendientes
      : ['Subsanar las salvaguardas pendientes identificadas durante el análisis de riesgos.'];
    return {
      titulo: RESOL_TITULO['ok-condiciones'],
      parrafos: [
        `Tras analizar la solicitud de uso de ${sol}, evaluar la funcionalidad y el objetivo que se pretende cubrir, y realizar la correspondiente evaluación de impacto y análisis de riesgos conforme a la metodología corporativa MAINS, se ha valorado favorablemente su adopción de forma condicionada a la ejecución de un plan de acción por parte de ${prov}.`,
        `La evaluación ha tenido en cuenta, entre otros aspectos, las características y limitaciones de la solución, el modelo de gestión de la información asociado a su uso, así como los riesgos identificados en materia de seguridad de la información, cumplimiento normativo y gestión de riesgos.${cumplimientoFrase(ctx)}`,
        `Si bien el nivel de riesgo residual resulta gestionable, se han identificado ${ctx.riesgosATratar} ${ctx.riesgosATratar === 1 ? 'riesgo que requiere' : 'riesgos que requieren'} la implantación de medidas correctivas específicas por parte de ${prov} antes de su despliegue, o en un plazo acordado tras el mismo. La aprobación queda por tanto supeditada al cumplimiento del siguiente plan de acción:`,
      ],
      acciones,
    };
  }

  // ko — No recomendado
  return {
    titulo: RESOL_TITULO.ko,
    parrafos: [
      `Tras analizar la solicitud de uso de ${sol}, evaluar la funcionalidad y el objetivo que se pretende cubrir, y realizar la correspondiente evaluación de impacto y análisis de riesgos conforme a la metodología corporativa MAINS, se ha valorado desfavorablemente su adopción en el entorno corporativo.`,
      `La evaluación ha tenido en cuenta, entre otros aspectos, las características y limitaciones de la solución, el modelo de gestión de la información asociado a su uso, así como los riesgos identificados en materia de seguridad de la información, cumplimiento normativo y gestión de riesgos. Dicho análisis se ha apoyado en la valoración de riesgos realizada con la metodología MAINS, considerando igualmente el nivel de control y protección proporcionado por los mecanismos de seguridad corporativos.${cumplimientoFrase(ctx)}`,
      `Se considera que el uso de ${sol} no resulta recomendable en el entorno corporativo, al haberse identificado ${ctx.riesgosATratar} ${ctx.riesgosATratar === 1 ? 'riesgo relevante' : 'riesgos relevantes'} en materia de seguridad de la información y control de los datos que no se alinean con los estándares y políticas de la organización.`,
      `Si bien la solución puede presentar capacidades avanzadas y un rendimiento superior en determinadas tareas frente a otras soluciones autorizadas para uso corporativo, dicha ventaja funcional no compensa los riesgos asociados a su modelo de gestión de la información, que incluyen, entre otros aspectos, la posibilidad de acceso no autorizado a datos sensibles, modificación no autorizada de datos y caídas del servicio o indisponibilidad prolongada. Estas circunstancias impiden garantizar un nivel de seguridad y control acorde con los requisitos corporativos.`,
      `En consecuencia, se resuelve no recomendar el uso de ${sol} para los fines analizados en el presente informe.`,
    ],
  };
}
