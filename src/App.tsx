import CategoriesPage from './components/categories/CategoriesPage';

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-slate-100">
      {/* ── Header ── */}
      <header className="bg-slate-900 text-white shrink-0 flex items-stretch">
        <div className="flex items-center gap-3 px-5 border-r border-slate-700 shrink-0">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-sm font-black">M</div>
          <div>
            <p className="text-sm font-bold leading-tight tracking-tight">MAGERIT Risk</p>
            <p className="text-[11px] text-slate-400 leading-tight">Categorías · Riesgos · Salvaguardas</p>
          </div>
        </div>
        <div className="flex items-center px-5 border-b-[3px] border-red-500 bg-slate-800">
          <span className="text-[13px] font-semibold text-white">Categorías</span>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 min-h-0 flex flex-col bg-slate-50">
        <CategoriesPage />
      </main>
    </div>
  );
}
