/**
 * Mapeo Riesgo ↔ Control — 17 grupos temáticos, editable.
 *
 * Cada grupo muestra sus amenazas y los controles que las mitigan. El usuario puede
 * quitar controles (×) o añadir desde el catálogo / texto libre. El Excel descargable
 * refleja las ediciones.
 */

import ExcelJS from 'exceljs';
import { useMemo, useState } from 'react';
import { RISK_CONTROL_GROUPS } from '../../data/riskControlGroups';
import { RIESGOS_BY_CODE } from '../../data/riesgosCatalog';
import { CONTROLES_CATALOG } from '../../data/controlesCatalog';
import { useRiskControlStore, effectiveControls } from '../../store/riskControlStore';

// Nombres de control del catálogo (para el autocompletado al añadir).
const CATALOG_CONTROL_NAMES = [...new Set(CONTROLES_CATALOG.map(c => c.nombre))].sort((a, b) => a.localeCompare(b, 'es'));

function riskName(code: string): string {
  return RIESGOS_BY_CODE[code]?.name ?? '';
}

// ── Excel ───────────────────────────────────────────────────────────────────

function safeSheetName(name: string): string {
  return name.replace(/[*?:\\/[\]]/g, '-').slice(0, 31);
}

async function exportMappingExcel() {
  const overrides = useRiskControlStore.getState().overrides;
  const HEAD = 'FF0F172A';
  const SUB  = 'FF1E3A5F';
  const wb = new ExcelJS.Workbook();
  wb.creator = 'M.A.I.N.S. · MAGERIT';

  // Hoja 1: resumen por grupo
  const ws1 = wb.addWorksheet(safeSheetName('Mapeo Riesgo-Control'));
  ws1.columns = [{ width: 32 }, { width: 50 }, { width: 60 }];
  const t1 = ws1.addRow(['Mapeo general Riesgo → Control (MAGERIT v3)']);
  ws1.mergeCells('A1:C1');
  t1.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  t1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD } };
  t1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  t1.height = 28;
  ws1.addRow([`Generado: ${new Date().toLocaleDateString('es-ES')}`]);
  ws1.addRow([]);
  const h1 = ws1.addRow(['Grupo', 'Amenazas', 'Controles']);
  h1.height = 22;
  h1.eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  ws1.views = [{ state: 'frozen', ySplit: 4 }];

  // Hoja 2: pares amenaza-control
  const ws2 = wb.addWorksheet('Amenaza-Control');
  ws2.columns = [{ width: 12 }, { width: 46 }, { width: 50 }, { width: 30 }];
  const h2 = ws2.addRow(['Código', 'Amenaza', 'Control', 'Grupo']);
  h2.eachCell(c => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD } };
    c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  ws2.views = [{ state: 'frozen', ySplit: 1 }];
  ws2.autoFilter = 'A1:D1';

  RISK_CONTROL_GROUPS.forEach((g, i) => {
    const controls = effectiveControls(g.controls, overrides[g.id]);
    const amenazas = g.riskCodes.map(c => `[${c}] ${riskName(c)}`).join('\n');

    const row = ws1.addRow([`${i + 1}. ${g.title}`, amenazas, controls.map(c => `• ${c}`).join('\n')]);
    row.alignment = { vertical: 'top', wrapText: true };
    row.getCell(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUB } };
    row.getCell(1).alignment = { vertical: 'top', wrapText: true, indent: 1 };
    row.eachCell(c => { c.border = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } }; });

    for (const code of g.riskCodes) {
      for (const ctrl of controls) {
        const r = ws2.addRow([code, riskName(code), ctrl, g.title]);
        r.getCell(1).font = { bold: true, color: { argb: 'FF1E3A5F' } };
        r.alignment = { vertical: 'middle', wrapText: true };
      }
    }
  });

  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `mapeo-riesgo-control-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

async function handleExport() {
  try {
    await exportMappingExcel();
  } catch (err) {
    console.error('[Mapeo Riesgo-Control] Error al generar el Excel:', err);
    alert('No se pudo generar el Excel. Revisa la consola para más detalle.');
  }
}

// ── Tarjeta de grupo ─────────────────────────────────────────────────────────

function GroupCard({ index, group }: { index: number; group: typeof RISK_CONTROL_GROUPS[number] }) {
  const { overrides, addControl, removeControl, resetGroup } = useRiskControlStore();
  const [draft, setDraft] = useState('');

  const override = overrides[group.id];
  const controls = effectiveControls(group.controls, override);
  const isEdited = !!override && (override.add.length > 0 || override.remove.length > 0);

  function add() {
    const c = draft.trim();
    if (!c) return;
    addControl(group.id, c);
    setDraft('');
  }

  return (
    <div className="w-full xl:w-[calc(50%-0.5rem)] border border-slate-200 rounded-2xl bg-white overflow-hidden self-start">
      {/* Cabecera del grupo */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-white text-sm font-bold shrink-0">{index + 1}</span>
        <h3 className="flex-1 text-sm font-bold text-slate-800 uppercase tracking-wide">{group.title}</h3>
        {isEdited && (
          <button
            onClick={() => resetGroup(group.id)}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-2"
          >Restaurar</button>
        )}
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Amenazas */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Amenazas ({group.riskCodes.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {group.riskCodes.map(code => (
              <span
                key={code}
                title={riskName(code)}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs bg-rose-50 border border-rose-200 text-rose-700"
              >
                <span className="font-mono font-bold">[{code}]</span>
                <span className="text-rose-600/80 max-w-[220px] truncate">{riskName(code)}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Controles */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Controles que mitigan ({controls.length})</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {controls.map(c => (
              <span key={c} className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg text-xs bg-emerald-50 border border-emerald-200 text-emerald-800">
                {c}
                <button
                  onClick={() => removeControl(group.id, c)}
                  title="Quitar"
                  className="p-0.5 rounded text-emerald-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {controls.length === 0 && <span className="text-xs italic text-slate-400">Sin controles.</span>}
          </div>

          {/* Añadir control */}
          <div className="flex items-center gap-2">
            <input
              list="catalog-control-names"
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') add(); }}
              placeholder="Añadir control (del catálogo o escribe uno)…"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button
              onClick={add}
              disabled={!draft.trim()}
              className="flex items-center gap-1 px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-40 shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Página ──────────────────────────────────────────────────────────────────

export default function RiskControlMappingPage() {
  const { overrides } = useRiskControlStore();

  const stats = useMemo(() => {
    const risks = new Set<string>();
    let links = 0;
    for (const g of RISK_CONTROL_GROUPS) {
      g.riskCodes.forEach(c => risks.add(c));
      const controls = effectiveControls(g.controls, overrides[g.id]);
      links += g.riskCodes.length * controls.length;
    }
    return { groups: RISK_CONTROL_GROUPS.length, risks: risks.size, links };
  }, [overrides]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mapeo Riesgo ↔ Control</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              17 grupos temáticos · controles que mitigan cada amenaza · editable
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2z" />
            </svg>
            Descargar Excel
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Grupos', value: stats.groups, sub: 'temáticos' },
            { label: 'Amenazas', value: stats.risks, sub: 'MAGERIT v3 cubiertas' },
            { label: 'Vínculos', value: stats.links, sub: 'pares amenaza-control' },
          ].map(k => (
            <div key={k.label} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
              <p className="text-xs text-slate-400">{k.label}</p>
              <p className="text-xl font-black text-slate-800">{k.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grupos */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-wrap items-start gap-4">
          {RISK_CONTROL_GROUPS.map((g, i) => <GroupCard key={g.id} index={i} group={g} />)}
        </div>
      </div>

      {/* Datalist compartida para autocompletar controles */}
      <datalist id="catalog-control-names">
        {CATALOG_CONTROL_NAMES.map(n => <option key={n} value={n} />)}
      </datalist>
    </div>
  );
}
