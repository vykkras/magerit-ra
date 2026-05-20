import { useState, useRef, useEffect } from 'react';
import ExcelJS from 'exceljs';
import s from './CategoriesPage.module.css';
import { useCategoryStore } from '../../store/categoryStore';
import { useQuestionnaireStore, type Answer, type Criticality } from '../../store/questionnaireStore';
import { useRiskScenarioStore } from '../../store/riskScenarioStore';
import { MAGERIT_THREATS } from '../../data/threats.data';
import { CATALOG_BY_CODE } from '../../data/safeguards.data';
import { CATEGORY_QUESTIONNAIRES, type Question } from '../../data/questionnaires.data';
import type { Category } from '../../store/categoryStore';

// ── Constants ─────────────────────────────────────────────────────────────────

const CRIT_OPTIONS: { value: NonNullable<Criticality>; label: string }[] = [
  { value: 'baja',    label: 'Baja' },
  { value: 'media',   label: 'Media' },
  { value: 'alta',    label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

// ── Editable question cell ────────────────────────────────────────────────────

function EditableQuestion({
  categoryId, questionId, defaultText,
}: { categoryId: string; questionId: string; defaultText: string }) {
  const { customQuestions, setCustomQuestion, resetCustomQuestion } = useQuestionnaireStore();
  const customText = customQuestions[categoryId]?.[questionId];
  const displayText = customText ?? defaultText;
  const isEdited = customText !== undefined && customText !== defaultText;

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);

  function startEdit() {
    setDraft(displayText);
    setEditing(true);
    setTimeout(() => taRef.current?.focus(), 0);
  }

  function save() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== defaultText) {
      setCustomQuestion(categoryId, questionId, trimmed);
    } else {
      resetCustomQuestion(categoryId, questionId);
    }
    setEditing(false);
  }

  function cancel() { setEditing(false); }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Escape') cancel();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save();
  }

  if (editing) {
    return (
      <div>
        <textarea
          ref={taRef}
          className={s.editArea}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
        />
        <div className={s.editActions}>
          <button className={s.btnSave}   onClick={save}>Guardar</button>
          <button className={s.btnCancel} onClick={cancel}>Cancelar</button>
          {isEdited && (
            <button className={s.btnReset} onClick={() => { resetCustomQuestion(categoryId, questionId); setEditing(false); }}>
              Restaurar original
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={s.questionCell}>
      {isEdited && <span className={s.editedDot} title="Pregunta editada" />}
      <span className={s.questionText}>{displayText}</span>
      <button className={s.editBtn} onClick={startEdit} title="Editar pregunta">✏</button>
    </div>
  );
}

// ── Editable refs (risk or safeguard multi-select) ────────────────────────────

function EditableRefs({
  categoryId, questionId, type, defaultCodes,
}: {
  categoryId: string;
  questionId: string;
  type: 'risk' | 'safeguard';
  defaultCodes: string[];
}) {
  const {
    customRiskRefs, customSafeguardRefs,
    setCustomRiskRefs, resetCustomRiskRefs,
    setCustomSafeguardRefs, resetCustomSafeguardRefs,
  } = useQuestionnaireStore();

  const stored = type === 'risk'
    ? customRiskRefs[categoryId]?.[questionId]
    : customSafeguardRefs[categoryId]?.[questionId];
  const currentCodes = stored ?? defaultCodes;
  const isEdited = stored !== undefined;

  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const [draft,  setDraft]  = useState<string[]>([]);
  const ref       = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const allOptions = type === 'risk'
    ? MAGERIT_THREATS.map(t => ({ code: t.code, name: t.name }))
    : Object.entries(CATALOG_BY_CODE).map(([code, sg]) => ({ code, name: (sg as { name: string }).name }));

  const filtered = search.trim()
    ? allOptions.filter(o =>
        o.code.toLowerCase().includes(search.toLowerCase()) ||
        o.name?.toLowerCase().includes(search.toLowerCase())
      )
    : allOptions;

  function openEditor() {
    setDraft([...currentCodes]);
    setOpen(true);
    setTimeout(() => searchRef.current?.focus(), 0);
  }

  function toggle(code: string) {
    setDraft(d => d.includes(code) ? d.filter(c => c !== code) : [...d, code]);
  }

  function save() {
    if (type === 'risk') setCustomRiskRefs(categoryId, questionId, draft);
    else setCustomSafeguardRefs(categoryId, questionId, draft);
    setOpen(false);
    setSearch('');
  }

  function restore() {
    if (type === 'risk') resetCustomRiskRefs(categoryId, questionId);
    else resetCustomSafeguardRefs(categoryId, questionId);
    setOpen(false);
    setSearch('');
  }

  function cancel() { setOpen(false); setSearch(''); }

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cancel();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className={s.refsCell}>
        <div className={s.badgeWrap}>
          {currentCodes.map(code => {
            const item = type === 'risk'
              ? MAGERIT_THREATS.find(t => t.code === code)
              : CATALOG_BY_CODE[code] as { name?: string; description?: string } | undefined;
            return <BadgeBtn key={code} code={code} name={item?.name} description={item?.description} />;
          })}
          {currentCodes.length === 0 && (
            <span style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic' }}>—</span>
          )}
        </div>
        <button className={s.refsEditBtn} onClick={openEditor} title={`Editar ${type === 'risk' ? 'riesgos' : 'salvaguardas'}`}>✏</button>
      </div>

      {open && (
        <div className={s.refsPopover}>
          <input
            ref={searchRef}
            className={s.refsSearch}
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className={s.refsList}>
            {filtered.map(opt => (
              <label key={opt.code} className={s.refsOption}>
                <input
                  type="checkbox"
                  checked={draft.includes(opt.code)}
                  onChange={() => toggle(opt.code)}
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                <span className={s.refsOptionCode}>{opt.code}</span>
                <span className={s.refsOptionName}>{opt.name}</span>
              </label>
            ))}
          </div>
          <div className={s.refsActions}>
            {isEdited && (
              <button className={s.btnReset} onClick={restore} style={{ marginLeft: 0 }}>Restaurar</button>
            )}
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button className={s.btnCancel} onClick={cancel}>Cancelar</button>
              <button className={s.btnSave}   onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Expandable badge ──────────────────────────────────────────────────────────

function BadgeBtn({ code, name, description }: { code: string; name?: string; description?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ display: 'inline-block', position: 'relative' }}>
      <button
        className={`${s.badgeBtn} ${open ? s.badgeBtnOpen : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {code}
      </button>
      {open && (name || description) && (
        <div className={s.badgePopup}>
          <p className={s.badgePopupCode}>{code}</p>
          {name        && <p className={s.badgePopupName}>{name}</p>}
          {description && <p className={s.badgePopupDesc}>{description}</p>}
        </div>
      )}
    </div>
  );
}

// ── Risk scenario table ───────────────────────────────────────────────────────

const PIP_ACTIVE = [s.pip1Active, s.pip2Active, s.pip3Active, s.pip4Active] as const;

function ScorePip({ value, onSelect }: { value: 1|2|3|4|null; onSelect: (v: 1|2|3|4) => void }) {
  return (
    <div className={s.pipRow}>
      {([1, 2, 3, 4] as const).map(n => (
        <button
          key={n}
          onClick={() => onSelect(n)}
          className={`${s.pip} ${value === n ? PIP_ACTIVE[n - 1] : ''}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function ScenarioTable({ category }: { category: Category }) {
  const { scenarios, updateRow } = useRiskScenarioStore();
  const rows = scenarios[category.id] ?? [];

  return (
    <div className={s.tableCard}>
      <table className={s.table}>
        <thead>
          <tr>
            <th style={{ width: '14%' }}>Riesgo ID</th>
            <th style={{ width: '16%' }}>Probabilidad (1–4)</th>
            <th style={{ width: '16%' }}>Impacto inherente (1–4)</th>
            <th style={{ width: '30%' }}>Salvaguarda aplicable</th>
            <th style={{ width: '16%' }}>Impacto residual (1–4)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>
                <select
                  className={s.sgSelect}
                  value={row.threatCode}
                  onChange={e => updateRow(category.id, row.id, { threatCode: e.target.value })}
                >
                  <option value="">—</option>
                  {MAGERIT_THREATS.map(t => (
                    <option key={t.code} value={t.code}>{t.code} · {t.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <ScorePip value={row.probability} onSelect={v => updateRow(category.id, row.id, { probability: v })} />
              </td>
              <td>
                <ScorePip value={row.inherentImpact} onSelect={v => updateRow(category.id, row.id, { inherentImpact: v })} />
              </td>
              <td>
                <select
                  className={s.sgSelect}
                  value={row.applicableSafeguard}
                  onChange={e => updateRow(category.id, row.id, { applicableSafeguard: e.target.value })}
                >
                  <option value="">—</option>
                  {Object.entries(CATALOG_BY_CODE).map(([sc, sg]) => (
                    <option key={sc} value={sc}>{sc} · {(sg as { name: string }).name}</option>
                  ))}
                </select>
              </td>
              <td>
                <ScorePip value={row.residualImpact} onSelect={v => updateRow(category.id, row.id, { residualImpact: v })} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Excel export ──────────────────────────────────────────────────────────────

async function downloadExcel(
  category: Category,
  questions: Question[],
  categoryAnswers: Record<string, Answer>,
  critValue: Criticality,
  customQ: Record<string, string> = {},
  customRR: Record<string, string[]> = {},
  customSR: Record<string, string[]> = {},
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MAGERIT Risk';
  const ws = wb.addWorksheet(category.name.replace(/[\\/*?:[\]]/g, '-').slice(0, 31));

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
    const riskCodes = customRR[q.id] ?? q.riskRefs;
    const sgCodes   = customSR[q.id] ?? q.safeguardRefs;
    const row = ws.addRow([
      customQ[q.id] ?? q.text,
      answerLabel,
      riskCodes.join(', '),
      sgCodes.map(sc => `${sc} – ${(CATALOG_BY_CODE[sc] as { name?: string })?.name ?? sc}`).join('\n'),
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
                    <span key={sc} className={s.sgItem}>
                      <strong style={{ fontFamily: 'monospace' }}>{sc}</strong>
                      {CATALOG_BY_CODE[sc]?.name ? ` · ${CATALOG_BY_CODE[sc].name}` : ''}
                    </span>
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
  const { answers, criticality, customQuestions, customRiskRefs, customSafeguardRefs, setAnswer, setCriticality } = useQuestionnaireStore();

  const [activeIdx, setActiveIdx] = useState(0);
  const [showDB,    setShowDB]    = useState(false);
  const [view, setView] = useState<'questionnaire' | 'scenario'>('questionnaire');

  const category        = categories[activeIdx];
  const questions       = CATEGORY_QUESTIONNAIRES[category?.id] ?? [];
  const categoryAnswers = answers[category?.id] ?? {};
  const critValue       = criticality[category?.id] ?? null;
  const customQ         = customQuestions[category?.id] ?? {};
  const customRR        = customRiskRefs[category?.id] ?? {};
  const customSR        = customSafeguardRefs[category?.id] ?? {};

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
          {/* View toggle */}
          <div className={s.viewToggle}>
            <button
              className={`${s.viewBtn} ${view === 'questionnaire' ? s.viewBtnActive : ''}`}
              onClick={() => setView('questionnaire')}
            >
              Cuestionario
            </button>
            <button
              className={`${s.viewBtn} ${view === 'scenario' ? s.viewBtnActive : ''}`}
              onClick={() => setView('scenario')}
            >
              Escenario de riesgo
            </button>
          </div>

          {view === 'questionnaire' && (
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
          )}

          <div className={s.toolbarRight}>
            {view === 'questionnaire' && (
              <>
                <span className={`${s.scoreLabel} ${scoreClass}`}>{pct}%</span>
                <div className={s.divider} />
              </>
            )}
            <button className={s.btnSecondary} onClick={() => setShowDB(true)}>
              Ver BD
            </button>
            {view === 'questionnaire' && (
              <button className={s.btnExcel} onClick={() => downloadExcel(category, questions, categoryAnswers, critValue, customQ, customRR, customSR)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 3v9" />
                </svg>
                Descargar Excel
              </button>
            )}
          </div>
        </div>

        {/* Scenario table */}
        {view === 'scenario' && <ScenarioTable category={category} />}

        {/* Questionnaire table card */}
        {view === 'questionnaire' && (
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
                    <td>
                      <EditableQuestion
                        categoryId={category.id}
                        questionId={q.id}
                        defaultText={q.text}
                      />
                    </td>

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
                      <EditableRefs
                        categoryId={category.id}
                        questionId={q.id}
                        type="risk"
                        defaultCodes={q.riskRefs}
                      />
                    </td>

                    <td>
                      <EditableRefs
                        categoryId={category.id}
                        questionId={q.id}
                        type="safeguard"
                        defaultCodes={q.safeguardRefs}
                      />
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
        )}
      </div>

      {showDB && <DBModal category={category} onClose={() => setShowDB(false)} />}
    </div>
  );
}
