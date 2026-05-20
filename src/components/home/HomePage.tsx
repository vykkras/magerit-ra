import s from './HomePage.module.css';
import { useCategoryStore } from '../../store/categoryStore';
import { useQuestionnaireStore } from '../../store/questionnaireStore';
import { useRiskScenarioStore } from '../../store/riskScenarioStore';
import { CATEGORY_QUESTIONNAIRES, type Question } from '../../data/questionnaires.data';

function computeResidual(
  threatCode: string,
  questions: Question[],
  categoryAnswers: Record<string, string>,
  inherentImpact: number
): number {
  const covering = questions.filter(q => q.riskRefs.includes(threatCode));
  if (covering.length === 0) return inherentImpact;
  const yesCount = covering.filter(q => categoryAnswers[q.id] === 'yes').length;
  return Math.max(1, inherentImpact - yesCount);
}

function StatCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className={s.statCard}>
      <p className={s.statValue} style={color ? { color } : undefined}>{value}</p>
      <p className={s.statLabel}>{label}</p>
      {sub && <p className={s.statSub}>{sub}</p>}
    </div>
  );
}

export default function HomePage({ onStart }: { onStart: () => void }) {
  const { categories } = useCategoryStore();
  const { answers } = useQuestionnaireStore();
  const { scenarios } = useRiskScenarioStore();

  // ── Per-category stats ──────────────────────────────────────────────────────
  const catStats = categories.map(cat => {
    const questions     = CATEGORY_QUESTIONNAIRES[cat.id] ?? [];
    const catAnswers    = answers[cat.id] ?? {};
    const totalQ        = questions.length;
    const answered      = questions.filter(q => catAnswers[q.id] != null).length;
    const yesCount      = questions.filter(q => catAnswers[q.id] === 'yes').length;
    const pct           = totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;
    const compliance    = totalQ > 0 ? Math.round((yesCount / totalQ) * 100) : 0;
    const isComplete    = totalQ > 0 && answered === totalQ;
    const isActive      = answered > 0;

    const rows          = scenarios[cat.id] ?? [];
    const scorableRows  = rows.filter(r => r.inherentImpact !== null && r.probability !== null);
    const totalInherent = scorableRows.reduce((s, r) => s + r.probability! * r.inherentImpact!, 0);
    const totalResidual = scorableRows.reduce((s, r) => {
      const res = computeResidual(r.threatCode, questions, catAnswers, r.inherentImpact!);
      return s + r.probability! * res;
    }, 0);
    const reduction     = totalInherent > 0 ? Math.round((1 - totalResidual / totalInherent) * 100) : 0;

    return { cat, totalQ, answered, pct, compliance, isComplete, isActive, totalInherent, totalResidual, reduction, scorableRows: scorableRows.length };
  });

  // ── Global aggregates ───────────────────────────────────────────────────────
  const activeCount    = catStats.filter(c => c.isActive).length;
  const completeCount  = catStats.filter(c => c.isComplete).length;
  const totalAnswered  = catStats.reduce((s, c) => s + c.answered, 0);
  const totalQuestions = catStats.reduce((s, c) => s + c.totalQ, 0);

  const activeCats     = catStats.filter(c => c.scorableRows > 0);
  const avgInherent    = activeCats.length > 0
    ? (activeCats.reduce((s, c) => s + c.totalInherent, 0) / activeCats.length).toFixed(1)
    : '—';
  const avgResidual    = activeCats.length > 0
    ? (activeCats.reduce((s, c) => s + c.totalResidual, 0) / activeCats.length).toFixed(1)
    : '—';
  const avgReduction   = activeCats.length > 0
    ? Math.round(activeCats.reduce((s, c) => s + c.reduction, 0) / activeCats.length)
    : null;
  const avgCompliance  = catStats.filter(c => c.isActive).length > 0
    ? Math.round(catStats.filter(c => c.isActive).reduce((s, c) => s + c.compliance, 0) / catStats.filter(c => c.isActive).length)
    : null;

  return (
    <div className={s.page}>

      {/* ── Hero ── */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          <p className={s.heroEyebrow}>Marco de Análisis Integrado de Necesidades de Seguridad</p>
          <h1 className={s.heroTitle}>M.A.I.N.S.</h1>
          <p className={s.heroSub}>
            Plataforma interna de evaluación de soluciones ICT y proveedores tecnológicos,
            basada en MAGERIT v3.
          </p>
          <button className={s.ctaBtn} onClick={onStart}>
            Iniciar proceso de evaluación
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Dashboard ── */}
      <div className={s.dashboard}>

        {/* Stat cards */}
        <div className={s.statsGrid}>
          <StatCard
            label="Categorías activas"
            value={`${activeCount} / ${categories.length}`}
            sub="Con al menos 1 respuesta"
          />
          <StatCard
            label="Categorías completadas"
            value={completeCount}
            sub="Todas las preguntas respondidas"
            color={completeCount > 0 ? '#16a34a' : undefined}
          />
          <StatCard
            label="Preguntas respondidas"
            value={`${totalAnswered} / ${totalQuestions}`}
            sub="Total acumulado"
          />
          <StatCard
            label="Cumplimiento medio"
            value={avgCompliance !== null ? `${avgCompliance}%` : '—'}
            sub="Promedio de respuestas Sí"
            color={avgCompliance !== null ? (avgCompliance >= 70 ? '#16a34a' : avgCompliance >= 40 ? '#ca8a04' : '#dc2626') : undefined}
          />
          <StatCard
            label="Riesgo inherente medio"
            value={avgInherent}
            sub="Prob × impacto inherente"
            color={avgInherent !== '—' ? '#dc2626' : undefined}
          />
          <StatCard
            label="Riesgo residual medio"
            value={avgResidual}
            sub="Prob × impacto residual"
            color={avgResidual !== '—' ? (avgReduction !== null && avgReduction >= 20 ? '#ca8a04' : '#dc2626') : undefined}
          />
          <StatCard
            label="Reducción de riesgo media"
            value={avgReduction !== null ? `${avgReduction}%` : '—'}
            sub="Inherente → residual"
            color={avgReduction !== null ? (avgReduction >= 25 ? '#16a34a' : '#ca8a04') : undefined}
          />
        </div>

        {/* Per-category breakdown */}
        <div className={s.catSection}>
          <p className={s.catSectionTitle}>Estado por categoría</p>
          <div className={s.catTable}>
            <div className={s.catTableHead}>
              <span>Categoría</span>
              <span>Respondidas</span>
              <span>Cumplimiento</span>
              <span>Riesgo inherente</span>
              <span>Riesgo residual</span>
              <span>Reducción</span>
              <span>Estado</span>
            </div>
            {catStats.map(({ cat, totalQ, answered, compliance, isComplete, isActive, totalInherent, totalResidual, reduction, scorableRows }) => (
              <div key={cat.id} className={`${s.catRow} ${!isActive ? s.catRowInactive : ''}`}>
                <span className={s.catName}>{cat.name}</span>
                <span className={s.catCell}>{answered} / {totalQ}</span>
                <span className={s.catCell}>
                  {isActive ? (
                    <span className={`${s.pct} ${compliance >= 70 ? s.pctGreen : compliance >= 40 ? s.pctYellow : s.pctRed}`}>
                      {compliance}%
                    </span>
                  ) : '—'}
                </span>
                <span className={s.catCell}>{scorableRows > 0 ? totalInherent.toFixed(1) : '—'}</span>
                <span className={s.catCell}>{scorableRows > 0 ? totalResidual.toFixed(1) : '—'}</span>
                <span className={s.catCell}>
                  {scorableRows > 0 ? (
                    <span className={`${s.pct} ${reduction >= 25 ? s.pctGreen : s.pctYellow}`}>{reduction}%</span>
                  ) : '—'}
                </span>
                <span className={s.catCell}>
                  <span className={`${s.badge} ${isComplete ? s.badgeComplete : isActive ? s.badgeActive : s.badgePending}`}>
                    {isComplete ? 'Completado' : isActive ? 'En progreso' : 'Pendiente'}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
