import { useMemo, useState } from 'react';
import { useQuestionnaireStore } from '../../store/questionnaireStore';
import { useCategoryStore } from '../../store/categoryStore';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import { THREAT_PROB, THREAT_IMPACT, CAT_THREATS } from '../../data/scenarios.data';
import { MAGERIT_THREATS } from '../../data/threats.data';
import s from './RiskAnalysisPage.module.css';

// ── Risk level helpers ─────────────────────────────────────────────────────

type RiskLevel = 'critico' | 'alto' | 'medio' | 'bajo';

function riskLevel(score: number): RiskLevel {
  if (score >= 9) return 'critico';
  if (score >= 6) return 'alto';
  if (score >= 4) return 'medio';
  return 'bajo';
}

const LEVEL_LABEL: Record<RiskLevel, string> = {
  critico: 'Crítico', alto: 'Alto', medio: 'Medio', bajo: 'Bajo',
};

const PROB_LABELS = ['', 'Muy rara', 'Poco frec.', 'Posible', 'Frecuente'];
const IMP_LABELS  = ['', 'Mínimo',   'Bajo',       'Medio',  'Alto'];

// Heat colour for a P×I cell in the 4×4 matrix
function heatBg(p: number, i: number): string {
  const sc = p * i;
  if (sc >= 9) return '#fee2e2'; // red-100
  if (sc >= 6) return '#fed7aa'; // orange-100
  if (sc >= 4) return '#fef9c3'; // yellow-100
  return '#dcfce7';              // green-100
}

// Threat name lookup
const THREAT_NAME: Record<string, string> = Object.fromEntries(
  MAGERIT_THREATS.map(t => [t.code, t.name])
);

// ── Types ──────────────────────────────────────────────────────────────────

interface ThreatRow {
  code: string;
  name: string;
  prob: number;
  inherentImpact: number;
  inherentScore: number;
  inherentLevel: RiskLevel;
  implementedSafeguards: string[]; // question texts answered 'yes'
  missingSafeguards: string[];     // question texts answered 'no'
  residualImpact: number;
  residualScore: number;
  residualLevel: RiskLevel;
  reduction: number; // %
  covered: boolean;  // at least one covering question exists
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RiskAnalysisPage() {
  const { categories } = useCategoryStore();
  const { answers, customResponsibility } = useQuestionnaireStore();

  const [activeTab, setActiveTab] = useState<string | null>(null);

  const category = activeTab
    ? categories.find(c => c.id === activeTab) ?? categories[0]
    : categories[0];

  const catId = category?.id ?? '';

  const rows = useMemo<ThreatRow[]>(() => {
    if (!catId) return [];
    const threats  = CAT_THREATS[catId] ?? [];
    const questions = CATEGORY_QUESTIONNAIRES[catId] ?? [];
    const catAnswers = answers[catId] ?? {};
    const custResp   = customResponsibility[catId] ?? {};

    // Only count questions that are actually shown (proveedor or ambos)
    const visibleQs = questions.filter(q => {
      const resp = custResp[q.id] ?? q.responsibility;
      return resp !== 'cliente';
    });

    return threats.map(code => {
      const prob          = THREAT_PROB[code]   ?? 2;
      const inherentImpact = THREAT_IMPACT[code] ?? 2;
      const inherentScore  = prob * inherentImpact;

      const covering = visibleQs.filter(q => q.riskRefs.includes(code));
      const yesQs  = covering.filter(q => catAnswers[q.id] === 'yes');
      const noQs   = covering.filter(q => catAnswers[q.id] === 'no');

      const residualImpact = Math.max(1, inherentImpact - yesQs.length) as number;
      const residualScore  = prob * residualImpact;
      const reduction = inherentScore > 0
        ? Math.round((1 - residualScore / inherentScore) * 100)
        : 0;

      return {
        code,
        name: THREAT_NAME[code] ?? code,
        prob,
        inherentImpact,
        inherentScore,
        inherentLevel: riskLevel(inherentScore),
        implementedSafeguards: yesQs.map(q => q.text),
        missingSafeguards:     noQs.map(q => q.text),
        residualImpact,
        residualScore,
        residualLevel: riskLevel(residualScore),
        reduction,
        covered: covering.length > 0,
      };
    });
  }, [catId, answers, customResponsibility]);

  // ── Summary stats ──────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total      = rows.length;
    const avgInh     = total ? rows.reduce((a, r) => a + r.inherentScore, 0) / total : 0;
    const avgRes     = total ? rows.reduce((a, r) => a + r.residualScore, 0) / total : 0;
    const reduction  = avgInh > 0 ? Math.round((1 - avgRes / avgInh) * 100) : 0;
    const byLevel = (fn: (r: ThreatRow) => RiskLevel) =>
      Object.fromEntries(
        (['critico', 'alto', 'medio', 'bajo'] as RiskLevel[]).map(lv => [
          lv, rows.filter(r => fn(r) === lv).length,
        ])
      ) as Record<RiskLevel, number>;
    return {
      total, avgInh: Math.round(avgInh * 10) / 10,
      avgRes: Math.round(avgRes * 10) / 10,
      reduction,
      inherent: byLevel(r => r.inherentLevel),
      residual: byLevel(r => r.residualLevel),
    };
  }, [rows]);

  // ── 4×4 matrix data ───────────────────────────────────────────────────

  // threats grouped by (prob, inherentImpact) and (prob, residualImpact)
  type MatrixCell = { inherent: string[]; residual: string[] };
  const matrix = useMemo(() => {
    const m: Record<string, MatrixCell> = {};
    const key = (p: number, i: number) => `${p}-${i}`;
    rows.forEach(r => {
      const ki = key(r.prob, r.inherentImpact);
      if (!m[ki]) m[ki] = { inherent: [], residual: [] };
      m[ki].inherent.push(r.code);
      const kr = key(r.prob, r.residualImpact);
      if (!m[kr]) m[kr] = { inherent: [], residual: [] };
      m[kr].residual.push(r.code);
    });
    return m;
  }, [rows]);

  if (!category) {
    return <div className={s.empty}>Sin categorías activas.</div>;
  }

  const activeCatId = activeTab ?? catId;

  return (
    <div className={s.page}>
      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className={s.tabs}>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${s.tab} ${(activeTab ?? catId) === cat.id ? s.tabActive : ''}`}
            onClick={() => setActiveTab(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className={s.content}>
        {/* ── Stats bar ──────────────────────────────────────────────── */}
        <div className={s.statsBar}>
          <StatChip label="Amenazas" value={String(stats.total)} />
          <StatChip label="Riesgo inherente medio" value={String(stats.avgInh)} />
          <StatChip label="Riesgo residual medio"  value={String(stats.avgRes)} />
          <StatChip label="Reducción global" value={`${stats.reduction}%`} accent />
          <div className={s.levelChips}>
            {(['critico','alto','medio','bajo'] as RiskLevel[]).map(lv => (
              <span key={lv} className={`${s.lvChip} ${s[`lv_${lv}`]}`}>
                {LEVEL_LABEL[lv]}: {stats.residual[lv]}
              </span>
            ))}
          </div>
        </div>

        <div className={s.mainRow}>
          {/* ── 4×4 Matrix heatmap ───────────────────────────────────── */}
          <div className={s.matrixWrap}>
            <h3 className={s.sectionTitle}>Matriz de Riesgo</h3>
            <div className={s.matrixLegendRow}>
              <span className={s.legendDot} style={{ background: '#1e3a5f' }} />Inherente
              <span className={s.legendDot} style={{ background: '#16a34a', marginLeft: 12 }} />Residual
            </div>
            <div className={s.matrix}>
              {/* Y axis label */}
              <div className={s.yAxisLabel}>Probabilidad →</div>
              {/* Grid: rows = prob 4→1, cols = impact 1→4 */}
              <div className={s.grid}>
                {[4,3,2,1].map(p => (
                  <div key={p} className={s.matrixRow}>
                    <div className={s.axisCell}>{PROB_LABELS[p]}</div>
                    {[1,2,3,4].map(i => {
                      const ki = `${p}-${i}`;
                      const cell = matrix[ki] ?? { inherent: [], residual: [] };
                      const bg = heatBg(p, i);
                      return (
                        <div key={i} className={s.cell} style={{ background: bg }}>
                          {cell.inherent.map(c => (
                            <span key={`i-${c}`} className={s.dotInherent} title={`Inherente: ${c}`}>{c}</span>
                          ))}
                          {cell.residual.map(c => (
                            <span key={`r-${c}`} className={s.dotResidual} title={`Residual: ${c}`}>{c}</span>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {/* X axis */}
                <div className={s.matrixRow}>
                  <div className={s.axisCell} />
                  {[1,2,3,4].map(i => (
                    <div key={i} className={s.xAxisCell}>{IMP_LABELS[i]}</div>
                  ))}
                </div>
              </div>
              <div className={s.xAxisLabel}>← Impacto</div>
            </div>
          </div>

          {/* ── Level breakdown ──────────────────────────────────────── */}
          <div className={s.breakdownWrap}>
            <h3 className={s.sectionTitle}>Niveles de Riesgo</h3>
            <div className={s.breakdownGrid}>
              {(['critico','alto','medio','bajo'] as RiskLevel[]).map(lv => (
                <div key={lv} className={`${s.breakdownCard} ${s[`card_${lv}`]}`}>
                  <div className={s.cardLevel}>{LEVEL_LABEL[lv]}</div>
                  <div className={s.cardNums}>
                    <div>
                      <div className={s.cardNumLabel}>Inherente</div>
                      <div className={s.cardNum}>{stats.inherent[lv]}</div>
                    </div>
                    <div className={s.cardArrow}>→</div>
                    <div>
                      <div className={s.cardNumLabel}>Residual</div>
                      <div className={s.cardNum}>{stats.residual[lv]}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Risk table ─────────────────────────────────────────────── */}
        <div className={s.tableWrap}>
          <h3 className={s.sectionTitle}>Detalle por Amenaza</h3>
          <table className={s.table}>
            <thead className={s.thead}>
              <tr>
                <th className={s.thCode}>Amenaza</th>
                <th className={s.thName}>Descripción</th>
                <th className={s.thNum}>Prob.</th>
                <th className={s.thNum}>Imp. Inh.</th>
                <th className={s.thScore}>Riesgo Inh.</th>
                <th className={s.thSafeguards}>Salvaguardas activas</th>
                <th className={s.thSafeguards}>Salvaguardas pendientes</th>
                <th className={s.thNum}>Imp. Res.</th>
                <th className={s.thScore}>Riesgo Res.</th>
                <th className={s.thNum}>Reducción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.code} className={s.tr}>
                  <td className={s.tdCode}>{r.code}</td>
                  <td className={s.tdName}>{r.name}</td>
                  <td className={s.tdNum}>{r.prob}</td>
                  <td className={s.tdNum}>{r.inherentImpact}</td>
                  <td className={s.tdScore}>
                    <span className={`${s.badge} ${s[`lv_${r.inherentLevel}`]}`}>
                      {r.inherentScore} · {LEVEL_LABEL[r.inherentLevel]}
                    </span>
                  </td>
                  <td className={s.tdSafeguards}>
                    {r.implementedSafeguards.length === 0
                      ? <span className={s.none}>—</span>
                      : r.implementedSafeguards.map((sg, i) => (
                          <div key={i} className={s.sgYes}>{sg}</div>
                        ))
                    }
                  </td>
                  <td className={s.tdSafeguards}>
                    {r.missingSafeguards.length === 0
                      ? <span className={r.covered ? s.allGood : s.none}>
                          {r.covered ? 'Todo cubierto' : '—'}
                        </span>
                      : r.missingSafeguards.map((sg, i) => (
                          <div key={i} className={s.sgNo}>{sg}</div>
                        ))
                    }
                  </td>
                  <td className={s.tdNum}>{r.residualImpact}</td>
                  <td className={s.tdScore}>
                    <span className={`${s.badge} ${s[`lv_${r.residualLevel}`]}`}>
                      {r.residualScore} · {LEVEL_LABEL[r.residualLevel]}
                    </span>
                  </td>
                  <td className={s.tdNum}>
                    <span className={r.reduction > 0 ? s.reductionPos : s.reductionZero}>
                      {r.reduction > 0 ? `↓ ${r.reduction}%` : '0%'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={s.statChip}>
      <span className={s.statLabel}>{label}</span>
      <span className={`${s.statValue} ${accent ? s.statAccent : ''}`}>{value}</span>
    </div>
  );
}
