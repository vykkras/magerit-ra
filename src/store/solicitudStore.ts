import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SolicitudState {
  solicitante: string;
  proveedor: string;
  referenciaPST: string;
  fechaSolicitud: string;
  descripcion: string;
  departamento: string;
  esSolucionICT: boolean | null;
  categoriaId: string | null;
  esHerramientaIA: boolean | null;
}

interface SolicitudStore extends SolicitudState {
  set: (updates: Partial<SolicitudState>) => void;
  reset: () => void;
}

const INITIAL: SolicitudState = {
  solicitante: '',
  proveedor: '',
  referenciaPST: '',
  fechaSolicitud: new Date().toISOString().slice(0, 10),
  descripcion: '',
  departamento: '',
  esSolucionICT: null,
  categoriaId: null,
  esHerramientaIA: null,
};

export const useSolicitudStore = create<SolicitudStore>()(
  persist(
    (setState) => ({
      ...INITIAL,
      set: (updates) => setState(s => ({ ...s, ...updates })),
      reset: () => setState(INITIAL),
    }),
    { name: 'magerit-solicitud-v1' }
  )
);
