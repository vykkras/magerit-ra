import { useSolicitudStore } from '../../store/solicitudStore';
import s from './InfoGeneral.module.css';

export default function InfoGeneral() {
  const { solicitante, proveedor, referenciaPST, fechaSolicitud, descripcion, departamento, esSolucionICT, set } = useSolicitudStore();

  return (
    <div className={s.page}>

      {/* Header */}
      <div className={s.headerCard}>
        <div>
          <p className={s.headerTitle}>Información General de la Solicitud</p>
          <p className={s.headerSub}>Completa los datos antes de iniciar el proceso MAINS</p>
        </div>
      </div>

      {/* Form */}
      <div className={s.card}>
        <p className={s.cardTitle}>Datos de la solicitud</p>
        <div className={s.grid}>

          <div className={s.field}>
            <label className={s.label}>Solicitante / Responsable</label>
            <input className={s.input} placeholder="Nombre y apellidos" value={solicitante}
              onChange={e => set({ solicitante: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Departamento</label>
            <input className={s.input} placeholder="Ej. IT, Finanzas, RRHH…" value={departamento}
              onChange={e => set({ departamento: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Proveedor / Servicio ICT</label>
            <input className={s.input} placeholder="Nombre del proveedor o solución" value={proveedor}
              onChange={e => set({ proveedor: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Referencia PST (ITSM)</label>
            <input className={s.input} placeholder="Ej. INC-2025-00123" value={referenciaPST}
              onChange={e => set({ referenciaPST: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Fecha de solicitud</label>
            <input className={s.input} type="date" value={fechaSolicitud}
              onChange={e => set({ fechaSolicitud: e.target.value })} />
          </div>

          <div className={`${s.field} ${s.fullWidth}`}>
            <label className={s.label}>Descripción / Razón de la solicitud</label>
            <textarea className={`${s.input} ${s.textarea}`}
              placeholder="Describe brevemente el uso previsto, contexto y necesidad del servicio o solución…"
              value={descripcion}
              onChange={e => set({ descripcion: e.target.value })}
            />
          </div>

        </div>
      </div>

      {/* Decision diamond: ¿Es Solución ICT? */}
      <div className={s.diamond}>
        <div className={s.diamondTop}>
          <span className={s.diamondLabel}>Decisión</span>
        </div>
        <p className={s.diamondQuestion}>¿Es una Solución Proveedor-Servicio ICT?</p>
        <div className={s.yesNo}>
          <button
            className={`${s.btnYes} ${esSolucionICT === true  ? s.btnYesActive : ''}`}
            onClick={() => set({ esSolucionICT: true })}
          >
            Sí
          </button>
          <button
            className={`${s.btnNo}  ${esSolucionICT === false ? s.btnNoActive  : ''}`}
            onClick={() => set({ esSolucionICT: false })}
          >
            No
          </button>
        </div>

        {esSolucionICT === false && (
          <div className={s.outOfScope}>
            <div>
              <p className={s.outOfScopeTitle}>Fuera del alcance del MAINS</p>
              <p className={s.outOfScopeText}>
                Esta solicitud no requiere evaluación por el equipo de Gestión de Riesgos, Ciberseguridad y Cumplimiento.
                El proceso concluye aquí.
              </p>
            </div>
          </div>
        )}

        {esSolucionICT === true && (
          <p className={s.hint}>✓ Continúa en el Cuestionario Preliminar (1) para seleccionar la categoría</p>
        )}
      </div>

    </div>
  );
}
