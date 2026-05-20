import s from './PendingPage.module.css';

interface Props {
  num?: number;
  title: string;
  phase: string;
  description: string;
}

export default function PendingPage({ num, title, phase, description }: Props) {
  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.top}>
          {num !== undefined && <span className={s.stepNum}>{num}</span>}
          <div className={s.meta}>
            <p className={s.phase}>{phase}</p>
            <h1 className={s.title}>{title}</h1>
          </div>
          <span className={s.badge}>Pendiente</span>
        </div>

        <p className={s.desc}>{description}</p>

        <div className={s.placeholder}>
          <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#d1d5db" strokeWidth="1.4">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          </svg>
          <p className={s.placeholderTitle}>Módulo en desarrollo</p>
          <p className={s.placeholderSub}>Este paso estará disponible en una próxima versión</p>
        </div>
      </div>
    </div>
  );
}
