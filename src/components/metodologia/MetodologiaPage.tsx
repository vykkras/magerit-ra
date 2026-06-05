import { useCategoryStore } from '../../store/categoryStore';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import s from './MetodologiaPage.module.css';

const CATEGORY_DESC: Record<string, string> = {
  'low-impact-it': 'Adquisiciones IT sencillas, de bajo impacto en la seguridad de la información.',
  'saas':          'Software como servicio gestionado por un proveedor (aplicación en la nube).',
  'saas-ai':       'SaaS que incorpora modelos de inteligencia artificial generativa o predictiva.',
  'paas-iaas':     'Plataforma o infraestructura como servicio (cómputo, red y almacenamiento).',
  'it-outsourcing': 'Externalización de servicios o personal IT a un tercero.',
};

const TOC = [
  ['objetivo', '1 · Objetivo'],
  ['bases', '2 · Bases'],
  ['categorias', '3 · Categorías'],
  ['metodo', '4 · Método de evaluación'],
  ['matriz', '5 · Matriz de mapeo'],
  ['modelo', '6 · Modelo de cálculo'],
  ['escala', '7 · Escala de riesgo'],
  ['flujo', '8 · Flujo en la herramienta'],
  ['roadmap', '9 · Roadmap'],
] as const;

const RISK_LEVELS = [
  { name: 'Muy alto', range: '17 – 25', bg: '#fee2e2', border: '#991b1b' },
  { name: 'Alto',     range: '13 – 16', bg: '#fed7aa', border: '#9a3412' },
  { name: 'Medio',    range: '9 – 12',  bg: '#fef9c3', border: '#854d0e' },
  { name: 'Bajo',     range: '5 – 8',   bg: '#ecfccb', border: '#3f6212' },
  { name: 'Muy bajo', range: '1 – 4',   bg: '#dcfce7', border: '#166534' },
];

// Ejemplo de la matriz de mapeo (categoría SaaS) — metodología AARR §9.
const MAPPING_EXAMPLE = [
  ['SaaS-01', 'Sistema de gestión de seguridad', 'Organización deficiente', false, true],
  ['SaaS-03', 'Gestión de incidentes', 'Gestión inadecuada de incidentes', true, true],
  ['SaaS-04', 'MFA', 'Suplantación, acceso no autorizado', false, true],
  ['SaaS-07', 'Cifrado en tránsito', 'Interceptación de comunicaciones', true, true],
  ['SaaS-08', 'Cifrado en reposo', 'Divulgación de información', true, false],
  ['SaaS-13', 'Copias de seguridad', 'Pérdida de información', true, false],
  ['SaaS-15', 'Continuidad de negocio', 'Desastres e indisponibilidad', true, true],
] as const;

export default function MetodologiaPage() {
  const { categories } = useCategoryStore();

  return (
    <div className={s.page}>

      {/* ── Hero ── */}
      <div className={s.hero}>
        <div className={s.heroIcon}>📐</div>
        <div>
          <p className={s.kicker}>Documentación</p>
          <p className={s.title}>Metodología de Evaluación de Soluciones (AARR)</p>
          <p className={s.sub}>
            Proceso homogéneo para evaluar nuevas soluciones tecnológicas antes de su adquisición o
            contratación: identifica riesgos de seguridad de la información y calcula automáticamente
            el riesgo residual mediante el modelo corporativo de análisis de riesgos.
          </p>
        </div>
      </div>

      {/* ── TOC ── */}
      <div className={s.toc}>
        {TOC.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={s.tocLink}>{label}</a>
        ))}
      </div>

      {/* ── 1 · Objetivo ── */}
      <section id="objetivo" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>1</span>
          <span className={s.sectionTitle}>Objetivo</span>
        </div>
        <p className={s.sectionLead}>
          Establecer un criterio único y repetible para decidir si una solución puede adquirirse o
          contratarse desde el punto de vista de seguridad. La evaluación se basa en cuestionarios
          respondidos por el proveedor, que alimentan un modelo de cálculo de riesgo inherente y
          residual definido por la organización.
        </p>
      </section>

      {/* ── 2 · Bases ── */}
      <section id="bases" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>2</span>
          <span className={s.sectionTitle}>Bases metodológicas</span>
        </div>
        <p className={s.sectionLead}>La metodología combina cinco fuentes de referencia:</p>
        <div className={s.pills}>
          <div className={s.pill}><span className={s.pillTag}>MAGERIT v3</span><span className={s.pillText}>Catálogo de amenazas sobre los activos.</span></div>
          <div className={s.pill}><span className={s.pillTag}>ISO 27001:2022</span><span className={s.pillText}>Controles de seguridad y su madurez.</span></div>
          <div className={s.pill}><span className={s.pillTag}>NIS2</span><span className={s.pillText}>Requisitos regulatorios aplicables.</span></div>
          <div className={s.pill}><span className={s.pillTag}>Cuestionarios</span><span className={s.pillText}>Preguntas cerradas Sí/No por categoría.</span></div>
          <div className={s.pill}><span className={s.pillTag}>Modelo de riesgo</span><span className={s.pillText}>Cálculo corporativo inherente y residual.</span></div>
        </div>
      </section>

      {/* ── 3 · Categorías ── */}
      <section id="categorias" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>3</span>
          <span className={s.sectionTitle}>Categorías de soluciones</span>
        </div>
        <p className={s.sectionLead}>
          Cada solución se clasifica en una categoría, que determina el cuestionario específico,
          las amenazas aplicables y las salvaguardas asociadas.
        </p>
        <div className={s.grid}>
          {categories.map(cat => {
            const count = (CATEGORY_QUESTIONNAIRES[cat.id] ?? []).length;
            return (
              <div key={cat.id} className={s.cat}>
                <div className={s.catTop}>
                  <span className={s.catName}>{cat.name}</span>
                  <span className={s.catCount}>{count} preg.</span>
                </div>
                <p className={s.catDesc}>{CATEGORY_DESC[cat.id] ?? ''}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4 · Método de evaluación ── */}
      <section id="metodo" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>4</span>
          <span className={s.sectionTitle}>Método de evaluación</span>
        </div>
        <p className={s.sectionLead}>
          El proveedor responde a todas las preguntas aplicables a su categoría. Cada respuesta
          afirmativa identifica la existencia de controles que mitigan una o varias amenazas.
        </p>
        <div className={s.steps}>
          {[
            ['Identificar amenazas aplicables', 'Cada pregunta está mapeada a amenazas MAGERIT v3.'],
            ['Determinar controles existentes', 'Una respuesta «Sí» confirma un control alineado con ISO 27001:2022.'],
            ['Calcular impacto residual', 'Los controles que mitigan impacto reducen el impacto inherente.'],
            ['Calcular probabilidad residual', 'Los controles que mitigan probabilidad reducen la probabilidad inherente.'],
            ['Obtener el riesgo residual', 'Riesgo residual = probabilidad residual × impacto residual.'],
          ].map(([title, text], i) => (
            <div key={i} className={s.step}>
              <span className={s.stepNum}>{i + 1}</span>
              <div>
                <p className={s.stepTitle}>{title}</p>
                <p className={s.stepText}>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5 · Matriz de mapeo ── */}
      <section id="matriz" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>5</span>
          <span className={s.sectionTitle}>Matriz de mapeo de controles</span>
        </div>
        <p className={s.sectionLead}>
          Cada pregunta indica si el control que confirma <strong>mitiga el impacto</strong> y/o
          <strong> mitiga la probabilidad</strong> de las amenazas asociadas. Esa marca es la que
          permite separar el cálculo de impacto y probabilidad residual.
        </p>
        <div className={s.legend}>
          <div className={s.legendItem}>
            <span className={s.badgeI}>I↓</span>
            <span className={s.legendText}><strong>Mitiga impacto</strong> — reduce la consecuencia una vez materializada la amenaza (cifrado, copias, continuidad, segregación, eliminación segura).</span>
          </div>
          <div className={s.legendItem}>
            <span className={s.badgeP}>P↓</span>
            <span className={s.legendText}><strong>Mitiga probabilidad</strong> — reduce la posibilidad de que ocurra (MFA, gestión de accesos, vulnerabilidades, monitorización, formación).</span>
          </div>
        </div>
        <table className={s.table}>
          <thead>
            <tr>
              <th>ID</th><th>Control</th><th>Amenaza MAGERIT</th><th>Mitiga impacto</th><th>Mitiga probabilidad</th>
            </tr>
          </thead>
          <tbody>
            {MAPPING_EXAMPLE.map(([id, ctrl, threat, mi, mp]) => (
              <tr key={id}>
                <td className={s.cellCode}>{id}</td>
                <td>{ctrl}</td>
                <td>{threat}</td>
                <td className={mi ? s.yes : s.no}>{mi ? 'Sí' : '—'}</td>
                <td className={mp ? s.yes : s.no}>{mp ? 'Sí' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={s.formulaNote}>Ejemplo orientativo para la categoría SaaS (metodología AARR §9).</p>
      </section>

      {/* ── 6 · Modelo de cálculo ── */}
      <section id="modelo" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>6</span>
          <span className={s.sectionTitle}>Modelo de cálculo de riesgo</span>
        </div>

        <p className={s.sectionLead}><strong>Riesgo inherente</strong> — riesgo de la solución sin considerar controles.</p>
        <div className={s.formulaList}>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Criticidad (A1)</p>
            <span className={s.formulaExpr}>A1 = 10^C + 10^I + 10^D + 10^A + 10^T  →  escala 1–5</span>
            <p className={s.formulaNote}>C/I/D/A/T = Confidencialidad, Integridad, Disponibilidad, Autenticidad y Trazabilidad (cada una 1–5: 1 muy bajo … 5 muy alto).</p>
          </div>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Impacto inherente (A3)</p>
            <span className={s.formulaExpr}>A3 = A1 × A2 / 100</span>
            <p className={s.formulaNote}>A2 = Impacto por degradación (manual).</p>
          </div>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Riesgo inherente (A5)</p>
            <span className={s.formulaExpr}>A5 = A3 × A4</span>
            <p className={s.formulaNote}>A4 = Probabilidad inherente (manual, 1–5).</p>
          </div>
        </div>

        <p className={s.sectionLead} style={{ marginTop: 22 }}>
          <strong>Parámetros del control</strong> — para cada control identificado se definen:
        </p>
        <div className={s.paramRow}>
          <div className={s.param}><p className={s.paramName}>Tipo de control</p><p className={s.paramVals}>Preventivo · Detectivo · Correctivo</p></div>
          <div className={s.param}><p className={s.paramName}>Tipo de implementación</p><p className={s.paramVals}>Manual · Automático</p></div>
          <div className={s.param}><p className={s.paramName}>Frecuencia</p><p className={s.paramVals}>Periodicidad de aplicación</p></div>
          <div className={s.param}><p className={s.paramName}>Grado de implantación</p><p className={s.paramVals}>L0=0 · L1=0,1 · L2=0,25 · L3=0,5 · L4=0,8 · L5=1</p></div>
        </div>
        <div className={s.formulaList} style={{ marginTop: 14 }}>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Madurez del control (C5)</p>
            <span className={s.formulaExpr}>C5 = (Tipo + Implementación + Frecuencia) / 3</span>
          </div>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Eficacia del control</p>
            <span className={s.formulaExpr}>eficacia = C5 × Grado de implantación</span>
            <p className={s.formulaNote}>Solo se aplica a la dimensión que el control mitiga (impacto y/o probabilidad).</p>
          </div>
        </div>

        <p className={s.sectionLead} style={{ marginTop: 22 }}><strong>Riesgo residual</strong> — descontando los controles existentes.</p>
        <div className={s.formulaList}>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Impacto residual (A6)</p>
            <span className={s.formulaExpr}>A6 = A3 − media(eficacia de los controles que mitigan impacto)</span>
          </div>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Probabilidad residual (A7)</p>
            <span className={s.formulaExpr}>A7 = A4 − media(eficacia de los controles que mitigan probabilidad)</span>
          </div>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Riesgo residual (A8)</p>
            <span className={s.formulaExpr}>A8 = A6 × A7</span>
            <p className={s.formulaNote}>Si una dimensión no tiene controles que la mitiguen, su valor residual es igual al inherente.</p>
          </div>
        </div>
      </section>

      {/* ── 7 · Escala de riesgo ── */}
      <section id="escala" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>7</span>
          <span className={s.sectionTitle}>Escala de riesgo</span>
        </div>
        <p className={s.sectionLead}>
          El riesgo (probabilidad × impacto) se clasifica en cinco zonas sobre una escala 1–25,
          alineada con la plantilla corporativa.
        </p>
        <div className={s.levels}>
          {RISK_LEVELS.map(l => (
            <div key={l.name} className={s.level}>
              <span className={s.levelDot} style={{ background: l.bg, borderColor: l.border }} />
              <span className={s.levelName}>{l.name}</span>
              <span className={s.levelRange}>{l.range}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8 · Flujo en la herramienta ── */}
      <section id="flujo" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>8</span>
          <span className={s.sectionTitle}>Flujo en la herramienta</span>
        </div>
        <div className={s.flowList}>
          <div className={s.flowPhase}>
            <p className={s.flowPhaseTag}>Fase 1 · Registro y categorización</p>
            <p className={s.flowPhaseTitle}>Información general + Cuestionario preliminar</p>
            <p className={s.flowSteps}>Se registran los datos de la solicitud y se selecciona la categoría de la solución.</p>
          </div>
          <div className={s.flowPhase}>
            <p className={s.flowPhaseTag}>Fase 2 · Análisis y evaluación</p>
            <p className={s.flowPhaseTitle}>Cuestionario avanzado → Análisis de riesgos → Matriz de responsabilidades → TPRM</p>
            <p className={s.flowSteps}>El proveedor responde el cuestionario; en «Escenario de riesgo» se calcula el riesgo inherente y residual por amenaza a partir de la matriz de mapeo.</p>
          </div>
          <div className={s.flowPhase}>
            <p className={s.flowPhaseTag}>Fase 3 · Resultados</p>
            <p className={s.flowPhaseTitle}>Resultado → Informe → Despliegue → Inventario</p>
            <p className={s.flowSteps}>Resolución formal (OK / OK con plan / KO), informe de evaluación y registro en el inventario.</p>
          </div>
        </div>
      </section>

      {/* ── 9 · Roadmap ── */}
      <section id="roadmap" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>9</span>
          <span className={s.sectionTitle}>Próximos pasos recomendados</span>
        </div>
        <div className={s.steps}>
          {[
            'Mapear todas las preguntas a las amenazas específicas de MAGERIT v3.',
            'Asociar cada pregunta a controles ISO 27001:2022.',
            'Asociar cada pregunta a requisitos NIS2.',
            'Definir pesos por categoría de solución.',
            'Automatizar la generación de controles y el cálculo de riesgo residual.',
            'Construir una matriz maestra única con trazabilidad pregunta → amenaza → control → riesgo.',
          ].map((t, i) => (
            <div key={i} className={s.step}>
              <span className={s.stepNum}>{i + 1}</span>
              <div><p className={s.stepText} style={{ marginTop: 3 }}>{t}</p></div>
            </div>
          ))}
        </div>
        <div className={s.callout}>
          <span className={s.calloutIcon}>💡</span>
          <span className={s.calloutText}>
            La herramienta ya implementa el mapeo de preguntas a amenazas MAGERIT y controles ISO,
            y el cálculo de impacto y probabilidad residual a partir de la matriz de mapeo. La capa
            de parámetros por control (tipo, implementación, frecuencia y grado) se incorporará para
            replicar íntegramente el modelo corporativo de GlobalSuite.
          </span>
        </div>
      </section>

    </div>
  );
}
