import { useState } from 'react';
import s from './App.module.css';
import { useSolicitudStore } from './store/solicitudStore';
import { useQuestionnaireStore } from './store/questionnaireStore';
import { useRiskScenarioStore } from './store/riskScenarioStore';
import { useCompletedStore } from './store/completedStore';
import { useCategoryStore } from './store/categoryStore';
import { CATEGORY_QUESTIONNAIRES, type Question } from './data/questionnaires.data';
import HomePage from './components/home/HomePage';
import InfoGeneral from './components/fase1/InfoGeneral';
import CuestionarioPreliminar from './components/fase1/CuestionarioPreliminar';
import CategoriesPage from './components/categories/CategoriesPage';
import PendingPage from './components/common/PendingPage';
import ResponsibilityMatrixPage from './components/tprm/ResponsibilityMatrixPage';
import RiskAnalysisPage from './components/grc/RiskAnalysisPage';
import TprmResultsPage from './components/tprm/TprmResultsPage';
import ResultadoPage from './components/grc/ResultadoPage';
import InformePage from './components/grc/InformePage';

// ── Navigation model ──────────────────────────────────────────────────────────

type PageId =
  | 'home'
  | 'solicitud'
  | 'preliminar'
  | 'avanzado'
  | 'grc'
  | 'matriz_responsabilidad'
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
      { id: 'preliminar', num: 1, label: 'Cuestionario Preliminar', pending: false },
    ],
  },
  {
    phaseNum: 'Fase 2',
    phase: 'Análisis y Evaluación',
    items: [
      { id: 'avanzado', num: 3, label: 'Cuestionario Avanzado',    pending: false },
      { id: 'grc',                    num: 4, label: 'Análisis de Riesgos',             pending: false },
      { id: 'matriz_responsabilidad', num: 5, label: 'Matriz de Responsabilidades',    pending: false },
      { id: 'tprm',    num: 6, label: 'Resultados TPRM',       pending: false },
    ],
  },
  {
    phaseNum: 'Fase 3',
    phase: 'Resultados',
    items: [
      { id: 'resultado',  label: 'Resultado',  pending: false },
      { id: 'informe', num: 7, label: 'Informe de Evaluación', pending: false },
      { id: 'despliegue', num: 8, label: 'Solicitud de Despliegue',  pending: true },
      { id: 'inventario', num: 9, label: 'Inventario de Soluciones', pending: true },
    ],
  },
];

const ALL_ITEMS: NavItem[] = [NAV_PRE, ...NAV.flatMap(sec => sec.items)];

// ── Pending page info ─────────────────────────────────────────────────────────

const PENDING_INFO: Partial<Record<PageId, { phase: string; description: string }>> = {
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
  const { solicitante, proveedor, categoriaId } = useSolicitudStore();
  return {
    solicitud:  !!(solicitante || proveedor),
    preliminar: !!categoriaId,
  };
}

function StatusDot({ done }: { done: boolean }) {
  if (!done) return null;
  return <span className={s.doneDot} title="Completado" />;
}

// ── App ───────────────────────────────────────────────────────────────────────

function computeResidualImpact(
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

export default function App() {
  const [page, setPage]               = useState<PageId>('home');
  const [editingId, setEditingId]     = useState<string | null>(null);
  const solicitud                     = useSolicitudStore();
  const { categoriaId } = solicitud;
  const questionnaireStore            = useQuestionnaireStore();
  const { answers, criticality, customQuestions, customRiskRefs, customSafeguardRefs, customResponsibility, extraQuestions } = questionnaireStore;
  const scenarioStore                 = useRiskScenarioStore();
  const { scenarios }                 = scenarioStore;
  const { categories }                = useCategoryStore();
  const { add: addCompleted, update: updateCompleted, remove: removeCompleted } = useCompletedStore();
  const done = useCompletionStatus();

  function buildSnapshot() {
    let totalAnswered = 0, totalQ = 0, totalYes = 0;
    let totalInherent = 0, totalResidual = 0;

    categories.forEach(cat => {
      const questions   = CATEGORY_QUESTIONNAIRES[cat.id] ?? [];
      const catAnswers  = answers[cat.id] ?? {};
      const catAnswered = questions.filter(q => catAnswers[q.id] != null).length;
      totalQ        += questions.length;
      totalAnswered += catAnswered;
      totalYes      += questions.filter(q => catAnswers[q.id] === 'yes').length;
      if (catAnswered === 0) return;
      (scenarios[cat.id] ?? []).forEach(row => {
        if (row.inherentImpact === null || row.probability === null) return;
        const res = computeResidualImpact(row.threatCode, questions, catAnswers as Record<string, string>, row.inherentImpact);
        totalInherent += row.probability * row.inherentImpact;
        totalResidual += row.probability * res;
      });
    });

    const compliance = totalQ > 0 ? Math.round((totalYes / totalQ) * 100) : 0;
    const reduction  = totalInherent > 0 ? Math.round((1 - totalResidual / totalInherent) * 100) : 0;

    return {
      solicitante:   solicitud.solicitante,
      proveedor:     solicitud.proveedor,
      departamento:  solicitud.departamento,
      referenciaPST: solicitud.referenciaPST,
      categoriaId:   solicitud.categoriaId,
      totalAnswered,
      totalQuestions: totalQ,
      compliance,
      totalInherent:  Math.round(totalInherent * 10) / 10,
      totalResidual:  Math.round(totalResidual * 10) / 10,
      reduction,
      snapshot: {
        solicitud: {
          solicitante:   solicitud.solicitante,
          departamento:  solicitud.departamento,
          proveedor:     solicitud.proveedor,
          solucion:      solicitud.solucion,
          tipoSolucion:  solicitud.tipoSolucion,
          referenciaPST: solicitud.referenciaPST,
          fechaSolicitud: solicitud.fechaSolicitud,
          categoriaId:   solicitud.categoriaId,
          tprmScore:     solicitud.tprmScore,
          resultado:     solicitud.resultado,
        },
        answers,
        criticality,
        customQuestions,
        customRiskRefs,
        customSafeguardRefs,
        customResponsibility,
        extraQuestions,
        scenarios,
      },
    };
  }

  function completeProcess() {
    const data = buildSnapshot();
    if (editingId) {
      updateCompleted(editingId, { ...data, id: editingId, completedAt: new Date().toISOString() });
      setEditingId(null);
    } else {
      addCompleted({ ...data, id: crypto.randomUUID(), completedAt: new Date().toISOString() });
    }
    solicitud.reset();
    categories.forEach(c => questionnaireStore.resetCategory(c.id));
    setPage('home');
  }

  function reopenEvaluation(ev: import('./store/completedStore').CompletedEvaluation) {
    const { snapshot } = ev;
    solicitud.set(snapshot.solicitud);
    questionnaireStore.loadState({
      answers:            snapshot.answers,
      criticality:        snapshot.criticality,
      customQuestions:    snapshot.customQuestions,
      customRiskRefs:       snapshot.customRiskRefs,
      customSafeguardRefs:  snapshot.customSafeguardRefs,
      customResponsibility: snapshot.customResponsibility ?? {},
      extraQuestions:       snapshot.extraQuestions,
    });
    scenarioStore.loadState(snapshot.scenarios);
    removeCompleted(ev.id);
    setEditingId(ev.id);
    setPage('solicitud');
  }

  const currentItem    = ALL_ITEMS.find(i => i.id === page);
  const currentSection = NAV.find(sec => sec.items.some(i => i.id === page));

  function renderContent() {
    switch (page) {
      case 'home':        return <HomePage onStart={() => setPage('solicitud')} onReopen={reopenEvaluation} />;
      case 'solicitud':   return <InfoGeneral />;
      case 'preliminar':  return <CuestionarioPreliminar />;
      case 'matriz_responsabilidad': return <ResponsibilityMatrixPage />;
      case 'grc':       return <RiskAnalysisPage />;
      case 'tprm':      return <TprmResultsPage />;
      case 'resultado': return <ResultadoPage />;
      case 'informe':   return <InformePage />;
      case 'avanzado':
        return <CategoriesPage lockedCategoryId={categoriaId ?? undefined} />;
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
      <header className={`${s.header} no-print`}>
        <button className={s.headerBrand} onClick={() => setPage('home')}>
          <img src="/logo.png" alt="Capgemini" className={s.headerLogo} />
          <div>
            <p className={s.headerName}>M.A.I.N.S.</p>
            <p className={s.headerSub}>Gestión de Riesgos · Ciberseguridad · Cumplimiento</p>
          </div>
        </button>

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

        {/* ── Sidebar (hidden on home) ── */}
        {page === 'home' ? null : <nav className={`${s.sidebar} no-print`}>

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
                      page === item.id ? s.sidebarItemActive : '',
                      item.pending ? s.sidebarItemPending : '',
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

          {/* ── Complete button ── */}
          <div className={s.sidebarFooter}>
            <button className={s.completeBtn} onClick={completeProcess}>
              {editingId ? 'Guardar cambios' : 'Marcar como completado'}
            </button>
          </div>

        </nav>}

        {/* ── Content ── */}
        <main className={s.content}>
          {renderContent()}
        </main>

      </div>
    </div>
  );
}
