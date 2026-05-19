import { useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import { useCategoryStore, getCategorySafeguards } from '../../store/categoryStore';
import { useQuestionnaireStore, type Answer, type Criticality } from '../../store/questionnaireStore';
import { MAGERIT_THREATS, GROUP_LABELS } from '../../data/threats.data';
import { SAFEGUARD_CATALOG, FAMILY_META, CATALOG_BY_CODE } from '../../data/safeguards.data';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import type { Category } from '../../store/categoryStore';

// ── Helpers ──────────────────────────────────────────────────────────────────

const GROUP_COLOR: Record<string, string> = {
  N: 'bg-blue-100 text-blue-800',
  I: 'bg-orange-100 text-orange-800',
  E: 'bg-yellow-100 text-yellow-800',
  A: 'bg-red-100 text-red-800',
};

const FAMILY_COLOR: Record<string, string> = {
  H:   'bg-slate-100 text-slate-700',
  D:   'bg-blue-100 text-blue-700',
  K:   'bg-indigo-100 text-indigo-700',
  S:   'bg-cyan-100 text-cyan-700',
  SW:  'bg-teal-100 text-teal-700',
  HW:  'bg-green-100 text-green-700',
  COM: 'bg-emerald-100 text-emerald-700',
  IP:  'bg-lime-100 text-lime-700',
  MP:  'bg-yellow-100 text-yellow-700',
  AUX: 'bg-amber-100 text-amber-700',
  L:   'bg-orange-100 text-orange-700',
  PS:  'bg-red-100 text-red-700',
  G:   'bg-rose-100 text-rose-700',
  BC:  'bg-purple-100 text-purple-700',
  E:   'bg-violet-100 text-violet-700',
  NEW: 'bg-fuchsia-100 text-fuchsia-700',
};

const CRITICALITY_OPTIONS: { value: Criticality; label: string }[] = [
  { value: null,      label: '— Seleccionar —' },
  { value: 'baja',   label: 'Baja' },
  { value: 'media',  label: 'Media' },
  { value: 'alta',   label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const CRITICALITY_COLOR: Record<string, string> = {
  baja:    'bg-emerald-100 text-emerald-800',
  media:   'bg-amber-100 text-amber-800',
  alta:    'bg-orange-100 text-orange-800',
  critica: 'bg-red-100 text-red-800',
};

// ── Excel export ──────────────────────────────────────────────────────────────

async function downloadQuestionnaireExcel(
  category: Category,
  questions: ReturnType<typeof CATEGORY_QUESTIONNAIRES[string]>,
  categoryAnswers: Record<string, Answer>,
  criticalityValue: Criticality,
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MAGERIT Risk';
  const ws = wb.addWorksheet(category.name.slice(0, 31));

  // Column widths
  ws.columns = [
    { width: 6  },  // A – #
    { width: 70 },  // B – Pregunta
    { width: 18 },  // C – Respuesta
    { width: 24 },  // D – Amenazas
    { width: 30 },  // E – Salvaguardas
  ];

  // ── Header banner ──
  const titleRow = ws.addRow(['CUESTIONARIO DE SALVAGUARDAS — ' + category.name.toUpperCase()]);
  titleRow.getCell(1).font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  ws.mergeCells(`A1:E1`);
  titleRow.height = 24;

  const dateRow = ws.addRow(['Fecha: ' + new Date().toLocaleDateString('es-ES')]);
  dateRow.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF64748B' } };
  ws.mergeCells(`A2:E2`);

  ws.addRow([]);

  // ── Column headers ──
  const hdr = ws.addRow(['#', 'Pregunta', 'Respuesta', 'Amenazas MAGERIT', 'Salvaguardas MAGERIT']);
  hdr.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFDC2626' } },
    };
  });
  hdr.height = 20;

  // ── Criticality row (first question) ──
  const critLabel = CRITICALITY_OPTIONS.find(o => o.value === criticalityValue)?.label ?? '—';
  const critRow = ws.addRow(['Q0', '¿Cuál es la criticidad de la solución evaluada?', critLabel, '', '']);
  critRow.getCell(1).font = { bold: true, color: { argb: 'FF64748B' } };
  critRow.getCell(2).font = { bold: true };
  critRow.getCell(2).alignment = { wrapText: true, vertical: 'top' };
  critRow.getCell(3).font = { bold: true };

  // Dropdown for criticality
  ws.getCell(`C${critRow.number}`).dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"Baja,Media,Alta,Crítica"'],
    showDropDown: false,
  };

  const critColors: Record<string, string> = {
    Baja: 'FFD1FAE5', Media: 'FFFEF3C7', Alta: 'FFFED7AA', Crítica: 'FFFECACA',
  };
  if (critLabel in critColors) {
    critRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: critColors[critLabel] } };
  }
  critRow.height = 30;

  // Separator
  ws.addRow([]);

  // ── Question rows ──
  const ANSWER_VALUES = '"Sí,No,N/A"';

  questions.forEach((q, i) => {
    const raw = categoryAnswers[q.id] ?? null;
    const answerLabel = raw === 'yes' ? 'Sí' : raw === 'no' ? 'No' : raw === 'na' ? 'N/A' : '';

    const threats    = q.riskRefs.join(', ');
    const safeguards = q.safeguardRefs
      .map(sc => `${sc} – ${CATALOG_BY_CODE[sc]?.name ?? sc}`)
      .join('\n');

    const row = ws.addRow([`Q${i + 1}`, q.text, answerLabel, threats, safeguards]);

    row.getCell(1).font      = { bold: true, color: { argb: 'FF94A3B8' } };
    row.getCell(1).alignment = { vertical: 'top', horizontal: 'center' };
    row.getCell(2).alignment = { wrapText: true, vertical: 'top' };
    row.getCell(3).alignment = { vertical: 'top', horizontal: 'center' };
    row.getCell(4).font      = { name: 'Courier New', size: 9 };
    row.getCell(4).alignment = { wrapText: true, vertical: 'top' };
    row.getCell(5).font      = { size: 9 };
    row.getCell(5).alignment = { wrapText: true, vertical: 'top' };

    // Dropdown
    ws.getCell(`C${row.number}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [ANSWER_VALUES],
      showDropDown: false,
    };

    // Row color by answer
    const rowFill =
      answerLabel === 'Sí'  ? 'FFF0FDF4' :
      answerLabel === 'No'  ? 'FFFEF2F2' :
      answerLabel === 'N/A' ? 'FFF8FAFC' :
      'FFFFFFFF';

    const answerFontColor =
      answerLabel === 'Sí'  ? 'FF16A34A' :
      answerLabel === 'No'  ? 'FFDC2626' :
      'FF94A3B8';

    for (let c = 1; c <= 5; c++) {
      row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } };
    }
    row.getCell(3).font = { bold: true, color: { argb: answerFontColor } };

    // Zebra stripe when unanswered
    if (!answerLabel) {
      const stripe = i % 2 === 0 ? 'FFFFFFFF' : 'FFF8FAFC';
      for (let c = 1; c <= 5; c++) {
        row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: stripe } };
      }
    }

    row.height = Math.max(30, q.safeguardRefs.length * 16);
  });

  // ── Summary footer ──
  ws.addRow([]);
  const answered  = questions.filter(q => categoryAnswers[q.id] != null).length;
  const yesCount  = questions.filter(q => categoryAnswers[q.id] === 'yes').length;
  const noCount   = questions.filter(q => categoryAnswers[q.id] === 'no').length;
  const pct       = questions.length > 0 ? Math.round((yesCount / questions.length) * 100) : 0;

  const summaryRow = ws.addRow([
    '', `Respondidas: ${answered}/${questions.length}   ·   Sí: ${yesCount}   ·   No: ${noCount}   ·   Cumplimiento: ${pct}%`, '', '', '',
  ]);
  ws.mergeCells(`B${summaryRow.number}:E${summaryRow.number}`);
  summaryRow.getCell(2).font = { bold: true, size: 11 };
  summaryRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
  summaryRow.height = 22;

  // Download
  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `cuestionario-${category.id}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Threat Picker Modal ───────────────────────────────────────────────────────

function ThreatPickerModal({
  assignedCodes, onSelect, onClose,
}: { assignedCodes: string[]; onSelect: (code: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MAGERIT_THREATS.filter(
      t => !assignedCodes.includes(t.code) &&
        (t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    );
  }, [query, assignedCodes]);

  const groups = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach(t => { (map[t.group] ??= []).push(t); });
    return map;
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-slate-800">Agregar riesgo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="px-4 py-3 border-b">
          <input autoFocus className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Buscar amenaza por código o nombre…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {Object.keys(groups).length === 0 && <p className="text-sm text-slate-400 text-center py-6">Sin resultados</p>}
          {(['N', 'I', 'E', 'A'] as const).map(g => {
            if (!groups[g]?.length) return null;
            return (
              <div key={g}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{GROUP_LABELS[g]}</p>
                <div className="space-y-1">
                  {groups[g].map(t => (
                    <button key={t.code} onClick={() => { onSelect(t.code); onClose(); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${GROUP_COLOR[g]}`}>{t.code}</span>
                        <span className="text-sm font-semibold text-slate-700">{t.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 ml-8">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Safeguard Picker Modal ────────────────────────────────────────────────────

function SafeguardPickerModal({
  assignedCodes, onSelect, onClose,
}: { assignedCodes: string[]; onSelect: (code: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return SAFEGUARD_CATALOG.filter(
      s => !assignedCodes.includes(s.code) &&
        (s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    );
  }, [query, assignedCodes]);

  const byFamily = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach(s => { (map[s.family] ??= []).push(s); });
    return map;
  }, [filtered]);

  const families = Object.keys(byFamily) as (keyof typeof FAMILY_META)[];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-slate-800">Agregar salvaguarda</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="px-4 py-3 border-b">
          <input autoFocus className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Buscar salvaguarda por código o nombre…" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {families.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Sin resultados</p>}
          {families.map(f => (
            <div key={f}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{FAMILY_META[f]?.label ?? f}</p>
              <div className="space-y-1">
                {byFamily[f].map(s => (
                  <button key={s.code} onClick={() => { onSelect(s.code); onClose(); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${FAMILY_COLOR[f] ?? 'bg-slate-100 text-slate-700'}`}>{s.code}</span>
                      <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Risk Card ─────────────────────────────────────────────────────────────────

function RiskCard({ categoryId, threatCode, safeguardCodes }: {
  categoryId: string; threatCode: string; safeguardCodes: string[];
}) {
  const { removeRisk, addSafeguard, removeSafeguard } = useCategoryStore();
  const [showSgPicker, setShowSgPicker] = useState(false);

  const threat = MAGERIT_THREATS.find(t => t.code === threatCode);
  const group  = threat?.group ?? 'E';

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${GROUP_COLOR[group]}`}>{threatCode}</span>
            <span className="text-sm font-semibold text-slate-800">{threat?.name ?? threatCode}</span>
          </div>
          <button onClick={() => removeRisk(categoryId, threatCode)}
            className="text-slate-300 hover:text-red-500 transition-colors shrink-0 text-lg leading-none" title="Quitar riesgo">×</button>
        </div>
        {threat?.description && <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{threat.description}</p>}
        <div className="flex flex-wrap gap-1.5 items-center">
          {safeguardCodes.length === 0 && <span className="text-xs text-slate-400 italic">Sin salvaguardas asignadas</span>}
          {safeguardCodes.map(sc => {
            const entry = SAFEGUARD_CATALOG.find(s => s.code === sc);
            const fam   = entry?.family ?? 'H';
            return (
              <span key={sc} className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${FAMILY_COLOR[fam] ?? 'bg-slate-100 text-slate-700'}`} title={entry?.name}>
                {sc}
                <button onClick={() => removeSafeguard(categoryId, threatCode, sc)} className="opacity-60 hover:opacity-100 ml-0.5 leading-none">×</button>
              </span>
            );
          })}
          <button onClick={() => setShowSgPicker(true)}
            className="text-[11px] font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-0.5 rounded-full transition-colors">
            + Salvaguarda
          </button>
        </div>
      </div>
      {showSgPicker && (
        <SafeguardPickerModal assignedCodes={safeguardCodes}
          onSelect={sc => addSafeguard(categoryId, threatCode, sc)} onClose={() => setShowSgPicker(false)} />
      )}
    </>
  );
}

// ── Questionnaire Panel ───────────────────────────────────────────────────────

function QuestionnairePanel({ category }: { category: Category }) {
  const { answers, criticality, setAnswer, setCriticality, resetCategory } = useQuestionnaireStore();
  const categoryAnswers  = answers[category.id] ?? {};
  const criticalityValue = criticality[category.id] ?? null;
  const questions        = CATEGORY_QUESTIONNAIRES[category.id] ?? [];

  const answered = questions.filter(q => categoryAnswers[q.id] != null).length;
  const yesCount = questions.filter(q => categoryAnswers[q.id] === 'yes').length;
  const noCount  = questions.filter(q => categoryAnswers[q.id] === 'no').length;
  const pct      = questions.length > 0 ? Math.round((yesCount / questions.length) * 100) : 0;

  function toggle(qid: string, val: Answer) {
    setAnswer(category.id, qid, categoryAnswers[qid] === val ? null : val);
  }

  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5">

      {/* Score + actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-slate-800">Cumplimiento estimado</p>
            <p className="text-xs text-slate-400 mt-0.5">{answered}/{questions.length} respondidas · {yesCount} Sí · {noCount} No</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-500' : 'text-red-600'}`}>
              {pct}%
            </span>
            <button
              onClick={() => downloadQuestionnaireExcel(category, questions, categoryAnswers, criticalityValue)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 3v9" />
              </svg>
              Excel
            </button>
            <button
              onClick={() => { if (confirm('¿Resetear todas las respuestas de este cuestionario?')) resetCategory(category.id); }}
              className="text-xs text-slate-400 hover:text-red-500 transition-colors border border-slate-200 hover:border-red-300 px-2.5 py-1.5 rounded-lg"
            >
              Resetear
            </button>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Q0 — Criticality (always first) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center mt-0.5">0</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800 mb-2">¿Cuál es la criticidad de la solución evaluada?</p>
            <div className="flex gap-2 flex-wrap">
              {CRITICALITY_OPTIONS.filter(o => o.value !== null).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCriticality(category.id, criticalityValue === opt.value ? null : opt.value)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                    criticalityValue === opt.value
                      ? CRITICALITY_COLOR[opt.value!] + ' border-transparent shadow-sm font-bold'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Substantive questions */}
      {questions.length === 0 && (
        <div className="text-center text-sm text-slate-400 py-12">No hay cuestionario definido para esta categoría.</div>
      )}

      {questions.map((q, i) => {
        const current = categoryAnswers[q.id] ?? null;
        return (
          <div key={q.id} className={`bg-white border rounded-xl p-4 transition-colors ${
            current === 'yes' ? 'border-emerald-200 bg-emerald-50/40' :
            current === 'no'  ? 'border-red-200 bg-red-50/40' :
            current === 'na'  ? 'border-slate-200 bg-slate-50/40' :
            'border-slate-200'
          }`}>
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                {/* Risk + safeguard badges */}
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {q.riskRefs.map(code => {
                    const t = MAGERIT_THREATS.find(x => x.code === code);
                    const g = t?.group ?? 'E';
                    return (
                      <span key={code} title={t?.name}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${GROUP_COLOR[g]}`}>
                        {code}
                      </span>
                    );
                  })}
                  <span className="text-[10px] text-slate-300 self-center">·</span>
                  {q.safeguardRefs.map(sc => {
                    const entry = CATALOG_BY_CODE[sc];
                    const fam   = entry?.family ?? 'H';
                    return (
                      <span key={sc} title={entry?.name ?? sc}
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${FAMILY_COLOR[fam] ?? 'bg-slate-100 text-slate-700'}`}>
                        {sc}
                      </span>
                    );
                  })}
                </div>

                {/* Question text */}
                <p className="text-sm text-slate-800 leading-relaxed">{q.text}</p>

                {/* Answer buttons */}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => toggle(q.id, 'yes')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                      current === 'yes'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-600'
                    }`}>
                    Sí
                  </button>
                  <button onClick={() => toggle(q.id, 'no')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                      current === 'no'
                        ? 'bg-red-500 text-white border-red-500 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-red-400 hover:text-red-600'
                    }`}>
                    No
                  </button>
                  <button onClick={() => toggle(q.id, 'na')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      current === 'na'
                        ? 'bg-slate-400 text-white border-slate-400 shadow-sm'
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600'
                    }`}>
                    N/A
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Category Detail ───────────────────────────────────────────────────────────

type Tab = 'risks' | 'questionnaire';

function CategoryDetail({ category }: { category: Category }) {
  const { addRisk } = useCategoryStore();
  const [showThreatPicker, setShowThreatPicker] = useState(false);
  const [tab, setTab] = useState<Tab>('risks');

  const categorySafeguards = getCategorySafeguards(category);

  const sgByFamily = useMemo(() => {
    const map: Record<string, string[]> = {};
    categorySafeguards.forEach(sc => {
      const entry = SAFEGUARD_CATALOG.find(s => s.code === sc);
      const fam   = entry?.family ?? 'H';
      (map[fam] ??= []).push(sc);
    });
    return map;
  }, [categorySafeguards]);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'risks',         label: 'Riesgos y salvaguardas' },
    { id: 'questionnaire', label: 'Cuestionario' },
  ];

  return (
    <>
      {/* Tab bar */}
      <div className="flex gap-1 px-6 pt-3 pb-0 bg-white border-b border-slate-200 shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
              tab === t.id
                ? 'border-red-500 text-red-700 bg-red-50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'risks' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-800">
                Riesgos
                <span className="ml-2 text-sm font-normal text-slate-400">({category.risks.length})</span>
              </h2>
              <button onClick={() => setShowThreatPicker(true)}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors">
                + Agregar riesgo
              </button>
            </div>
            {category.risks.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                <p className="text-sm text-slate-400">Sin riesgos asignados.</p>
                <button onClick={() => setShowThreatPicker(true)} className="mt-3 text-sm text-red-600 font-semibold hover:underline">
                  + Agregar el primero
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {category.risks.map(r => (
                  <RiskCard key={r.threatCode} categoryId={category.id} threatCode={r.threatCode} safeguardCodes={r.safeguardCodes} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-800 mb-1">
              Salvaguardas de la Categoría
              <span className="ml-2 text-sm font-normal text-slate-400">({categorySafeguards.length} · derivadas automáticamente)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-3">Unión de todas las salvaguardas asignadas a los riesgos de esta categoría.</p>
            {categorySafeguards.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-400">Agrega riesgos con salvaguardas para verlas aquí.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(sgByFamily).map(([fam, codes]) => (
                  <div key={fam} className="bg-white border border-slate-200 rounded-xl p-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      {FAMILY_META[fam as keyof typeof FAMILY_META]?.label ?? fam}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {codes.map(sc => {
                        const entry = SAFEGUARD_CATALOG.find(s => s.code === sc);
                        return (
                          <span key={sc} className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${FAMILY_COLOR[fam] ?? 'bg-slate-100 text-slate-700'}`} title={entry?.name}>
                            <span>{sc}</span>
                            <span className="font-normal opacity-75">— {entry?.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === 'questionnaire' && <QuestionnairePanel category={category} />}

      {showThreatPicker && (
        <ThreatPickerModal assignedCodes={category.risks.map(r => r.threatCode)}
          onSelect={code => addRisk(category.id, code)} onClose={() => setShowThreatPicker(false)} />
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { categories } = useCategoryStore();
  const { answers, criticality } = useQuestionnaireStore();
  const [selectedId, setSelectedId] = useState<string>(categories[0]?.id ?? '');
  const selected = categories.find(c => c.id === selectedId);

  return (
    <div className="flex h-full">

      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Categorías</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {categories.map(c => {
            const active           = c.id === selectedId;
            const qs               = CATEGORY_QUESTIONNAIRES[c.id] ?? [];
            const categoryAnswers  = answers[c.id] ?? {};
            const critValue        = criticality[c.id] ?? null;
            const yesCount         = qs.filter(q => categoryAnswers[q.id] === 'yes').length;
            const pct              = qs.length > 0 ? Math.round((yesCount / qs.length) * 100) : null;

            return (
              <button key={c.id} onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-[3px] ${
                  active
                    ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}>
                <span className="block leading-snug">{c.name}</span>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {c.risks.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${active ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                      {c.risks.length} riesgos
                    </span>
                  )}
                  {critValue && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize ${CRITICALITY_COLOR[critValue]}`}>
                      {critValue}
                    </span>
                  )}
                  {pct !== null && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      pct >= 80 ? 'bg-emerald-100 text-emerald-700' :
                      pct >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {pct}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <h1 className="text-lg font-bold text-slate-900">{selected.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {selected.risks.length} riesgo{selected.risks.length !== 1 ? 's' : ''} ·{' '}
                {getCategorySafeguards(selected).length} salvaguarda{getCategorySafeguards(selected).length !== 1 ? 's' : ''}
              </p>
            </div>
            <CategoryDetail category={selected} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Selecciona una categoría
          </div>
        )}
      </div>
    </div>
  );
}
