import React from 'react';
import {
  TrendingDown,
  TrendingUp,
  ReceiptText,
  User,
} from 'lucide-react';
import { Transaction, Category, MonthForecast, UserProfile, FixedItem } from '../types';
import {
  formatCurrency,
  getCurrentMonthKey,
  getMonthYearLabel,
} from '../utils/formatters';
import { calculateMonthTotals } from '../utils/storage';
import { ForecastCard } from './ForecastCard';
import { MonthlyComparisonChart } from './MonthlyComparisonChart';

interface DashboardViewProps {
  forecast: MonthForecast;
  transactions: Transaction[];
  fixedItems: FixedItem[];
  categories: Category[];
  userProfile?: UserProfile;
  onOpenQuickExpense: () => void;
  onOpenForecastDetails: () => void;
  onOpenUserProfile?: () => void;
  onDeleteTransaction: (id: string) => void;
  onNavigateToStatement?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  forecast,
  transactions,
  fixedItems,
  categories,
  userProfile,
  onOpenQuickExpense,
  onOpenForecastDetails,
  onOpenUserProfile,
  onNavigateToStatement,
}) => {
  const currentMonthKey = getCurrentMonthKey();
  const currentMonthLabel = getMonthYearLabel(currentMonthKey);

  // Format today's full day date in Portuguese
  const now = new Date();
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const formattedToday = `${dayNames[now.getDay()]}, ${now.getDate()} de ${monthNames[now.getMonth()]}`;

  // Unified calculations for the current month (Fixed items + Variable + Card + Saldo Anterior)
  const currentMonthTotals = calculateMonthTotals(currentMonthKey, fixedItems, transactions);
  const totalExpensesCurrentMonth = currentMonthTotals.totalExpenses;
  const totalIncomesCurrentMonth = currentMonthTotals.totalIncomes;
  const balanceCurrentMonth = currentMonthTotals.netBalance;

  const displayName = userProfile?.name?.trim() ? userProfile.name.trim().split(' ')[0] : 'Sano';

  return (
    <div id="view-dashboard" className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-4">
      {/* 1. Dashboard Greeting Header from Sleek Interface Theme */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Olá, {displayName}
          </h1>
          <p className="text-xs text-slate-400 font-medium">{formattedToday}</p>
        </div>
        <button
          id="btn-user-profile-avatar"
          type="button"
          onClick={onOpenUserProfile}
          aria-label="Abrir preferências do usuário, perfil e senha"
          className="w-10 h-10 rounded-full bg-indigo-50 hover:bg-indigo-100 active:scale-95 flex items-center justify-center text-indigo-600 shadow-xs border border-indigo-100/60 overflow-hidden transition-all group focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
        >
          {userProfile?.photoUrl ? (
            <img
              src={userProfile.photoUrl}
              alt={userProfile.name || 'Perfil'}
              className="w-full h-full object-cover"
            />
          ) : userProfile?.name ? (
            <span className="text-xs font-black text-indigo-700 tracking-tight">
              {userProfile.name.slice(0, 2).toUpperCase()}
            </span>
          ) : (
            <User size={20} className="group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* 2. SPOTLIGHT: Previsão do Próximo Mês (Brain Card) */}
      <section id="section-forecast">
        <ForecastCard forecast={forecast} onOpenDetails={onOpenForecastDetails} />
      </section>

      {/* 3. Current Month Overview Bar */}
      <section
        id="section-current-month-overview"
        className="bg-white border border-slate-100 rounded-3xl p-4 shadow-xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <ReceiptText size={15} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {currentMonthLabel}
            </span>
          </div>
          <span
            className={`text-xs font-bold ${
              balanceCurrentMonth >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            Saldo: {formatCurrency(balanceCurrentMonth)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Entradas
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {formatCurrency(totalIncomesCurrentMonth)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
              <TrendingDown size={16} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Gastos
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {formatCurrency(totalExpensesCurrentMonth)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Monthly Comparison Chart: Gastos x Receitas dos Meses */}
      <MonthlyComparisonChart
        transactions={transactions}
        fixedItems={fixedItems}
        categories={categories}
        onNavigateToStatement={onNavigateToStatement}
        onOpenQuickExpense={onOpenQuickExpense}
      />
    </div>
  );
};

