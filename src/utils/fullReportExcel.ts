/**
 * Informe completo en Excel — toda la información de la herramienta en un solo libro.
 *
 * Sheets:
 *   1. Índice
 *   2. Riesgos              (catálogo de amenazas MAGERIT v3)
 *   3. Controles            (catálogo de controles MAGERIT / ENS)
 *   4. Mapeo Riesgo-Control (17 grupos temáticos, con ediciones del usuario)
 *   5. Responsabilidades    (cliente / proveedor / ambos por pregunta y categoría)
 *   6-10. Cuestionario <cat> (uno por categoría: pregunta + respuesta Sí/No)
 *   11. AARR                (metodología y fórmulas de cálculo)
 *
 * Refleja las ediciones del usuario (mapeo, respuestas, responsabilidad, textos)
 * leyendo el estado de los stores.
 */

import ExcelJS from 'exceljs';
import { RIESGOS_CATALOG } from '../data/riesgosCatalog';
import { RIESGOS_BY_CODE } from '../data/riesgosCatalog';
import { CONTROLES_CATALOG } from '../data/controlesCatalog';
import { RISK_CONTROL_GROUPS } from '../data/riskControlGroups';
import { RISK_CONTROL_SPECIFIC } from '../data/riskControlSpecific';
import {
  CATEGORY_QUESTIONNAIRES, CATEGORY_ORDER, RESPONSIBILITY_LABELS,
  type Question, type QuestionResponsibility,
} from '../data/questionnaires.data';
import { useRiskControlStore, effectiveControls } from '../store/riskControlStore';
import { useQuestionnaireStore, type Answer } from '../store/questionnaireStore';
import { PROB_LEVELS, DEGRAD_LEVELS } from '../data/aarrScale';

// ── Estilos ──────────────────────────────────────────────────────────────────
const HEAD = 'FF0F172A';
const SUB  = 'FF1E3A5F';
const BORDER = { style: 'thin' as const, color: { argb: 'FFE2E8F0' } };

const RESP_FILL: Record<QuestionResponsibility, string> = {
  proveedor: 'FFDBE9FE', // azul
  cliente:   'FFDCFCE7', // verde
  ambos:     'FFFEF3C7', // ámbar
};
const RESP_FONT: Record<QuestionResponsibility, string> = {
  proveedor: 'FF1E40AF',
  cliente:   'FF166534',
  ambos:     'FF92400E',
};
const ANSWER_FILL: Record<string, string> = { Si: 'FFF0FDF4', No: 'FFFEF2F2', 'N/A': 'FFF8FAFC' };

function titleRow(ws: ExcelJS.Worksheet, text: string, span: number) {
  const r = ws.addRow([text]);
  ws.mergeCells(`A${ws.rowCount}:${String.fromCharCode(64 + span)}${ws.rowCount}`);
  r.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD } };
  r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  r.height = 28;
  return r;
}

function headerRow(ws: ExcelJS.Worksheet, cells: string[]) {
  const r = ws.addRow(cells);
  r.height = 24;
  r.eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  return r;
}

function band(ws: ExcelJS.Worksheet, text: string, span: number) {
  const r = ws.addRow([text]);
  ws.mergeCells(`A${ws.rowCount}:${String.fromCharCode(64 + span)}${ws.rowCount}`);
  r.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUB } };
  r.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  r.height = 22;
  return r;
}

function safeSheet(name: string) {
  return name.replace(/[*?:\\/[\]]/g, '-').slice(0, 31);
}

// ── Generación ───────────────────────────────────────────────────────────────
export async function exportFullReport() {
  const { overrides, specificOverrides } = useRiskControlStore.getState();
  const qs = useQuestionnaireStore.getState();

  const wb = new ExcelJS.Workbook();
  wb.creator = 'M.A.I.N.S. · MAGERIT';
  const fecha = new Date().toLocaleDateString('es-ES');

  // Helper: pregunta efectiva (texto/refs/responsabilidad/respuesta) de una Question
  const effText = (cat: string, q: Question) => qs.customQuestions[cat]?.[q.id] ?? q.text;
  const effRisks = (cat: string, q: Question) => qs.customRiskRefs[cat]?.[q.id] ?? q.riskRefs;
  const effCtrls = (cat: string, q: Question) => qs.customSafeguardRefs[cat]?.[q.id] ?? q.safeguardRefs;
  const effResp = (cat: string, q: Question): QuestionResponsibility => qs.customResponsibility[cat]?.[q.id] ?? q.responsibility;
  const answerLabel = (a: Answer) => a === 'yes' ? 'Si' : a === 'no' ? 'No' : a === 'na' ? 'N/A' : '';

  // ── 1. Índice ──
  {
    const ws = wb.addWorksheet('Índice');
    ws.columns = [{ width: 6 }, { width: 34 }, { width: 70 }];
    titleRow(ws, 'Informe de Apreciación del Riesgo — MAGERIT v3 (BPO CC v7.3)', 3);
    ws.addRow([`Generado: ${fecha}`]).getCell(1).font = { italic: true, color: { argb: 'FF64748B' } };
    ws.addRow([]);
    headerRow(ws, ['#', 'Hoja', 'Contenido']);
    const items: [string, string][] = [
      ['Riesgos', 'Catálogo de amenazas MAGERIT v3 (degradación y probabilidad inherentes).'],
      ['Controles', 'Catálogo de controles / salvaguardas MAGERIT y ENS.'],
      ['Mapeo Riesgo-Control', 'Controles que mitigan cada amenaza (17 grupos temáticos).'],
      ['Mapeo Riesgo específico', 'Salvaguardas y responsable por amenaza individual.'],
      ['Responsabilidades', 'Responsabilidad por pregunta: cliente / proveedor / ambos.'],
      ['Cuestionario · (categoría)', 'Cuestionario Sí/No por categoría (rellenable, con % de cumplimiento).'],
      ['AARR', 'Evaluación del riesgo rellenable: dimensiones, criticidad, impacto, zona y residual (fórmulas).'],
    ];
    items.forEach(([h, d], i) => {
      const r = ws.addRow([i + 1, h, d]);
      r.alignment = { vertical: 'middle', wrapText: true };
      r.getCell(1).alignment = { horizontal: 'center' };
      r.eachCell(c => { c.border = { bottom: BORDER }; });
    });
  }

  // ── 2. Riesgos ──
  {
    const ws = wb.addWorksheet('Riesgos');
    ws.columns = [{ width: 10 }, { width: 46 }, { width: 18 }, { width: 30 }, { width: 14 }, { width: 14 }, { width: 70 }];
    titleRow(ws, 'Catálogo de Riesgos / Amenazas (MAGERIT v3)', 7);
    headerRow(ws, ['Código', 'Amenaza', 'Factor', 'Categorías de activo', 'Degradación (1-5)', 'Probabilidad (1-5)', 'Causa']);
    ws.views = [{ state: 'frozen', ySplit: 2 }];
    ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: 7 } };
    for (const r of RIESGOS_CATALOG) {
      const row = ws.addRow([r.code, r.name, r.factor, r.categorias.join(', '), r.degradacion, r.probabilidad, r.causa]);
      row.alignment = { vertical: 'top', wrapText: true };
      row.getCell(1).font = { bold: true, color: { argb: 'FF1E3A5F' } };
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'top' };
      row.getCell(6).alignment = { horizontal: 'center', vertical: 'top' };
      row.eachCell(c => { c.border = { bottom: BORDER }; });
    }
  }

  // ── 3. Controles ──
  {
    const ws = wb.addWorksheet('Controles');
    ws.columns = [{ width: 10 }, { width: 54 }, { width: 14 }, { width: 16 }, { width: 50 }];
    titleRow(ws, 'Catálogo de Controles / Salvaguardas (MAGERIT / ENS)', 5);
    headerRow(ws, ['ID', 'Control', 'Tipo', 'Metodología', 'Familia de salvaguarda']);
    ws.views = [{ state: 'frozen', ySplit: 2 }];
    ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: 5 } };
    for (const c of CONTROLES_CATALOG) {
      const row = ws.addRow([c.id, c.nombre, c.tipo, c.metodologia, c.familia]);
      row.alignment = { vertical: 'middle', wrapText: true };
      row.getCell(1).font = { bold: true, color: { argb: 'FF1E3A5F' } };
      row.eachCell(cell => { cell.border = { bottom: BORDER }; });
    }
  }

  // ── 4. Mapeo Riesgo-Control ──
  {
    const ws = wb.addWorksheet('Mapeo Riesgo-Control');
    ws.columns = [{ width: 32 }, { width: 50 }, { width: 64 }];
    titleRow(ws, 'Mapeo Riesgo → Control (17 grupos temáticos)', 3);
    headerRow(ws, ['Grupo', 'Amenazas', 'Controles que mitigan']);
    ws.views = [{ state: 'frozen', ySplit: 2 }];
    RISK_CONTROL_GROUPS.forEach((g, i) => {
      const controls = effectiveControls(g.controls, overrides[g.id]);
      const amenazas = g.riskCodes.map(c => `[${c}] ${RIESGOS_BY_CODE[c]?.name ?? ''}`).join('\n');
      const row = ws.addRow([`${i + 1}. ${g.title}`, amenazas, controls.map(c => `• ${c}`).join('\n')]);
      row.alignment = { vertical: 'top', wrapText: true };
      row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUB } };
      row.getCell(1).alignment = { vertical: 'top', wrapText: true, indent: 1 };
      row.eachCell(c => { c.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } }; });
    });
  }

  // ── 4b. Mapeo Riesgo específico ──
  {
    const ws = wb.addWorksheet('Mapeo Riesgo específico');
    ws.columns = [{ width: 10 }, { width: 42 }, { width: 64 }, { width: 16 }];
    titleRow(ws, 'Mapeo Riesgo específico (por amenaza individual)', 4);
    headerRow(ws, ['Código', 'Amenaza', 'Salvaguardas aplicables', 'Responsable']);
    ws.views = [{ state: 'frozen', ySplit: 2 }];
    ws.autoFilter = { from: { row: 2, column: 1 }, to: { row: 2, column: 4 } };
    const RESP_SPEC_FILL: Record<string, string> = { Cliente: 'FFDCFCE7', Proveedor: 'FFDBE9FE', Compartido: 'FFFEF3C7' };
    const RESP_SPEC_FONT: Record<string, string> = { Cliente: 'FF166534', Proveedor: 'FF1E40AF', Compartido: 'FF92400E' };
    for (const e of RISK_CONTROL_SPECIFIC) {
      const ctrls = effectiveControls(e.controls, specificOverrides[e.code]);
      const row = ws.addRow([e.code, e.name, ctrls.join('; '), e.responsable]);
      row.alignment = { vertical: 'middle', wrapText: true };
      row.getCell(1).font = { bold: true, color: { argb: 'FF1E3A5F' } };
      const rc = row.getCell(4);
      rc.font = { bold: true, color: { argb: RESP_SPEC_FONT[e.responsable] } };
      rc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RESP_SPEC_FILL[e.responsable] } };
      rc.alignment = { horizontal: 'center', vertical: 'middle' };
      row.eachCell(c => { c.border = { bottom: BORDER }; });
    }
  }

  // ── 5. Responsabilidades ──
  {
    const ws = wb.addWorksheet('Responsabilidades');
    ws.columns = [{ width: 30 }, { width: 64 }, { width: 18 }];
    titleRow(ws, 'Matriz de Responsabilidades (Proveedor / Ambos / Cliente)', 3);
    headerRow(ws, ['Categoría', 'Pregunta', 'Responsabilidad']);
    ws.views = [{ state: 'frozen', ySplit: 2 }];
    for (const { id: cat, name } of CATEGORY_ORDER) {
      band(ws, name, 3);
      for (const q of CATEGORY_QUESTIONNAIRES[cat] ?? []) {
        const resp = effResp(cat, q);
        const row = ws.addRow([name, effText(cat, q), RESPONSIBILITY_LABELS[resp]]);
        row.alignment = { vertical: 'middle', wrapText: true };
        const rc = row.getCell(3);
        rc.font = { bold: true, color: { argb: RESP_FONT[resp] } };
        rc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RESP_FILL[resp] } };
        rc.alignment = { horizontal: 'center', vertical: 'middle' };
        rc.dataValidation = { type: 'list', allowBlank: false, formulae: ['"Proveedor,Ambos,Cliente"'] };
        row.eachCell(c => { c.border = { bottom: BORDER }; });
      }
    }
  }

  // ── 6-10. Cuestionario por categoría ──
  for (const { id: cat, name } of CATEGORY_ORDER) {
    const ws = wb.addWorksheet(safeSheet(`Cuest · ${name}`));
    ws.columns = [{ width: 64 }, { width: 12 }, { width: 16 }, { width: 24 }, { width: 40 }];
    titleRow(ws, `Cuestionario — ${name}`, 5);
    ws.addRow([`Fecha: ${fecha}`]).getCell(1).font = { italic: true, color: { argb: 'FF64748B' } };
    headerRow(ws, ['Pregunta', 'Respuesta', 'Responsabilidad', 'Amenazas', 'Controles']);
    ws.views = [{ state: 'frozen', ySplit: 3 }];

    const cAnswers = qs.answers[cat] ?? {};
    const rows: { text: string; ans: string; resp: QuestionResponsibility | null; risks: string[]; ctrls: string[] }[] = [];
    for (const q of CATEGORY_QUESTIONNAIRES[cat] ?? []) {
      rows.push({
        text: effText(cat, q),
        ans: answerLabel(cAnswers[q.id] ?? null),
        resp: effResp(cat, q),
        risks: effRisks(cat, q),
        ctrls: effCtrls(cat, q),
      });
    }
    for (const eq of qs.extraQuestions[cat] ?? []) {
      rows.push({ text: eq.text, ans: answerLabel(cAnswers[eq.id] ?? null), resp: null, risks: eq.riskRefs, ctrls: eq.safeguardRefs });
    }

    const firstAns = ws.rowCount + 1;
    for (const r of rows) {
      const row = ws.addRow([r.text, r.ans, r.resp ? RESPONSIBILITY_LABELS[r.resp] : '', r.risks.join(', '), r.ctrls.join('; ')]);
      row.alignment = { vertical: 'middle', wrapText: true };
      row.getCell(1).alignment = { vertical: 'middle', wrapText: true, indent: 1 };
      const ac = row.getCell(2);
      ac.alignment = { horizontal: 'center', vertical: 'middle' };
      ac.font = { bold: !!r.ans };
      ac.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: r.ans ? ANSWER_FILL[r.ans] : INPUT_FILL } };
      if (r.resp) {
        const rc = row.getCell(3);
        rc.font = { bold: true, color: { argb: RESP_FONT[r.resp] } };
        rc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RESP_FILL[r.resp] } };
        rc.alignment = { horizontal: 'center', vertical: 'middle' };
      }
      row.eachCell(c => { c.border = { bottom: BORDER }; });
      // Validación Sí/No/N/A en la celda de respuesta
      ws.getCell(`B${row.number}`).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Si,No,N/A"'] };
    }
    const lastAns = ws.rowCount;

    // Fila de cumplimiento (% de "Si" sobre preguntas respondidas)
    const sumRow = ws.addRow(['Cumplimiento (% de "Si" sobre respondidas)', null]);
    const sn = sumRow.number;
    sumRow.getCell(1).font = { bold: true, color: { argb: 'FF0F172A' } };
    sumRow.getCell(1).alignment = { horizontal: 'right', vertical: 'middle' };
    const yes = `COUNTIF(B${firstAns}:B${lastAns},"Si")`;
    const answered = `(COUNTIF(B${firstAns}:B${lastAns},"Si")+COUNTIF(B${firstAns}:B${lastAns},"No"))`;
    fcell(ws, `B${sn}`, `IF(${answered}=0,"",ROUND(${yes}/${answered}*100,0))`, '');
    sumRow.getCell(2).numFmt = '0"%"';
    sumRow.getCell(2).font = { bold: true };
    sumRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    sumRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
  }

  // ── 11. AARR ──
  buildAarrSheet(wb);

  // ── Descarga ──
  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `herramienta-apreciacion-riesgo-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// Color amarillo claro para celdas de ENTRADA (rellenar a mano).
const INPUT_FILL = 'FFFEF9C3';

function zona(v: number): string {
  if (v <= 0.7) return 'Z3 Aceptable';
  if (v <= 1.6) return 'Z4 Tolerable';
  if (v <= 9.9) return 'Z2 A tratar';
  return 'Z1 Inaceptable';
}
function zonaFormula(ref: string): string {
  return `IF(${ref}<=0.7,"Z3 Aceptable",IF(${ref}<=1.6,"Z4 Tolerable",IF(${ref}<=9.9,"Z2 A tratar","Z1 Inaceptable")))`;
}
function fcell(ws: ExcelJS.Worksheet, addr: string, formula: string, result: number | string) {
  ws.getCell(addr).value = { formula, result } as ExcelJS.CellFormulaValue;
}

// ── Hoja AARR — evaluación rellenable con fórmulas vivas ─────────────────────
function buildAarrSheet(wb: ExcelJS.Workbook) {
  const ws = wb.addWorksheet('AARR');
  ws.columns = [
    { width: 9 }, { width: 38 },                                  // A,B
    { width: 5 }, { width: 5 }, { width: 5 }, { width: 5 }, { width: 5 }, // C..G dims
    { width: 11 }, { width: 11 }, { width: 12 }, { width: 12 }, { width: 11 }, { width: 15 }, // H..M
    { width: 11 }, { width: 12 }, { width: 11 }, { width: 12 }, { width: 15 }, // N..R
  ];
  titleRow(ws, 'AARR · Evaluación del Riesgo (rellena las celdas amarillas; el resto se calcula)', 18);
  const help = ws.addRow(['Entrada (amarillo): C/I/D/A/T (1-5), Degradación %, Probabilidad y Madurez de controles %. El resto son fórmulas.']);
  ws.mergeCells(`A${ws.rowCount}:R${ws.rowCount}`);
  help.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF64748B' } };

  const hdr = headerRow(ws, [
    'Código', 'Amenaza', 'C', 'I', 'D', 'A', 'T', 'Criticidad', 'Degrad. %', 'Impacto inh.',
    'Probabilidad', 'Riesgo inh.', 'Zona inherente', 'Madurez %', 'Impacto resid.', 'Prob. resid.', 'Riesgo resid.', 'Zona residual',
  ]);
  hdr.height = 30;
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: hdr.number }];

  // Riesgos únicos (dedup por código) con valores inherentes por defecto del catálogo.
  const seen = new Set<string>();
  const risks = RIESGOS_CATALOG.filter(r => (seen.has(r.code) ? false : (seen.add(r.code), true)));

  const firstRow = ws.rowCount + 1;
  for (const r of risks) {
    const degr = DEGRAD_LEVELS[r.degradacion]?.value ?? 50;
    const prob = PROB_LEVELS[r.probabilidad]?.value ?? 1;
    const dimDef = 3;
    const crit = dimDef;                          // = MAX(C..T)
    const impInh = +(crit * degr / 100).toFixed(2);
    const riesgoInh = +(prob * impInh).toFixed(2);
    const madurez = 0;
    const impRes = +(impInh * (1 - madurez / 100)).toFixed(2);
    const probRes = +(prob * (1 - madurez / 100)).toFixed(2);
    const riesgoRes = +(impRes * probRes).toFixed(2);

    const row = ws.addRow([r.code, r.name, dimDef, dimDef, dimDef, dimDef, dimDef, null, degr, null, prob, null, null, madurez, null, null, null, null]);
    const n = row.number;
    fcell(ws, `H${n}`, `MAX(C${n}:G${n})`, crit);
    fcell(ws, `J${n}`, `H${n}*I${n}/100`, impInh);
    fcell(ws, `L${n}`, `K${n}*J${n}`, riesgoInh);
    fcell(ws, `M${n}`, zonaFormula(`L${n}`), zona(riesgoInh));
    fcell(ws, `O${n}`, `J${n}*(1-N${n}/100)`, impRes);
    fcell(ws, `P${n}`, `K${n}*(1-N${n}/100)`, probRes);
    fcell(ws, `Q${n}`, `O${n}*P${n}`, riesgoRes);
    fcell(ws, `R${n}`, zonaFormula(`Q${n}`), zona(riesgoRes));

    row.alignment = { vertical: 'middle' };
    row.getCell(1).font = { bold: true, color: { argb: 'FF1E3A5F' } };
    row.getCell(2).alignment = { vertical: 'middle', wrapText: true };
    // celdas de entrada en amarillo
    for (const col of ['C', 'D', 'E', 'F', 'G', 'I', 'K', 'N']) {
      ws.getCell(`${col}${n}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INPUT_FILL } };
    }
    row.eachCell((c, col) => { c.border = { bottom: BORDER }; if (col > 2) c.alignment = { ...c.alignment, horizontal: 'center' }; });

    // Desplegables
    for (const col of ['C', 'D', 'E', 'F', 'G']) {
      ws.getCell(`${col}${n}`).dataValidation = { type: 'list', allowBlank: false, formulae: ['"1,2,3,4,5"'] };
    }
    ws.getCell(`I${n}`).dataValidation = { type: 'list', allowBlank: false, formulae: ['"5,15,50,80,100"'] };
    ws.getCell(`K${n}`).dataValidation = { type: 'list', allowBlank: false, formulae: ['"0.1,0.3,1,2,3"'] };
    ws.getCell(`N${n}`).dataValidation = { type: 'list', allowBlank: false, formulae: ['"0,10,50,80,90,100"'] };
  }
  const lastRow = ws.rowCount;

  // Escala de color en riesgo inherente y residual
  for (const col of ['L', 'Q']) {
    ws.addConditionalFormatting({
      ref: `${col}${firstRow}:${col}${lastRow}`,
      rules: [{
        type: 'colorScale', priority: 1,
        cfvo: [{ type: 'num', value: 0 }, { type: 'num', value: 5 }, { type: 'num', value: 15 }],
        color: [{ argb: 'FF63BE7B' }, { argb: 'FFFFEB84' }, { argb: 'FFF8696B' }],
      }],
    });
  }

  // ── Leyenda y fórmulas ──
  ws.addRow([]);
  band(ws, 'Cómo se calcula', 18);
  const doc: [string, string][] = [
    ['Criticidad', '= MAX(C, I, D, A, T)  (criterio más restrictivo)'],
    ['Impacto inherente', '= Criticidad × Degradación / 100'],
    ['Riesgo inherente', '= Probabilidad × Impacto inherente'],
    ['Zonas', 'Z3 Aceptable ≤ 0,7 · Z4 Tolerable ≤ 1,6 · Z2 A tratar ≤ 9,9 · Z1 Inaceptable > 9,9'],
    ['Madurez %', 'Eficacia agregada de los controles (L0=0 · L1=10 · L2=50 · L3=80 · L4=90 · L5=100)'],
    ['Impacto / Prob. residual', '= valor inherente × (1 − Madurez/100)'],
    ['Riesgo residual', '= Probabilidad residual × Impacto residual  (recalcula la zona)'],
    ['NRA', 'Z3 y Z4 → aceptables (no se tratan) · Z1 y Z2 → a tratar'],
  ];
  for (const [k, v] of doc) {
    const row = ws.addRow([k, v]);
    ws.mergeCells(`B${ws.rowCount}:R${ws.rowCount}`);
    row.getCell(1).font = { bold: true, color: { argb: 'FF1E3A5F' } };
    row.alignment = { vertical: 'middle', wrapText: true };
  }
}
