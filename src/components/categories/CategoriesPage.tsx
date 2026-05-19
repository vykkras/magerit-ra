import { useState, useMemo } from 'react';
import { useCategoryStore, getCategorySafeguards } from '../../store/categoryStore';
import { MAGERIT_THREATS, GROUP_LABELS } from '../../data/threats.data';
import { SAFEGUARD_CATALOG, FAMILY_META } from '../../data/safeguards.data';
import type { Category } from '../../store/categoryStore';

// ── Helpers ──────────────────────────────────────────────────────────────────

const GROUP_COLOR: Record<string, string> = {
  N: 'bg-blue-100 text-blue-800',
  I: 'bg-orange-100 text-orange-800',
  E: 'bg-yellow-100 text-yellow-800',
  A: 'bg-red-100 text-red-800',
};

const FAMILY_COLOR: Record<string, string> = {
  H: 'bg-slate-100 text-slate-700',
  D: 'bg-blue-100 text-blue-700',
  K: 'bg-indigo-100 text-indigo-700',
  S: 'bg-cyan-100 text-cyan-700',
  SW: 'bg-teal-100 text-teal-700',
  HW: 'bg-green-100 text-green-700',
  COM: 'bg-emerald-100 text-emerald-700',
  IP: 'bg-lime-100 text-lime-700',
  MP: 'bg-yellow-100 text-yellow-700',
  AUX: 'bg-amber-100 text-amber-700',
  L: 'bg-orange-100 text-orange-700',
  PS: 'bg-red-100 text-red-700',
  G: 'bg-rose-100 text-rose-700',
  BC: 'bg-purple-100 text-purple-700',
  E: 'bg-violet-100 text-violet-700',
  NEW: 'bg-fuchsia-100 text-fuchsia-700',
};

// ── Threat Picker Modal ───────────────────────────────────────────────────────

function ThreatPickerModal({
  assignedCodes,
  onSelect,
  onClose,
}: {
  assignedCodes: string[];
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return MAGERIT_THREATS.filter(
      t => !assignedCodes.includes(t.code) &&
        (t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    );
  }, [query, assignedCodes]);

  const groups = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach(t => { (map[t.group] ??= []).push(t); });
    return map;
  }, [filtered]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-slate-800">Agregar riesgo</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="px-4 py-3 border-b">
          <input
            autoFocus
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Buscar amenaza por código o nombre…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {Object.keys(groups).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">Sin resultados</p>
          )}
          {(['N', 'I', 'E', 'A'] as const).map(g => {
            if (!groups[g]?.length) return null;
            return (
              <div key={g}>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{GROUP_LABELS[g]}</p>
                <div className="space-y-1">
                  {groups[g].map(t => (
                    <button
                      key={t.code}
                      onClick={() => { onSelect(t.code); onClose(); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${GROUP_COLOR[g]}`}>{t.code}</span>
                        <span className="text-sm font-semibold text-slate-700">{t.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 ml-8">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Safeguard Picker Modal ────────────────────────────────────────────────────

function SafeguardPickerModal({
  assignedCodes,
  onSelect,
  onClose,
}: {
  assignedCodes: string[];
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return SAFEGUARD_CATALOG.filter(
      s => !assignedCodes.includes(s.code) &&
        (s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    );
  }, [query, assignedCodes]);

  const byFamily = useMemo(() => {
    const map: Record<string, typeof filtered> = {};
    filtered.forEach(s => { (map[s.family] ??= []).push(s); });
    return map;
  }, [filtered]);

  const families = Object.keys(byFamily) as (keyof typeof FAMILY_META)[];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="font-bold text-slate-800">Agregar salvaguarda</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        <div className="px-4 py-3 border-b">
          <input
            autoFocus
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Buscar salvaguarda por código o nombre…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {families.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">Sin resultados</p>
          )}
          {families.map(f => (
            <div key={f}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                {FAMILY_META[f]?.label ?? f}
              </p>
              <div className="space-y-1">
                {byFamily[f].map(s => (
                  <button
                    key={s.code}
                    onClick={() => { onSelect(s.code); onClose(); }}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${FAMILY_COLOR[f] ?? 'bg-slate-100 text-slate-700'}`}>{s.code}</span>
                      <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Risk Card ─────────────────────────────────────────────────────────────────

function RiskCard({
  categoryId,
  threatCode,
  safeguardCodes,
}: {
  categoryId: string;
  threatCode: string;
  safeguardCodes: string[];
}) {
  const { removeRisk, addSafeguard, removeSafeguard } = useCategoryStore();
  const [showSgPicker, setShowSgPicker] = useState(false);

  const threat = MAGERIT_THREATS.find(t => t.code === threatCode);
  const group  = threat?.group ?? 'E';

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${GROUP_COLOR[group]}`}>{threatCode}</span>
            <span className="text-sm font-semibold text-slate-800">{threat?.name ?? threatCode}</span>
          </div>
          <button
            onClick={() => removeRisk(categoryId, threatCode)}
            className="text-slate-300 hover:text-red-500 transition-colors shrink-0 text-lg leading-none"
            title="Quitar riesgo"
          >×</button>
        </div>

        {/* Description */}
        {threat?.description && (
          <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{threat.description}</p>
        )}

        {/* Safeguards */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {safeguardCodes.length === 0 && (
            <span className="text-xs text-slate-400 italic">Sin salvaguardas asignadas</span>
          )}
          {safeguardCodes.map(sc => {
            const entry = SAFEGUARD_CATALOG.find(s => s.code === sc);
            const fam   = entry?.family ?? 'H';
            return (
              <span
                key={sc}
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${FAMILY_COLOR[fam] ?? 'bg-slate-100 text-slate-700'}`}
                title={entry?.name}
              >
                {sc}
                <button
                  onClick={() => removeSafeguard(categoryId, threatCode, sc)}
                  className="opacity-60 hover:opacity-100 ml-0.5 leading-none"
                >×</button>
              </span>
            );
          })}
          <button
            onClick={() => setShowSgPicker(true)}
            className="text-[11px] font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-400 px-2 py-0.5 rounded-full transition-colors"
          >
            + Salvaguarda
          </button>
        </div>
      </div>

      {showSgPicker && (
        <SafeguardPickerModal
          assignedCodes={safeguardCodes}
          onSelect={sc => addSafeguard(categoryId, threatCode, sc)}
          onClose={() => setShowSgPicker(false)}
        />
      )}
    </>
  );
}

// ── Category Detail ───────────────────────────────────────────────────────────

function CategoryDetail({ category }: { category: Category }) {
  const { addRisk } = useCategoryStore();
  const [showThreatPicker, setShowThreatPicker] = useState(false);

  const categorySafeguards = getCategorySafeguards(category);

  const sgByFamily = useMemo(() => {
    const map: Record<string, string[]> = {};
    categorySafeguards.forEach(sc => {
      const entry = SAFEGUARD_CATALOG.find(s => s.code === sc);
      const fam   = entry?.family ?? 'H';
      (map[fam] ??= []).push(sc);
    });
    return map;
  }, [categorySafeguards]);

  const assignedThreatCodes = category.risks.map(r => r.threatCode);

  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ── Riesgos ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">
              Riesgos
              <span className="ml-2 text-sm font-normal text-slate-400">({category.risks.length})</span>
            </h2>
            <button
              onClick={() => setShowThreatPicker(true)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              + Agregar riesgo
            </button>
          </div>

          {category.risks.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
              <p className="text-sm text-slate-400">Sin riesgos asignados.</p>
              <button
                onClick={() => setShowThreatPicker(true)}
                className="mt-3 text-sm text-red-600 font-semibold hover:underline"
              >
                + Agregar el primero
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {category.risks.map(r => (
                <RiskCard
                  key={r.threatCode}
                  categoryId={category.id}
                  threatCode={r.threatCode}
                  safeguardCodes={r.safeguardCodes}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Salvaguardas de la categoría (auto-derived) ── */}
        <section>
          <h2 className="text-base font-bold text-slate-800 mb-1">
            Salvaguardas de la Categoría
            <span className="ml-2 text-sm font-normal text-slate-400">
              ({categorySafeguards.length} · derivadas automáticamente)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            Unión de todas las salvaguardas asignadas a los riesgos de esta categoría.
          </p>

          {categorySafeguards.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
              <p className="text-sm text-slate-400">Agrega riesgos con salvaguardas para verlas aquí.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(sgByFamily).map(([fam, codes]) => (
                <div key={fam} className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                    {FAMILY_META[fam as keyof typeof FAMILY_META]?.label ?? fam}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {codes.map(sc => {
                      const entry = SAFEGUARD_CATALOG.find(s => s.code === sc);
                      return (
                        <span
                          key={sc}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${FAMILY_COLOR[fam] ?? 'bg-slate-100 text-slate-700'}`}
                          title={entry?.name}
                        >
                          <span>{sc}</span>
                          <span className="font-normal opacity-75">— {entry?.name}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showThreatPicker && (
        <ThreatPickerModal
          assignedCodes={assignedThreatCodes}
          onSelect={code => addRisk(category.id, code)}
          onClose={() => setShowThreatPicker(false)}
        />
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { categories } = useCategoryStore();
  const [selectedId, setSelectedId] = useState<string>(categories[0]?.id ?? '');

  const selected = categories.find(c => c.id === selectedId);

  return (
    <div className="flex h-full">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Categorías</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {categories.map(c => {
            const active = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-l-[3px] ${
                  active
                    ? 'border-red-500 bg-red-50 text-red-700 font-semibold'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {c.name}
                {c.risks.length > 0 && (
                  <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                    active ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.risks.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
              <h1 className="text-lg font-bold text-slate-900">{selected.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {selected.risks.length} riesgo{selected.risks.length !== 1 ? 's' : ''} ·{' '}
                {getCategorySafeguards(selected).length} salvaguarda{getCategorySafeguards(selected).length !== 1 ? 's' : ''}
              </p>
            </div>
            <CategoryDetail category={selected} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Selecciona una categoría
          </div>
        )}
      </div>
    </div>
  );
}
