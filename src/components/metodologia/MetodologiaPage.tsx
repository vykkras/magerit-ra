import { useCategoryStore } from '../../store/categoryStore';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import { CONTROLES_CATALOG, CONTROL_FAMILIAS } from '../../data/controlesCatalog';
import { DIMENSIONS, DIMENSION_DESC, LEVEL_NAMES } from '../../data/aarrScale';
import s from './MetodologiaPage.module.css';

// Requisitos del método (Excel · hoja "Proceso").
const REQUISITOS: [string, string][] = [
  ['Metódica', 'No es improvisada.'],
  ['Objetiva', 'El método utilizado es objetivo y no depende de la arbitrariedad.'],
  ['Repetible', 'Permite conseguir resultados repetibles en el tiempo.'],
  ['Documentada', 'Toda modificación, concreción o criterio adoptado se documenta para que cualquier persona autorizada pueda consultarlo y continuarlo.'],
];

const TENIDO_EN_CUENTA = [
  'Tipología de los activos.',
  'Criticidad en las actividades del servicio.',
  'Nivel de madurez de las medidas y controles de seguridad implantados.',
];

// Procedimiento del Análisis de Riesgos (Excel · hoja "Proceso").
const PROCEDIMIENTO: [string, string][] = [
  ['Determinar los activos', 'Determinar los activos relevantes para la organización, su interrelación y su valor, en el sentido de qué perjuicio supondría su degradación.'],
  ['Determinar las amenazas', 'Determinar a qué amenazas están expuestos aquellos activos.'],
  ['Determinar las salvaguardas', 'Determinar qué controles y/o salvaguardas hay dispuestas y cuán eficaces son frente al riesgo.'],
  ['Estimar el impacto', 'Estimar el impacto, definido como el daño sobre el activo derivado de la materialización de la amenaza.'],
  ['Estimar el riesgo', 'Estimar el riesgo, definido como el impacto ponderado con la tasa de ocurrencia (probabilidad) de la amenaza.'],
];

const CATEGORY_DESC: Record<string, string> = {
  'low-impact-it': 'Adquisiciones IT sencillas, de bajo impacto en la seguridad de la información.',
  'saas':          'Software como servicio gestionado por un proveedor (aplicación en la nube).',
  'saas-ai':       'SaaS que incorpora modelos de inteligencia artificial generativa o predictiva.',
  'paas-iaas':     'Plataforma o infraestructura como servicio (cómputo, red y almacenamiento).',
  'it-outsourcing': 'Externalización de servicios o personal IT a un tercero.',
};

const TOC = [
  ['objetivo', '1 · Objetivo'],
  ['bases', '2 · Referencias y herramienta'],
  ['procedimiento', '3 · Procedimiento del AARR'],
  ['dimensiones', '4 · Dimensiones de valoración'],
  ['categorias', '5 · Categorías'],
  ['metodo', '6 · Método de evaluación'],
  ['matriz', '7 · Matriz de mapeo'],
  ['modelo', '8 · Modelo de cálculo'],
  ['escala', '9 · Escala de riesgo'],
  ['controles', '10 · Catálogo de controles'],
  ['flujo', '11 · Flujo en la herramienta'],
  ['mantenimiento', '12 · Mantenimiento y vigencia'],
] as const;

// Las 4 zonas de riesgo (metodología BPO CC v7.3). Umbral sobre Probabilidad × Impacto.
const RISK_LEVELS = [
  { name: 'Zona 1 · Inaceptable', range: '9,9 – 15,1', treatment: 'Requiere tratamiento (plan en PDSI)',  bg: '#fee2e2', border: '#991b1b' },
  { name: 'Zona 2 · A tratar',    range: '1,6 – 9,9',  treatment: 'Requiere tratamiento (plan en PDSI)',  bg: '#fed7aa', border: '#9a3412' },
  { name: 'Zona 4 · Tolerable',   range: '0,7 – 1,6',  treatment: 'No requiere tratamiento (NRA)',        bg: '#ecfccb', border: '#3f6212' },
  { name: 'Zona 3 · Aceptable',   range: '0 – 0,7',    treatment: 'No requiere tratamiento (NRA)',        bg: '#dcfce7', border: '#166534' },
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
          La Apreciación de Riesgos se realiza mediante una aproximación metódica, utilizando como
          referencia la metodología <strong>MAGERIT v3</strong>, con el fin de garantizar que los
          datos obtenidos resulten fiables, comparables y reproducibles. El método cumple los
          siguientes requisitos:
        </p>
        <div className={s.pills}>
          {REQUISITOS.map(([tag, text]) => (
            <div key={tag} className={s.pill}>
              <span className={s.pillTag}>{tag}</span>
              <span className={s.pillText}>{text}</span>
            </div>
          ))}
        </div>
        <p className={s.sectionLead} style={{ marginTop: 18 }}>Este proceso de apreciación del riesgo ha tenido en cuenta:</p>
        <ul className={s.ul}>
          {TENIDO_EN_CUENTA.map(t => <li key={t} className={s.li}>{t}</li>)}
        </ul>
      </section>

      {/* ── 2 · Referencias y herramienta ── */}
      <section id="bases" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>2</span>
          <span className={s.sectionTitle}>Referencias y herramienta</span>
        </div>
        <p className={s.sectionLead}>La metodología se apoya en los siguientes marcos de referencia:</p>
        <div className={s.pills}>
          <div className={s.pill}><span className={s.pillTag}>MAGERIT v3</span><span className={s.pillText}>Metodología de análisis y gestión de riesgos: catálogo de activos, amenazas y salvaguardas.</span></div>
          <div className={s.pill}><span className={s.pillTag}>ISO 27001</span><span className={s.pillText}>Sistema de Gestión de Seguridad de la Información y controles.</span></div>
          <div className={s.pill}><span className={s.pillTag}>ENS</span><span className={s.pillText}>Esquema Nacional de Seguridad: marco organizativo, operacional y medidas de protección.</span></div>
          <div className={s.pill}><span className={s.pillTag}>GlobalSuite (EAR)</span><span className={s.pillText}>Entorno de Análisis de Riesgos que ejecuta el AARR siguiendo MAGERIT.</span></div>
        </div>
      </section>

      {/* ── 3 · Procedimiento del AARR ── */}
      <section id="procedimiento" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>3</span>
          <span className={s.sectionTitle}>Procedimiento del Análisis de Riesgos</span>
        </div>
        <p className={s.sectionLead}>El análisis de riesgos se desarrolla siguiendo estos pasos:</p>
        <div className={s.steps}>
          {PROCEDIMIENTO.map(([title, text], i) => (
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

      {/* ── 4 · Dimensiones de valoración ── */}
      <section id="dimensiones" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>4</span>
          <span className={s.sectionTitle}>Dimensiones de valoración</span>
        </div>
        <p className={s.sectionLead}>
          Cada activo se valora en cinco dimensiones (escala 1–5: Muy bajo … Muy alto). El
          <strong> Impacto del activo</strong> es la media de las cinco dimensiones, y la
          <strong> Criticidad</strong> se obtiene por el criterio más restrictivo
          (10^C + 10^I + 10^D + 10^A + 10^T → nivel 1–5).
        </p>
        {DIMENSIONS.map(dim => (
          <div key={dim.key} className={s.ctrlFamily}>
            <p className={s.ctrlFamilyName}>
              {dim.name} <span className={s.ctrlFamilyCount}>{dim.key}</span>
            </p>
            <table className={s.table}>
              <thead>
                <tr><th style={{ width: 110 }}>Nivel</th><th>Descripción</th></tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(lvl => (
                  <tr key={lvl}>
                    <td className={s.cellCode}>{lvl} · {LEVEL_NAMES[lvl]}</td>
                    <td>{DIMENSION_DESC[dim.key][lvl]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      {/* ── 3 · Categorías ── */}
      <section id="categorias" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>5</span>
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
          <span className={s.sectionNum}>6</span>
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
          <span className={s.sectionNum}>7</span>
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
          <span className={s.sectionNum}>8</span>
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
            <p className={s.formulaNote}>A4 = Probabilidad inherente (manual; valores 0,1 · 0,3 · 1 · 2 · 3). El producto se clasifica en las 4 zonas (ver §7).</p>
          </div>
        </div>

        <p className={s.sectionLead} style={{ marginTop: 22 }}>
          <strong>Parámetros del control</strong> — para cada control identificado se definen:
        </p>
        <div className={s.paramRow}>
          <div className={s.param}><p className={s.paramName}>Tipo de control (C1)</p><p className={s.paramVals}>Correctivo=1 · Detectivo=2 · Preventivo=3</p></div>
          <div className={s.param}><p className={s.paramName}>Tipo de implementación (C2)</p><p className={s.paramVals}>Manual=1 · Semiautomático=2 · Automatizado=3</p></div>
          <div className={s.param}><p className={s.paramName}>Frecuencia (C4)</p><p className={s.paramVals}>Ad-Hoc=0 · Anual=0,5 · Semestral=1 · Trimestral=1,5 · Mensual=2 · Diario=3</p></div>
          <div className={s.param}><p className={s.paramName}>Grado de implantación (C3)</p><p className={s.paramVals}>L0=0 · L1=0,1 · L2=0,25 · L3=0,5 · L4=0,8 · L5=1</p></div>
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
          <span className={s.sectionNum}>9</span>
          <span className={s.sectionTitle}>Escala de riesgo</span>
        </div>
        <p className={s.sectionLead}>
          El riesgo (Probabilidad × Impacto) se clasifica en <strong>cuatro zonas</strong> según el
          valor del producto. El Nivel de Riesgo Aceptable (NRA) determina que las zonas 3 y 4 no
          requieren tratamiento, mientras que las zonas 2 y 1 sí deben disponer de un plan de acción
          (PDSI) para su mitigación.
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
        <div className={s.formulaList} style={{ marginTop: 16 }}>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Probabilidad inherente (5 niveles)</p>
            <span className={s.formulaExpr}>Muy improbable 0,1 · Improbable 0,3 · Normal 1 · Frecuente 2 · Muy frecuente 3</span>
            <p className={s.formulaNote}>10 años o nunca · cada varios años · anual · mensual · semanal.</p>
          </div>
          <div className={s.formula}>
            <p className={s.formulaLabel}>Impacto por degradación (5 niveles, %)</p>
            <span className={s.formulaExpr}>Muy bajo 5% · Bajo 15% · Medio 50% · Alto 80% · Muy alto 100%</span>
          </div>
        </div>
      </section>

      {/* ── 10 · Catálogo de controles ── */}
      <section id="controles" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>10</span>
          <span className={s.sectionTitle}>Catálogo de controles (MAGERIT v3 / ENS)</span>
        </div>
        <p className={s.sectionLead}>
          {CONTROLES_CATALOG.length} controles agrupados en {CONTROL_FAMILIAS.length} familias de
          salvaguarda. Cada control indica su tipo (Preventivo / Detectivo / Correctivo) y el marco
          de referencia (MAGERIT, ENS o ambos).
        </p>
        {CONTROL_FAMILIAS.map(familia => {
          const items = CONTROLES_CATALOG.filter(c => c.familia === familia);
          return (
            <div key={familia} className={s.ctrlFamily}>
              <p className={s.ctrlFamilyName}>
                {familia} <span className={s.ctrlFamilyCount}>{items.length}</span>
              </p>
              <table className={s.table}>
                <thead>
                  <tr><th>Control</th><th>Tipo</th><th>Metodología</th></tr>
                </thead>
                <tbody>
                  {items.map((c, i) => (
                    <tr key={i}>
                      <td>{c.nombre}</td>
                      <td>{c.tipo}</td>
                      <td className={s.cellCode}>{c.metodologia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </section>

      {/* ── 11 · Flujo en la herramienta ── */}
      <section id="flujo" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>11</span>
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
            <p className={s.flowSteps}>El proveedor responde el cuestionario y se valoran los riesgos: dimensiones del activo, degradación, probabilidad y controles, calculando riesgo inherente y residual sobre las 4 zonas.</p>
          </div>
          <div className={s.flowPhase}>
            <p className={s.flowPhaseTag}>Fase 3 · Resultados</p>
            <p className={s.flowPhaseTitle}>Resultado → Informe → Despliegue → Inventario</p>
            <p className={s.flowSteps}>Resolución formal (OK / OK con plan / KO), informe de evaluación y registro en el inventario.</p>
          </div>
        </div>
      </section>

      {/* ── 12 · Mantenimiento y vigencia ── */}
      <section id="mantenimiento" className={s.section}>
        <div className={s.sectionHead}>
          <span className={s.sectionNum}>12</span>
          <span className={s.sectionTitle}>Mantenimiento y vigencia</span>
        </div>
        <p className={s.sectionLead}>
          La evaluación del AARR se realiza con periodicidad <strong>anual</strong> y/o cuando exista
          un cambio significativo que amerite su ejecución antes del año.
        </p>
        <div className={s.callout}>
          <span className={s.calloutIcon}>📌</span>
          <span className={s.calloutText}>
            Documento de referencia: <strong>MS01.MA01 — Metodología de Apreciación del Riesgo
            BPO CC</strong> (v7.3, abril 2025). Clasificación: Interna. Adecuación al ENS e
            ISO 27001. Elaborado por el Equipo GRC; revisado por el Responsable SGSI; aprobado por el
            Responsable de Seguridad de la Información.
          </span>
        </div>
      </section>

    </div>
  );
}
