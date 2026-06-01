import { useMemo } from 'react';
import { useManualRiskStore } from '../../store/manualRiskStore';
import {
  computeRiskSummary,
  PROB_LABELS, IMP_LABELS,
  ZONE_LABEL, ZONE_ORDER, ZONE_BG, ZONE_COLOR, zoneFromPI,
  type ZoneLevel,
} from '../../data/riskScale';
import s from './RiskAnalysisPage.module.css';

export default function RiskAnalysisPage() {
  const { risks, addRisk, updateRisk, removeRisk } = useManualRiskStore();
  const summary = useMemo(() => computeRiskSummary(risks), [risks]);

  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.headerCard}>
        <div className={s.headerIcon}>4</div>
        <div>
          <p className={s.headerNum}>Fase 2 · Paso 4</p>
          <p className={s.headerTitle}>Análisis de Riesgos</p>
          <p className={s.headerSub}>Introduce manualmente los riesgos residuales obtenidos en GlobalSuite. La zona de riesgo se calcula automáticamente (Probabilidad × Impacto).</p>
        </div>
      </div>

      {/* Editor */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <p className={s.cardTitle}>Matriz de riesgos residuales</p>
          <button className={s.addBtn} onClick={addRisk}>+ Añadir riesgo</button>
        </div>

        {risks.length === 0 ? (
          <div className={s.empty}>
            No hay riesgos. Pulsa <strong>“Añadir riesgo”</strong> para introducir las filas de la matriz.
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.thNum}>#</th>
                <th>Activo</th>
                <th>Amenaza</th>
                <th className={s.thSel}>Probabilidad residual</th>
                <th className={s.thSel}>Impacto residual</th>
                <th className={s.thZone}>Zona de Riesgo Residual</th>
                <th className={s.thDel} />
              </tr>
            </thead>
            <tbody>
              {risks.map((r, i) => {
                const zone = zoneFromPI(r.probabilidad, r.impacto);
                return (
                  <tr key={r.id}>
                    <td className={s.tdNum}>{i + 1}</td>
                    <td>
                      <input
                        className={s.input}
                        value={r.activo}
                        placeholder="Activo…"
                        onChange={e => updateRisk(r.id, { activo: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className={s.input}
                        value={r.amenaza}
                        placeholder="Amenaza…"
                        onChange={e => updateRisk(r.id, { amenaza: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        className={s.select}
                        value={r.probabilidad}
                        onChange={e => updateRisk(r.id, { probabilidad: Number(e.target.value) })}
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} · {PROB_LABELS[v]}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        className={s.select}
                        value={r.impacto}
                        onChange={e => updateRisk(r.id, { impacto: Number(e.target.value) })}
                      >
                        {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} · {IMP_LABELS[v]}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={s.zoneBadge} style={{ background: ZONE_BG[zone], color: ZONE_COLOR[zone] }}>
                        {ZONE_LABEL[zone]}
                      </span>
                    </td>
                    <td className={s.tdDel}>
                      <button className={s.delBtn} title="Eliminar" onClick={() => removeRisk(r.id)}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Mapa de riesgos + distribución */}
      {risks.length > 0 && (
        <div className={s.card}>
          <p className={s.cardTitle}>Mapa de Riesgos</p>
          <p className={s.cardSub}>Distribución de los {summary.total} riesgos por probabilidad e impacto residual.</p>

          <div className={s.mapRow}>
            <RiskMap mapCounts={summary.mapCounts} total={summary.total} />

            <div className={s.zoneDist}>
              {ZONE_ORDER.map(z => (
                <div key={z} className={s.zoneDistRow}>
                  <span className={s.zoneDot} style={{ background: ZONE_BG[z], borderColor: ZONE_COLOR[z] }} />
                  <span className={s.zoneDistLabel}>{ZONE_LABEL[z]}</span>
                  <span className={s.zoneDistCount} style={{ color: ZONE_COLOR[z] }}>{summary.zoneCounts[z]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskMap({ mapCounts, total }: { mapCounts: number[][]; total: number }) {
  return (
    <table className={s.mapTable}>
      <thead>
        <tr>
          <th className={s.mapCorner}>Impacto ↓ / Prob. →</th>
          {[1, 2, 3, 4, 5].map(p => <th key={p} className={s.mapAxis}>{PROB_LABELS[p]}</th>)}
          <th className={s.mapTotalHead}>Total</th>
        </tr>
      </thead>
      <tbody>
        {[5, 4, 3, 2, 1].map(imp => {
          const counts = mapCounts[imp - 1];
          const rowTotal = counts.reduce((a, b) => a + b, 0);
          return (
            <tr key={imp}>
              <td className={s.mapAxis}>{IMP_LABELS[imp]}</td>
              {[1, 2, 3, 4, 5].map(p => {
                const zone: ZoneLevel = zoneFromPI(p, imp);
                const c = counts[p - 1];
                return (
                  <td key={p} className={s.mapCell} style={{ background: ZONE_BG[zone] }}>
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
            const colTotal = [0, 1, 2, 3, 4].reduce((a, imp) => a + mapCounts[imp][p - 1], 0);
            return <td key={p} className={s.mapTotal}>{colTotal}</td>;
          })}
          <td className={s.mapTotal}>{total}</td>
        </tr>
      </tbody>
    </table>
  );
}
