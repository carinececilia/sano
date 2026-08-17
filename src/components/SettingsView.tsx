import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  User,
  Shield,
  KeyRound,
  ChevronRight,
} from 'lucide-react';
import { Category, FixedItem, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { SanoLogo } from './SanoLogo';

interface SettingsViewProps {
  categories: Category[];
  fixedItems: FixedItem[];
  userProfile?: UserProfile;
  onOpenUserProfile?: () => void;
  onOpenNewCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onOpenNewFixedItem: () => void;
  onEditFixedItem: (item: FixedItem) => void;
  onToggleFixedItem: (id: string, active: boolean) => void;
  onDeleteFixedItem: (id: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetSeedData: () => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  categories,
  fixedItems,
  userProfile,
  onOpenUserProfile,
  onOpenNewCategory,
  onEditCategory,
  onDeleteCategory,
  onOpenNewFixedItem,
  onEditFixedItem,
  onToggleFixedItem,
  onDeleteFixedItem,
  onExportData,
  onImportData,
  onResetSeedData,
  onClearAllData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'fixed' | 'data'>('categories');

  const fixedIncomes = fixedItems.filter((i) => i.type === 'income');
  const fixedExpenses = fixedItems.filter((i) => i.type === 'expense');

  const totalFixedIncome = fixedIncomes
    .filter((i) => i.active)
    .reduce((sum, i) => sum + i.amount, 0);

  const totalFixedExpense = fixedExpenses
    .filter((i) => i.active)
    .reduce((sum, i) => sum + i.amount, 0);

  const getCategory = (catId: string) =>
    categories.find((c) => c.id === catId) || {
      name: 'Geral',
      icon: 'Tag',
      color: '#6366f1',
      bgLight: '#eef2ff',
      textColor: '#4338ca',
    };

  return (
    <div id="view-settings" className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-4">
      {/* User Profile Card Banner */}
      {onOpenUserProfile && (
        <button
          id="btn-settings-user-profile"
          type="button"
          onClick={onOpenUserProfile}
          className="w-full bg-white border border-slate-100 rounded-3xl p-4 shadow-xs flex items-center justify-between hover:bg-slate-50/80 transition-all text-left group"
        >
          <div className="flex items-center gap-3">
            {userProfile?.photoUrl ? (
              <img
                src={userProfile.photoUrl}
                alt={userProfile.name}
                className="w-12 h-12 rounded-full object-cover border border-indigo-200 shadow-xs"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base border border-indigo-100">
                {userProfile?.name ? userProfile.name.slice(0, 2).toUpperCase() : <User size={22} />}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800">
                  {userProfile?.name || 'Meu Perfil'}
                </span>
                {userProfile?.isPinEnabled && (
                  <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md flex items-center gap-1 border border-indigo-100">
                    <KeyRound size={10} /> PIN Ativo
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {userProfile?.email || 'Editar nome, foto e senha de acesso'}
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
            <ChevronRight size={16} />
          </div>
        </button>
      )}

      {/* Settings Navigation Tabs */}
      <div className="bg-slate-100 p-1 rounded-2xl grid grid-cols-3 gap-1 text-xs font-bold">
        <button
          id="tab-settings-categories"
          onClick={() => setActiveSubTab('categories')}
          className={`py-2 rounded-xl transition-all ${
            activeSubTab === 'categories'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Categorias
        </button>

        <button
          id="tab-settings-fixed"
          onClick={() => setActiveSubTab('fixed')}
          className={`py-2 rounded-xl transition-all ${
            activeSubTab === 'fixed'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Recorrência
        </button>

        <button
          id="tab-settings-data"
          onClick={() => setActiveSubTab('data')}
          className={`py-2 rounded-xl transition-all ${
            activeSubTab === 'data'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Restaurar
        </button>
      </div>

      {/* 1. GERENCIAMENTO DE CATEGORIAS */}
      {activeSubTab === 'categories' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Categorias</h3>
              <p className="text-xs text-slate-400">
                Estrutura de nível único para agilidade
              </p>
            </div>
            <button
              id="btn-add-category-settings"
              onClick={onOpenNewCategory}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus size={14} />
              <span>Nova</span>
            </button>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-3 hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.bgLight, color: cat.textColor }}
                  >
                    <CategoryIcon name={cat.icon} size={16} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {cat.type === 'expense' ? 'Gasto' : 'Receita'}
                      {cat.isDefault ? ' • Padrão' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditCategory(cat)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Editar categoria"
                  >
                    <Edit2 size={14} />
                  </button>

                  {!cat.isDefault && (
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Excluir categoria"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. RECORRÊNCIA FIXA */}
      {activeSubTab === 'fixed' && (
        <div className="space-y-3">
          {/* Header Card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Itens Recorrentes</h3>
                <p className="text-xs text-slate-400">
                  Alimentam o cálculo da Previsão do Mês
                </p>
              </div>
              <button
                id="btn-add-fixed-item"
                onClick={onOpenNewFixedItem}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs transition-colors"
              >
                <Plus size={14} />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Summary badges */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3">
                <span className="text-[10px] text-indigo-900 font-bold uppercase tracking-wider block">
                  Receitas Fixas
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-600 block mt-0.5">
                  +{formatCurrency(totalFixedIncome)}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Gastos Fixos
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-0.5">
                  -{formatCurrency(totalFixedExpense)}
                </span>
              </div>
            </div>
          </div>

          {/* List of Fixed Items */}
          <div className="space-y-2">
            {fixedItems.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center text-xs text-slate-400">
                Nenhum item fixo cadastrado. Adicione seu salário ou contas mensais.
              </div>
            ) : (
              fixedItems.map((item) => {
                const cat = getCategory(item.categoryId);
                const isIncome = item.type === 'income';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between gap-2.5 transition-all ${
                      item.active ? 'hover:border-slate-200' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: cat.bgLight, color: cat.textColor }}
                      >
                        <CategoryIcon name={cat.icon} size={15} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {item.description}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            (Dia {item.dayOfMonth})
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            isIncome ? 'text-emerald-600' : 'text-slate-800'
                          }`}
                        >
                          {isIncome ? `+${formatCurrency(item.amount)}` : `-${formatCurrency(item.amount)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Active toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.active}
                          onChange={(e) => onToggleFixedItem(item.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>

                      <button
                        onClick={() => onEditFixedItem(item)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                        title="Editar item fixo"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        onClick={() => onDeleteFixedItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        title="Excluir item fixo"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. DADOS E BACKUP */}
      {activeSubTab === 'data' && (
        <div className="space-y-3">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Backup & Gestão de Dados</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Seus dados ficam armazenados com privacidade no seu navegador.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* Reset to Seed Data */}
              <button
                id="btn-reset-seed-data"
                onClick={onResetSeedData}
                className="w-full py-3 px-4 bg-indigo-50/60 hover:bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles size={15} />
                <span>Restaurar Dados de Exemplo</span>
              </button>

              {/* Clear All */}
              <button
                id="btn-clear-all-data"
                onClick={onClearAllData}
                className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100/70 text-rose-700 border border-rose-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 size={15} />
                <span>Limpar Todos os Registros</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Identity & Version Card */}
      <div className="pt-2 pb-4 flex flex-col items-center justify-center text-center space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
        <SanoLogo size="sm" />
        <p className="text-xs font-bold text-slate-700">Sano • Saúde Financeira</p>
        <p className="text-[10px] text-slate-400">Versão 1.0 • Armazenamento Local Seguro</p>
      </div>
    </div>
  );
};
