import s from './HomePage.module.css';

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

      {/* ── Pillars ── */}
      <div className={s.pillarsRow}>
        {PILLARS.map(p => (
          <div key={p.label} className={s.pillarCard}>
            <p className={s.pillarLabel}>{p.label}</p>
            <p className={s.pillarSub}>{p.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Footer note ── */}
      <p className={s.footerNote}>Uso interno · Capgemini · Ciberseguridad y Cumplimiento</p>

    </div>
  );
}
