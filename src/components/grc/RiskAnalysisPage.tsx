import { useMemo } from 'react';
import { useManualRiskStore, type ManualRisk } from '../../store/manualRiskStore';
import {
  PROB_LEVELS, DEGRAD_LEVELS, DIMENSIONS, LEVEL_NAMES,
  GRADO_VALUE, GRADO_DESC, FRECUENCIA_LABEL,
  ZONE_META, ZONE_ORDER, zoneOfCell, computeRisk, computeRiskSummary,
  type Zone, type DimensionKey,
} from '../../data/aarrScale';
import {
  RIESGOS_CATALOG, FACTOR_GROUPS,
} from '../../data/riesgosCatalog';
import { CONTROLES_CATALOG } from '../../data/controlesCatalog';
import type {
  ControlTipo, ControlImplementacion, ControlGrado, ControlFrecuencia,
} from '../../types/control.types';
import s from './RiskAnalysisPage.module.css';

const TIPOS: ControlTipo[] = ['Preventivo', 'Detectivo', 'Correctivo'];
const IMPLS: ControlImplementacion[] = ['Manual', 'Semiautomatico', 'Automatizado'];
const GRADOS: ControlGrado[] = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'];
const FRECS: ControlFrecuencia[] = ['AdHoc', 'Anual', 'Semestral', 'Trimestral', 'Mensual', 'Diario'];
const IMPL_LABEL: Record<ControlImplementacion, string> = {
  Manual: 'Manual', Semiautomatico: 'Semiautomático', Automatizado: 'Automatizado',
};

// Catálogo de controles (Excel) para el selector de controles.
const CONTROL_NOMBRES = Array.from(new Set(CONTROLES_CATALOG.map(c => c.nombre)));
const CONTROL_BY_NOMBRE = new Map(CONTROLES_CATALOG.map(c => [c.nombre, c]));

function ZoneBadge({ zone }: { zone: Zone }) {
  const m = ZONE_META[zone];
  return (
    <span className={s.zoneTag} style={{ background: m.bg, color: m.color }}>
      {m.label} · {m.treatment}
    </span>
  );
}

export default function RiskAnalysisPage() {
  const {
    risks, addRisk, updateRisk, removeRisk, addControl, updateControl, removeControl,
  } = useManualRiskStore();

  const results = useMemo(
    () => risks.map(r => computeRisk(r)),
    [risks]
  );

  const summary = useMemo(() => computeRiskSummary(risks), [risks]);

  return (
    <div className={s.page}>

      {/* Catálogo de controles para los selectores */}
      <datalist id="controles-catalog">
        {CONTROL_NOMBRES.map(n => <option key={n} value={n} />)}
      </datalist>

      {/* Header */}
      <div className={s.headerCard}>
        <div className={s.headerIcon}>4</div>
        <div>
          <p className={s.headerNum}>Fase 2 · Paso 4</p>
          <p className={s.headerTitle}>Análisis de Riesgos (AARR)</p>
          <p className={s.headerSub}>
            Metodología corporativa BPO CC v7.3. Para cada riesgo se valoran las dimensiones del
            activo (C/I/D/A/T), la degradación y la probabilidad inherente; los controles aplicados
            reducen el riesgo según su madurez. La zona de riesgo (inherente y residual) se calcula
            automáticamente sobre 4 zonas.
          </p>
        </div>
      </div>

      {/* Editor */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <p className={s.cardTitle}>Matriz de riesgos</p>
          <button className={s.addBtn} onClick={addRisk}>+ Añadir riesgo</button>
        </div>

        {risks.length === 0 ? (
          <div className={s.empty}>
            No hay riesgos. Pulsa <strong>“Añadir riesgo”</strong> para empezar la apreciación.
          </div>
        ) : (
          risks.map((r, i) => (
            <RiskCard
              key={r.id}
              index={i}
              risk={r}
              result={results[i]}
              onUpdate={updateRisk}
              onRemove={removeRisk}
              onAddControl={addControl}
              onUpdateControl={updateControl}
              onRemoveControl={removeControl}
            />
          ))
        )}
      </div>

      {/* Mapa de riesgos */}
      {risks.length > 0 && (
        <div className={s.card}>
          <p className={s.cardTitle}>Mapa de Riesgos (residual)</p>
          <p className={s.cardSub}>
            Distribución de los {summary.total} riesgos por probabilidad e impacto residual.
            Zonas: Z3 Aceptable · Z4 Tolerable · Z2 A tratar · Z1 Inaceptable.
          </p>

          <div className={s.mapRow}>
            <RiskMap grid={summary.grid} total={summary.total} />

            <div className={s.zoneDist}>
              {ZONE_ORDER.map(z => {
                const m = ZONE_META[z];
                return (
                  <div key={z} className={s.zoneDistRow}>
                    <span className={s.zoneDot} style={{ background: m.bg, borderColor: m.color }} />
                    <span className={s.zoneDistLabel}>
                      {m.label}
                      <span className={s.zoneDistTreat}> · {m.treatment}</span>
                    </span>
                    <span className={s.zoneDistCount} style={{ color: m.color }}>{summary.zoneCounts[z]}</span>
                  </div>
                );
              })}
              <div className={s.nra}>
                <div className={s.nraItem}>
                  <span className={s.nraDot} style={{ background: ZONE_META.Z3.bg, borderColor: ZONE_META.Z3.color }} />
                  Z3/Z4 — no requieren tratamiento (NRA)
                </div>
                <div className={s.nraItem}>
                  <span className={s.nraDot} style={{ background: ZONE_META.Z1.bg, borderColor: ZONE_META.Z1.color }} />
                  Z1/Z2 — requieren plan de tratamiento (PDSI)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Risk card ───────────────────────────────────────────────────────────────
interface RiskCardProps {
  index: number;
  risk: ManualRisk;
  result: ReturnType<typeof computeRisk>;
  onUpdate: (id: string, patch: Partial<Omit<ManualRisk, 'id' | 'controls'>>) => void;
  onRemove: (id: string) => void;
  onAddControl: (riskId: string) => void;
  onUpdateControl: (riskId: string, controlId: string, patch: Partial<Omit<ManualRisk['controls'][number], 'id'>>) => void;
  onRemoveControl: (riskId: string, controlId: string) => void;
}

function RiskCard({
  index, risk: r, result: res, onUpdate, onRemove,
  onAddControl, onUpdateControl, onRemoveControl,
}: RiskCardProps) {
  function onSelectAmenaza(idx: number) {
    if (idx < 0) { onUpdate(r.id, { amenaza: '' }); return; }
    const e = RIESGOS_CATALOG[idx];
    onUpdate(r.id, { amenaza: `[${e.code}] ${e.name}`, degradacion: e.degradacion, probabilidad: e.probabilidad });
  }
  const selectedIdx = RIESGOS_CATALOG.findIndex(e => `[${e.code}] ${e.name}` === r.amenaza);

  return (
    <div className={s.riskCard}>
      <div className={s.riskCardHead}>
        <span className={s.riskCardNum}>{index + 1}</span>
        <input
          className={s.input}
          value={r.activo}
          placeholder="Activo…"
          onChange={e => onUpdate(r.id, { activo: e.target.value })}
        />
        <select
          className={`${s.select} ${s.amenazaSel}`}
          value={selectedIdx}
          onChange={e => onSelectAmenaza(Number(e.target.value))}
        >
          <option value={-1}>— Seleccionar amenaza —</option>
          {FACTOR_GROUPS.map(factor => (
            <optgroup key={factor} label={`Factor ${factor}`}>
              {RIESGOS_CATALOG.map((e, idx) => e.factor === factor ? (
                <option key={idx} value={idx}>
                  [{e.code}] {e.name} · {e.categorias.join(', ')}
                </option>
              ) : null)}
            </optgroup>
          ))}
        </select>
        <button className={s.delBtn} title="Eliminar riesgo" onClick={() => onRemove(r.id)}>✕</button>
      </div>

      {/* Dimensiones + degradación + probabilidad */}
      <div className={s.fieldGrid}>
        {DIMENSIONS.map(dim => (
          <div className={s.field} key={dim.key}>
            <span className={s.fieldLabel}>{dim.name}</span>
            <select
              className={s.select}
              value={r[dim.key as DimensionKey]}
              onChange={e => onUpdate(r.id, { [dim.key]: Number(e.target.value) } as Partial<ManualRisk>)}
            >
              {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} · {LEVEL_NAMES[v]}</option>)}
            </select>
          </div>
        ))}
        <div className={s.field}>
          <span className={s.fieldLabel}>Degradación</span>
          <select
            className={s.select}
            value={r.degradacion}
            onChange={e => onUpdate(r.id, { degradacion: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map(v => (
              <option key={v} value={v}>{DEGRAD_LEVELS[v]!.name} · {DEGRAD_LEVELS[v]!.desc}</option>
            ))}
          </select>
        </div>
        <div className={s.field}>
          <span className={s.fieldLabel}>Probabilidad</span>
          <select
            className={s.select}
            value={r.probabilidad}
            onChange={e => onUpdate(r.id, { probabilidad: Number(e.target.value) })}
          >
            {[1, 2, 3, 4, 5].map(v => (
              <option key={v} value={v}>{PROB_LEVELS[v]!.name} · {PROB_LEVELS[v]!.desc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultados inherentes */}
      <div className={s.badgeRow}>
        <div className={s.calcBadge}>
          <span className={s.calcBadgeLabel}>Criticidad</span>
          <span className={s.calcBadgeVal}>{res.criticidad} · {LEVEL_NAMES[res.criticidad]}</span>
        </div>
        <div className={s.calcBadge}>
          <span className={s.calcBadgeLabel}>Impacto inherente</span>
          <span className={s.calcBadgeVal}>{res.impactoInherente} · {LEVEL_NAMES[res.impactoInherente]}</span>
        </div>
        <div className={s.calcBadge}>
          <span className={s.calcBadgeLabel}>Riesgo inherente</span>
          <span className={s.calcBadgeVal}>{round(res.riesgoInherente)}</span>
        </div>
        <div className={s.calcBadge}>
          <span className={s.calcBadgeLabel}>Zona inherente</span>
          <ZoneBadge zone={res.zonaInherente} />
        </div>
      </div>

      {/* Controles */}
      <div className={s.subHead}>
        <span className={s.subTitle}>Controles / salvaguardas ({r.controls.length})</span>
        <button className={s.subAddBtn} onClick={() => onAddControl(r.id)}>+ Añadir control</button>
      </div>

      {r.controls.length === 0 ? (
        <p className={s.ctrlEmpty}>Sin controles: el riesgo residual es igual al inherente.</p>
      ) : (
        <table className={s.ctrlTable}>
          <thead>
            <tr>
              <th>Control</th>
              <th>Tipo</th>
              <th>Implementación</th>
              <th>Grado</th>
              <th>Frecuencia</th>
              <th>Mit. I</th>
              <th>Mit. P</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {r.controls.map(c => (
              <tr key={c.id}>
                <td>
                  <input
                    className={s.miniInput}
                    value={c.nombre}
                    placeholder="Control del catálogo…"
                    list="controles-catalog"
                    onChange={e => {
                      const nombre = e.target.value;
                      const found = CONTROL_BY_NOMBRE.get(nombre);
                      onUpdateControl(r.id, c.id, found ? { nombre, tipo: found.tipo } : { nombre });
                    }}
                  />
                </td>
                <td>
                  <select className={s.miniSelect} value={c.tipo}
                    onChange={e => onUpdateControl(r.id, c.id, { tipo: e.target.value as ControlTipo })}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                <td>
                  <select className={s.miniSelect} value={c.implementacion}
                    onChange={e => onUpdateControl(r.id, c.id, { implementacion: e.target.value as ControlImplementacion })}>
                    {IMPLS.map(t => <option key={t} value={t}>{IMPL_LABEL[t]}</option>)}
                  </select>
                </td>
                <td>
                  <select className={s.miniSelect} value={c.grado}
                    onChange={e => onUpdateControl(r.id, c.id, { grado: e.target.value as ControlGrado })}>
                    {GRADOS.map(g => <option key={g} value={g}>{g} ({GRADO_VALUE[g]}) · {GRADO_DESC[g]}</option>)}
                  </select>
                </td>
                <td>
                  <select className={s.miniSelect} value={c.frecuencia}
                    onChange={e => onUpdateControl(r.id, c.id, { frecuencia: e.target.value as ControlFrecuencia })}>
                    {FRECS.map(f => <option key={f} value={f}>{FRECUENCIA_LABEL[f]}</option>)}
                  </select>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" className={s.chk} checked={c.mitigaImpacto}
                    onChange={e => onUpdateControl(r.id, c.id, { mitigaImpacto: e.target.checked })} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" className={s.chk} checked={c.mitigaProbabilidad}
                    onChange={e => onUpdateControl(r.id, c.id, { mitigaProbabilidad: e.target.checked })} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button className={s.delBtn} title="Eliminar control" onClick={() => onRemoveControl(r.id, c.id)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Resultados residuales */}
      <div className={s.badgeRow} style={{ marginTop: 14 }}>
        <div className={s.calcBadge}>
          <span className={s.calcBadgeLabel}>Impacto residual</span>
          <span className={s.calcBadgeVal}>{round(res.impactoResidual)}</span>
        </div>
        <div className={s.calcBadge}>
          <span className={s.calcBadgeLabel}>Probabilidad residual</span>
          <span className={s.calcBadgeVal}>{round(res.probResidual)}</span>
        </div>
        <div className={s.calcBadge}>
          <span className={s.calcBadgeLabel}>Riesgo residual</span>
          <span className={s.calcBadgeVal}>{round(res.riesgoResidual)}</span>
        </div>
        <div className={s.calcBadge}>
          <span className={s.calcBadgeLabel}>Zona residual</span>
          <ZoneBadge zone={res.zonaResidual} />
        </div>
      </div>
    </div>
  );
}

// ── Heat map ──────────────────────────────────────────────────────────────
function RiskMap({ grid, total }: { grid: number[][]; total: number }) {
  return (
    <table className={s.mapTable}>
      <thead>
        <tr>
          <th className={s.mapCorner}>Impacto ↓ / Prob. →</th>
          {[1, 2, 3, 4, 5].map(p => <th key={p} className={s.mapAxis}>{PROB_LEVELS[p]!.name}</th>)}
          <th className={s.mapTotalHead}>Total</th>
        </tr>
      </thead>
      <tbody>
        {[5, 4, 3, 2, 1].map(imp => {
          const counts = grid[imp - 1];
          const rowTotal = counts.reduce((a, b) => a + b, 0);
          return (
            <tr key={imp}>
              <td className={s.mapAxis}>{LEVEL_NAMES[imp]}</td>
              {[1, 2, 3, 4, 5].map(p => {
                const zone = zoneOfCell(p, imp);
                const c = counts[p - 1];
                return (
                  <td key={p} className={s.mapCell} style={{ background: ZONE_META[zone].bg }}>
                    {c > 0 ? c : ''}
                  </td>
                );
              })}
              <td className={s.mapTotal}>{rowTotal}</td>
            </tr>
          );
        })}
        <tr>
          <td className={s.mapTotal}>Total</td>
          {[1, 2, 3, 4, 5].map(p => {
            const colTotal = [0, 1, 2, 3, 4].reduce((a, imp) => a + grid[imp][p - 1], 0);
            return <td key={p} className={s.mapTotal}>{colTotal}</td>;
          })}
          <td className={s.mapTotal}>{total}</td>
        </tr>
      </tbody>
    </table>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────
function round(n: number): number {
  return Math.round(n * 100) / 100;
}
