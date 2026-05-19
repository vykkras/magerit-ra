import { useState } from 'react';
import ExcelJS from 'exceljs';
import { useCategoryStore } from '../../store/categoryStore';
import { useQuestionnaireStore, type Answer, type Criticality } from '../../store/questionnaireStore';
import { MAGERIT_THREATS } from '../../data/threats.data';
import { CATALOG_BY_CODE } from '../../data/safeguards.data';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import type { Category } from '../../store/categoryStore';

// ── Constants ─────────────────────────────────────────────────────────────────

const CRIT_OPTIONS: { value: Criticality; label: string }[] = [
  { value: 'baja',    label: 'Baja' },
  { value: 'media',   label: 'Media' },
  { value: 'alta',    label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

// ── Excel export ──────────────────────────────────────────────────────────────

async function downloadExcel(
  category: Category,
  questions: ReturnType<(typeof CATEGORY_QUESTIONNAIRES)[string]>,
  categoryAnswers: Record<string, Answer>,
  critValue: Criticality,
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MAGERIT Risk';
  const ws = wb.addWorksheet(category.name.slice(0, 31));

  ws.columns = [
    { width: 60 }, // A – Pregunta
    { width: 14 }, // B – Respuesta
    { width: 20 }, // C – Riesgos
    { width: 35 }, // D – Salvaguardas
  ];

  // Title
  const t = ws.addRow(['CUESTIONARIO — ' + category.name.toUpperCase()]);
  t.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  t.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
  ws.mergeCells('A1:D1');
  t.height = 22;

  const dt = ws.addRow(['Fecha: ' + new Date().toLocaleDateString('es-ES')]);
  dt.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF94A3B8' } };
  ws.mergeCells('A2:D2');

  ws.addRow([]);

  // Header
  const hdr = ws.addRow(['Pregunta', 'Respuesta', 'Riesgos asociados', 'Salvaguardas asociadas']);
  hdr.eachCell(cell => {
    cell.font      = { bold: true, size: 10, color: { argb: 'FF334155' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    cell.alignment = { vertical: 'middle' };
    cell.border    = { bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } } };
  });
  hdr.height = 18;

  // Criticality row
  const critLabel = CRIT_OPTIONS.find(o => o.value === critValue)?.label ?? '';
  const cr = ws.addRow(['¿Cuál es la criticidad de la solución evaluada?', critLabel, '—', '—']);
  cr.getCell(1).font      = { bold: true };
  cr.getCell(1).alignment = { wrapText: true, vertical: 'top' };
  cr.getCell(2).alignment = { horizontal: 'center', vertical: 'top' };
  cr.height = 28;

  ws.getCell(`B${cr.number}`).dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"Baja,Media,Alta,Critica"'],
  };

  // Question rows
  questions.forEach((q, i) => {
    const raw         = categoryAnswers[q.id] ?? null;
    const answerLabel = raw === 'yes' ? 'Si' : raw === 'no' ? 'No' : raw === 'na' ? 'N/A' : '';
    const threats     = q.riskRefs.join(', ');
    const safeguards  = q.safeguardRefs
      .map(sc => `${sc} – ${CATALOG_BY_CODE[sc]?.name ?? sc}`)
      .join('\n');

    const row = ws.addRow([q.text, answerLabel, threats, safeguards]);

    row.getCell(1).alignment = { wrapText: true, vertical: 'top' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'top' };
    row.getCell(3).font      = { name: 'Courier New', size: 9 };
    row.getCell(3).alignment = { vertical: 'top' };
    row.getCell(4).font      = { size: 9 };
    row.getCell(4).alignment = { wrapText: true, vertical: 'top' };

    ws.getCell(`B${row.number}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Si,No,N/A"'],
    };

    // Subtle row fill based on answer
    const fill =
      answerLabel === 'Si'  ? 'FFF0FDF4' :
      answerLabel === 'No'  ? 'FFFEF2F2' :
      (i % 2 === 0 ? 'FFFFFFFF' : 'FAFAFAFA');
    for (let c = 1; c <= 4; c++) {
      row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    }

    row.height = Math.max(28, q.safeguardRefs.length * 15);
  });

  // Footer summary
  ws.addRow([]);
  const answered = questions.filter(q => categoryAnswers[q.id] != null).length;
  const yesCount = questions.filter(q => categoryAnswers[q.id] === 'yes').length;
  const pct      = questions.length > 0 ? Math.round((yesCount / questions.length) * 100) : 0;
  const foot     = ws.addRow([`Respondidas: ${answered}/${questions.length}   ·   Si: ${yesCount}   ·   No: ${questions.filter(q => categoryAnswers[q.id] === 'no').length}   ·   Cumplimiento: ${pct}%`]);
  ws.mergeCells(`A${foot.number}:D${foot.number}`);
  foot.getCell(1).font = { bold: true, size: 10 };
  foot.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `cuestionario-${category.id}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── DB Modal ──────────────────────────────────────────────────────────────────

function DBModal({ category, onClose }: { category: Category; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">{category.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">Riesgos y salvaguardas asociadas</p>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {category.risks.map(risk => {
            const threat = MAGERIT_THREATS.find(t => t.code === risk.threatCode);
            return (
              <div key={risk.threatCode} className="rounded-lg border border-gray-100 p-3">
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 shrink-0 mt-0.5">
                    {risk.threatCode}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{threat?.name ?? risk.threatCode}</p>
                    {threat?.description && (
                      <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{threat.description}</p>
                    )}
                    {risk.safeguardCodes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {risk.safeguardCodes.map(sc => (
                          <span key={sc} title={CATALOG_BY_CODE[sc]?.name}
                            className="font-mono text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {sc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Answer buttons ────────────────────────────────────────────────────────────

function AnswerBtn({
  label, active, color, onClick,
}: { label: string; active: boolean; color: 'green' | 'red' | 'gray'; onClick: () => void }) {
  const base = 'text-xs font-semibold px-2.5 py-1 rounded border transition-all';
  const styles = {
    green: active ? 'bg-green-600 text-white border-green-600'   : 'text-gray-400 border-gray-200 hover:border-green-400 hover:text-green-600',
    red:   active ? 'bg-red-500 text-white border-red-500'       : 'text-gray-400 border-gray-200 hover:border-red-400 hover:text-red-600',
    gray:  active ? 'bg-gray-400 text-white border-gray-400'     : 'text-gray-400 border-gray-200 hover:border-gray-400',
  };
  return <button className={`${base} ${styles[color]}`} onClick={onClick}>{label}</button>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { categories } = useCategoryStore();
  const { answers, criticality, setAnswer, setCriticality } = useQuestionnaireStore();

  const [activeIdx, setActiveIdx] = useState(0);
  const [showDB,    setShowDB]    = useState(false);

  const category        = categories[activeIdx];
  const questions       = CATEGORY_QUESTIONNAIRES[category?.id] ?? [];
  const categoryAnswers = answers[category?.id] ?? {};
  const critValue       = criticality[category?.id] ?? null;

  const yesCount = questions.filter(q => categoryAnswers[q.id] === 'yes').length;
  const pct      = questions.length > 0 ? Math.round((yesCount / questions.length) * 100) : 0;

  function toggle(qid: string, val: Answer) {
    setAnswer(category.id, qid, categoryAnswers[qid] === val ? null : val);
  }

  if (!category) return null;

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Category tabs ── */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto shrink-0">
        {categories.map((c, i) => {
          const qs      = CATEGORY_QUESTIONNAIRES[c.id] ?? [];
          const cAns    = answers[c.id] ?? {};
          const cYes    = qs.filter(q => cAns[q.id] === 'yes').length;
          const cPct    = qs.length > 0 ? Math.round((cYes / qs.length) * 100) : null;
          const active  = i === activeIdx;
          return (
            <button
              key={c.id}
              onClick={() => setActiveIdx(i)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active
                  ? 'border-gray-900 text-gray-900 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-white/60'
              }`}
            >
              {c.name}
              {cPct !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  cPct >= 80 ? 'bg-green-100 text-green-700' :
                  cPct >= 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{cPct}%</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-5 py-2.5 border-b border-gray-100 bg-white shrink-0">
        {/* Criticality */}
        <span className="text-xs text-gray-400 font-medium">Criticidad:</span>
        <div className="flex gap-1">
          {CRIT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setCriticality(category.id, critValue === opt.value ? null : opt.value)}
              className={`text-xs px-2.5 py-1 rounded border font-medium transition-all ${
                critValue === opt.value
                  ? 'bg-gray-800 text-white border-gray-800'
                  : 'text-gray-500 border-gray-200 hover:border-gray-500 hover:text-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Score */}
          <span className={`text-sm font-bold tabular-nums ${
            pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'
          }`}>{pct}%</span>
          <span className="text-gray-200">|</span>

          {/* Ver BD */}
          <button
            onClick={() => setShowDB(true)}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            Ver BD
          </button>

          {/* Excel */}
          <button
            onClick={() => downloadExcel(category, questions, categoryAnswers, critValue)}
            className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 3v9" />
            </svg>
            Excel
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide w-[52%]">Pregunta</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide w-[12%]">Respuesta</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide w-[14%]">Riesgo asociado</th>
              <th className="text-left px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Salvaguardas asociadas</th>
            </tr>
          </thead>
          <tbody>
            {/* Q0 — Criticality */}
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <td className="px-4 py-3 font-medium text-gray-700 text-sm">
                ¿Cuál es la criticidad de la solución evaluada?
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1 flex-wrap">
                  {CRIT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setCriticality(category.id, critValue === opt.value ? null : opt.value)}
                      className={`text-xs px-2 py-0.5 rounded border font-medium transition-all ${
                        critValue === opt.value
                          ? 'bg-gray-800 text-white border-gray-800'
                          : 'text-gray-400 border-gray-200 hover:border-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-300 text-xs">—</td>
              <td className="px-4 py-3 text-gray-300 text-xs">—</td>
            </tr>

            {/* Question rows */}
            {questions.map((q, i) => {
              const current = categoryAnswers[q.id] ?? null;
              return (
                <tr
                  key={q.id}
                  className={`border-b border-gray-100 transition-colors ${
                    current === 'yes' ? 'bg-green-50/50' :
                    current === 'no'  ? 'bg-red-50/50' :
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  {/* Pregunta */}
                  <td className="px-4 py-3 text-gray-800 leading-relaxed">{q.text}</td>

                  {/* Respuesta */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <AnswerBtn label="Si"  active={current === 'yes'} color="green" onClick={() => toggle(q.id, 'yes')} />
                      <AnswerBtn label="No"  active={current === 'no'}  color="red"   onClick={() => toggle(q.id, 'no')} />
                      <AnswerBtn label="N/A" active={current === 'na'}  color="gray"  onClick={() => toggle(q.id, 'na')} />
                    </div>
                  </td>

                  {/* Riesgo */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {q.riskRefs.map(code => {
                        const t = MAGERIT_THREATS.find(x => x.code === code);
                        return (
                          <span key={code} title={t?.name}
                            className="font-mono text-[11px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                            {code}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Salvaguardas */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {q.safeguardRefs.map(sc => (
                        <span key={sc} title={CATALOG_BY_CODE[sc]?.name}
                          className="font-mono text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                          {sc}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDB && <DBModal category={category} onClose={() => setShowDB(false)} />}
    </div>
  );
}
