import s from './HomePage.module.css';

const PHASES = [
  {
    num: 'Fase 1',
    title: 'Registro y Categorización',
    steps: [
      { n: 1, label: 'Cuestionario Preliminar' },
      { n: 2, label: 'Categorización ICT' },
    ],
  },
  {
    num: 'Fase 2',
    title: 'Análisis y Evaluación',
    steps: [
      { n: 3, label: 'Cuestionario Avanzado' },
      { n: 4, label: 'Tareas de Evaluación GRC' },
      { n: 5, label: 'Cuestionario TPRM' },
      { n: 6, label: 'Informe de Evaluación' },
    ],
  },
  {
    num: 'Fase 3',
    title: 'Resultados',
    steps: [
      { n: undefined, label: 'Resultado OK / KO' },
      { n: 7, label: 'Solicitud de Despliegue' },
      { n: 8, label: 'Inventario de Soluciones' },
    ],
  },
];

const PILLARS = [
  { label: 'Gestión de Riesgos',   sub: 'MAGERIT v3' },
  { label: 'Ciberseguridad',       sub: 'ENS / ISO 27001' },
  { label: 'Cumplimiento',         sub: 'DORA · NIS2 · GDPR' },
  { label: 'Gestión de Terceros',  sub: 'TPRM' },
];

export default function HomePage({ onStart }: { onStart: () => void }) {
  return (
    <div className={s.page}>

      {/* ── Hero ── */}
      <div className={s.hero}>
        <div className={s.heroInner}>
          <p className={s.heroEyebrow}>Marco de Análisis Integrado de Necesidades de Seguridad</p>
          <h1 className={s.heroTitle}>M.A.I.N.S.</h1>
          <p className={s.heroSub}>
            Plataforma interna de evaluación de soluciones ICT y proveedores tecnológicos,
            basada en MAGERIT v3 y alineada con ENS, DORA y NIS2.
          </p>
          <button className={s.ctaBtn} onClick={onStart}>
            Iniciar proceso de evaluación
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Pillars ── */}
      <div className={s.pillarsRow}>
        {PILLARS.map(p => (
          <div key={p.label} className={s.pillarCard}>
            <p className={s.pillarLabel}>{p.label}</p>
            <p className={s.pillarSub}>{p.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Process overview ── */}
      <div className={s.section}>
        <p className={s.sectionTitle}>Flujo del proceso MAINS</p>
        <div className={s.phases}>
          {PHASES.map((phase, pi) => (
            <div key={phase.num} className={s.phaseCol}>
              <div className={s.phaseHeader}>
                <span className={s.phaseTag}>{phase.num}</span>
                <span className={s.phaseTitle}>{phase.title}</span>
              </div>
              <div className={s.stepList}>
                {phase.steps.map(step => (
                  <div key={step.label} className={s.stepRow}>
                    {step.n !== undefined
                      ? <span className={s.stepNum}>{step.n}</span>
                      : <span className={s.stepDot} />
                    }
                    <span className={s.stepLabel}>{step.label}</span>
                  </div>
                ))}
              </div>
              {pi < PHASES.length - 1 && <div className={s.phaseArrow}>›</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer note ── */}
      <p className={s.footerNote}>Uso interno · Capgemini · Ciberseguridad y Cumplimiento</p>

    </div>
  );
}
