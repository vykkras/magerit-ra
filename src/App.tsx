import { useState } from 'react';
import s from './App.module.css';
import { useSolicitudStore } from './store/solicitudStore';
import InfoGeneral from './components/fase1/InfoGeneral';
import CuestionarioPreliminar from './components/fase1/CuestionarioPreliminar';
import CategoriesPage from './components/categories/CategoriesPage';
import PendingPage from './components/common/PendingPage';

// ── Navigation model ──────────────────────────────────────────────────────────

type PageId =
  | 'solicitud'
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

const NAV_PRE: NavItem = { id: 'solicitud', label: 'Información General', pending: false };

const NAV: NavSection[] = [
  {
    phaseNum: 'Fase 1',
    phase: 'Registro y Categorización',
    items: [
      { id: 'preliminar',     num: 1, label: 'Cuestionario Preliminar', pending: false },
      { id: 'categorizacion', num: 2, label: 'Categorización ICT',       pending: true  },
    ],
  },
  {
    phaseNum: 'Fase 2',
    phase: 'Análisis y Evaluación',
    items: [
      { id: 'avanzado', num: 3, label: 'Cuestionario Avanzado',    pending: false },
      { id: 'grc',      num: 4, label: 'Tareas de Evaluación GRC', pending: true  },
      { id: 'tprm',     num: 5, label: 'Cuestionario TPRM',        pending: true  },
      { id: 'informe',  num: 6, label: 'Informe de Evaluación',    pending: true  },
    ],
  },
  {
    phaseNum: 'Fase 3',
    phase: 'Resultados',
    items: [
      { id: 'resultado',  label: 'Resultado OK / KO',             pending: true },
      { id: 'despliegue', num: 7, label: 'Solicitud de Despliegue', pending: true },
      { id: 'inventario', num: 8, label: 'Inventario de Soluciones',pending: true },
    ],
  },
];

const ALL_ITEMS: NavItem[] = [NAV_PRE, ...NAV.flatMap(sec => sec.items)];

// ── Pending page info ─────────────────────────────────────────────────────────

const PENDING_INFO: Partial<Record<PageId, { phase: string; description: string }>> = {
  categorizacion: {
    phase: 'Fase 1 · Registro y Categorización',
    description: 'Clasificación formal de la solución por parte del equipo GRC, confirmando tipología e impacto en la organización. Determinada automáticamente a partir del Cuestionario Preliminar.',
  },
  grc: {
    phase: 'Fase 2 · Análisis y Evaluación',
    description: 'Tareas de Gobernanza, Riesgos y Cumplimiento asignadas al equipo de seguridad para la evaluación profunda de la solución ICT, incluyendo revisión documental y análisis de controles.',
  },
  tprm: {
    phase: 'Fase 2 · Análisis y Evaluación',
    description: 'Evaluación de riesgos de terceros (Third-Party Risk Management): certificaciones del proveedor, incidentes previos, subcontratistas, gestión de vulnerabilidades y continuidad del negocio.',
  },
  informe: {
    phase: 'Fase 2 · Análisis y Evaluación',
    description: 'Informe ejecutivo con el análisis de riesgos residuales, nivel de cumplimiento, salvaguardas aplicadas, resultado global (OK / OK+Plan / KO) y recomendaciones para la dirección.',
  },
  resultado: {
    phase: 'Fase 3 · Resultados',
    description: 'Resolución formal: OK (aprobado), OK con Plan de Acción al Proveedor, o KO (no aprobado). Incluye firma del informe y transferencia de riesgos si procede.',
  },
  despliegue: {
    phase: 'Fase 3 · Resultados',
    description: 'Solicitud formal de despliegue en infraestructura corporativa cuando la solución requiere participación del equipo de infraestructura.',
  },
  inventario: {
    phase: 'Fase 3 · Resultados',
    description: 'Registro de la solución aprobada en el inventario centralizado de herramientas y servicios, junto con el informe de evaluación y la PST asociada.',
  },
};

// ── Completion helpers ────────────────────────────────────────────────────────

function useCompletionStatus() {
  const { solicitante, proveedor, esSolucionICT, categoriaId, esHerramientaIA } = useSolicitudStore();
  return {
    solicitud:    !!(solicitante || proveedor) && esSolucionICT !== null,
    preliminar:   !!(categoriaId && esHerramientaIA !== null),
  };
}

function StatusDot({ done }: { done: boolean }) {
  if (!done) return null;
  return <span className={s.doneDot} title="Completado" />;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<PageId>('solicitud');
  const { categoriaId } = useSolicitudStore();
  const done = useCompletionStatus();

  const currentItem    = ALL_ITEMS.find(i => i.id === page);
  const currentSection = NAV.find(sec => sec.items.some(i => i.id === page));

  function renderContent() {
    switch (page) {
      case 'solicitud':   return <InfoGeneral />;
      case 'preliminar':  return <CuestionarioPreliminar />;
      case 'avanzado':    return <CategoriesPage lockedCategoryId={categoriaId ?? undefined} />;
      default: {
        const info = PENDING_INFO[page];
        if (!info) return null;
        return (
          <PendingPage
            num={currentItem?.num}
            title={currentItem?.label ?? ''}
            phase={info.phase}
            description={info.description}
          />
        );
      }
    }
  }

  return (
    <div className={s.shell}>

      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.headerBrand}>
          <img src="/logo.png" alt="Capgemini" className={s.headerLogo} />
          <div>
            <p className={s.headerName}>M.A.I.N.S.</p>
            <p className={s.headerSub}>Gestión de Riesgos · Ciberseguridad · Cumplimiento</p>
          </div>
        </div>

        <div className={s.headerCrumb}>
          {currentSection ? (
            <>
              <span className={s.headerCrumbPhase}>{currentSection.phaseNum}</span>
              <span className={s.headerCrumbSep}>/</span>
            </>
          ) : page === 'solicitud' ? (
            <>
              <span className={s.headerCrumbPhase}>Inicio</span>
              <span className={s.headerCrumbSep}>/</span>
            </>
          ) : null}
          {currentItem && (
            <>
              <span className={s.headerCrumbPage}>{currentItem.label}</span>
              {currentItem.pending && <span className={s.headerPendingBadge}>Pendiente</span>}
            </>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div className={s.body}>

        {/* ── Sidebar ── */}
        <nav className={s.sidebar}>

          {/* Pre-phase item: Información General */}
          <div className={s.sidebarSection}>
            <button
              onClick={() => setPage('solicitud')}
              className={`${s.sidebarItem} ${page === 'solicitud' ? s.sidebarItemActive : ''}`}
            >
              <span className={`${s.sidebarNum} ${page === 'solicitud' ? s.sidebarNumActive : ''}`}>
                ℹ
              </span>
              <span className={s.sidebarLabel}>Información General</span>
              <StatusDot done={done.solicitud} />
            </button>
          </div>

          {/* Phase sections */}
          {NAV.map(section => (
            <div key={section.phaseNum} className={s.sidebarSection}>
              <p className={s.sidebarPhase}>
                <span className={s.sidebarPhaseTag}>{section.phaseNum}</span>
                {section.phase}
              </p>

              {section.items.map(item => {
                const isDone = item.id === 'preliminar' ? done.preliminar : false;
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={[
                      s.sidebarItem,
                      page === item.id    ? s.sidebarItemActive  : '',
                      item.pending        ? s.sidebarItemPending : '',
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
                    {item.pending
                      ? <span className={s.sidebarPendingTag}>Pendiente</span>
                      : <StatusDot done={isDone} />
                    }
                  </button>
                );
              })}
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
