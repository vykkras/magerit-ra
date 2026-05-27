import { useState, useMemo } from 'react';
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
