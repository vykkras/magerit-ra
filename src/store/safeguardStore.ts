import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Safeguard, SafeguardStatus, SafeguardResponsable } from '../types';

let _counter = 1;
function nextId(): string {
  return `SG-${String(_counter++).padStart(3, '0')}`;
}

interface SafeguardStore {
  safeguards: Safeguard[];
  addSafeguard: (data: Omit<Safeguard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSafeguard: (id: string, data: Partial<Omit<Safeguard, 'id' | 'createdAt'>>) => void;
  deleteSafeguard: (id: string) => void;
  updateStatus: (id: string, status: SafeguardStatus) => void;
  updateResponsable: (id: string, responsable: SafeguardResponsable | null) => void;
}

export const useSafeguardStore = create<SafeguardStore>()(
  persist(
    (set, get) => ({
      safeguards: [],

      addSafeguard(data) {
        const now = new Date().toISOString();
        const existing = get().safeguards;
        if (existing.length > 0) {
          const nums = existing.map(s => parseInt(s.id.replace('SG-', ''), 10)).filter(n => !isNaN(n));
          _counter = (Math.max(...nums) || 0) + 1;
        }
        const sg: Safeguard = { ...data, id: nextId(), createdAt: now, updatedAt: now };
        set(s => ({ safeguards: [...s.safeguards, sg] }));
      },

      updateSafeguard(id, data) {
        set(s => ({
          safeguards: s.safeguards.map(sg =>
            sg.id === id ? { ...sg, ...data, updatedAt: new Date().toISOString() } : sg
          ),
        }));
      },

      deleteSafeguard(id) {
        set(s => ({ safeguards: s.safeguards.filter(sg => sg.id !== id) }));
      },

      updateStatus(id, status) {
        set(s => ({
          safeguards: s.safeguards.map(sg =>
            sg.id === id ? { ...sg, status, updatedAt: new Date().toISOString() } : sg
          ),
        }));
      },

      updateResponsable(id, responsable) {
        set(s => ({
          safeguards: s.safeguards.map(sg =>
            sg.id === id ? { ...sg, responsable, updatedAt: new Date().toISOString() } : sg
          ),
        }));
      },
    }),
    { name: 'magerit-safeguards-v2' }
  )
);
