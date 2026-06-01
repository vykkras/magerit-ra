import { useMemo, useState } from 'react';
import { useSolicitudStore } from '../../store/solicitudStore';
import { useQuestionnaireStore } from '../../store/questionnaireStore';
import { useCategoryStore } from '../../store/categoryStore';
import { CATEGORY_QUESTIONNAIRES } from '../../data/questionnaires.data';
import { useRiskAnalysis, LEVEL_LABEL, type RiskLevel } from '../../hooks/useRiskAnalysis';
import { downloadInformeDocx } from '../../utils/informeDocx';
import {
  DOC_PROPS,
  DOCUMENTOS_REFERENCIA,
  TERMINOS_DEFINICIONES,
  METODOLOGIA_PARRAFOS,
  VIGENCIA_PARRAFOS,
  INDICE,
  buildResolucion,
  resolucionTitulo,
} from '../../data/informe.data';
import s from './InformePage.module.css';

const PROB_LABELS = ['', 'Muy improbable', 'Improbable', 'Normal', 'Frecuente'];
const IMP_LABELS  = ['', 'Muy bajo', 'Bajo', 'Medio', 'Alto'];

function fmtDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

export default function InformePage() {
  const sol = useSolicitudStore();
  const { answers } = useQuestionnaireStore();
  const { categories } = useCategoryStore();
  const { rows, stats } = useRiskAnalysis();

  const catId = sol.categoriaId ?? '';
  const categoriaNombre = categories.find(c => c.id === catId)?.name ?? '—';

  const compliance = useMemo(() => {
    const qs = CATEGORY_QUESTIONNAIRES[catId] ?? [];
    if (qs.length === 0) return null;
    const catA = answers[catId] ?? {};
    const yes = qs.filter(q => catA[q.id] === 'yes').length;
    return Math.round((yes / qs.length) * 100);
  }, [catId, answers]);

  const riesgosATratar = rows.filter(r => r.residualLevel === 'critico' || r.residualLevel === 'alto').length;

  const salvaguardasPendientes = useMemo(() => {
    const seen = new Set<string>();
    rows.forEach(r => r.missingSafeguards.forEach(sg => seen.add(sg)));
    return [...seen];
  }, [rows]);

  const amenazasPrincipales = useMemo(() => {
    const sorted = [...rows].sort((a, b) => b.residualScore - a.residualScore);
    const relevant = sorted.filter(r => r.residualLevel === 'critico' || r.residualLevel === 'alto');
    return (relevant.length > 0 ? relevant : sorted.slice(0, 3)).filter(r => r.residualScore > 0);
  }, [rows]);

  // Mapa de riesgos: conteo por Impacto (filas) × Probabilidad (columnas), residual
  const mapCounts = useMemo(() => {
    const grid: number[][] = [0, 1, 2, 3].map(() => [0, 0, 0, 0]); // [imp-1][prob-1]
    rows.forEach(r => { grid[r.residualImpact - 1][r.prob - 1]++; });
    return grid;
  }, [rows]);

  const totalRiesgos = rows.length;
  const resultado = sol.resultado;

  const resol = resultado
    ? buildResolucion(resultado, {
        solucion: sol.solucion,
        proveedor: sol.proveedor,
        compliance,
        tprm: sol.tprmScore,
        riesgosATratar,
        totalRiesgos,
        reduccion: stats.reduction,
        salvaguardasPendientes,
      })
    : null;

  const datosIncompletos = !catId || totalRiesgos === 0;
  const solucionTxt = sol.solucion?.trim() || '[Solución]';
  const proveedorTxt = sol.proveedor?.trim() || '[Proveedor]';
  const fecha = fmtDate(sol.fechaSolicitud);
  const pst = sol.referenciaPST || '—';
  const resolTitulo = resolucionTitulo(resultado);

  // Cabecera repetida (Word) — Fecha / Nº PST / Solución / Proveedor / Resolución
  const headerRows: [string, string][] = [
    ['Fecha', fecha],
    ['Nº de PST', pst],
    ['Solución', solucionTxt],
    ['Proveedor', proveedorTxt],
    ['Resolución', resolTitulo],
  ];

  const [generando, setGenerando] = useState(false);

  async function handleDescargarWord() {
    if (generando) return;
    setGenerando(true);
    try {
      await downloadInformeDocx({
        fecha, pst, solucion: solucionTxt, proveedor: proveedorTxt,
        categoriaNombre, resolTitulo,
        compliance, tprm: sol.tprmScore,
        reduccion: stats.reduction, riesgosATratar, totalRiesgos,
        risks: [...rows]
          .sort((a, b) => b.residualScore - a.residualScore)
          .map(r => ({
            code: r.code, name: r.name,
            probLabel: PROB_LABELS[r.prob] ?? String(r.prob),
            zoneLabel: LEVEL_LABEL[r.residualLevel],
            zoneLevel: r.residualLevel,
          })),
        mapCounts,
        probLabels: PROB_LABELS,
        impLabels: IMP_LABELS,
        amenazas: amenazasPrincipales.map(r => ({
          code: r.code, name: r.name, zoneLabel: LEVEL_LABEL[r.residualLevel],
        })),
        resol: resol ? { titulo: resol.titulo, parrafos: resol.parrafos, acciones: resol.acciones } : null,
      });
    } catch (e) {
      console.error('Error generando el Word del informe:', e);
      alert('No se pudo generar el documento Word. Revisa la consola para más detalles.');
    } finally {
      setGenerando(false);
    }
  }

  return (
    <div className={s.wrap}>

      {/* Barra de herramientas (no se imprime) */}
      <div className={`${s.toolbar} no-print`}>
        <div className={s.toolbarInfo}>
          <span className={s.toolbarTitle}>Informe de Evaluación</span>
          <span className={s.toolbarSub}>Se autocompleta con los datos de la evaluación · Descárgalo en Word (.docx)</span>
        </div>
        <button className={s.btnPrimary} onClick={handleDescargarWord} disabled={generando}>
          {generando ? 'Generando…' : '⤓ Descargar Word'}
        </button>
      </div>

      <div className={s.doc} id="informe-print">

        {/* Cabecera repetida en cada página (Word) */}
        <div className={s.runningHeader}>
          <img className={s.rhLogos} src="/informe-header-logos.png" alt="ILUNION · Fundación ONCE" />
          <div className={s.rhTitle}>
            Informe de Evaluación, Análisis de Riesgo y recomendación Solicitud Proveedor-Servicio ITC
          </div>
          <div className={s.rhVersion}>
            <span className={s.rhVerLabel}>Versión</span>
            <span className={s.rhVerNum}>1.0</span>
          </div>
        </div>

        {datosIncompletos && (
          <div className={`${s.warn} no-print`}>
            Faltan datos de la evaluación. Completa la categorización y el cuestionario avanzado para que el
            informe refleje el análisis de riesgos completo.
          </div>
        )}

        {/* ── Portada ─────────────────────────────────────────────────────── */}
        <div className={s.cover}>
          <img className={s.coverLogos} src="/informe-portada.png" alt="ILUNION · Fundación ONCE" />
          <h1 className={s.coverTitle}>
            Informe de Evaluación, Análisis de Riesgo y recomendación de Solicitud Proveedor-Servicio ICT
          </h1>
          <table className={s.coverTable}>
            <tbody>
              {headerRows.map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{k === 'Resolución' ? <strong>{v}</strong> : v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Propiedades del documento ───────────────────────────────────── */}
        <div className={s.section}>
          <h2 className={s.h2}>Propiedades del documento</h2>
          <table className={s.propsTable}>
            <tbody>
              <tr><td>Nombre del documento</td><td>{DOC_PROPS.nombre}</td></tr>
              <tr><td>Tipo</td><td>{DOC_PROPS.tipo}</td></tr>
              <tr><td>Resumen</td><td>{DOC_PROPS.resumen}</td></tr>
              <tr><td>Propietario</td><td>{DOC_PROPS.propietario}</td></tr>
              <tr><td>Clasificación</td><td>{DOC_PROPS.clasificacion}</td></tr>
            </tbody>
          </table>

          <h3 className={s.h3}>Participantes (relativos a la última versión del documento)</h3>
          <table className={s.propsTable}>
            <tbody>
              <tr><td>Elaborado por</td><td>{DOC_PROPS.elaboradoPor}</td></tr>
              <tr><td>Revisado por</td><td>{DOC_PROPS.revisadoPor}</td></tr>
              <tr><td>Aprobado por</td><td>{DOC_PROPS.aprobadoPor}</td></tr>
            </tbody>
          </table>

          <h3 className={s.h3}>Historial de revisiones</h3>
          <table className={s.propsTable}>
            <thead>
              <tr><th>Versión</th><th>Fecha</th><th>Autor</th><th>Detalles de la versión</th></tr>
            </thead>
            <tbody>
              <tr><td>1.0</td><td>{fecha}</td><td>{DOC_PROPS.elaboradoPor}</td><td>Versión inicial.</td></tr>
            </tbody>
          </table>

          <h3 className={s.h3}>Vigencia</h3>
          {VIGENCIA_PARRAFOS.map((p, i) => <p key={i} className={s.p}>{p}</p>)}
        </div>

        {/* ── Índice ──────────────────────────────────────────────────────── */}
        <div className={s.section}>
          <h2 className={s.h2}>Índice</h2>
          <div className={s.indice}>
            {INDICE.map(item => (
              <div key={item.n}>
                <div className={s.indiceL1}><span className={s.indiceNum}>{item.n}.</span> {item.t}</div>
                {item.sub.map(sub => (
                  <div key={sub.n} className={s.indiceL2}><span className={s.indiceNum}>{sub.n}</span> {sub.t}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── 1. Introducción ─────────────────────────────────────────────── */}
        <div className={s.section}>
          <h2 className={s.h2}><span className={s.num}>1.</span> Introducción</h2>

          <h3 className={s.h3}>1.1 Objetivo</h3>
          <p className={s.p}>
            El presente informe tiene como propósito evaluar el uso corporativo de <strong>{solucionTxt}</strong>,
            proporcionada por <strong>{proveedorTxt}</strong>. El análisis examina si su adopción resulta recomendable
            desde una perspectiva de seguridad.
          </p>
          <p className={s.p}>
            El objetivo principal es analizar, a nivel general, las capacidades, limitaciones y riesgos asociados a
            {' '}{solucionTxt}. Esta evaluación permitirá determinar su idoneidad para un posible uso corporativo,
            garantizando al mismo tiempo un nivel adecuado de seguridad de la información, cumplimiento normativo y
            gestión del riesgo.
          </p>

          <h3 className={s.h3}>1.2 Documentos para consulta</h3>
          <p className={s.p}>
            A continuación, se listan las diferentes normas y/o estándares de referencia indispensables para la
            aplicación de este documento.
          </p>
          <ul className={s.ul}>{DOCUMENTOS_REFERENCIA.map((d, i) => <li key={i}>{d}</li>)}</ul>

          <h3 className={s.h3}>1.3 Términos y Definiciones</h3>
          <p className={s.p}>
            Para los fines de este documento, se toman referencias de buenas prácticas, como, por ejemplo:
          </p>
          <ul className={s.ul}>{TERMINOS_DEFINICIONES.map((d, i) => <li key={i}>{d}</li>)}</ul>
        </div>

        {/* ── 2. Metodología ──────────────────────────────────────────────── */}
        <div className={s.section}>
          <h2 className={s.h2}><span className={s.num}>2.</span> Metodología utilizada para la evaluación del impacto y análisis de riesgos</h2>
          {METODOLOGIA_PARRAFOS.map((par, i) => <p key={i} className={s.p}>{par}</p>)}
        </div>

        {/* ── 3. Resultados ───────────────────────────────────────────────── */}
        <div className={s.section}>
          <h2 className={s.h2}><span className={s.num}>3.</span> Resultados</h2>
          <p className={s.p}>
            El análisis de riesgo efectuado, tanto al proveedor del servicio como a la solución, ha permitido
            identificar y valorar diversas amenazas que pueden afectar a la seguridad de la información gestionada por
            el sistema, obteniendo la siguiente tabla de riesgos, que deben ser tratados de acuerdo con la metodología
            establecida.
          </p>

          <table className={s.dataTable}>
            <thead>
              <tr>
                <th>Activo</th>
                <th>Amenaza</th>
                <th>Probabilidad residual</th>
                <th>Zona de Riesgo Residual (riesgo a tratar)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={4} className={s.tdEmpty}>Sin riesgos evaluados.</td></tr>
              ) : (
                [...rows]
                  .sort((a, b) => b.residualScore - a.residualScore)
                  .map(r => (
                    <tr key={r.code}>
                      <td>{solucionTxt}</td>
                      <td><span className={s.codeCell}>{r.code}</span> — {r.name}</td>
                      <td>{PROB_LABELS[r.prob] ?? r.prob}</td>
                      <td>
                        <span className={`${s.zoneBadge} ${s[`zone_${r.residualLevel}`]}`}>
                          {LEVEL_LABEL[r.residualLevel]}
                        </span>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Mapa de riesgos */}
          <p className={s.mapCaption}><strong>Mapa de Riesgos</strong> — Total riesgos: {totalRiesgos}</p>
          <div className={s.mapWrap}>
            <table className={s.mapTable}>
              <thead>
                <tr>
                  <th className={s.mapCorner}>Impacto residual / Probabilidad residual</th>
                  {[1, 2, 3, 4].map(p => <th key={p} className={s.mapAxis}>{PROB_LABELS[p]}</th>)}
                  <th className={s.mapTotal}>Total</th>
                </tr>
              </thead>
              <tbody>
                {[4, 3, 2, 1].map(imp => {
                  const rowCounts = mapCounts[imp - 1];
                  const rowTotal = rowCounts.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={imp}>
                      <td className={s.mapAxis}>{IMP_LABELS[imp]}</td>
                      {[1, 2, 3, 4].map(p => (
                        <td key={p} className={s.mapCell} style={{ background: cellBg(cellLevel(p, imp)) }}>
                          {rowCounts[p - 1] > 0 ? rowCounts[p - 1] : ''}
                        </td>
                      ))}
                      <td className={`${s.mapCell} ${s.mapTotal}`}>{rowTotal}</td>
                    </tr>
                  );
                })}
                <tr>
                  <td className={s.mapTotal}>Total</td>
                  {[1, 2, 3, 4].map(p => {
                    const colTotal = [0, 1, 2, 3].reduce((a, imp) => a + mapCounts[imp][p - 1], 0);
                    return <td key={p} className={`${s.mapCell} ${s.mapTotal}`}>{colTotal}</td>;
                  })}
                  <td className={`${s.mapCell} ${s.mapTotal}`}>{totalRiesgos}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className={s.p}>Como resultado de este análisis, se determinan las siguientes amenazas principales:</p>
          <ul className={s.ul}>
            {amenazasPrincipales.length === 0 ? (
              <li>No se han identificado amenazas con riesgo residual relevante.</li>
            ) : (
              amenazasPrincipales.map(r => (
                <li key={r.code}>
                  <strong>{r.code}</strong> — {r.name} (riesgo residual <em>{LEVEL_LABEL[r.residualLevel].toLowerCase()}</em>)
                </li>
              ))
            )}
          </ul>

          <p className={s.p}>
            Los resultados del análisis de seguridad reflejan el grado de exposición a riesgos asociado a la solución,
            así como a los controles aplicados en materia de acceso, protección de datos y uso de servicios externos.
            La evaluación permite valorar el nivel de adecuación de la solución al marco de seguridad establecido,
            facilitando la identificación de posibles mejoras orientadas a reforzar la protección de la información y
            el cumplimiento de la normativa vigente en materia de seguridad y privacidad.
          </p>
        </div>

        {/* ── 4. Resolución ───────────────────────────────────────────────── */}
        <div className={s.section}>
          <h2 className={s.h2}><span className={s.num}>4.</span> Resolución</h2>

          <h3 className={s.h3}>4.1 Resolución</h3>
          {!resol ? (
            <div className={s.warn}>
              Aún no se ha seleccionado el resultado de la evaluación. Accede a la página <strong>Resultado</strong>
              {' '}(Fase 3) para fijar la resolución y el informe mostrará aquí la conclusión correspondiente.
            </div>
          ) : (
            <>
              <p className={s.resolTitulo}>{resol.titulo}</p>
              {resol.parrafos.map((par, i) => <p key={i} className={s.p}>{par}</p>)}
              {resol.acciones && (
                <ol className={s.accionList}>{resol.acciones.map((a, i) => <li key={i}>{a}</li>)}</ol>
              )}
            </>
          )}

          {/* Firma */}
          <div className={s.firmaGrid}>
            {[
              ['Elaborado por', DOC_PROPS.elaboradoPor],
              ['Revisado por', DOC_PROPS.revisadoPor],
              ['Aprobado por', DOC_PROPS.aprobadoPor],
            ].map(([rol, ent]) => (
              <div key={rol} className={s.firmaCol}>
                <div className={s.firmaLine} />
                <div className={s.firmaName}>{rol}</div>
                <div className={s.firmaRole}>{ent}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function cellLevel(prob: number, imp: number): RiskLevel {
  const sc = prob * imp;
  if (sc >= 9) return 'critico';
  if (sc >= 6) return 'alto';
  if (sc >= 4) return 'medio';
  return 'bajo';
}

function cellBg(lvl: RiskLevel): string {
  switch (lvl) {
    case 'critico': return '#fee2e2';
    case 'alto':    return '#fed7aa';
    case 'medio':   return '#fef9c3';
    default:        return '#dcfce7';
  }
}
