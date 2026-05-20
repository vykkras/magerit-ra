import { useState } from 'react';
import s from './App.module.css';
import CategoriesPage from './components/categories/CategoriesPage';
import PendingPage from './components/common/PendingPage';

// ── Navigation model ──────────────────────────────────────────────────────────

type PageId =
  | 'preliminar'
  | 'categorizacion'
  | 'avanzado'
  | 'grc'
  | 'tprm'
  | 'informe'
  | 'resultado'
  | 'despliegue'
  | 'inventario';

interface NavItem {
  id: PageId;
  num?: number;
  label: string;
  pending: boolean;
}

interface NavSection {
  phaseNum: string;
  phase: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    phaseNum: 'Fase 1',
    phase: 'Registro y Categorización',
    items: [
      { id: 'preliminar',     num: 1, label: 'Cuestionario Preliminar',  pending: true  },
      { id: 'categorizacion', num: 2, label: 'Categorización ICT',        pending: true  },
    ],
  },
  {
    phaseNum: 'Fase 2',
    phase: 'Análisis y Evaluación',
    items: [
      { id: 'avanzado', num: 3, label: 'Cuestionario Avanzado',      pending: false },
      { id: 'grc',      num: 4, label: 'Tareas de Evaluación GRC',   pending: true  },
      { id: 'tprm',     num: 5, label: 'Cuestionario TPRM',          pending: true  },
      { id: 'informe',  num: 6, label: 'Informe de Evaluación',      pending: true  },
    ],
  },
  {
    phaseNum: 'Fase 3',
    phase: 'Resultados',
    items: [
      { id: 'resultado',  label: 'Resultado OK / KO',              pending: true },
      { id: 'despliegue', num: 7, label: 'Solicitud de Despliegue',  pending: true },
      { id: 'inventario', num: 8, label: 'Inventario de Soluciones', pending: true },
    ],
  },
];

const ALL_ITEMS = NAV.flatMap(sec => sec.items);

// ── Pending page content ──────────────────────────────────────────────────────

const PENDING_INFO: Record<PageId, { phase: string; description: string }> = {
  preliminar: {
    phase: 'Fase 1 · Registro y Categorización',
    description:
      'Cuestionario inicial enviado junto a la PST para determinar si la solución ICT requiere análisis completo de seguridad por parte del equipo GRC. Permite al solicitante declarar el tipo de solución y su alcance previsto.',
  },
  categorizacion: {
    phase: 'Fase 1 · Registro y Categorización',
    description:
      'Clasificación formal de la solución proveedor-servicio ICT según su tipología (SaaS, PaaS/IaaS, IT Outsourcing, etc.) e impacto en la organización. Determina el cuestionario avanzado y los controles aplicables.',
  },
  avanzado: { phase: '', description: '' },
  grc: {
    phase: 'Fase 2 · Análisis y Evaluación',
    description:
      'Conjunto estructurado de tareas de Gobernanza, Riesgos y Cumplimiento asignadas al equipo de seguridad para la evaluación profunda de la solución ICT, incluyendo revisión documental y análisis de controles.',
  },
  tprm: {
    phase: 'Fase 2 · Análisis y Evaluación',
    description:
      'Evaluación de riesgos de terceros (Third-Party Risk Management) para analizar la postura de seguridad del proveedor: certificaciones, incidentes previos, subcontratistas, gestión de vulnerabilidades y continuidad.',
  },
  informe: {
    phase: 'Fase 2 · Análisis y Evaluación',
    description:
      'Informe ejecutivo de evaluación de la solución ICT con el análisis de riesgos residuales, nivel de cumplimiento, salvaguardas aplicadas, resultado global (OK / OK+Plan / KO) y recomendaciones para la dirección.',
  },
  resultado: {
    phase: 'Fase 3 · Resultados',
    description:
      'Resolución formal de la evaluación: OK (aprobado sin condiciones), OK con Plan de Acción al Proveedor (aprobado con mejoras comprometidas), o KO (no aprobado). Incluye transferencia de riesgos si procede.',
  },
  despliegue: {
    phase: 'Fase 3 · Resultados',
    description:
      'Solicitud formal de despliegue de entorno en la infraestructura corporativa cuando la solución requiere participación del equipo de infraestructura. Gestiona la coordinación técnica del onboarding.',
  },
  inventario: {
    phase: 'Fase 3 · Resultados',
    description:
      'Registro de la nueva solución ICT aprobada en el inventario centralizado de herramientas y servicios de la organización, junto con el informe de evaluación y la PST asociada.',
  },
};

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<PageId>('avanzado');

  const currentItem    = ALL_ITEMS.find(i => i.id === page);
  const currentSection = NAV.find(sec => sec.items.some(i => i.id === page));

  function renderContent() {
    if (page === 'avanzado') return <CategoriesPage />;
    const info = PENDING_INFO[page];
    return (
      <PendingPage
        num={currentItem?.num}
        title={currentItem?.label ?? ''}
        phase={info.phase}
        description={info.description}
      />
    );
  }

  return (
    <div className={s.shell}>

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.headerBrand}>
          <div className={s.headerLogo}>M</div>
          <div>
            <p className={s.headerName}>M.A.I.N.S.</p>
            <p className={s.headerSub}>Gestión de Riesgos · Ciberseguridad · Cumplimiento</p>
          </div>
        </div>

        {currentItem && currentSection && (
          <div className={s.headerCrumb}>
            <span className={s.headerCrumbPhase}>{currentSection.phaseNum}</span>
            <span className={s.headerCrumbSep}>/</span>
            <span className={s.headerCrumbPage}>{currentItem.label}</span>
            {currentItem.pending && (
              <span className={s.headerPendingBadge}>Pendiente</span>
            )}
          </div>
        )}
      </header>

      {/* ── Body ── */}
      <div className={s.body}>

        {/* ── Sidebar ── */}
        <nav className={s.sidebar}>
          {NAV.map(section => (
            <div key={section.phaseNum} className={s.sidebarSection}>
              <p className={s.sidebarPhase}>
                <span className={s.sidebarPhaseTag}>{section.phaseNum}</span>
                {section.phase}
              </p>

              {section.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={[
                    s.sidebarItem,
                    page === item.id   ? s.sidebarItemActive  : '',
                    item.pending       ? s.sidebarItemPending : '',
                  ].join(' ')}
                >
                  {item.num !== undefined ? (
                    <span className={`${s.sidebarNum} ${page === item.id ? s.sidebarNumActive : ''}`}>
                      {item.num}
                    </span>
                  ) : (
                    <span className={s.sidebarNumPlaceholder} />
                  )}
                  <span className={s.sidebarLabel}>{item.label}</span>
                  {item.pending && <span className={s.sidebarPendingTag}>Pendiente</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Content ── */}
        <main className={s.content}>
          {renderContent()}
        </main>
      </div>

    </div>
  );
}
