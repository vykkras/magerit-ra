import React, { useMemo, useRef, useState } from 'react';
import { useQuestionnaireStore } from '../../store/questionnaireStore';
import { useSolicitudStore } from '../../store/solicitudStore';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import { THREAT_PROB, THREAT_IMPACT, CAT_THREATS } from '../../data/scenarios.data';
import { MAGERIT_THREATS } from '../../data/threats.data';
import { avgMaturity, maturityReduction, MATURITY_LABEL, type MaturityLevel } from '../../data/maturityLevels.data';
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
const IMP_LABELS  = ['', 'Mínimo', 'Bajo', 'Medio', 'Alto'];

function heatBg(p: number, i: number): string {
  const sc = p * i;
  if (sc >= 9) return '#fee2e2';
  if (sc >= 6) return '#fed7aa';
  if (sc >= 4) return '#fef9c3';
  return '#dcfce7';
}

const THREAT_META: Record<string, { name: string; description: string }> = Object.fromEntries(
  MAGERIT_THREATS.map(t => [t.code, { name: t.name, description: t.description }])
);

// Maturity badge colour
function matColor(m: number): { bg: string; color: string } {
  if (m >= 5)   return { bg: '#dcfce7', color: '#166534' };
  if (m >= 4)   return { bg: '#dbeafe', color: '#1e40af' };
  if (m >= 3)   return { bg: '#fef9c3', color: '#854d0e' };
  if (m >= 2)   return { bg: '#fed7aa', color: '#9a3412' };
  return               { bg: '#fee2e2', color: '#991b1b' };
}

// ── Types ──────────────────────────────────────────────────────────────────

interface ThreatRow {
  code: string;
  name: string;
  description: string;
  prob: number;
  // Raw MAGERIT inherent
  inherentImpact: number;
  inherentScore: number;
  inherentLevel: RiskLevel;
  // Internal control maturity
  avgMat: number;
  matLabel: string;
  matReduction: number;
  // Maturity-adjusted inherent (our controls applied)
  adjImpact: number;
  adjScore: number;
  adjLevel: RiskLevel;
  // Residual (after vendor answers)
  implementedSafeguards: string[];
  missingSafeguards: string[];
  residualImpact: number;
  residualScore: number;
  residualLevel: RiskLevel;
  reduction: number; // % from raw inherent → residual
  covered: boolean;
}

// ── Tooltip ────────────────────────────────────────────────────────────────

interface TooltipState {
  code: string; name: string; description: string; x: number; y: number;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function RiskAnalysisPage() {
  const { categoriaId } = useSolicitudStore();
  const { answers, customResponsibility } = useQuestionnaireStore();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const catId = categoriaId ?? '';

  const rows = useMemo<ThreatRow[]>(() => {
    if (!catId) return [];
    const threats    = CAT_THREATS[catId] ?? [];
    const questions  = CATEGORY_QUESTIONNAIRES[catId] ?? [];
    const catAnswers = answers[catId] ?? {};
    const custResp   = customResponsibility[catId] ?? {};

    const visibleQs = questions.filter(q => {
      const resp = custResp[q.id] ?? q.responsibility;
      return resp !== 'cliente';
    });

    return threats.map(code => {
      const prob            = THREAT_PROB[code]   ?? 2;
      const inherentImpact  = THREAT_IMPACT[code] ?? 2;
      const inherentScore   = prob * inherentImpact;

      const covering  = visibleQs.filter(q => q.riskRefs.includes(code));
      const yesQs     = covering.filter(q => catAnswers[q.id] === 'yes');
      const noQs      = covering.filter(q => catAnswers[q.id] === 'no');

      // Maturity: average of safeguardRefs across all covering questions
      const allRefs = covering.flatMap(q => q.safeguardRefs);
      const mat     = avgMaturity(allRefs);
      const matRed  = maturityReduction(mat);
      const matRounded = Math.round(mat * 10) / 10;

      // Maturity-adjusted inherent (our controls applied)
      const adjImpact  = Math.max(1, inherentImpact - matRed);
      const adjScore   = prob * adjImpact;

      // Residual (vendor yes answers applied on top of maturity-adjusted)
      const residualImpact = Math.max(1, adjImpact - yesQs.length);
      const residualScore  = prob * residualImpact;

      const reduction = inherentScore > 0
        ? Math.round((1 - residualScore / inherentScore) * 100)
        : 0;

      const meta = THREAT_META[code] ?? { name: code, description: '' };

      return {
        code,
        name: meta.name,
        description: meta.description,
        prob,
        inherentImpact,
        inherentScore,
        inherentLevel: riskLevel(inherentScore),
        avgMat: matRounded,
        matLabel: MATURITY_LABEL[Math.round(mat) as MaturityLevel] ?? '',
        matReduction: matRed,
        adjImpact,
        adjScore,
        adjLevel: riskLevel(adjScore),
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

  // ── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total  = rows.length;
    const avgInh = total ? rows.reduce((a, r) => a + r.inherentScore, 0) / total : 0;
    const avgRes = total ? rows.reduce((a, r) => a + r.residualScore, 0) / total : 0;
    const avgMat = total ? rows.reduce((a, r) => a + r.avgMat, 0) / total : 0;
    const reduction = avgInh > 0 ? Math.round((1 - avgRes / avgInh) * 100) : 0;
    const byLevel = (fn: (r: ThreatRow) => RiskLevel) =>
      Object.fromEntries(
        (['critico','alto','medio','bajo'] as RiskLevel[]).map(lv => [
          lv, rows.filter(r => fn(r) === lv).length,
        ])
      ) as Record<RiskLevel, number>;
    return {
      total,
      avgInh: Math.round(avgInh * 10) / 10,
      avgRes: Math.round(avgRes * 10) / 10,
      avgMat: Math.round(avgMat * 10) / 10,
      reduction,
      inherent: byLevel(r => r.inherentLevel),
      residual:  byLevel(r => r.residualLevel),
    };
  }, [rows]);

  // ── 4×4 matrix (uses adj inherent vs residual positions) ──────────────

  type MatrixCell = { inherent: ThreatRow[]; residual: ThreatRow[] };
  const matrix = useMemo(() => {
    const m: Record<string, MatrixCell> = {};
    rows.forEach(r => {
      const ki = `${r.prob}-${r.adjImpact}`;
      if (!m[ki]) m[ki] = { inherent: [], residual: [] };
      m[ki].inherent.push(r);
      const kr = `${r.prob}-${r.residualImpact}`;
      if (!m[kr]) m[kr] = { inherent: [], residual: [] };
      if (r.residualImpact !== r.adjImpact) m[kr].residual.push(r);
    });
    return m;
  }, [rows]);

  function showTooltip(r: ThreatRow, e: React.MouseEvent) {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltip({ code: r.code, name: r.name, description: r.description, x: e.clientX, y: e.clientY });
  }
  function hideTooltip() {
    tooltipTimer.current = setTimeout(() => setTooltip(null), 120);
  }

  if (!catId) {
    return <div className={s.empty}>Completa primero el cuestionario para ver el análisis de riesgos.</div>;
  }

  return (
    <div className={s.page}>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <div className={s.statsBar}>
        <StatChip label="Amenazas" value={String(stats.total)} />
        <div className={s.divider} />
        <StatChip label="Riesgo inherente medio" value={String(stats.avgInh)} />
        <StatChip label="Riesgo residual medio"  value={String(stats.avgRes)} />
        <StatChip label="Reducción total"         value={`${stats.reduction}%`} accent />
        <div className={s.divider} />
        <StatChip label="Madurez media controles" value={`${stats.avgMat}/5`} matColor={matColor(stats.avgMat)} />
        <div className={s.divider} />
        <div className={s.levelChips}>
          {(['critico','alto','medio','bajo'] as RiskLevel[]).map(lv => (
            <span key={lv} className={`${s.lvChip} ${s[`lv_${lv}`]}`}>
              {LEVEL_LABEL[lv]}: {stats.residual[lv]}
            </span>
          ))}
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className={s.helpBtn} onClick={() => setHelpOpen(true)} title="Ver metodología">
            ? Ayuda
          </button>
        </div>
      </div>

      <div className={s.content}>
        <div className={s.mainRow}>

          {/* ── 4×4 matrix ─────────────────────────────────────────────── */}
          <div className={s.matrixWrap}>
            <h3 className={s.sectionTitle}>Matriz de Riesgo</h3>
            <div className={s.matrixLegendRow}>
              <span className={s.legendDot} style={{ background: '#1e3a5f' }} /><span>Ajustado por madurez</span>
              <span className={s.legendDot} style={{ background: '#16a34a', marginLeft: 10 }} /><span>Residual (proveedor)</span>
            </div>
            <div className={s.grid}>
              {[4,3,2,1].map(p => (
                <div key={p} className={s.matrixRow}>
                  <div className={s.axisCell}>{PROB_LABELS[p]}</div>
                  {[1,2,3,4].map(i => {
                    const cell = matrix[`${p}-${i}`] ?? { inherent: [], residual: [] };
                    return (
                      <div key={i} className={s.cell} style={{ background: heatBg(p, i) }}>
                        {cell.inherent.map(r => (
                          <span key={`i-${r.code}`} className={s.dotInherent}
                            onMouseEnter={e => showTooltip(r, e)}
                            onMouseMove={e => showTooltip(r, e)}
                            onMouseLeave={hideTooltip}>
                            {r.code}
                          </span>
                        ))}
                        {cell.residual.map(r => (
                          <span key={`r-${r.code}`} className={s.dotResidual}
                            onMouseEnter={e => showTooltip(r, e)}
                            onMouseMove={e => showTooltip(r, e)}
                            onMouseLeave={hideTooltip}>
                            {r.code}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className={s.matrixRow}>
                <div className={s.axisCell} />
                {[1,2,3,4].map(i => (
                  <div key={i} className={s.xAxisCell}>{IMP_LABELS[i]}</div>
                ))}
              </div>
            </div>
            <div className={s.axisLabels}>
              <span className={s.yAxisLabel}>↑ Probabilidad</span>
              <span className={s.xAxisLabel}>Impacto →</span>
            </div>
          </div>

          {/* ── Level breakdown ────────────────────────────────────────── */}
          <div className={s.breakdownWrap}>
            <h3 className={s.sectionTitle}>Distribución por Nivel</h3>
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

        {/* ── Threat table ───────────────────────────────────────────────── */}
        <div className={s.tableWrap}>
          <h3 className={s.sectionTitle}>Detalle por Amenaza</h3>
          <table className={s.table}>
            <thead className={s.thead}>
              <tr>
                <th className={s.thCode}>Amenaza</th>
                <th className={s.thName}>Descripción</th>
                <th className={s.thNum}>P</th>
                <th className={s.thNum}>Imp. Inh.</th>
                <th className={s.thScore}>Riesgo Inh.</th>
                <th className={s.thMat}>Madurez Int.</th>
                <th className={s.thNum}>Imp. Adj.</th>
                <th className={s.thScore}>Riesgo Adj.</th>
                <th className={s.thSafeguards}>Salv. activas</th>
                <th className={s.thSafeguards}>Salv. pendientes</th>
                <th className={s.thNum}>Imp. Res.</th>
                <th className={s.thScore}>Riesgo Res.</th>
                <th className={s.thNum}>Reducción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const mc = matColor(r.avgMat);
                return (
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
                    <td className={s.tdMat}>
                      <span className={s.matBadge} style={{ background: mc.bg, color: mc.color }}>
                        {r.avgMat}/5 — {r.matLabel}
                      </span>
                      {r.matReduction > 0 && (
                        <span className={s.matRed}>↓{r.matReduction}</span>
                      )}
                    </td>
                    <td className={s.tdNum}>{r.adjImpact}</td>
                    <td className={s.tdScore}>
                      <span className={`${s.badge} ${s[`lv_${r.adjLevel}`]}`}>
                        {r.adjScore} · {LEVEL_LABEL[r.adjLevel]}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Help modal ───────────────────────────────────────────────────── */}
      {helpOpen && (
        <div className={s.helpOverlay} onClick={() => setHelpOpen(false)}>
          <div className={s.helpModal} onClick={e => e.stopPropagation()}>
            <div className={s.helpHeader}>
              <span className={s.helpTitle}>Metodología de Análisis de Riesgos</span>
              <button className={s.helpClose} onClick={() => setHelpOpen(false)}>✕</button>
            </div>
            <div className={s.helpBody}>

              <HelpSection title="Modelo de tres niveles">
                <p>El análisis calcula tres posiciones de riesgo para cada amenaza, aplicando controles de forma escalonada:</p>
                <ol>
                  <li><strong>Riesgo Inherente</strong> — riesgo teórico sin ningún control; valores base de MAGERIT v3.</li>
                  <li><strong>Riesgo Ajustado</strong> — riesgo tras aplicar los controles internos de la organización, ponderados por su nivel de madurez ISO 27001:2022.</li>
                  <li><strong>Riesgo Residual</strong> — riesgo final tras aplicar adicionalmente las salvaguardas implementadas por el proveedor (respuestas "Sí" en el cuestionario).</li>
                </ol>
              </HelpSection>

              <HelpSection title="Fórmulas">
                <table className={s.helpTable}>
                  <tbody>
                    <tr><td className={s.helpTdLabel}>Riesgo Inherente</td><td className={s.helpTdFormula}>P × I</td></tr>
                    <tr><td className={s.helpTdLabel}>Reducción por madurez</td><td className={s.helpTdFormula}>f(madurez media) → 0, 1 ó 2 puntos</td></tr>
                    <tr><td className={s.helpTdLabel}>Impacto Ajustado</td><td className={s.helpTdFormula}>max(1, I − Reducción_madurez)</td></tr>
                    <tr><td className={s.helpTdLabel}>Riesgo Ajustado</td><td className={s.helpTdFormula}>P × Impacto_Ajustado</td></tr>
                    <tr><td className={s.helpTdLabel}>Impacto Residual</td><td className={s.helpTdFormula}>max(1, Impacto_Ajustado − Nº_Salvaguardas_Activas)</td></tr>
                    <tr><td className={s.helpTdLabel}>Riesgo Residual</td><td className={s.helpTdFormula}>P × Impacto_Residual</td></tr>
                    <tr><td className={s.helpTdLabel}>Reducción total (%)</td><td className={s.helpTdFormula}>(1 − Riesgo_Residual / Riesgo_Inherente) × 100</td></tr>
                  </tbody>
                </table>
                <p className={s.helpNote}>El límite inferior de impacto es siempre 1 (min=1), garantizando que ningún riesgo se anule completamente por controles.</p>
              </HelpSection>

              <HelpSection title="Escala de Probabilidad (P · 1–4)">
                <table className={s.helpTable}>
                  <tbody>
                    <tr><td className={s.helpTdVal}>1</td><td><strong>Muy rara</strong> — ocurrencia excepcional, improbable en el ciclo de vida del contrato.</td></tr>
                    <tr><td className={s.helpTdVal}>2</td><td><strong>Poco frecuente</strong> — ocurre ocasionalmente, posible pero no habitual.</td></tr>
                    <tr><td className={s.helpTdVal}>3</td><td><strong>Posible</strong> — ocurre con cierta regularidad en el sector.</td></tr>
                    <tr><td className={s.helpTdVal}>4</td><td><strong>Frecuente</strong> — ocurre habitualmente o es una amenaza activa conocida.</td></tr>
                  </tbody>
                </table>
              </HelpSection>

              <HelpSection title="Escala de Impacto (I · 1–4)">
                <table className={s.helpTable}>
                  <tbody>
                    <tr><td className={s.helpTdVal}>1</td><td><strong>Mínimo</strong> — impacto despreciable, sin afectación operativa relevante.</td></tr>
                    <tr><td className={s.helpTdVal}>2</td><td><strong>Bajo</strong> — impacto menor gestionable con recursos ordinarios.</td></tr>
                    <tr><td className={s.helpTdVal}>3</td><td><strong>Medio</strong> — impacto significativo con recuperación posible pero costosa.</td></tr>
                    <tr><td className={s.helpTdVal}>4</td><td><strong>Alto</strong> — impacto crítico con consecuencias graves o duraderas.</td></tr>
                  </tbody>
                </table>
              </HelpSection>

              <HelpSection title="Niveles de Riesgo (P × I)">
                <div className={s.helpLevels}>
                  <div className={s.helpLvRow} style={{ background: '#fee2e2' }}><span style={{ color: '#991b1b', fontWeight: 700 }}>Crítico ≥ 9</span><span>Tratamiento inmediato obligatorio.</span></div>
                  <div className={s.helpLvRow} style={{ background: '#fed7aa' }}><span style={{ color: '#9a3412', fontWeight: 700 }}>Alto ≥ 6</span><span>Plan de tratamiento prioritario.</span></div>
                  <div className={s.helpLvRow} style={{ background: '#fef9c3' }}><span style={{ color: '#854d0e', fontWeight: 700 }}>Medio ≥ 4</span><span>Seguimiento y plan de mejora.</span></div>
                  <div className={s.helpLvRow} style={{ background: '#dcfce7' }}><span style={{ color: '#166534', fontWeight: 700 }}>Bajo &lt; 4</span><span>Riesgo aceptable con monitorización periódica.</span></div>
                </div>
              </HelpSection>

              <HelpSection title="Madurez de controles internos (ISO 27001:2022)">
                <p>La madurez media de los controles que cubren una amenaza determina cuántos puntos de impacto se reducen <em>antes</em> de valorar las salvaguardas del proveedor:</p>
                <table className={s.helpTable}>
                  <tbody>
                    <tr><td className={s.helpTdVal}>≥ 5 — Optimizado</td><td>−2 puntos de impacto</td></tr>
                    <tr><td className={s.helpTdVal}>≥ 4 — Gestionado</td><td>−1 punto de impacto</td></tr>
                    <tr><td className={s.helpTdVal}>1–3 — Inicial / Repetible / Definido</td><td>sin reducción</td></tr>
                  </tbody>
                </table>
                <table className={s.helpTable} style={{ marginTop: 8 }}>
                  <thead><tr><th>Nivel</th><th>Descripción</th></tr></thead>
                  <tbody>
                    <tr><td className={s.helpTdVal}>1 — Inicial</td><td>Sin procedimientos formales; actuación reactiva.</td></tr>
                    <tr><td className={s.helpTdVal}>2 — Repetible</td><td>Procesos informales, dependientes de personas clave.</td></tr>
                    <tr><td className={s.helpTdVal}>3 — Definido</td><td>Procesos documentados y estandarizados.</td></tr>
                    <tr><td className={s.helpTdVal}>4 — Gestionado</td><td>Procesos medidos, controlados y con métricas.</td></tr>
                    <tr><td className={s.helpTdVal}>5 — Optimizado</td><td>Mejora continua, automatización y revisión proactiva.</td></tr>
                  </tbody>
                </table>
              </HelpSection>

              <HelpSection title="Leyenda de la matriz">
                <div className={s.helpMatrixLegend}>
                  <span className={s.helpDotNavy} />
                  <span><strong>Azul marino</strong> — posición ajustada por madurez interna (Riesgo Ajustado).</span>
                </div>
                <div className={s.helpMatrixLegend}>
                  <span className={s.helpDotGreen} />
                  <span><strong>Verde</strong> — posición residual tras salvaguardas del proveedor (Riesgo Residual). Solo aparece cuando la posición difiere de la ajustada.</span>
                </div>
                <p className={s.helpNote}>El color de fondo de cada celda indica el nivel de riesgo (Crítico / Alto / Medio / Bajo) basado en P × I de esa celda.</p>
              </HelpSection>

            </div>
          </div>
        </div>
      )}

      {/* ── Tooltip ──────────────────────────────────────────────────────── */}
      {tooltip && (
        <div
          className={s.tooltip}
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
          onMouseEnter={() => { if (tooltipTimer.current) clearTimeout(tooltipTimer.current); }}
          onMouseLeave={hideTooltip}
        >
          <div className={s.tooltipCode}>{tooltip.code}</div>
          <div className={s.tooltipName}>{tooltip.name}</div>
          {tooltip.description && <div className={s.tooltipDesc}>{tooltip.description}</div>}
        </div>
      )}
    </div>
  );
}

function HelpSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={s.helpSection}>
      <h4 className={s.helpSectionTitle}>{title}</h4>
      {children}
    </div>
  );
}

function StatChip({ label, value, accent, matColor: mc }: {
  label: string; value: string; accent?: boolean; matColor?: { bg: string; color: string };
}) {
  return (
    <div className={s.statChip}>
      <span className={s.statLabel}>{label}</span>
      <span
        className={`${s.statValue} ${accent ? s.statAccent : ''}`}
        style={mc ? { color: mc.color } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
