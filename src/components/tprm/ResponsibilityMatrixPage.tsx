import { useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import s from './ResponsibilityMatrixPage.module.css';
import {
  CATEGORY_QUESTIONNAIRES,
  DOMAIN_LABELS,
  type Question,
  type QuestionDomain,
  type QuestionResponsibility,
} from '../../data/questionnaires.data';
import { useQuestionnaireStore } from '../../store/questionnaireStore';
import { useCategoryStore } from '../../store/categoryStore';

// ── Constants ──────────────────────────────────────────────────────────────

const RESP_LABELS: Record<QuestionResponsibility, string> = {
  proveedor: 'Proveedor',
  cliente:   'Cliente',
  ambos:     'Ambos',
};

const DOMAIN_ORDER: QuestionDomain[] = ['organizativo', 'personas', 'fisico', 'tecnologico'];

const RESP_OPTIONS: QuestionResponsibility[] = ['proveedor', 'ambos', 'cliente'];

const XL_FILLS: Record<QuestionResponsibility, string> = {
  proveedor: 'FFDBEAFE',
  cliente:   'FFD1FAE5',
  ambos:     'FFFEF9C3',
};
const XL_FONTS: Record<QuestionResponsibility, string> = {
  proveedor: 'FF1E40AF',
  cliente:   'FF166534',
  ambos:     'FF854D0E',
};
const DOMAIN_FILLS: Record<QuestionDomain, string> = {
  organizativo: 'FFF3E8FF',
  personas:     'FFFCE7F3',
  fisico:       'FFFFEDD5',
  tecnologico:  'FFE0F2FE',
};
const DOMAIN_FONTS: Record<QuestionDomain, string> = {
  organizativo: 'FF6B21A8',
  personas:     'FF9D174D',
  fisico:       'FF9A3412',
  tecnologico:  'FF0C4A6E',
};

// ── Types ──────────────────────────────────────────────────────────────────

interface MatrixRow {
  categoryId:   string;
  categoryName: string;
  question:     Question;
  effectiveResp: QuestionResponsibility;
}

// ── Excel export ───────────────────────────────────────────────────────────

async function exportToExcel(rows: MatrixRow[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MAGERIT Risk';
  const ws = wb.addWorksheet('Matriz de Responsabilidades');

  ws.columns = [
    { width: 10  }, // ID
    { width: 65  }, // Pregunta
    { width: 22  }, // Categoría
    { width: 16  }, // Dominio
    { width: 15  }, // Responsabilidad
    { width: 20  }, // Amenazas ref
  ];

  // Title
  const titleRow = ws.addRow(['Matriz de Responsabilidades — Cuestionario de Proveedores']);
  ws.mergeCells('A1:F1');
  titleRow.getCell(1).font      = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 28;

  const dateRow = ws.addRow([`Generado: ${new Date().toLocaleDateString('es-ES')}   ·   ${rows.length} preguntas`]);
  ws.mergeCells('A2:F2');
  dateRow.getCell(1).font      = { size: 10, italic: true, color: { argb: 'FF64748B' } };
  dateRow.getCell(1).alignment = { horizontal: 'center' };
  ws.addRow([]);

  // Header
  const hdr = ws.addRow(['ID', 'Pregunta', 'Categoría', 'Dominio', 'Responsabilidad', 'Refs. Amenaza']);
  hdr.height = 28;
  hdr.eachCell(cell => {
    cell.font      = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });
  hdr.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

  // Group by category
  const byCategory = new Map<string, MatrixRow[]>();
  rows.forEach(r => {
    if (!byCategory.has(r.categoryId)) byCategory.set(r.categoryId, []);
    byCategory.get(r.categoryId)!.push(r);
  });

  for (const [, catRows] of byCategory) {
    const catName = catRows[0].categoryName;
    const catHeader = ws.addRow([catName]);
    ws.mergeCells(`A${ws.rowCount}:F${ws.rowCount}`);
    catHeader.getCell(1).font      = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    catHeader.getCell(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    catHeader.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    catHeader.height = 22;

    // Group by domain within category
    const byDomain = new Map<QuestionDomain, MatrixRow[]>();
    catRows.forEach(r => {
      const d = r.question.domain;
      if (!byDomain.has(d)) byDomain.set(d, []);
      byDomain.get(d)!.push(r);
    });

    for (const domain of DOMAIN_ORDER) {
      const domRows = byDomain.get(domain);
      if (!domRows?.length) continue;

      const domHeader = ws.addRow([DOMAIN_LABELS[domain]]);
      ws.mergeCells(`A${ws.rowCount}:F${ws.rowCount}`);
      domHeader.getCell(1).font      = { bold: true, size: 10, color: { argb: DOMAIN_FONTS[domain] } };
      domHeader.getCell(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: DOMAIN_FILLS[domain] } };
      domHeader.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 2 };
      domHeader.height = 18;

      for (const r of domRows) {
        const q = r.question;
        const row = ws.addRow([
          q.id,
          q.text,
          r.categoryName,
          DOMAIN_LABELS[q.domain],
          RESP_LABELS[r.effectiveResp],
          q.riskRefs.join(', '),
        ]);
        row.height = 20;

        row.getCell(1).font      = { size: 10, bold: true, color: { argb: 'FF475569' } };
        row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(2).font      = { size: 10, color: { argb: 'FF1E293B' } };
        row.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };

        row.getCell(3).font      = { size: 10, color: { argb: 'FF475569' } };
        row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };

        row.getCell(4).font      = { size: 10, color: { argb: DOMAIN_FONTS[q.domain] } };
        row.getCell(4).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: DOMAIN_FILLS[q.domain] } };
        row.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };

        const resp = r.effectiveResp;
        row.getCell(5).font      = { bold: true, size: 10, color: { argb: XL_FONTS[resp] } };
        row.getCell(5).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL_FILLS[resp] } };
        row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };

        row.getCell(6).font      = { size: 10, color: { argb: 'FF64748B' } };
        row.getCell(6).alignment = { horizontal: 'left', vertical: 'middle' };

        row.eachCell(cell => {
          cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
        });
      }
    }
  }

  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `matriz-responsabilidades-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ResponsibilityMatrixPage() {
  const [catFilter,    setCatFilter]    = useState<string>('all');
  const [domainFilter, setDomainFilter] = useState<QuestionDomain | 'all'>('all');
  const [respFilter,   setRespFilter]   = useState<QuestionResponsibility | 'all'>('all');

  const { categories } = useCategoryStore();
  const { customResponsibility, setCustomResponsibility } = useQuestionnaireStore();

  // Build all rows (all categories, all questions)
  const allRows = useMemo<MatrixRow[]>(() => {
    return categories.flatMap(cat =>
      (CATEGORY_QUESTIONNAIRES[cat.id] ?? []).map(q => ({
        categoryId:    cat.id,
        categoryName:  cat.name,
        question:      q,
        effectiveResp: customResponsibility[cat.id]?.[q.id] ?? q.responsibility,
      }))
    );
  }, [categories, customResponsibility]);

  const filtered = useMemo(() => {
    return allRows.filter(r =>
      (catFilter    === 'all' || r.categoryId         === catFilter) &&
      (domainFilter === 'all' || r.question.domain    === domainFilter) &&
      (respFilter   === 'all' || r.effectiveResp      === respFilter)
    );
  }, [allRows, catFilter, domainFilter, respFilter]);

  // Stats (unfiltered)
  const stats = useMemo(() => {
    const counts: Record<QuestionResponsibility, number> = { proveedor: 0, cliente: 0, ambos: 0 };
    allRows.forEach(r => counts[r.effectiveResp]++);
    return counts;
  }, [allRows]);

  // Count customized cells
  const totalOverrides = useMemo(() =>
    Object.values(customResponsibility).reduce((n, obj) => n + Object.keys(obj ?? {}).length, 0),
    [customResponsibility]
  );

  // Group filtered rows by category then domain
  const grouped = useMemo(() => {
    const map = new Map<string, Map<QuestionDomain, MatrixRow[]>>();
    filtered.forEach(r => {
      if (!map.has(r.categoryId)) map.set(r.categoryId, new Map());
      const domMap = map.get(r.categoryId)!;
      if (!domMap.has(r.question.domain)) domMap.set(r.question.domain, []);
      domMap.get(r.question.domain)!.push(r);
    });
    return map;
  }, [filtered]);

  const STAT_COLORS: Record<QuestionResponsibility, string> = {
    proveedor: '#60a5fa',
    ambos:     '#fbbf24',
    cliente:   '#4ade80',
  };

  return (
    <div className={s.page}>

      {/* ── Toolbar ── */}
      <div className={s.toolbar}>
        <span className={s.toolbarTitle}>Matriz de Responsabilidades</span>

        <div className={s.filterGroup}>
          <span className={s.filterLabel}>Categoría</span>
          <select className={s.select} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="all">Todas</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className={s.filterGroup}>
          <span className={s.filterLabel}>Dominio</span>
          <select className={s.select} value={domainFilter} onChange={e => setDomainFilter(e.target.value as QuestionDomain | 'all')}>
            <option value="all">Todos</option>
            {DOMAIN_ORDER.map(d => (
              <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
            ))}
          </select>
        </div>

        <div className={s.filterGroup}>
          <span className={s.filterLabel}>Responsabilidad</span>
          <select className={s.select} value={respFilter} onChange={e => setRespFilter(e.target.value as QuestionResponsibility | 'all')}>
            <option value="all">Todas</option>
            {RESP_OPTIONS.map(r => (
              <option key={r} value={r}>{RESP_LABELS[r]}</option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
          {filtered.length} de {allRows.length} preguntas
          {totalOverrides > 0 && (
            <> · <strong style={{ color: '#f59e0b' }}>{totalOverrides} modificadas</strong></>
          )}
        </span>

        <button
          className={s.exportBtn}
          onClick={() => exportToExcel(filtered)}
        >
          ↓ Exportar Excel
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className={s.stats}>
        {RESP_OPTIONS.map(resp => (
          <div key={resp} className={s.stat}>
            <span className={s.statDot} style={{ background: STAT_COLORS[resp] }} />
            <span>{RESP_LABELS[resp]}:</span>
            <span className={s.statVal}>{stats[resp]}</span>
          </div>
        ))}
        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>
          {allRows.length} preguntas · {categories.length} categorías
        </span>
      </div>

      {/* ── Table ── */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead className={s.thead}>
            <tr>
              <th className={s.thId}>ID</th>
              <th className={s.thControl}>Pregunta</th>
              <th className={s.thDomain}>Dominio</th>
              <th className={s.thResp}>Responsabilidad</th>
              <th className={s.thRisk}>Amenazas ref.</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(grouped.entries()).map(([catId, domMap]) => {
              const catName = categories.find(c => c.id === catId)?.name ?? catId;
              return (
                <>
                  {/* Category group header */}
                  <tr key={`cat-${catId}`} className={s.categoryRow}>
                    <td colSpan={5}>{catName}</td>
                  </tr>

                  {DOMAIN_ORDER.map(domain => {
                    const rows = domMap.get(domain);
                    if (!rows?.length) return null;
                    return (
                      <>
                        {/* Domain sub-header */}
                        <tr key={`dom-${catId}-${domain}`} className={s.domainRow}>
                          <td colSpan={5}>{DOMAIN_LABELS[domain]}</td>
                        </tr>

                        {rows.map(r => {
                          const q   = r.question;
                          const cur = r.effectiveResp;
                          const isOverridden = customResponsibility[catId]?.[q.id] !== undefined;
                          return (
                            <tr key={`${catId}-${q.id}`} className={s.tr}>
                              <td className={s.tdId}>{q.id}</td>
                              <td className={s.tdControl}>{q.text}</td>
                              <td className={s.tdCell}>
                                <span className={`${s.domainBadge} ${s[`dom_${domain}`]}`}>
                                  {DOMAIN_LABELS[domain]}
                                </span>
                              </td>
                              <td className={s.tdCell}>
                                <select
                                  className={[
                                    s.respSelect,
                                    s[`resp_${cur}`],
                                    isOverridden ? s.modified : '',
                                  ].join(' ')}
                                  value={cur}
                                  onChange={e =>
                                    setCustomResponsibility(catId, q.id, e.target.value as QuestionResponsibility)
                                  }
                                >
                                  {RESP_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>{RESP_LABELS[opt]}</option>
                                  ))}
                                </select>
                              </td>
                              <td className={s.tdRisk}>
                                {q.riskRefs.map(rc => (
                                  <span key={rc} className={s.riskTag}>{rc}</span>
                                ))}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
