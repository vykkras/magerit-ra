import { useState, useMemo } from 'react';
import ExcelJS from 'exceljs';
import s from './ResponsibilityMatrixPage.module.css';
import {
  RESPONSIBILITY_MATRIX,
  CATEGORY_KEYS,
  CATEGORY_LABELS,
  DOMAIN_LABELS,
  RESPONSIBILITY_LABELS,
  getDomain,
  type CategoryKey,
  type Responsibility,
  type DomainKey,
} from '../../data/responsibilityMatrix.data';
import { useResponsibilityMatrixStore } from '../../store/responsibilityMatrixStore';

// Excel fill colors per responsibility value (ARGB)
const XL_FILLS: Record<Responsibility, string> = {
  cliente:    'FFD1FAE5', // green-100
  proveedor:  'FFDBEAFE', // blue-100
  compartido: 'FFFEF9C3', // yellow-100
  na:         'FFF1F5F9', // slate-100
};
const XL_FONTS: Record<Responsibility, string> = {
  cliente:    'FF166534',
  proveedor:  'FF1E40AF',
  compartido: 'FF854D0E',
  na:         'FF94A3B8',
};
const DOMAIN_FILL = 'FF1E293B';

async function exportToExcel(getResp: (id: string, cat: CategoryKey) => Responsibility) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MAGERIT Risk';
  const ws = wb.addWorksheet('Matriz de Responsabilidades');

  // Column widths
  ws.columns = [
    { width: 8  },  // ID
    { width: 58 },  // Control
    ...CATEGORY_KEYS.map(() => ({ width: 18 })),
  ];

  // ── Title row ──
  const titleRow = ws.addRow(['Matriz de Responsabilidades ISO 27001:2022']);
  ws.mergeCells(`A1:G1`);
  titleRow.getCell(1).font  = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
  titleRow.getCell(1).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  titleRow.height = 28;

  // ── Date row ──
  const dateRow = ws.addRow([`Generado: ${new Date().toLocaleDateString('es-ES')}   ·   ${RESPONSIBILITY_MATRIX.length} controles × ${CATEGORY_KEYS.length} categorías`]);
  ws.mergeCells(`A2:G2`);
  dateRow.getCell(1).font      = { size: 10, italic: true, color: { argb: 'FF64748B' } };
  dateRow.getCell(1).alignment = { horizontal: 'center' };
  dateRow.height = 18;

  ws.addRow([]); // spacer

  // ── Header row ──
  const hdrRow = ws.addRow(['ID', 'Control ISO 27001:2022', ...CATEGORY_KEYS.map(k => CATEGORY_LABELS[k].short)]);
  hdrRow.height = 36;
  hdrRow.eachCell(cell => {
    cell.font      = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border    = { bottom: { style: 'medium', color: { argb: 'FF334155' } } };
  });
  hdrRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
  hdrRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

  // Freeze header area
  ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

  // ── Data rows grouped by domain ──
  const domainOrder: DomainKey[] = ['5', '6', '7', '8'];
  let rowIdx = 5;

  for (const domain of domainOrder) {
    const entries = RESPONSIBILITY_MATRIX.filter(e => getDomain(e.id) === domain);
    if (!entries.length) continue;

    // Domain header
    const domRow = ws.addRow([DOMAIN_LABELS[domain]]);
    ws.mergeCells(`A${rowIdx}:G${rowIdx}`);
    domRow.getCell(1).font      = { bold: true, size: 10.5, color: { argb: 'FF94A3B8' }, italic: false };
    domRow.getCell(1).fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: DOMAIN_FILL } };
    domRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    domRow.height = 20;
    rowIdx++;

    for (const entry of entries) {
      const respValues = CATEGORY_KEYS.map(cat => RESPONSIBILITY_LABELS[getResp(entry.id, cat)]);
      const dataRow = ws.addRow([entry.id, entry.control, ...respValues]);
      dataRow.height = 18;

      // ID cell
      dataRow.getCell(1).font      = { bold: true, size: 10, color: { argb: 'FF475569' } };
      dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

      // Control name cell
      dataRow.getCell(2).font      = { size: 10, color: { argb: 'FF1E293B' } };
      dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: false };

      // Responsibility cells (cols 3–7)
      CATEGORY_KEYS.forEach((cat, i) => {
        const val   = getResp(entry.id, cat);
        const cell  = dataRow.getCell(3 + i);
        cell.font      = { bold: true, size: 10, color: { argb: XL_FONTS[val] } };
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL_FILLS[val] } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border    = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      });

      // Bottom border on control cells
      dataRow.getCell(1).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      dataRow.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };

      rowIdx++;
    }
  }

  // ── Legend sheet ──
  const leg = wb.addWorksheet('Leyenda');
  leg.columns = [{ width: 18 }, { width: 60 }];
  const legTitle = leg.addRow(['Leyenda de responsabilidades']);
  legTitle.getCell(1).font = { bold: true, size: 12 };
  leg.addRow([]);
  const legends: [Responsibility, string][] = [
    ['cliente',    'El cliente (organización solicitante) es responsable de implementar y mantener este control.'],
    ['proveedor',  'El proveedor es responsable de implementar y mantener este control.'],
    ['compartido', 'Responsabilidad compartida: ambas partes deben implementar y coordinar este control.'],
    ['na',         'No aplica para esta categoría de adquisición.'],
  ];
  for (const [val, desc] of legends) {
    const r = leg.addRow([RESPONSIBILITY_LABELS[val], desc]);
    r.getCell(1).font = { bold: true, size: 10, color: { argb: XL_FONTS[val] } };
    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: XL_FILLS[val] } };
    r.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    r.getCell(2).font = { size: 10 };
    r.height = 20;
    leg.addRow([]);
  }

  const buf  = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `matriz-responsabilidades-iso27001-${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

const RESP_OPTIONS: Responsibility[] = ['cliente', 'proveedor', 'compartido', 'na'];

const STAT_COLORS: Record<Responsibility, string> = {
  cliente:    '#4ade80',
  proveedor:  '#60a5fa',
  compartido: '#fbbf24',
  na:         '#cbd5e1',
};

export default function ResponsibilityMatrixPage() {
  const [domainFilter, setDomainFilter] = useState<DomainKey | 'all'>('all');
  const [respFilter, setRespFilter]     = useState<Responsibility | 'all'>('all');

  const { overrides, setResponsibility, resetAll, getResponsibility } = useResponsibilityMatrixStore();

  const filteredControls = useMemo(() => {
    return RESPONSIBILITY_MATRIX.filter(entry => {
      if (domainFilter !== 'all' && getDomain(entry.id) !== domainFilter) return false;
      if (respFilter !== 'all') {
        const anyMatch = CATEGORY_KEYS.some(cat => getResponsibility(entry.id, cat) === respFilter);
        if (!anyMatch) return false;
      }
      return true;
    });
  }, [domainFilter, respFilter, overrides]);

  // Stats across all controls (unfiltered)
  const stats = useMemo(() => {
    const counts: Record<Responsibility, number> = { cliente: 0, proveedor: 0, compartido: 0, na: 0 };
    RESPONSIBILITY_MATRIX.forEach(entry =>
      CATEGORY_KEYS.forEach(cat => counts[getResponsibility(entry.id, cat)]++)
    );
    return counts;
  }, [overrides]);

  const totalOverrides = Object.values(overrides).reduce(
    (n, obj) => n + Object.keys(obj ?? {}).length, 0
  );

  // Group filtered controls by domain
  const domains = useMemo(() => {
    const map = new Map<DomainKey, typeof RESPONSIBILITY_MATRIX>();
    filteredControls.forEach(entry => {
      const d = getDomain(entry.id);
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(entry);
    });
    return map;
  }, [filteredControls]);

  return (
    <div className={s.page}>

      {/* ── Toolbar ── */}
      <div className={s.toolbar}>
        <span className={s.toolbarTitle}>Matriz de Responsabilidades ISO 27001</span>

        <div className={s.filterGroup}>
          <span className={s.filterLabel}>Dominio</span>
          <select className={s.select} value={domainFilter} onChange={e => setDomainFilter(e.target.value as DomainKey | 'all')}>
            <option value="all">Todos</option>
            {(Object.keys(DOMAIN_LABELS) as DomainKey[]).map(d => (
              <option key={d} value={d}>{DOMAIN_LABELS[d]}</option>
            ))}
          </select>
        </div>

        <div className={s.filterGroup}>
          <span className={s.filterLabel}>Responsabilidad</span>
          <select className={s.select} value={respFilter} onChange={e => setRespFilter(e.target.value as Responsibility | 'all')}>
            <option value="all">Todas</option>
            {RESP_OPTIONS.map(r => (
              <option key={r} value={r}>{RESPONSIBILITY_LABELS[r]}</option>
            ))}
          </select>
        </div>

        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 4 }}>
          {filteredControls.length} de {RESPONSIBILITY_MATRIX.length} controles
          {totalOverrides > 0 && <> · <strong style={{ color: '#f59e0b' }}>{totalOverrides} modificados</strong></>}
        </span>

        {totalOverrides > 0 && (
          <button
            className={s.resetBtn}
            onClick={() => { if (confirm('¿Restaurar todos los valores por defecto?')) resetAll(); }}
          >
            Restaurar valores por defecto
          </button>
        )}

        <button
          className={s.exportBtn}
          onClick={() => exportToExcel(getResponsibility)}
        >
          ↓ Exportar Excel
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className={s.stats}>
        {RESP_OPTIONS.map(resp => (
          <div key={resp} className={s.stat}>
            <span className={s.statDot} style={{ background: STAT_COLORS[resp] }} />
            <span>{RESPONSIBILITY_LABELS[resp]}:</span>
            <span className={s.statVal}>{stats[resp]}</span>
          </div>
        ))}
        <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>
          {RESPONSIBILITY_MATRIX.length} controles × {CATEGORY_KEYS.length} categorías = {RESPONSIBILITY_MATRIX.length * CATEGORY_KEYS.length} celdas
        </span>
      </div>

      {/* ── Table ── */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead className={s.thead}>
            <tr>
              <th className={s.thId}>ID</th>
              <th className={s.thControl}>Control</th>
              {CATEGORY_KEYS.map(cat => (
                <th key={cat} className={s.thCat} title={CATEGORY_LABELS[cat].full}>
                  <span className={s.thCatShort}>{CATEGORY_LABELS[cat].short}</span>
                  <span className={s.thCatFull}>{CATEGORY_LABELS[cat].full}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from(domains.entries()).map(([domain, entries]) => (
              <>
                <tr key={`domain-${domain}`} className={s.domainRow}>
                  <td colSpan={2 + CATEGORY_KEYS.length}>{DOMAIN_LABELS[domain]}</td>
                </tr>
                {entries.map(entry => {
                  const isModified = !!overrides[entry.id] && Object.keys(overrides[entry.id]).length > 0;
                  return (
                    <tr key={entry.id} className={s.tr}>
                      <td className={s.tdId}>{entry.id}</td>
                      <td className={s.tdControl}>{entry.control}</td>
                      {CATEGORY_KEYS.map(cat => {
                        const val = getResponsibility(entry.id, cat);
                        const cellModified = overrides[entry.id]?.[cat] !== undefined;
                        return (
                          <td key={cat} className={s.tdCell}>
                            <select
                              className={[
                                s.respSelect,
                                s[`resp_${val}`],
                                cellModified ? s.modified : '',
                              ].join(' ')}
                              value={val}
                              onChange={e => setResponsibility(entry.id, cat, e.target.value as Responsibility)}
                            >
                              {RESP_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{RESPONSIBILITY_LABELS[opt]}</option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
