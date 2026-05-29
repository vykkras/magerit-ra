import s from './HomePage.module.css';
import { useCategoryStore } from '../../store/categoryStore';
import { useQuestionnaireStore } from '../../store/questionnaireStore';
import { useCompletedStore, type CompletedEvaluation } from '../../store/completedStore';
import { useSolicitudStore } from '../../store/solicitudStore';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';

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

function CompletedRow({ ev, onRemove, onReopen }: { ev: CompletedEvaluation; onRemove: () => void; onReopen: () => void }) {
  const date = new Date(ev.completedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  return (
    <div className={s.completedRow}>
      <div className={s.completedMain}>
        <span className={s.completedProveedor}>{ev.proveedor || '—'}</span>
        {ev.solicitante && <span className={s.completedSolicitante}>{ev.solicitante}</span>}
      </div>
      <span className={s.completedCell}>{date}</span>
      <span className={s.completedCell}>
        <span className={`${s.pct} ${ev.compliance >= 70 ? s.pctGreen : ev.compliance >= 40 ? s.pctYellow : s.pctRed}`}>
          {ev.compliance}%
        </span>
      </span>
      <span className={s.completedCell}>{ev.totalInherent}</span>
      <span className={s.completedCell}>{ev.totalResidual}</span>
      <span className={s.completedCell}>
        <span className={`${s.pct} ${ev.reduction >= 25 ? s.pctGreen : s.pctYellow}`}>{ev.reduction}%</span>
      </span>
      <button className={s.openBtn} onClick={onReopen}>Abrir</button>
      <button className={s.removeBtn} onClick={onRemove} title="Eliminar">×</button>
    </div>
  );
}

export default function HomePage({ onStart, onReopen }: { onStart: () => void; onReopen: (ev: CompletedEvaluation) => void }) {
  const { categories }          = useCategoryStore();
  const { answers }             = useQuestionnaireStore();
  const { evaluations, remove } = useCompletedStore();
  const { solicitante, proveedor, categoriaId } = useSolicitudStore();

  // ── Completed evaluations aggregates ────────────────────────────────────────
  const evalCount     = evaluations.length;
  const avgCompliance = evalCount > 0 ? Math.round(evaluations.reduce((s, e) => s + e.compliance, 0) / evalCount) : null;
  const avgInh        = evalCount > 0 ? (evaluations.reduce((s, e) => s + e.totalInherent, 0) / evalCount).toFixed(1) : '—';
  const avgRes        = evalCount > 0 ? (evaluations.reduce((s, e) => s + e.totalResidual, 0)  / evalCount).toFixed(1) : '—';
  const avgRed        = evalCount > 0 ? Math.round(evaluations.reduce((s, e) => s + e.reduction, 0) / evalCount) : null;

  // ── Current session: questionnaire progress only (no scenario defaults) ──────
  const catStats = categories.map(cat => {
    const questions  = CATEGORY_QUESTIONNAIRES[cat.id] ?? [];
    const catAnswers = answers[cat.id] ?? {};
    const totalQ     = questions.length;
    const answered   = questions.filter(q => catAnswers[q.id] != null).length;
    const yesCount   = questions.filter(q => catAnswers[q.id] === 'yes').length;
    const compliance = totalQ > 0 ? Math.round((yesCount / totalQ) * 100) : 0;
    const isComplete = totalQ > 0 && answered === totalQ;
    const isActive   = answered > 0;
    return { cat, totalQ, answered, compliance, isComplete, isActive };
  });

  const hasSession     = catStats.some(c => c.isActive) || !!(solicitante || proveedor || categoriaId);
  const totalAnswered  = catStats.reduce((s, c) => s + c.answered, 0);
  const totalQuestions = catStats.reduce((s, c) => s + c.totalQ, 0);
  const activeCatList  = catStats.filter(c => c.isActive);
  const sessCompliance = activeCatList.length > 0
    ? Math.round(activeCatList.reduce((s, c) => s + c.compliance, 0) / activeCatList.length)
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
            {hasSession ? 'Continuar proceso' : 'Iniciar proceso de evaluación'}
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className={s.dashboard}>

        {/* ── Completed evaluations ── */}
        <div className={s.section}>
          <p className={s.sectionTitle}>Evaluaciones completadas</p>
          <div className={s.statsGrid4}>
            <StatCard label="Total completadas" value={evalCount} sub="Evaluaciones guardadas" color={evalCount > 0 ? '#16a34a' : undefined} />
            <StatCard label="Cumplimiento medio" value={avgCompliance !== null ? `${avgCompliance}%` : '—'} sub="Promedio respuestas Sí"
              color={avgCompliance !== null ? (avgCompliance >= 70 ? '#16a34a' : avgCompliance >= 40 ? '#ca8a04' : '#dc2626') : undefined} />
            <StatCard label="Riesgo inherente medio" value={avgInh} sub="Prob × impacto acumulado"
              color={avgInh !== '—' ? '#dc2626' : undefined} />
            <StatCard label="Reducción de riesgo media" value={avgRed !== null ? `${avgRed}%` : '—'} sub="Inherente → residual"
              color={avgRed !== null ? (avgRed >= 25 ? '#16a34a' : '#ca8a04') : undefined} />
          </div>

          {evalCount > 0 ? (
            <div className={s.completedTable}>
              <div className={s.completedHead}>
                <span>Proveedor / Solicitante</span>
                <span>Fecha</span>
                <span>Cumplimiento</span>
                <span>Inherente</span>
                <span>Residual</span>
                <span>Reducción</span>
                <span />
                <span />
              </div>
              {evaluations.map(ev => (
                <CompletedRow key={ev.id} ev={ev} onRemove={() => remove(ev.id)} onReopen={() => onReopen(ev)} />
              ))}
            </div>
          ) : (
            <p className={s.emptyNote}>Ninguna evaluación completada aún. Usa el botón "Marcar como completado" en el sidebar al finalizar el proceso.</p>
          )}
        </div>

        {/* ── Session en progreso ── */}
        {hasSession && (
          <div className={s.section}>
            <p className={s.sectionTitle}>Proceso en curso</p>
            <div className={s.statsGrid4}>
              <StatCard label="Preguntas respondidas" value={`${totalAnswered} / ${totalQuestions}`} sub="Total acumulado" />
              <StatCard label="Cumplimiento medio" value={sessCompliance !== null ? `${sessCompliance}%` : '—'} sub="Respuestas Sí"
                color={sessCompliance !== null ? (sessCompliance >= 70 ? '#16a34a' : sessCompliance >= 40 ? '#ca8a04' : '#dc2626') : undefined} />
              {solicitante && <StatCard label="Solicitante" value={solicitante} />}
              {proveedor   && <StatCard label="Proveedor" value={proveedor} />}
            </div>

            {activeCatList.length > 0 && (
              <div className={s.catTable}>
                <div className={s.catTableHead}>
                  <span>Categoría</span>
                  <span>Respondidas</span>
                  <span>Cumplimiento</span>
                  <span>Estado</span>
                </div>
                {activeCatList.map(({ cat, totalQ, answered, compliance, isComplete }) => (
                  <div key={cat.id} className={s.catRow}>
                    <span className={s.catName}>{cat.name}</span>
                    <span className={s.catCell}>{answered} / {totalQ}</span>
                    <span className={s.catCell}>
                      <span className={`${s.pct} ${compliance >= 70 ? s.pctGreen : compliance >= 40 ? s.pctYellow : s.pctRed}`}>{compliance}%</span>
                    </span>
                    <span className={s.catCell}>
                      <span className={`${s.badge} ${isComplete ? s.badgeComplete : s.badgeActive}`}>
                        {isComplete ? 'Completado' : 'En progreso'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
