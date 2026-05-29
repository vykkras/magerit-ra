import { useSolicitudStore, type ResultadoEval } from '../../store/solicitudStore';
import { useQuestionnaireStore } from '../../store/questionnaireStore';
import { useCategoryStore } from '../../store/categoryStore';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import s from './ResultadoPage.module.css';

const OPCIONES: { value: ResultadoEval; label: string; sub: string; color: string; bg: string; border: string }[] = [
  {
    value: 'ok',
    label: 'OK',
    sub: 'Aprobado sin condiciones',
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#86efac',
  },
  {
    value: 'ok-condiciones',
    label: 'OK con condiciones',
    sub: 'Aprobado con plan de acción',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#fcd34d',
  },
  {
    value: 'ko',
    label: 'KO',
    sub: 'No aprobado',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fca5a5',
  },
];

export default function ResultadoPage() {
  const { resultado, tprmScore, categoriaId, set } = useSolicitudStore();
  const { answers } = useQuestionnaireStore();
  const { categories } = useCategoryStore();

  // Compute questionnaire compliance
  let totalQ = 0, totalYes = 0;
  categories.forEach(cat => {
    const qs = CATEGORY_QUESTIONNAIRES[cat.id] ?? [];
    const catA = answers[cat.id] ?? {};
    totalQ   += qs.length;
    totalYes += qs.filter(q => catA[q.id] === 'yes').length;
  });
  const compliance = totalQ > 0 ? Math.round((totalYes / totalQ) * 100) : null;

  // Suggested result (informative only)
  const tprm = tprmScore ?? null;
  let suggestion: ResultadoEval = null;
  if (compliance !== null && tprm !== null) {
    const avg = (compliance + tprm) / 2;
    suggestion = avg >= 80 ? 'ok' : avg >= 60 ? 'ok-condiciones' : 'ko';
  }

  return (
    <div className={s.page}>

      <div className={s.headerCard}>
        <div className={s.headerIcon}>★</div>
        <div>
          <p className={s.headerNum}>Fase 3 · Resultado</p>
          <p className={s.headerTitle}>Resultado de la Evaluación</p>
          <p className={s.headerSub}>Selecciona el resultado final de la evaluación MAINS</p>
        </div>
      </div>

      {/* Data summary */}
      <div className={s.summaryCard}>
        <p className={s.summaryTitle}>Resumen de datos</p>
        <div className={s.summaryGrid}>
          <div className={s.summaryItem}>
            <span className={s.summaryLabel}>Cuestionario</span>
            <span className={s.summaryValue}>
              {compliance !== null ? `${compliance}%` : '—'}
            </span>
          </div>
          <div className={s.summaryItem}>
            <span className={s.summaryLabel}>Puntuación TPRM</span>
            <span className={s.summaryValue}>
              {tprm !== null ? `${tprm} / 100` : '—'}
            </span>
          </div>
          <div className={s.summaryItem}>
            <span className={s.summaryLabel}>Categoría</span>
            <span className={s.summaryValue}>
              {categories.find(c => c.id === categoriaId)?.name ?? '—'}
            </span>
          </div>
          {suggestion && (
            <div className={s.summaryItem}>
              <span className={s.summaryLabel}>Resultado sugerido</span>
              <span className={s.summaryValue}>
                {OPCIONES.find(o => o.value === suggestion)?.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Manual result selection */}
      <div className={s.card}>
        <p className={s.cardTitle}>Resultado final</p>
        <p className={s.cardSub}>Selecciona el resultado. KO debe asignarse manualmente.</p>
        <div className={s.opciones}>
          {OPCIONES.map(op => {
            const active = resultado === op.value;
            return (
              <button
                key={op.value}
                className={`${s.opcionBtn} ${active ? s.opcionBtnActive : ''}`}
                style={active ? { background: op.bg, borderColor: op.border, color: op.color } : {}}
                onClick={() => set({ resultado: op.value })}
              >
                <span className={s.opcionLabel} style={active ? { color: op.color } : {}}>{op.label}</span>
                <span className={s.opcionSub}>{op.sub}</span>
                {op.value === 'ko' && (
                  <span className={s.koBadge}>Manual</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
