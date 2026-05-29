import { useSolicitudStore } from '../../store/solicitudStore';
import s from './InfoGeneral.module.css';

export default function InfoGeneral() {
  const { solicitante, departamento, proveedor, solucion, tipoSolucion, referenciaPST, fechaSolicitud, set } = useSolicitudStore();

  return (
    <div className={s.page}>

      <div className={s.headerCard}>
        <div>
          <p className={s.headerTitle}>Información General de la Solicitud</p>
          <p className={s.headerSub}>Completa los datos antes de iniciar el proceso MAINS</p>
        </div>
      </div>

      <div className={s.card}>
        <p className={s.cardTitle}>Datos de la solicitud</p>
        <div className={s.grid}>

          <div className={s.field}>
            <label className={s.label}>Fecha de solicitud</label>
            <input className={s.input} type="date" value={fechaSolicitud}
              onChange={e => set({ fechaSolicitud: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Número de PST</label>
            <input className={s.input} placeholder="Ej. PST-2025-00123" value={referenciaPST}
              onChange={e => set({ referenciaPST: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Solicitante</label>
            <input className={s.input} placeholder="Nombre y apellidos" value={solicitante}
              onChange={e => set({ solicitante: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Área del Solicitante</label>
            <input className={s.input} placeholder="Ej. IT, Finanzas, RRHH…" value={departamento}
              onChange={e => set({ departamento: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Proveedor</label>
            <input className={s.input} placeholder="Nombre del proveedor" value={proveedor}
              onChange={e => set({ proveedor: e.target.value })} />
          </div>

          <div className={s.field}>
            <label className={s.label}>Solución</label>
            <input className={s.input} placeholder="Nombre de la solución o servicio" value={solucion}
              onChange={e => set({ solucion: e.target.value })} />
          </div>

          <div className={`${s.field} ${s.fullWidth}`}>
            <label className={s.label}>Tipo de solución</label>
            <div className={s.tipoToggle}>
              <button
                className={`${s.tipoBtn} ${tipoSolucion === 'continuado' ? s.tipoBtnActive : ''}`}
                onClick={() => set({ tipoSolucion: 'continuado' })}
              >
                Continuado
              </button>
              <button
                className={`${s.tipoBtn} ${tipoSolucion === 'puntual' ? s.tipoBtnActive : ''}`}
                onClick={() => set({ tipoSolucion: 'puntual' })}
              >
                Puntual
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
