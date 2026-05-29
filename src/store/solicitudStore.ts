import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TipoSolucion = 'continuado' | 'puntual' | null;
export type ResultadoEval = 'ok' | 'ok-condiciones' | 'ko' | null;

export interface SolicitudState {
  solicitante: string;
  departamento: string;
  proveedor: string;
  solucion: string;
  tipoSolucion: TipoSolucion;
  referenciaPST: string;
  fechaSolicitud: string;
  categoriaId: string | null;
  tprmScore: number | null;
  resultado: ResultadoEval;
}

interface SolicitudStore extends SolicitudState {
  set: (updates: Partial<SolicitudState>) => void;
  reset: () => void;
}

const INITIAL: SolicitudState = {
  solicitante: '',
  departamento: '',
  proveedor: '',
  solucion: '',
  tipoSolucion: null,
  referenciaPST: '',
  fechaSolicitud: new Date().toISOString().slice(0, 10),
  categoriaId: null,
  tprmScore: null,
  resultado: null,
};

export const useSolicitudStore = create<SolicitudStore>()(
  persist(
    (setState) => ({
      ...INITIAL,
      set: (updates) => setState(s => ({ ...s, ...updates })),
      reset: () => setState(INITIAL),
    }),
    { name: 'magerit-solicitud-v2' }
  )
);
