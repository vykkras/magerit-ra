import { useSolicitudStore } from '../../store/solicitudStore';
import { useCategoryStore } from '../../store/categoryStore';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import s from './CuestionarioPreliminar.module.css';

export default function CuestionarioPreliminar() {
  const { categoriaId, esHerramientaIA, set } = useSolicitudStore();
  const { categories } = useCategoryStore();

  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.headerCard}>
        <div className={s.headerIcon}>1</div>
        <div>
          <p className={s.headerNum}>Cuestionario Preliminar · Paso 1</p>
          <p className={s.headerTitle}>Categorización de la Solución ICT</p>
          <p className={s.headerSub}>Selecciona la categoría que mejor describe el servicio o solución evaluada</p>
        </div>
      </div>

      {/* Category selection */}
      <div className={s.card}>
        <p className={s.cardTitle}>Categoría de la solución</p>
        <p className={s.cardSub}>
          La categoría determina el conjunto de riesgos y salvaguardas aplicables, así como las preguntas del cuestionario avanzado.
        </p>
        <div className={s.catGrid}>
          {categories.map(cat => {
            const qCount = (CATEGORY_QUESTIONNAIRES[cat.id] ?? []).length;
            const rCount = cat.risks.length;
            const active  = categoriaId === cat.id;
            return (
              <button
                key={cat.id}
                className={`${s.catCard} ${active ? s.catCardActive : ''}`}
                onClick={() => set({ categoriaId: cat.id })}
              >
                <p className={s.catName}>{cat.name}</p>
                <div className={s.catMeta}>
                  <span className={s.catRisks}>{rCount} riesgos · {qCount} preguntas</span>
                  {active && (
                    <span className={s.catCheck}>
                      <svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" /></svg>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Decision diamond: ¿Es herramienta de IA? */}
      <div className={s.diamond}>
        <div className={s.diamondTop}>
          <span className={s.diamondLabel}>Decisión</span>
        </div>
        <p className={s.diamondQuestion}>¿Es una herramienta de Inteligencia Artificial?</p>
        <div className={s.yesNo}>
          <button
            className={`${s.btnYes} ${esHerramientaIA === true  ? s.btnYesActive : ''}`}
            onClick={() => set({ esHerramientaIA: true })}
          >
            Sí
          </button>
          <button
            className={`${s.btnNo}  ${esHerramientaIA === false ? s.btnNoActive  : ''}`}
            onClick={() => set({ esHerramientaIA: false })}
          >
            No
          </button>
        </div>

        {esHerramientaIA === true && (
          <div className={s.policyNote}>
            <div>
              <p className={s.policyTitle}>Aplica política interna de IA</p>
              <p className={s.policyText}>
                Esta solución está sujeta a la política{' '}
                <span className={s.policyCode}>NS.05.07</span> — Uso de Herramientas de Inteligencia Artificial dentro del Grupo.
                El equipo GRC revisará el cumplimiento adicional requerido.
              </p>
            </div>
          </div>
        )}

        {categoriaId && esHerramientaIA !== null && (
          <p className={s.hint}>✓ Continúa en el Cuestionario Avanzado (3) para la evaluación de riesgos</p>
        )}
      </div>

    </div>
  );
}
