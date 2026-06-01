/**
 * Generación del Informe de Evaluación como documento Word (.docx).
 * La cabecera (logos + título + versión) se define como Header de sección, por
 * lo que Word la repite automáticamente en todas las páginas.
 */
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, Header,
  VerticalAlign, ShadingType, PageBreak, Footer, PageNumber, TabStopType, LeaderType,
} from 'docx';
import {
  DOC_PROPS, DOCUMENTOS_REFERENCIA, TERMINOS_DEFINICIONES,
  METODOLOGIA_PARRAFOS, VIGENCIA_PARRAFOS, INDICE,
} from '../data/informe.data';
import { ZONE_FILL, zoneFromPI, type ZoneLevel } from '../data/riskScale';

const NAVY = '1E3A5F';
const GREY = '64748B';
const LIGHT = 'F1F5F9';
const BORDER = 'CBD5E1';

export interface InformeDocxRisk {
  activo: string; amenaza: string; probLabel: string; zoneLabel: string; zoneLevel: ZoneLevel;
}

export interface InformeDocxData {
  fecha: string; pst: string; solucion: string; proveedor: string;
  categoriaNombre: string; resolTitulo: string;
  compliance: number | null; tprm: number | null;
  riesgosATratar: number; totalRiesgos: number;
  risks: InformeDocxRisk[];
  mapCounts: number[][];          // [imp-1][prob-1] (5×5)
  probLabels: string[]; impLabels: string[];
  amenazas: { amenaza: string; zoneLabel: string }[];
  resol: { titulo: string; parrafos: string[]; acciones?: string[] } | null;
  /** Plantilla: si se aporta, el documento incluye las conclusiones de los
   *  tres resultados posibles, una tras otra, en lugar de una sola. */
  resoluciones?: { titulo: string; parrafos: string[]; acciones?: string[] }[];
}

// ── Helpers de construcción ──────────────────────────────────────────────────

function txt(text: string, opts: { bold?: boolean; color?: string; size?: number } = {}): TextRun {
  return new TextRun({ text, bold: opts.bold, color: opts.color, size: opts.size });
}

function para(text: string, opts: { bold?: boolean; color?: string; size?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; spacingAfter?: number } = {}): Paragraph {
  return new Paragraph({
    children: [txt(text, opts)],
    alignment: opts.align ?? AlignmentType.JUSTIFIED,
    spacing: { after: opts.spacingAfter ?? 140 },
  });
}

function h1(num: string, text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 280, after: 140 },
    children: [txt(`${num}  ${text}`, { bold: true, color: NAVY, size: 30 })],
  });
}

function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [txt(text, { bold: true, color: '334155', size: 26 })],
  });
}

// Encabezados de portada / front-matter: mismo aspecto que h1/h2 pero SIN estilo
// "Heading", para que no aparezcan en la Tabla de Contenido (índice real).
function frontH1(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 280, after: 140 },
    children: [txt(text, { bold: true, color: NAVY, size: 30 })],
  });
}
function frontH2(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [txt(text, { bold: true, color: '334155', size: 26 })],
  });
}

function bullet(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 80 }, alignment: AlignmentType.JUSTIFIED });
}

// Línea de índice con puntos guía y número de página a la derecha
function indexLine(label: string, page: string, bold: boolean): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: 9600, leader: LeaderType.DOTS }],
    indent: bold ? undefined : { left: 360 },
    spacing: { after: bold ? 60 : 40 },
    children: [txt(label, { bold }), new TextRun({ text: `\t${page}`, bold })],
  });
}

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const thinBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
};

function cell(opts: {
  children?: Paragraph[]; text?: string; fill?: string; bold?: boolean; color?: string;
  width?: number; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; size?: number;
  borders?: typeof thinBorders | typeof noBorders;
}): TableCell {
  const children = opts.children ?? [new Paragraph({
    children: [txt(opts.text ?? '', { bold: opts.bold, color: opts.color, size: opts.size ?? 20 })],
    alignment: opts.align ?? AlignmentType.LEFT,
  })];
  return new TableCell({
    children,
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill, color: 'auto' } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    borders: opts.borders ?? thinBorders,
  });
}

/** Tabla ficha de dos columnas (clave | valor) */
function fichaTable(pairs: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: pairs.map(([k, v]) => new TableRow({
      children: [
        cell({ text: k, bold: true, color: '475569', fill: LIGHT, width: 32 }),
        cell({ text: v, width: 68 }),
      ],
    })),
  });
}

const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

async function fetchImage(url: string): Promise<Uint8Array> {
  const buf = await (await fetch(url)).arrayBuffer();
  return new Uint8Array(buf);
}

// ── Cabecera de sección (se repite en todas las páginas) ─────────────────────

function buildHeader(logos: Uint8Array): Header {
  const logoCell = cell({
    width: 26,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new ImageRun({ data: logos, transformation: { width: 150, height: 20 } })],
    })],
  });
  const titleCell = cell({
    width: 60,
    children: [new Paragraph({
      children: [txt('Informe de Evaluación, Análisis de Riesgo y recomendación Solicitud Proveedor-Servicio ITC', { bold: true, color: '5B78A8', size: 16 })],
    })],
  });
  const versionCell = cell({
    width: 14,
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [txt('Versión', { color: '5B78A8', size: 16 })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [txt('1.0', { bold: true, size: 18 })] }),
    ],
  });
  return new Header({
    children: [new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [logoCell, titleCell, versionCell] })],
    }), new Paragraph({ text: '', spacing: { after: 80 } })],
  });
}

// ── Secciones de contenido ───────────────────────────────────────────────────

function coverChildren(d: InformeDocxData, banner: Uint8Array): (Paragraph | Table)[] {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [new ImageRun({ data: banner, transformation: { width: 480, height: 46 } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [txt('Informe de Evaluación, Análisis de Riesgo y recomendación de Solicitud Proveedor-Servicio ICT', { bold: true, color: '0F172A', size: 40 })],
    }),
    fichaTable([
      ['Fecha', d.fecha],
      ['Nº de PST', d.pst],
      ['Solución', d.solucion],
      ['Proveedor', d.proveedor],
      ['Categoría', d.categoriaNombre],
      ['Resolución', d.resolTitulo],
    ]),
  ];
}

function riskTable(d: InformeDocxData): Table {
  const head = new TableRow({
    tableHeader: true,
    children: [
      cell({ text: 'Activo', bold: true, color: 'FFFFFF', fill: NAVY, width: 20 }),
      cell({ text: 'Amenaza', bold: true, color: 'FFFFFF', fill: NAVY, width: 44 }),
      cell({ text: 'Probabilidad residual', bold: true, color: 'FFFFFF', fill: NAVY, width: 18 }),
      cell({ text: 'Zona de Riesgo Residual', bold: true, color: 'FFFFFF', fill: NAVY, width: 18 }),
    ],
  });
  const body = d.risks.length === 0
    ? [new TableRow({ children: [cell({ text: 'Sin riesgos evaluados.', color: GREY, align: AlignmentType.CENTER })] })]
    : d.risks.map(r => new TableRow({
        children: [
          cell({ text: r.activo }),
          cell({ text: r.amenaza }),
          cell({ text: r.probLabel }),
          cell({ text: r.zoneLabel, bold: true, fill: ZONE_FILL[r.zoneLevel] }),
        ],
      }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [head, ...body] });
}

const LEVELS = [1, 2, 3, 4, 5];

function riskMap(d: InformeDocxData): Table {
  const head = new TableRow({
    children: [
      cell({ text: 'Impacto residual / Probabilidad residual', bold: true, color: 'FFFFFF', fill: NAVY, size: 16 }),
      ...LEVELS.map(p => cell({ text: d.probLabels[p], bold: true, fill: 'E2E8F0', align: AlignmentType.CENTER, size: 16 })),
      cell({ text: 'Total', bold: true, color: NAVY, fill: LIGHT, align: AlignmentType.CENTER }),
    ],
  });
  const rows = [5, 4, 3, 2, 1].map(imp => {
    const counts = d.mapCounts[imp - 1];
    const total = counts.reduce((a, b) => a + b, 0);
    return new TableRow({
      children: [
        cell({ text: d.impLabels[imp], bold: true, fill: 'E2E8F0', size: 16 }),
        ...LEVELS.map(p => cell({
          text: counts[p - 1] > 0 ? String(counts[p - 1]) : '',
          bold: true, align: AlignmentType.CENTER, fill: ZONE_FILL[zoneFromPI(p, imp)],
        })),
        cell({ text: String(total), bold: true, color: NAVY, fill: LIGHT, align: AlignmentType.CENTER }),
      ],
    });
  });
  const totalRow = new TableRow({
    children: [
      cell({ text: 'Total', bold: true, color: NAVY, fill: LIGHT }),
      ...LEVELS.map(p => {
        const colTotal = [0, 1, 2, 3, 4].reduce((a, imp) => a + d.mapCounts[imp][p - 1], 0);
        return cell({ text: String(colTotal), bold: true, color: NAVY, fill: LIGHT, align: AlignmentType.CENTER });
      }),
      cell({ text: String(d.totalRiesgos), bold: true, color: NAVY, fill: LIGHT, align: AlignmentType.CENTER }),
    ],
  });
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [head, ...rows, totalRow] });
}

// ── Documento completo ───────────────────────────────────────────────────────

export async function downloadInformeDocx(d: InformeDocxData): Promise<void> {
  const [headerLogos, banner] = await Promise.all([
    fetchImage('/informe-header-logos.png'),
    fetchImage('/informe-portada.png'),
  ]);

  const children: (Paragraph | Table)[] = [];

  // Portada (página 1)
  children.push(...coverChildren(d, banner));
  children.push(pageBreak());

  // Propiedades del documento (página 2)
  children.push(frontH1('Propiedades del documento'));
  children.push(fichaTable([
    ['Nombre del documento', DOC_PROPS.nombre],
    ['Tipo', DOC_PROPS.tipo],
    ['Resumen', DOC_PROPS.resumen],
    ['Propietario', DOC_PROPS.propietario],
    ['Clasificación', DOC_PROPS.clasificacion],
  ]));
  children.push(frontH2('Historial de revisiones'));
  children.push(new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell({ text: 'Versión', bold: true, color: 'FFFFFF', fill: NAVY, width: 14 }),
        cell({ text: 'Fecha', bold: true, color: 'FFFFFF', fill: NAVY, width: 20 }),
        cell({ text: 'Autor', bold: true, color: 'FFFFFF', fill: NAVY, width: 33 }),
        cell({ text: 'Detalles de la versión', bold: true, color: 'FFFFFF', fill: NAVY, width: 33 }),
      ] }),
      new TableRow({ children: [
        cell({ text: '1.0' }), cell({ text: d.fecha }),
        cell({ text: DOC_PROPS.elaboradoPor }), cell({ text: 'Versión inicial.' }),
      ] }),
    ],
  }));
  children.push(frontH2('Vigencia'));
  VIGENCIA_PARRAFOS.forEach(p => children.push(para(p)));
  children.push(pageBreak());

  // Índice (página 3) — números de página de marcador (ajustables)
  children.push(frontH1('Índice'));
  const tocPage: Record<string, string> = { '1': '4', '2': '5', '3': '6', '4': '7' };
  INDICE.forEach(item => {
    children.push(indexLine(`${item.n}.  ${item.t}`, tocPage[item.n] ?? '', true));
    item.sub.forEach(sub => children.push(indexLine(`${sub.n}  ${sub.t}`, tocPage[item.n] ?? '', false)));
  });
  children.push(pageBreak());

  // 1. Introducción (página 4 en adelante)
  children.push(h1('1.', 'Introducción'));
  children.push(h2('1.1 Objetivo'));
  children.push(para(`El presente informe tiene como propósito evaluar el uso corporativo de ${d.solucion}, proporcionada por ${d.proveedor}. El análisis examina si su adopción resulta recomendable desde una perspectiva de seguridad.`));
  children.push(para(`El objetivo principal es analizar, a nivel general, las capacidades, limitaciones y riesgos asociados a ${d.solucion}. Esta evaluación permitirá determinar su idoneidad para un posible uso corporativo, garantizando al mismo tiempo un nivel adecuado de seguridad de la información, cumplimiento normativo y gestión del riesgo.`));
  children.push(h2('1.2 Documentos para consulta'));
  children.push(para('A continuación, se listan las diferentes normas y/o estándares de referencia indispensables para la aplicación de este documento.'));
  DOCUMENTOS_REFERENCIA.forEach(x => children.push(bullet(x)));
  children.push(h2('1.3 Términos y Definiciones'));
  children.push(para('Para los fines de este documento, se toman referencias de buenas prácticas, como, por ejemplo:'));
  TERMINOS_DEFINICIONES.forEach(x => children.push(bullet(x)));

  // 2. Metodología
  children.push(h1('2.', 'Metodología utilizada para la evaluación del impacto y análisis de riesgos'));
  METODOLOGIA_PARRAFOS.forEach(p => children.push(para(p)));

  // 3. Resultados
  children.push(h1('3.', 'Resultados'));
  children.push(para('El análisis de riesgo efectuado, tanto al proveedor del servicio como a la solución, ha permitido identificar y valorar diversas amenazas que pueden afectar a la seguridad de la información gestionada por el sistema, obteniendo la siguiente tabla de riesgos, que deben ser tratados de acuerdo con la metodología establecida.'));
  children.push(riskTable(d));
  children.push(new Paragraph({ spacing: { before: 200, after: 80 }, children: [txt(`Mapa de Riesgos — Total riesgos: ${d.totalRiesgos}`, { bold: true })] }));
  children.push(riskMap(d));
  children.push(new Paragraph({ spacing: { before: 200, after: 80 }, children: [txt('Como resultado de este análisis, se determinan las siguientes amenazas principales:', {})] }));
  if (d.amenazas.length === 0) {
    children.push(bullet('No se han identificado amenazas con riesgo residual relevante.'));
  } else {
    d.amenazas.forEach(a => children.push(bullet(`${a.amenaza} (riesgo residual ${a.zoneLabel.toLowerCase()})`)));
  }
  children.push(para('Los resultados del análisis de seguridad reflejan el grado de exposición a riesgos asociado a la solución, así como a los controles aplicados en materia de acceso, protección de datos y uso de servicios externos. La evaluación permite valorar el nivel de adecuación de la solución al marco de seguridad establecido, facilitando la identificación de posibles mejoras orientadas a reforzar la protección de la información y el cumplimiento de la normativa vigente en materia de seguridad y privacidad.'));

  // 4. Resolución
  children.push(h1('4.', 'Resolución'));
  const pushResol = (r: { titulo: string; parrafos: string[]; acciones?: string[] }) => {
    r.parrafos.forEach(p => children.push(para(p)));
    if (r.acciones) {
      r.acciones.forEach(a => children.push(new Paragraph({ numbering: { reference: 'acciones', level: 0 }, spacing: { after: 80 }, children: [txt(a, {})] })));
    }
  };

  if (d.resoluciones && d.resoluciones.length) {
    children.push(para('Este documento es una plantilla: incluye las conclusiones para los tres resultados posibles. Conserva únicamente el apartado correspondiente al resultado final de la evaluación.'));
    d.resoluciones.forEach((r) => {
      children.push(h2(r.titulo));
      pushResol(r);
    });
  } else if (d.resol) {
    children.push(h2('4.1 Resolución'));
    children.push(new Paragraph({ spacing: { after: 120 }, children: [txt(d.resol.titulo, { bold: true, size: 24 })] }));
    pushResol(d.resol);
  } else {
    children.push(h2('4.1 Resolución'));
    children.push(para('Aún no se ha seleccionado el resultado de la evaluación.'));
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: 'acciones',
        levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START }],
      }],
    },
    styles: {
      default: {
        document: { run: { font: 'Calibri', size: 21 } },
      },
    },
    sections: [{
      properties: { page: { margin: { top: 1700, bottom: 1000, left: 1000, right: 1000 } } },
      headers: { default: buildHeader(headerLogos) },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES], size: 16, color: '94A3B8' })],
          })],
        }),
      },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safe = (d.solucion || 'solucion').replace(/[^\w.-]+/g, '_').slice(0, 40);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Informe_Evaluacion_${safe}.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
