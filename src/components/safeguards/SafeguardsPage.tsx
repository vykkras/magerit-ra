import { useState, useMemo } from 'react';
import { useSafeguardStore } from '../../store/safeguardStore';
import { SafeguardModal } from './SafeguardModal';
import {
  ISO27001_CONTROLS, ISO27001_CATEGORIES, STATUS_LABELS,
  type ISO27001Category,
} from '../../data/iso27001.data';
import type { Safeguard, SafeguardStatus } from '../../types';

// ── Colores de estado ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<SafeguardStatus, string> = {
  implemented:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  partial:        'bg-amber-100  text-amber-700  border-amber-200',
  planned:        'bg-blue-100   text-blue-700   border-blue-200',
  not_applicable: 'bg-slate-100  text-slate-500  border-slate-200',
  missing:        'bg-red-100    text-red-700    border-red-200',
};

const RESPONSABLE_STYLES = {
  proveedor: { label: 'Proveedor', cls: 'bg-violet-100 text-violet-700 border-violet-200' },
  empresa:   { label: 'Empresa',   cls: 'bg-sky-100    text-sky-700    border-sky-200' },
};

// ── Tarjeta de salvaguarda registrada ────────────────────────────────────────

function SafeguardCard({ sg, onEdit, onDelete }: {
  sg: Safeguard;
  onEdit: (sg: Safeguard) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const statusCls = STATUS_COLORS[sg.status];
  const resp = sg.responsable ? RESPONSABLE_STYLES[sg.responsable] : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
      >
        {/* ISO IDs */}
        <span className="font-mono text-[11px] font-bold text-slate-400 shrink-0 w-20">
          {sg.isoIds.join(', ')}
        </span>
        {/* Name */}
        <span className="flex-1 text-[14px] font-semibold text-slate-800 leading-snug">{sg.name}</span>
        {/* Responsable */}
        {resp && (
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${resp.cls}`}>
            {resp.label}
          </span>
        )}
        {/* Status */}
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border shrink-0 ${statusCls}`}>
          {STATUS_LABELS[sg.status]}
        </span>
        {/* Effectiveness */}
        <span className="text-[12px] font-bold text-slate-500 shrink-0 w-10 text-right">{sg.effectiveness}%</span>
        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4 pt-3 border-t border-slate-100 bg-slate-50/60 flex flex-col gap-3">
          <p className="text-sm text-slate-600 leading-relaxed">{sg.description}</p>

          {sg.threatsMitigated.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold mr-1">Amenazas:</span>
              {sg.threatsMitigated.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 font-mono text-[11px]">{t}</span>
              ))}
            </div>
          )}

          {sg.notes && (
            <p className="text-xs text-slate-500 italic">{sg.notes}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(sg)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Editar
            </button>
            <button
              onClick={() => { if (confirm('¿Eliminar este control?')) onDelete(sg.id); }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Vista del catálogo ISO 27001 (referencia) ────────────────────────────────

function CatalogRow({ controlId, name, isoIds, description }: {
  controlId: string; name: string; isoIds: string[]; description: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-mono text-[11px] font-bold text-slate-400 shrink-0 w-20">
          {isoIds.join(', ')}
        </span>
        <span className="flex-1 text-[13.5px] font-medium text-slate-800 leading-snug">{name}</span>
        <svg
          className={`w-4 h-4 text-slate-300 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-3 border-t border-slate-100 bg-slate-50/60">
          <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">{controlId}</p>
        </div>
      )}
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

type ViewMode = 'registered' | 'catalog';

export default function SafeguardsPage() {
  const { safeguards, deleteSafeguard } = useSafeguardStore();
  const [view, setView] = useState<ViewMode>('registered');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Safeguard | null>(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<ISO27001Category | null>(null);

  const filteredSafeguards = useMemo(() => {
    let list = safeguards;
    if (filterCat) list = list.filter(s => s.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.isoIds.some(id => id.includes(q)) ||
        s.description.toLowerCase().includes(q) ||
        (s.notes ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [safeguards, filterCat, search]);

  const filteredCatalog = useMemo(() => {
    let list = ISO27001_CONTROLS;
    if (filterCat) list = list.filter(c => c.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.isoIds.some(id => id.includes(q)) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filterCat, search]);

  function openNew() { setEditing(null); setModal(true); }
  function openEdit(sg: Safeguard) { setEditing(sg); setModal(true); }
  function closeModal() { setModal(false); setEditing(null); }

  // Summary counts
  const implemented = safeguards.filter(s => s.status === 'implemented').length;
  const partial      = safeguards.filter(s => s.status === 'partial').length;
  const missing      = safeguards.filter(s => s.status === 'missing').length;

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Controles ISO 27001</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {safeguards.length} registrados · {implemented} implementados · {partial} parciales · {missing} sin implementar
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar control…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Registrar control
            </button>
          </div>
        </div>

        {/* View tabs */}
        <div className="flex gap-1 mt-4">
          {([
            { key: 'registered', label: `Registrados (${safeguards.length})` },
            { key: 'catalog',    label: `Catálogo ISO 27001 (${ISO27001_CONTROLS.length})` },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                view === tab.key
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter bar */}
      <div className="bg-white border-b border-slate-100 px-8 py-2 shrink-0 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
            !filterCat ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-500 border-slate-200 hover:border-slate-400'
          }`}
        >
          Todas
        </button>
        {ISO27001_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(filterCat === cat ? null : cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filterCat === cat ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-500 border-slate-200 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">

        {view === 'registered' && (
          filteredSafeguards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400">
              <p className="text-sm">
                {safeguards.length === 0
                  ? 'Aún no has registrado ningún control. Usa "Registrar control" para empezar.'
                  : 'Sin resultados para los filtros actuales.'}
              </p>
            </div>
          ) : (
            ISO27001_CATEGORIES.map(cat => {
              const catSgs = filteredSafeguards.filter(s => s.category === cat);
              if (!catSgs.length) return null;
              return (
                <section key={cat}>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{cat}</h2>
                  <div className="flex flex-col gap-2">
                    {catSgs.map(sg => (
                      <SafeguardCard key={sg.id} sg={sg} onEdit={openEdit} onDelete={deleteSafeguard} />
                    ))}
                  </div>
                </section>
              );
            })
          )
        )}

        {view === 'catalog' && (
          ISO27001_CATEGORIES.map(cat => {
            const items = filteredCatalog.filter(c => c.category === cat);
            if (!items.length) return null;
            return (
              <section key={cat}>
                <div className="flex items-baseline gap-3 mb-3">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cat}</h2>
                  <span className="text-xs text-slate-400">{items.length} controles</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map(c => (
                    <CatalogRow key={c.id} {...c} controlId={c.id} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {modal && <SafeguardModal existing={editing ?? undefined} onClose={closeModal} />}
    </div>
  );
}
