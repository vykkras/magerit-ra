import { useState } from 'react';
import ExcelJS from 'exceljs';
import s from './CategoriesPage.module.css';
import { useCategoryStore } from '../../store/categoryStore';
import { useQuestionnaireStore, type Answer, type Criticality } from '../../store/questionnaireStore';
import { MAGERIT_THREATS } from '../../data/threats.data';
import { CATALOG_BY_CODE } from '../../data/safeguards.data';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import type { Category } from '../../store/categoryStore';

// ── Constants ─────────────────────────────────────────────────────────────────

const CRIT_OPTIONS: { value: NonNullable<Criticality>; label: string }[] = [
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
    { width: 60 },
    { width: 14 },
    { width: 20 },
    { width: 36 },
  ];

  const t = ws.addRow(['CUESTIONARIO — ' + category.name.toUpperCase()]);
  t.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  t.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2E5C' } };
  ws.mergeCells('A1:D1');
  t.height = 22;

  const dt = ws.addRow(['Fecha: ' + new Date().toLocaleDateString('es-ES')]);
  dt.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF94A3B8' } };
  ws.mergeCells('A2:D2');

  ws.addRow([]);

  const hdr = ws.addRow(['Pregunta', 'Respuesta', 'Riesgos asociados', 'Salvaguardas asociadas']);
  hdr.eachCell(cell => {
    cell.font      = { bold: true, size: 10, color: { argb: 'FF334155' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    cell.alignment = { vertical: 'middle' };
    cell.border    = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
  });
  hdr.height = 18;

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

  questions.forEach((q, i) => {
    const raw         = categoryAnswers[q.id] ?? null;
    const answerLabel = raw === 'yes' ? 'Si' : raw === 'no' ? 'No' : raw === 'na' ? 'N/A' : '';
    const row = ws.addRow([
      q.text,
      answerLabel,
      q.riskRefs.join(', '),
      q.safeguardRefs.map(sc => `${sc} – ${CATALOG_BY_CODE[sc]?.name ?? sc}`).join('\n'),
    ]);
    row.getCell(1).alignment = { wrapText: true, vertical: 'top' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'top' };
    row.getCell(3).font      = { name: 'Courier New', size: 9 };
    row.getCell(4).font      = { size: 9 };
    row.getCell(4).alignment = { wrapText: true, vertical: 'top' };
    ws.getCell(`B${row.number}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Si,No,N/A"'],
    };
    const fill = answerLabel === 'Si' ? 'FFF0FDF4' : answerLabel === 'No' ? 'FFFEF2F2' : (i % 2 === 0 ? 'FFFFFFFF' : 'FFFAFAFA');
    for (let c = 1; c <= 4; c++) row.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    row.height = Math.max(28, q.safeguardRefs.length * 15);
  });

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
  a.href = url; a.download = `cuestionario-${category.id}-${new Date().toISOString().slice(0, 10)}.xlsx`; a.click();
  URL.revokeObjectURL(url);
}

// ── DB Modal ──────────────────────────────────────────────────────────────────

function DBModal({ category, onClose }: { category: Category; onClose: () => void }) {
  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.modalHeader}>
          <div>
            <p className={s.modalTitle}>Riesgos y salvaguardas</p>
            <p className={s.modalSub}>{category.name}</p>
          </div>
          <button className={s.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={s.modalBody}>
          {category.risks.map(risk => {
            const threat = MAGERIT_THREATS.find(t => t.code === risk.threatCode);
            return (
              <div key={risk.threatCode} className={s.riskCard}>
                <div className={s.riskCardHeader}>
                  <span className={s.riskCode}>{risk.threatCode}</span>
                  <span className={s.riskName}>{threat?.name ?? risk.threatCode}</span>
                </div>
                {threat?.description && <p className={s.riskDesc}>{threat.description}</p>}
                <div className={s.sgList}>
                  {risk.safeguardCodes.map(sc => (
                    <span key={sc} className={s.sgItem} title={CATALOG_BY_CODE[sc]?.name}>{sc}</span>
                  ))}
                  {risk.safeguardCodes.length === 0 && (
                    <span style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic' }}>Sin salvaguardas</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
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

  const scoreClass = pct >= 80 ? s.scoreGreen : pct >= 50 ? s.scoreYellow : s.scoreRed;

  return (
    <div className={s.page}>

      {/* ── Tabs ── */}
      <div className={s.tabs}>
        {categories.map((c, i) => {
          const qs   = CATEGORY_QUESTIONNAIRES[c.id] ?? [];
          const cAns = answers[c.id] ?? {};
          const cYes = qs.filter(q => cAns[q.id] === 'yes').length;
          const cPct = qs.length > 0 ? Math.round((cYes / qs.length) * 100) : null;
          const badgeClass = cPct === null ? '' : cPct >= 80 ? s.tabBadgeGreen : cPct >= 50 ? s.tabBadgeYellow : s.tabBadgeRed;
          return (
            <button
              key={c.id}
              onClick={() => setActiveIdx(i)}
              className={`${s.tab} ${i === activeIdx ? s.tabActive : ''}`}
            >
              {c.name}
              {cPct !== null && (
                <span className={`${s.tabBadge} ${badgeClass}`}>{cPct}%</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className={s.content}>

        {/* Toolbar card */}
        <div className={s.toolbar}>
          <div className={s.toolbarSection}>
            <span className={s.toolbarLabel}>Criticidad:</span>
            <div className={s.critBtns}>
              {CRIT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCriticality(category.id, critValue === opt.value ? null : opt.value)}
                  className={`${s.critBtn} ${critValue === opt.value ? s.critBtnActive : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={s.toolbarRight}>
            <span className={`${s.scoreLabel} ${scoreClass}`}>{pct}%</span>
            <div className={s.divider} />
            <button className={s.btnSecondary} onClick={() => setShowDB(true)}>
              Ver BD
            </button>
            <button className={s.btnExcel} onClick={() => downloadExcel(category, questions, categoryAnswers, critValue)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 3v9" />
              </svg>
              Descargar Excel
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className={s.tableCard}>
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Pregunta</th>
                <th style={{ width: '13%' }}>Respuesta</th>
                <th style={{ width: '14%' }}>Riesgo asociado</th>
                <th>Salvaguardas asociadas</th>
              </tr>
            </thead>
            <tbody>

              {/* Q0 — Criticality */}
              <tr className={s.q0Row}>
                <td className={s.q0Question}>¿Cuál es la criticidad de la solución evaluada?</td>
                <td>
                  <div className={s.critBtns} style={{ flexWrap: 'wrap' }}>
                    {CRIT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setCriticality(category.id, critValue === opt.value ? null : opt.value)}
                        className={`${s.critBtn} ${critValue === opt.value ? s.critBtnActive : ''}`}
                        style={{ padding: '5px 12px', fontSize: 12 }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </td>
                <td style={{ color: '#cbd5e1' }}>—</td>
                <td style={{ color: '#cbd5e1' }}>—</td>
              </tr>

              {/* Question rows */}
              {questions.map(q => {
                const current = categoryAnswers[q.id] ?? null;
                return (
                  <tr
                    key={q.id}
                    className={current === 'yes' ? s.rowYes : current === 'no' ? s.rowNo : ''}
                  >
                    <td>{q.text}</td>

                    <td>
                      <div className={s.answerBtns}>
                        <button
                          onClick={() => toggle(q.id, 'yes')}
                          className={`${s.ansBtn} ${current === 'yes' ? s.ansBtnYes : ''}`}
                        >
                          Si
                        </button>
                        <button
                          onClick={() => toggle(q.id, 'no')}
                          className={`${s.ansBtn} ${current === 'no' ? s.ansBtnNo : ''}`}
                        >
                          No
                        </button>
                        <button
                          onClick={() => toggle(q.id, 'na')}
                          className={`${s.ansBtn} ${current === 'na' ? s.ansBtnNa : ''}`}
                        >
                          N/A
                        </button>
                      </div>
                    </td>

                    <td>
                      <div className={s.badgeWrap}>
                        {q.riskRefs.map(code => (
                          <span key={code} className={s.riskBadge} title={MAGERIT_THREATS.find(t => t.code === code)?.name}>
                            {code}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div className={s.badgeWrap}>
                        {q.safeguardRefs.map(sc => (
                          <span key={sc} className={s.sgBadge} title={CATALOG_BY_CODE[sc]?.name}>
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
      </div>

      {showDB && <DBModal category={category} onClose={() => setShowDB(false)} />}
    </div>
  );
}
