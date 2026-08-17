import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  PieChart,
  Trash2,
  Repeat,
  CreditCard,
  Wallet,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Transaction, Category, FixedItem } from '../types';
import {
  formatCurrency,
  getMonthYearLabel,
  getNextMonthKey,
  getPreviousMonthKey,
  getCurrentMonthKey,
  formatDateBR,
} from '../utils/formatters';
import { calculateMonthTotals } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';

interface StatementViewProps {
  transactions: Transaction[];
  fixedItems: FixedItem[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
  onOpenQuickExpense: () => void;
  onNavigateToFixed?: () => void;
}

interface StatementItem {
  id: string;
  originalTxId?: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  categoryId: string;
  paymentMethod: 'cash_debit_pix' | 'fixed' | 'credit_card';
  date: string;
  installmentsTotal?: number;
  installmentCurrent?: number;
  isFixed?: boolean;
  isRecurring?: boolean;
  isSurplus?: boolean;
  canDelete?: boolean;
}

export const StatementView: React.FC<StatementViewProps> = ({
  transactions,
  fixedItems,
  categories,
  onDeleteTransaction,
  onOpenQuickExpense,
  onNavigateToFixed,
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(getCurrentMonthKey());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'expense' | 'income' | 'credit_card' | 'fixed'>('all');

  const monthLabel = getMonthYearLabel(selectedMonthKey);

  // Month navigation
  const handlePrevMonth = () => {
    setSelectedMonthKey(getPreviousMonthKey(selectedMonthKey));
  };
  const handleNextMonth = () => {
    setSelectedMonthKey(getNextMonthKey(selectedMonthKey));
  };
  const handleCurrentMonth = () => {
    setSelectedMonthKey(getCurrentMonthKey());
  };

  // Unified month totals calculation (identical formula to MonthlyComparisonChart)
  const monthTotals = calculateMonthTotals(selectedMonthKey, fixedItems, transactions);
  const totalExpense = monthTotals.totalExpenses;
  const totalIncome = monthTotals.totalIncomes;
  const netBalance = monthTotals.netBalance;

  // Build the complete list of items for the selected month:
  // 1. Recurring Fixed Incomes
  const activeFixedIncomes: StatementItem[] = fixedItems
    .filter((item) => item.active && item.type === 'income')
    .map((item) => ({
      id: `fixed-inc-${item.id}-${selectedMonthKey}`,
      description: item.description,
      amount: item.amount,
      type: 'income',
      categoryId: item.categoryId,
      paymentMethod: 'fixed',
      date: `${selectedMonthKey}-${String(item.dayOfMonth || 1).padStart(2, '0')}`,
      isFixed: true,
      isRecurring: true,
      canDelete: false,
    }));

  // 2. Recurring Fixed Expenses
  const activeFixedExpenses: StatementItem[] = fixedItems
    .filter((item) => item.active && item.type === 'expense')
    .map((item) => ({
      id: `fixed-exp-${item.id}-${selectedMonthKey}`,
      description: item.description,
      amount: item.amount,
      type: 'expense',
      categoryId: item.categoryId,
      paymentMethod: 'fixed',
      date: `${selectedMonthKey}-${String(item.dayOfMonth || 1).padStart(2, '0')}`,
      isFixed: true,
      isRecurring: true,
      canDelete: false,
    }));

  // 3. Saldo Anterior Positivo (se o mês anterior fechou com receitas > despesas)
  const surplusItem: StatementItem[] =
    monthTotals.previousMonthBalance > 0
      ? [
          {
            id: `surplus-${selectedMonthKey}`,
            description: `Saldo Anterior (${getMonthYearLabel(getPreviousMonthKey(selectedMonthKey))})`,
            amount: monthTotals.previousMonthBalance,
            type: 'income',
            categoryId: 'cat-invest',
            paymentMethod: 'cash_debit_pix',
            date: `${selectedMonthKey}-01`,
            isSurplus: true,
            canDelete: false,
          },
        ]
      : [];

  // 4. Added / Variable Transactions (including credit card installments, avulsos, etc.)
  // Filter out any legacy tx with isFixed: true to avoid double counting with active fixedItems
  const variableTxs: StatementItem[] = transactions
    .filter((tx) => tx.date.startsWith(selectedMonthKey) && !tx.isFixed)
    .map((tx) => ({
      id: tx.id,
      originalTxId: tx.id,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      categoryId: tx.categoryId,
      paymentMethod: tx.paymentMethod,
      date: tx.date,
      installmentsTotal: tx.installmentsTotal,
      installmentCurrent: tx.installmentCurrent,
      isFixed: tx.isFixed,
      isRecurring: false,
      canDelete: true,
    }));

  // Combined complete list of items for this month
  const allMonthItems: StatementItem[] = [
    ...activeFixedIncomes,
    ...activeFixedExpenses,
    ...surplusItem,
    ...variableTxs,
  ];

  // Category breakdown for all expenses in this month (Fixed Expenses + Variable Expenses + Card Installments)
  const categoryTotals: Record<string, number> = {};
  allMonthItems
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      categoryTotals[item.categoryId] = (categoryTotals[item.categoryId] || 0) + item.amount;
    });

  const sortedCategoryBreakdown = Object.entries(categoryTotals)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId) || {
        id: catId,
        name: 'Outros',
        icon: 'Package',
        color: '#6366f1',
        bgLight: '#eef2ff',
        textColor: '#4338ca',
        type: 'expense' as const,
      };
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return { category: cat, amount, percentage };
    })
    .sort((a, b) => b.amount - a.amount);

  // Filtered list for display
  const filteredItems = allMonthItems
    .filter((item) => {
      if (selectedFilter === 'expense' && item.type !== 'expense') return false;
      if (selectedFilter === 'income' && item.type !== 'income') return false;
      if (selectedFilter === 'credit_card' && item.paymentMethod !== 'credit_card') return false;
      if (selectedFilter === 'fixed' && !item.isRecurring && !item.isFixed) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === item.categoryId);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchCat = cat?.name.toLowerCase().includes(query);
        if (!matchDesc && !matchCat) return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCategory = (catId: string) =>
    categories.find((c) => c.id === catId) || {
      name: 'Outros',
      icon: 'Package',
      color: '#64748b',
      bgLight: '#f8fafc',
      textColor: '#334155',
    };

  return (
    <div id="view-statement" className="space-y-4 pb-24 max-w-md mx-auto px-4 pt-4">
      {/* 1. Month / Year Selector Header */}
      <section
        id="section-month-selector"
        className="bg-white border border-slate-100 rounded-3xl p-3 shadow-xs flex items-center justify-between"
      >
        <button
          id="btn-prev-month"
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Mês Anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-slate-800">{monthLabel}</h2>
          {selectedMonthKey !== getCurrentMonthKey() ? (
            <button
              onClick={handleCurrentMonth}
              className="text-[10px] text-indigo-600 font-bold hover:underline"
            >
              Voltar ao Mês Atual
            </button>
          ) : (
            <span className="text-[10px] text-slate-400 font-medium">Mês em andamento</span>
          )}
        </div>

        <button
          id="btn-next-month"
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Próximo Mês"
        >
          <ChevronRight size={18} />
        </button>
      </section>

      {/* 2. Month Financial Summary (Totalmente sincronizado com o gráfico) */}
      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Entradas
          </span>
          <span className="text-xs sm:text-sm font-bold text-emerald-600 block mt-1">
            {formatCurrency(totalIncome)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {monthTotals.totalFixedIncomes > 0 && `Fixas: ${formatCurrency(monthTotals.totalFixedIncomes)}`}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Gastos
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 block mt-1">
            {formatCurrency(totalExpense)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {monthTotals.totalFixedExpenses > 0 && `Fixos: ${formatCurrency(monthTotals.totalFixedExpenses)}`}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Resultado
          </span>
          <span
            className={`text-xs sm:text-sm font-bold block mt-1 ${
              netBalance >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {formatCurrency(netBalance)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {netBalance >= 0 ? 'Positivo' : 'Déficit'}
          </span>
        </div>
      </section>

      {/* 3. TOTAL GASTO POR CATEGORIA NAQUELE MÊS (Inclui Fixos + Parcelas + Avulsos) */}
      <section
        id="section-category-breakdown"
        className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <PieChart size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Gastos por Categoria
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-700">
            Total: {formatCurrency(totalExpense)}
          </span>
        </div>

        {sortedCategoryBreakdown.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2 text-center">
            Nenhum gasto registrado neste mês para categorizar.
          </p>
        ) : (
          <div className="space-y-3 pt-1">
            {sortedCategoryBreakdown.map(({ category, amount, percentage }) => (
              <div key={category.id} className="space-y-1">
                {/* Category Row Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: category.bgLight, color: category.textColor }}
                    >
                      <CategoryIcon name={category.icon} size={13} />
                    </div>
                    <span className="font-bold text-slate-800 truncate">{category.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>

                  <span className="font-bold text-slate-800 shrink-0">
                    {formatCurrency(amount)}
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(3, percentage))}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Transactions & Recurring Items List with Search & Filter */}
      <section id="section-monthly-history" className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-white border border-slate-100 rounded-2xl pl-10 pr-4 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({allMonthItems.length})
          </button>

          <button
            onClick={() => setSelectedFilter('expense')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'expense'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Gastos
          </button>

          <button
            onClick={() => setSelectedFilter('income')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Entradas
          </button>

          <button
            onClick={() => setSelectedFilter('fixed')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'fixed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Recorrentes / Fixos
          </button>

          <button
            onClick={() => setSelectedFilter('credit_card')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'credit_card'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Cartão de Crédito
          </button>
        </div>

        {/* List of Filtered Items */}
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 text-center text-xs text-slate-400 space-y-2">
            <p>Nenhuma transação encontrada com os filtros selecionados.</p>
            <button
              onClick={onOpenQuickExpense}
              className="inline-flex items-center gap-1 text-indigo-600 font-bold hover:underline text-xs"
            >
              <Plus size={13} />
              <span>Adicionar lançamento neste mês</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const cat = getCategory(item.categoryId);
              const isExpense = item.type === 'expense';

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-xs border border-slate-100 hover:border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                      style={{
                        backgroundColor: item.isSurplus ? '#ecfdf5' : cat.bgLight,
                        color: item.isSurplus ? '#059669' : cat.textColor,
                      }}
                    >
                      {item.isSurplus ? (
                        <Sparkles size={18} className="text-emerald-600" />
                      ) : (
                        <CategoryIcon name={cat.icon} size={18} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                        <span>{formatDateBR(item.date)}</span>
                        <span>•</span>
                        <span className="truncate">
                          {item.isSurplus ? 'Saldo Anterior' : cat.name}
                        </span>

                        {/* Badges */}
                        {item.isRecurring && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                            <Repeat size={9} />
                            <span>Recorrente</span>
                          </span>
                        )}

                        {item.isSurplus && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                            <Sparkles size={9} />
                            <span>Sobra positiva</span>
                          </span>
                        )}

                        {item.paymentMethod === 'credit_card' && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 bg-violet-50 text-violet-600 rounded-md border border-violet-100">
                            <CreditCard size={9} />
                            <span>
                              {item.installmentsTotal && item.installmentsTotal > 1
                                ? `${item.installmentCurrent}/${item.installmentsTotal}`
                                : 'Crédito'}
                            </span>
                          </span>
                        )}

                        {item.paymentMethod === 'cash_debit_pix' && !item.isSurplus && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-slate-400 px-1.5 py-0.2 bg-slate-50 rounded-md">
                            <Wallet size={9} />
                            <span>À vista</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isExpense ? 'text-slate-800' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense
                        ? `- ${formatCurrency(item.amount)}`
                        : `+ ${formatCurrency(item.amount)}`}
                    </span>

                    {item.canDelete && item.originalTxId ? (
                      <button
                        onClick={() => onDeleteTransaction(item.originalTxId!)}
                        className="w-7 h-7 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors opacity-80 sm:opacity-0 group-hover:opacity-100"
                        title="Excluir lançamento avulso"
                        aria-label="Excluir"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : item.isRecurring ? (
                      <span
                        className="text-[10px] text-slate-300 font-bold px-1"
                        title="Configurado em Gastos Fixos"
                      >
                        Fixo
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
