import { useSolicitudStore } from '../../store/solicitudStore';
import s from './TprmResultsPage.module.css';

export default function TprmResultsPage() {
  const { tprmScore, set } = useSolicitudStore();

  const score = tprmScore ?? 0;

  const color =
    score >= 80 ? '#16a34a' :
    score >= 60 ? '#d97706' :
                  '#dc2626';

  const label =
    score >= 80 ? 'Satisfactorio' :
    score >= 60 ? 'Aceptable con condiciones' :
                  'No satisfactorio';

  return (
    <div className={s.page}>

      <div className={s.headerCard}>
        <div className={s.headerIcon}>6</div>
        <div>
          <p className={s.headerNum}>Fase 2 · Paso 6</p>
          <p className={s.headerTitle}>Resultados TPRM</p>
          <p className={s.headerSub}>Introduce la puntuación obtenida en la evaluación de terceros</p>
        </div>
      </div>

      <div className={s.card}>
        <p className={s.cardTitle}>Puntuación TPRM</p>
        <p className={s.cardSub}>Escala 0 – 100 según los criterios de evaluación de proveedores</p>

        <div className={s.scoreWrap}>
          <div className={s.scoreDisplay} style={{ color }}>
            {tprmScore !== null ? score : '—'}
          </div>
          <div className={s.scoreLabel} style={{ color }}>{tprmScore !== null ? label : 'Sin evaluar'}</div>
        </div>

        <div className={s.sliderWrap}>
          <span className={s.sliderMin}>0</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={score}
            className={s.slider}
            onChange={e => set({ tprmScore: Number(e.target.value) })}
          />
          <span className={s.sliderMax}>100</span>
        </div>

        <div className={s.inputWrap}>
          <label className={s.inputLabel}>O introduce el valor directamente</label>
          <input
            type="number"
            min={0}
            max={100}
            className={s.input}
            placeholder="0 – 100"
            value={tprmScore !== null ? score : ''}
            onChange={e => {
              const v = Math.min(100, Math.max(0, Number(e.target.value)));
              set({ tprmScore: isNaN(v) ? null : v });
            }}
          />
        </div>

        <div className={s.legend}>
          <div className={s.legendItem}>
            <span className={s.legendDot} style={{ background: '#16a34a' }} />
            <span>≥ 80 — Satisfactorio</span>
          </div>

          <div className={s.legendItem}>
            <span className={s.legendDot} style={{ background: '#dc2626' }} />
            <span>{'< 80 — No satisfactorio'}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
