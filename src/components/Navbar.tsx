import React from 'react';
import { Home, Receipt, SlidersHorizontal, Plus } from 'lucide-react';
import { ActiveTab } from '../types';
import { SanoLogo } from './SanoLogo';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenQuickExpense: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickExpense,
}) => {
  return (
    <>
      {/* Top Header */}
      <header
        id="app-header"
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 sm:px-6"
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <SanoLogo size="md" />
            <div>
              <h1 className="text-sm font-black text-slate-800 leading-tight tracking-tight flex items-center gap-1.5">
                <span>Sano</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Saúde & Previsão Financeira</p>
            </div>
          </div>

          <button
            id="btn-quick-add-header"
            onClick={onOpenQuickExpense}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 rounded-full transition-colors"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Lançar</span>
          </button>
        </div>
      </header>

      {/* Bottom Navigation Bar */}
      <nav
        id="app-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-100 shadow-xl px-4 py-2 pb-safe"
      >
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          {/* Tab 1: Início */}
          <button
            id="nav-tab-dashboard"
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'dashboard'
                ? 'text-indigo-600 font-bold scale-102'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <Home size={22} className={activeTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] font-bold mt-1">Início</span>
          </button>

          {/* Center Quick Add Action Button (FAB) */}
          <button
            id="nav-btn-center-add"
            onClick={onOpenQuickExpense}
            className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
            aria-label="Adicionar Novo Gasto"
          >
            <div className="w-13 h-13 rounded-full bg-indigo-600 group-hover:bg-indigo-700 group-active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 transition-all duration-200 border-4 border-white">
              <Plus size={26} className="stroke-[2.8]" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 mt-0.5">Novo Gasto</span>
          </button>

          {/* Tab 2: Extrato / Histórico */}
          <button
            id="nav-tab-statement"
            onClick={() => onTabChange('statement')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'statement'
                ? 'text-indigo-600 font-bold scale-102'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <Receipt size={22} className={activeTab === 'statement' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] font-bold mt-1">Extrato</span>
          </button>

          {/* Tab 3: Ajustes / Categorias */}
          <button
            id="nav-tab-settings"
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'text-indigo-600 font-bold scale-102'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <SlidersHorizontal
              size={22}
              className={activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-2'}
            />
            <span className="text-[10px] font-bold mt-1">Ajustes</span>
          </button>
        </div>
      </nav>
    </>
  );
};
