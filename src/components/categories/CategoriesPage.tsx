import { useState, useRef, useEffect } from 'react';
import ExcelJS from 'exceljs';
import s from './CategoriesPage.module.css';
import { useCategoryStore } from '../../store/categoryStore';
import { useQuestionnaireStore, type Answer, type Criticality, type ExtraQuestion } from '../../store/questionnaireStore';
import { useRiskScenarioStore } from '../../store/riskScenarioStore';
import { MAGERIT_THREATS } from '../../data/threats.data';
import { CATALOG_BY_CODE } from '../../data/safeguards.data';
import { CATEGORY_QUESTIONNAIRES, DOMAIN_LABELS, type Question, type QuestionResponsibility } from '../../data/questionnaires.data';
import { avgMaturity } from '../../data/maturityLevels.data';
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
  const [flipUp, setFlipUp] = useState(false);
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
    if (ref.current) {
      const spaceBelow = window.innerHeight - ref.current.getBoundingClientRect().bottom;
      setFlipUp(spaceBelow < 340);
    }
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
        <div className={s.refsPopover} style={flipUp ? { top: 'auto', bottom: 'calc(100% + 4px)' } : undefined}>
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
const RESIDUAL_CLS = [s.rBadge1, s.rBadge2, s.rBadge3, s.rBadge4] as const;

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

function computeRiskStatus(
  threatCode: string,
  questions: Question[],
  categoryAnswers: Record<string, Answer>
) {
  const covering = questions.filter(q => q.riskRefs.includes(threatCode));
  if (covering.length === 0) return { yesCount: 0, noCount: 0, naCount: 0, total: 0, isExcluded: false };
  const yesCount = covering.filter(q => categoryAnswers[q.id] === 'yes').length;
  const noCount  = covering.filter(q => categoryAnswers[q.id] === 'no').length;
  const naCount  = covering.filter(q => categoryAnswers[q.id] === 'na').length;
  const isExcluded = naCount > 0 && naCount === covering.length;
  return { yesCount, noCount, naCount, total: covering.length, isExcluded };
}

function ScenarioTable({
  category,
  questions,
  categoryAnswers,
}: {
  category: Category;
  questions: Question[];
  categoryAnswers: Record<string, Answer>;
}) {
  const { scenarios, updateRow, addRow, removeRow } = useRiskScenarioStore();
  const rows = scenarios[category.id] ?? [];

  // Enrich each row with computed residual impact + question coverage info
  const enriched = rows.map(row => {
    const status = computeRiskStatus(row.threatCode, questions, categoryAnswers);
    const { yesCount, noCount, naCount, total, isExcluded } = status;
    const imp = row.inherentImpact;
    const residual: 1|2|3|4|null = isExcluded
      ? null
      : imp !== null ? (Math.max(1, imp - yesCount) as 1|2|3|4) : null;
    return { ...row, isExcluded, residual, yesCount, noCount, naCount, total };
  });

  // Risk totals (probability × impact)
  const countable = enriched.filter(r => !r.isExcluded && r.probability !== null && r.inherentImpact !== null);
  const totalInherent = countable.reduce((sum, r) => sum + r.probability! * r.inherentImpact!, 0);
  const totalResidual = countable.reduce((sum, r) => sum + r.probability! * (r.residual ?? r.inherentImpact!), 0);
  const excludedCount = enriched.filter(r => r.isExcluded).length;
  const reduction     = totalInherent > 0 ? Math.round((1 - totalResidual / totalInherent) * 100) : 0;

  return (
    <>
      {/* ── Risk summary ── */}
      <div className={s.riskSummary}>
        <div className={s.summaryItem}>
          <span className={`${s.summaryValue} ${s.scoreRed}`}>{totalInherent}</span>
          <span className={s.summaryLabel}>Riesgo inherente total</span>
        </div>
        <div className={s.divider} />
        <div className={s.summaryItem}>
          <span className={`${s.summaryValue} ${reduction >= 25 ? s.scoreGreen : s.scoreYellow}`}>{totalResidual}</span>
          <span className={s.summaryLabel}>Riesgo residual total</span>
        </div>
        <div className={s.divider} />
        <div className={s.summaryItem}>
          <span className={`${s.summaryValue} ${reduction >= 25 ? s.scoreGreen : s.scoreYellow}`}>{reduction}%</span>
          <span className={s.summaryLabel}>Reducción de riesgo</span>
        </div>
        {excludedCount > 0 && (
          <>
            <div className={s.divider} />
            <div className={s.summaryItem}>
              <span className={s.summaryValue} style={{ color: '#94a3b8' }}>{excludedCount}</span>
              <span className={s.summaryLabel}>Excluidos (N/A)</span>
            </div>
          </>
        )}
        <span className={s.summaryNote}>Riesgo = probabilidad × impacto</span>
      </div>

      {/* ── Scenario table ── */}
      <div className={s.tableCard}>
        <table className={s.table}>
          <thead>
            <tr>
              <th style={{ width: '13%' }}>Riesgo ID</th>
              <th style={{ width: '15%' }}>Probabilidad (1–4)</th>
              <th style={{ width: '15%' }}>Impacto inherente (1–4)</th>
              <th style={{ width: '29%' }}>Salvaguarda aplicable</th>
              <th style={{ width: '13%' }}>Impacto residual</th>
              <th style={{ width: '3%' }} />
            </tr>
          </thead>
          <tbody>
            {enriched.map(row => (
              <tr key={row.id} className={row.isExcluded ? s.rowExcluded : ''}>
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
                  <div className={s.residualCell}>
                    {row.isExcluded ? (
                      <span className={s.residualNa}>N/A</span>
                    ) : row.residual !== null ? (
                      <span className={`${s.residualBadge} ${RESIDUAL_CLS[row.residual - 1]}`}>
                        {row.residual}
                      </span>
                    ) : (
                      <span style={{ color: '#cbd5e1' }}>—</span>
                    )}
                    {row.total > 0 && (
                      <span className={s.coveragePills}>
                        {row.yesCount > 0 && <span className={s.pillYes}>✓{row.yesCount}</span>}
                        {row.noCount  > 0 && <span className={s.pillNo}>✗{row.noCount}</span>}
                        {row.naCount  > 0 && <span className={s.pillNa}>–{row.naCount}</span>}
                      </span>
                    )}
                    {row.total === 0 && (
                      <span className={s.pillUncovered} title="Sin preguntas del cuestionario que cubran este riesgo">sin cobertura</span>
                    )}
                  </div>
                </td>
                <td>
                  <button className={s.removeExtraBtn} onClick={() => removeRow(category.id, row.id)} title="Eliminar fila">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Add row ── */}
      <button className={s.addRowBtn} onClick={() => addRow(category.id)}>
        + Agregar fila
      </button>
    </>
  );
}

// ── Excel export ──────────────────────────────────────────────────────────────

async function downloadExcel(
  category: Category,
  questions: Question[],
  categoryAnswers: Record<string, Answer>,
  critValue: Criticality,
  customQ: Record<string, string> = {},
) {
  const COL_Q_WIDTH = 80;
  const CHARS_PER_LINE = 76;
  const PT_PER_LINE = 15;

  function rowHeight(text: string) {
    return Math.max(18, Math.ceil(text.length / CHARS_PER_LINE) * PT_PER_LINE);
  }

  const wb = new ExcelJS.Workbook();
  wb.creator = 'MAGERIT Risk';
  const ws = wb.addWorksheet(category.name.replace(/[\\/*?:[\]]/g, '-').slice(0, 31));

  ws.columns = [
    { width: COL_Q_WIDTH },
    { width: 14 },
  ];

  const t = ws.addRow(['CUESTIONARIO — ' + category.name.toUpperCase()]);
  t.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  t.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2E5C' } };
  ws.mergeCells('A1:B1');
  t.height = 22;

  const dt = ws.addRow(['Fecha: ' + new Date().toLocaleDateString('es-ES')]);
  dt.getCell(1).font = { italic: true, size: 10, color: { argb: 'FF94A3B8' } };
  ws.mergeCells('A2:B2');

  ws.addRow([]);

  const hdr = ws.addRow(['Pregunta', 'Respuesta']);
  hdr.eachCell(cell => {
    cell.font      = { bold: true, size: 10, color: { argb: 'FF334155' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    cell.alignment = { vertical: 'middle' };
    cell.border    = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
  });
  hdr.height = 18;

  const critText  = '¿Cuál es la criticidad de la solución evaluada?';
  const critLabel = CRIT_OPTIONS.find(o => o.value === critValue)?.label ?? '';
  const cr = ws.addRow([critText, critLabel]);
  cr.getCell(1).font      = { bold: true };
  cr.getCell(1).alignment = { wrapText: true, vertical: 'top' };
  cr.getCell(2).alignment = { horizontal: 'center', vertical: 'top' };
  cr.height = rowHeight(critText);
  ws.getCell(`B${cr.number}`).dataValidation = {
    type: 'list',
    allowBlank: false,
    formulae: ['"Baja,Media,Alta,Critica"'],
  };

  questions.forEach((q, i) => {
    const raw         = categoryAnswers[q.id] ?? null;
    const answerLabel = raw === 'yes' ? 'Si' : raw === 'no' ? 'No' : raw === 'na' ? 'N/A' : '';
    const text        = customQ[q.id] ?? q.text;
    const row = ws.addRow([text, answerLabel]);
    row.getCell(1).alignment = { wrapText: true, vertical: 'top' };
    row.getCell(2).alignment = { horizontal: 'center', vertical: 'top' };
    ws.getCell(`B${row.number}`).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"Si,No,N/A"'],
    };
    const fill = answerLabel === 'Si' ? 'FFF0FDF4' : answerLabel === 'No' ? 'FFFEF2F2' : (i % 2 === 0 ? 'FFFFFFFF' : 'FFFAFAFA');
    row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    row.height = rowHeight(text);
  });

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

export default function CategoriesPage({ lockedCategoryId }: { lockedCategoryId?: string } = {}) {
  const { categories } = useCategoryStore();
  const { answers, criticality, customQuestions, customRiskRefs, customSafeguardRefs, customResponsibility, extraQuestions,
          setAnswer, setCriticality, clearAnswers, addExtraQuestion, updateExtraQuestion, removeExtraQuestion,
          setCustomResponsibility } = useQuestionnaireStore();

  const lockedIdx = lockedCategoryId ? categories.findIndex(c => c.id === lockedCategoryId) : -1;
  const [activeIdx, setActiveIdx] = useState(lockedIdx >= 0 ? lockedIdx : 0);
  const [showDB,    setShowDB]    = useState(false);
  const [view, setView] = useState<'questionnaire' | 'scenario'>('questionnaire');

  const category        = categories[activeIdx];
  const allQuestions    = CATEGORY_QUESTIONNAIRES[category?.id] ?? [];
  const customRespCat   = customResponsibility[category?.id] ?? {};

  // Only show questions where effective responsibility is proveedor or ambos
  function effectiveResp(q: Question): QuestionResponsibility {
    return customRespCat[q.id] ?? q.responsibility;
  }
  const questions       = allQuestions.filter(q => effectiveResp(q) !== 'cliente');

  const categoryAnswers = answers[category?.id] ?? {};
  const critValue       = criticality[category?.id] ?? null;
  const customQ         = customQuestions[category?.id] ?? {};
  const customRR        = customRiskRefs[category?.id] ?? {};
  const customSR        = customSafeguardRefs[category?.id] ?? {};
  const extraQs         = extraQuestions[category?.id] ?? [];

  const yesCount = questions.filter(q => categoryAnswers[q.id] === 'yes').length;
  const pct      = questions.length > 0 ? Math.round((yesCount / questions.length) * 100) : 0;

  function toggle(qid: string, val: Answer) {
    setAnswer(category.id, qid, categoryAnswers[qid] === val ? null : val);
  }

  if (!category) return null;

  const scoreClass = pct >= 80 ? s.scoreGreen : pct >= 50 ? s.scoreYellow : s.scoreRed;

  return (
    <div className={s.page}>

      {/* ── Tabs (hidden when category locked from Preliminar) ── */}
      {!lockedCategoryId && <div className={s.tabs}>
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
      </div>}

      {/* ── Content ── */}
      <div className={s.content}>

        {/* Category title (shown when tabs are hidden) */}
        {lockedCategoryId && (
          <div className={s.catTitle}>
            <span className={s.catTitleLabel}>Categoría</span>
            <span className={s.catTitleName}>{category.name}</span>
          </div>
        )}

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
            {view === 'questionnaire' && Object.keys(categoryAnswers).length > 0 && (
              <button className={s.btnClear} onClick={() => clearAnswers(category.id)}>
                Limpiar respuestas
              </button>
            )}
            <button className={s.btnSecondary} onClick={() => setShowDB(true)}>
              Ver BD
            </button>
            {view === 'questionnaire' && (
              <button className={s.btnExcel} onClick={() => downloadExcel(category, questions, categoryAnswers, critValue, customQ)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3M12 3v9" />
                </svg>
                Descargar Excel
              </button>
            )}
          </div>
        </div>

        {/* Scenario table */}
        {view === 'scenario' && (
          <ScenarioTable
            category={category}
            questions={questions}
            categoryAnswers={categoryAnswers}
          />
        )}

        {/* Questionnaire table card */}
        {view === 'questionnaire' && (
        <div className={s.tableCard}>
          <table className={s.table}>
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Pregunta</th>
                <th style={{ width: '9%'  }}>Dominio</th>
                <th style={{ width: '9%'  }}>Responsabilidad</th>
                <th style={{ width: '10%' }}>Respuesta</th>
                <th style={{ width: '13%' }}>Riesgo asociado</th>
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
                <td style={{ color: '#cbd5e1', textAlign: 'center' }}>—</td>
                <td style={{ color: '#cbd5e1', textAlign: 'center' }}>—</td>
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

                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <span className={`${s.respBadge} ${s[`domain_${q.domain ?? 'tecnologico'}`]}`}>
                        {DOMAIN_LABELS[q.domain ?? 'tecnologico']}
                      </span>
                      {(() => {
                        const refs = customSR?.[q.id] ?? q.safeguardRefs;
                        const mat  = Math.round(avgMaturity(refs) * 10) / 10;
                        const cls  = mat >= 5 ? s.mat5 : mat >= 4 ? s.mat4 : mat >= 3 ? s.mat3 : mat >= 2 ? s.mat2 : s.mat1;
                        return (
                          <span className={`${s.matBadge} ${cls}`} title={`Madurez media controles: ${mat}/5`}>
                            M:{mat}
                          </span>
                        );
                      })()}
                    </td>

                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      {(() => {
                        const cur = effectiveResp(q);
                        return (
                          <select
                            className={`${s.respSelect} ${s[`resp_${cur}`]}`}
                            value={cur}
                            onChange={e => setCustomResponsibility(category.id, q.id, e.target.value as QuestionResponsibility)}
                          >
                            <option value="proveedor">Proveedor</option>
                            <option value="ambos">Ambos</option>
                            <option value="cliente">Cliente</option>
                          </select>
                        );
                      })()}
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

              {/* Extra question rows */}
              {extraQs.map((eq: ExtraQuestion) => {
                const current = categoryAnswers[eq.id] ?? null;
                return (
                  <tr key={eq.id} className={current === 'yes' ? s.rowYes : current === 'no' ? s.rowNo : s.rowExtra}>
                    <td>
                      <div className={s.questionCell}>
                        <input
                          className={s.extraQInput}
                          placeholder="Nueva pregunta…"
                          value={eq.text}
                          onChange={e => updateExtraQuestion(category.id, eq.id, { text: e.target.value })}
                        />
                        <button className={s.removeExtraBtn} onClick={() => removeExtraQuestion(category.id, eq.id)} title="Eliminar">×</button>
                      </div>
                    </td>
                    <td>
                      <div className={s.answerBtns}>
                        {(['yes','no','na'] as const).map(v => (
                          <button key={v}
                            onClick={() => toggle(eq.id, v)}
                            className={`${s.ansBtn} ${current === v ? (v === 'yes' ? s.ansBtnYes : v === 'no' ? s.ansBtnNo : s.ansBtnNa) : ''}`}
                          >{v === 'yes' ? 'Si' : v === 'no' ? 'No' : 'N/A'}</button>
                        ))}
                      </div>
                    </td>
                    <td>
                      <EditableRefs categoryId={category.id} questionId={eq.id} type="risk" defaultCodes={eq.riskRefs} />
                    </td>
                    <td>
                      <EditableRefs categoryId={category.id} questionId={eq.id} type="safeguard" defaultCodes={eq.safeguardRefs} />
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>
          <button className={s.addRowBtn} onClick={() => addExtraQuestion(category.id)}>
            + Agregar pregunta
          </button>
        </div>
        )}
      </div>

      {showDB && <DBModal category={category} onClose={() => setShowDB(false)} />}
    </div>
  );
}
