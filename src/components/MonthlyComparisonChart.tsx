import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Repeat,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  Receipt,
  Layers,
} from 'lucide-react';
import { Transaction, FixedItem, Category } from '../types';
import {
  formatCurrency,
  getCurrentMonthKey,
  getMonthYearLabel,
  getNextMonthKey,
  getPreviousMonthKey,
} from '../utils/formatters';
import { calculateMonthSurplus } from '../utils/storage';

interface MonthlyComparisonChartProps {
  transactions: Transaction[];
  fixedItems: FixedItem[];
  categories: Category[];
  onNavigateToStatement?: () => void;
  onOpenQuickExpense?: () => void;
}

export interface MonthDataPoint {
  monthKey: string; // "2026-08"
  shortLabel: string; // "Ago/26"
  fullLabel: string; // "Agosto de 2026"
  monthName: string; // "Agosto"
  year: string; // "2026"
  isCurrent: boolean;
  isFuture: boolean;
  isPast: boolean;

  // Receitas
  fixedIncomes: number;
  variableIncomes: number;
  previousMonthBalance: number;
  totalIncomes: number;
  fixedIncomeItems: FixedItem[];
  variableIncomeTransactions: Transaction[];

  // Gastos
  fixedExpenses: number;
  cardInstallments: number;
  variableExpenses: number;
  totalExpenses: number;
  fixedExpenseItems: FixedItem[];
  cardInstallmentTransactions: Transaction[];
  variableExpenseTransactions: Transaction[];

  // Saldo
  netBalance: number;
}

type PeriodMode = 'overview' | 'future' | 'history';

export const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({
  transactions,
  fixedItems,
  onNavigateToStatement,
}) => {
  const currentMonthKey = getCurrentMonthKey();
  const [periodMode, setPeriodMode] = useState<PeriodMode>('overview');
  const [offsetMonths, setOffsetMonths] = useState<number>(0);
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(currentMonthKey);

  // Generate sequence of months based on period mode and offset
  const monthKeys = useMemo(() => {
    // Determine base starting month
    // "overview": 2 past months, current month, 3 future months (6 months total)
    // "future": current month + 5 future months (6 months total)
    // "history": 5 past months + current month (6 months total)
    let startKey = currentMonthKey;

    if (periodMode === 'overview') {
      // 2 months back
      startKey = getPreviousMonthKey(getPreviousMonthKey(currentMonthKey));
    } else if (periodMode === 'future') {
      startKey = currentMonthKey;
    } else if (periodMode === 'history') {
      let k = currentMonthKey;
      for (let i = 0; i < 5; i++) {
        k = getPreviousMonthKey(k);
      }
      startKey = k;
    }

    // Apply offset if user clicked next/prev
    let cursor = startKey;
    if (offsetMonths > 0) {
      for (let i = 0; i < offsetMonths; i++) {
        cursor = getNextMonthKey(cursor);
      }
    } else if (offsetMonths < 0) {
      for (let i = 0; i < Math.abs(offsetMonths); i++) {
        cursor = getPreviousMonthKey(cursor);
      }
    }

    // Build 6 months array
    const list: string[] = [];
    let currentCursor = cursor;
    for (let i = 0; i < 6; i++) {
      list.push(currentCursor);
      currentCursor = getNextMonthKey(currentCursor);
    }
    return list;
  }, [currentMonthKey, periodMode, offsetMonths]);

  // Compute metrics for each month in monthKeys
  const monthlyData: MonthDataPoint[] = useMemo(() => {
    const activeFixedIncomes = fixedItems.filter((item) => item.active && item.type === 'income');
    const activeFixedExpenses = fixedItems.filter((item) => item.active && item.type === 'expense');

    const totalFixedIncomes = activeFixedIncomes.reduce((acc, item) => acc + item.amount, 0);
    const totalFixedExpenses = activeFixedExpenses.reduce((acc, item) => acc + item.amount, 0);

    const monthNamesShort = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    const monthNamesFull = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return monthKeys.map((key) => {
      const [yearStr, monthStr] = key.split('-');
      const monthIdx = parseInt(monthStr, 10) - 1;
      const shortLabel = `${monthNamesShort[monthIdx]}/${yearStr.slice(2)}`;
      const monthName = monthNamesFull[monthIdx];
      const fullLabel = `${monthName} de ${yearStr}`;

      const isCurrent = key === currentMonthKey;
      const isFuture = key > currentMonthKey;
      const isPast = key < currentMonthKey;

      // Transactions belonging to this month
      const txsInMonth = transactions.filter((tx) => tx.date.startsWith(key));

      // Credit card installments in this month
      const cardInstallmentsTxs = txsInMonth.filter(
        (tx) => tx.paymentMethod === 'credit_card' && tx.type === 'expense'
      );
      const totalCardInstallments = cardInstallmentsTxs.reduce((acc, tx) => acc + tx.amount, 0);

      // Variable expenses (excluding fixed & credit card)
      const variableExpenseTxs = txsInMonth.filter(
        (tx) => tx.type === 'expense' && tx.paymentMethod !== 'credit_card' && !tx.isFixed
      );
      const totalVariableExpenses = variableExpenseTxs.reduce((acc, tx) => acc + tx.amount, 0);

      // Variable incomes (excluding fixed)
      const variableIncomeTxs = txsInMonth.filter(
        (tx) => tx.type === 'income' && !tx.isFixed
      );
      const totalVariableIncomes = variableIncomeTxs.reduce((acc, tx) => acc + tx.amount, 0);

      // Saldo anterior positivo do mês anterior (se gastos < receitas)
      const prevKey = getPreviousMonthKey(key);
      const previousMonthBalance = calculateMonthSurplus(prevKey, fixedItems, transactions);

      // Total Incomes: Fixed Incomes + Variable Incomes + Saldo Anterior
      const totalIncomes = totalFixedIncomes + totalVariableIncomes + previousMonthBalance;

      // Total Expenses: Fixed Expenses + Credit Card Installments + Variable Expenses
      const totalExpenses = totalFixedExpenses + totalCardInstallments + totalVariableExpenses;

      const netBalance = totalIncomes - totalExpenses;

      return {
        monthKey: key,
        shortLabel,
        fullLabel,
        monthName,
        year: yearStr,
        isCurrent,
        isFuture,
        isPast,
        fixedIncomes: totalFixedIncomes,
        variableIncomes: totalVariableIncomes,
        previousMonthBalance,
        totalIncomes,
        fixedIncomeItems: activeFixedIncomes,
        variableIncomeTransactions: variableIncomeTxs,
        fixedExpenses: totalFixedExpenses,
        cardInstallments: totalCardInstallments,
        variableExpenses: totalVariableExpenses,
        totalExpenses,
        fixedExpenseItems: activeFixedExpenses,
        cardInstallmentTransactions: cardInstallmentsTxs,
        variableExpenseTransactions: variableExpenseTxs,
        netBalance,
      };
    });
  }, [monthKeys, currentMonthKey, fixedItems, transactions]);

  // Find selected month data point
  const activeMonthData = useMemo(() => {
    return (
      monthlyData.find((m) => m.monthKey === selectedMonthKey) ||
      monthlyData.find((m) => m.monthKey === currentMonthKey) ||
      monthlyData[0]
    );
  }, [monthlyData, selectedMonthKey, currentMonthKey]);

  // Max value calculation for bar chart scaling
  const maxBarValue = useMemo(() => {
    const highestVal = Math.max(
      ...monthlyData.map((d) => Math.max(d.totalIncomes, d.totalExpenses)),
      1000
    );
    // Add 15% headroom
    return highestVal * 1.15;
  }, [monthlyData]);

  // Averages across the 6 displayed months
  const periodStats = useMemo(() => {
    const count = monthlyData.length || 1;
    const sumIncomes = monthlyData.reduce((acc, d) => acc + d.totalIncomes, 0);
    const sumExpenses = monthlyData.reduce((acc, d) => acc + d.totalExpenses, 0);
    const sumNet = monthlyData.reduce((acc, d) => acc + d.netBalance, 0);

    return {
      avgIncomes: sumIncomes / count,
      avgExpenses: sumExpenses / count,
      totalNet: sumNet,
    };
  }, [monthlyData]);

  return (
    <section id="section-monthly-comparison-chart" className="space-y-4">
      {/* 1. Main Chart Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs transition-all">
        {/* Card Header & Controls */}
        <div className="flex flex-col gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                <Layers size={17} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                  Gastos vs. Receitas
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  Com fixos, cartões e parcelamentos
                </p>
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setOffsetMonths((prev) => prev - 1)}
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white flex items-center justify-center transition-colors active:scale-95 shadow-xs"
                title="Mês anterior"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setOffsetMonths(0);
                  setSelectedMonthKey(currentMonthKey);
                }}
                className="px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-indigo-600 rounded-md hover:bg-white transition-colors"
                title="Voltar ao período atual"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setOffsetMonths((prev) => prev + 1)}
                className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white flex items-center justify-center transition-colors active:scale-95 shadow-xs"
                title="Próximo mês"
                aria-label="Próximo mês"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Period Filter Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100/70 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setPeriodMode('overview');
                setOffsetMonths(0);
              }}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all ${
                periodMode === 'overview'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Visão 6 Meses
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodMode('future');
                setOffsetMonths(0);
              }}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all ${
                periodMode === 'future'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Projeção Futura
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodMode('history');
                setOffsetMonths(0);
              }}
              className={`py-1.5 px-2 text-[11px] font-bold rounded-xl transition-all ${
                periodMode === 'history'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 py-3 px-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
              <span className="font-semibold text-slate-600">Entradas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs"></span>
              <span className="font-semibold text-slate-600">Gastos</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Toque para detalhar</span>
        </div>

        {/* Interactive Bar Chart Canvas */}
        <div className="pt-2 pb-1">
          <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 px-1 relative">
            {/* Subtle horizontal reference grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
              <div className="border-b border-dashed border-slate-200 w-full h-0"></div>
            </div>

            {monthlyData.map((data) => {
              const isSelected = data.monthKey === activeMonthData.monthKey;
              const incomeHeightPercent = Math.min(100, Math.max(8, (data.totalIncomes / maxBarValue) * 100));
              const expenseHeightPercent = Math.min(100, Math.max(8, (data.totalExpenses / maxBarValue) * 100));

              return (
                <button
                  key={data.monthKey}
                  type="button"
                  onClick={() => setSelectedMonthKey(data.monthKey)}
                  className={`flex-1 h-full flex flex-col justify-end items-center relative py-1 rounded-2xl transition-all focus:outline-none group ${
                    isSelected
                      ? 'bg-indigo-50/80 ring-1.5 ring-indigo-500/40 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Current Month or Selected Indicator */}
                  {data.isCurrent && (
                    <span className="absolute -top-2.5 bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-xs">
                      Atual
                    </span>
                  )}

                  {/* Net Balance Mini Badge */}
                  <div
                    className={`text-[9px] font-extrabold mb-1.5 transition-transform group-hover:scale-105 ${
                      data.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-500'
                    }`}
                  >
                    {data.netBalance >= 0 ? '+' : ''}
                    {data.netBalance >= 1000
                      ? `${(data.netBalance / 1000).toFixed(1)}k`
                      : Math.round(data.netBalance)}
                  </div>

                  {/* Grouped Dual Bars (Incomes & Expenses) */}
                  <div className="w-full flex items-end justify-center gap-1 px-1 h-28">
                    {/* Incomes Bar (Emerald) */}
                    <div
                      style={{ height: `${incomeHeightPercent}%` }}
                      className={`w-3 sm:w-3.5 rounded-t-md transition-all relative ${
                        isSelected
                          ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm'
                          : 'bg-emerald-400/85 group-hover:bg-emerald-500'
                      }`}
                      title={`Entradas: ${formatCurrency(data.totalIncomes)}`}
                    ></div>

                    {/* Expenses Bar (Rose) */}
                    <div
                      style={{ height: `${expenseHeightPercent}%` }}
                      className={`w-3 sm:w-3.5 rounded-t-md transition-all relative ${
                        isSelected
                          ? 'bg-gradient-to-t from-rose-500 to-rose-400 shadow-sm'
                          : 'bg-rose-400/85 group-hover:bg-rose-500'
                      }`}
                      title={`Gastos: ${formatCurrency(data.totalExpenses)}`}
                    ></div>
                  </div>

                  {/* Month Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-[11px] block font-bold transition-colors ${
                        isSelected
                          ? 'text-indigo-900 font-extrabold'
                          : data.isCurrent
                          ? 'text-indigo-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {data.shortLabel.split('/')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium block -mt-0.5">
                      '{data.year.slice(2)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Month Details Container */}
        {activeMonthData && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5">
            {/* Header of Active Month */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  {activeMonthData.fullLabel}
                </span>
                {activeMonthData.isCurrent && (
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                    Mês Atual
                  </span>
                )}
                {activeMonthData.isFuture && (
                  <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-0.5 rounded-full border border-sky-100 flex items-center gap-0.5">
                    <Sparkles size={10} /> Projeção
                  </span>
                )}
                {activeMonthData.isPast && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                    Histórico
                  </span>
                )}
              </div>

              {/* Net Balance Result */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Saldo Líquido
                </span>
                <span
                  className={`text-sm font-extrabold tracking-tight ${
                    activeMonthData.netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {activeMonthData.netBalance >= 0 ? '+' : ''}
                  {formatCurrency(activeMonthData.netBalance)}
                </span>
              </div>
            </div>

            {/* Two Column Metric Box: Entradas vs Gastos */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Entradas Breakdown Box */}
              <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-100/60">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold">Entradas</span>
                  </div>
                  <span className="text-xs font-black text-emerald-800">
                    {formatCurrency(activeMonthData.totalIncomes)}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Repeat size={10} className="text-emerald-600" />
                      Fixas:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(activeMonthData.fixedIncomes)}
                    </span>
                  </div>
                  {activeMonthData.previousMonthBalance > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span className="flex items-center gap-1 font-medium">
                        <Sparkles size={10} className="text-emerald-600" />
                        Saldo Anterior:
                      </span>
                      <span className="font-bold text-emerald-700">
                        +{formatCurrency(activeMonthData.previousMonthBalance)}
                      </span>
                    </div>
                  )}
                  {activeMonthData.variableIncomes > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Wallet size={10} className="text-emerald-600" />
                        Extras:
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(activeMonthData.variableIncomes)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gastos Breakdown Box */}
              <div className="bg-rose-50/50 border border-rose-100/80 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-rose-100/60">
                  <div className="flex items-center gap-1.5 text-rose-700">
                    <TrendingDown size={14} />
                    <span className="text-xs font-bold">Gastos</span>
                  </div>
                  <span className="text-xs font-black text-rose-800">
                    {formatCurrency(activeMonthData.totalExpenses)}
                  </span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Repeat size={10} className="text-rose-600" />
                      Fixos:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {formatCurrency(activeMonthData.fixedExpenses)}
                    </span>
                  </div>

                  {activeMonthData.cardInstallments > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-slate-500">
                        <CreditCard size={10} className="text-violet-600" />
                        Cartões:
                      </span>
                      <span className="font-semibold text-violet-700">
                        {formatCurrency(activeMonthData.cardInstallments)}
                      </span>
                    </div>
                  )}

                  {activeMonthData.variableExpenses > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Wallet size={10} className="text-rose-600" />
                        Variáveis:
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(activeMonthData.variableExpenses)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Credit Card Installments list in this month if any */}
            {activeMonthData.cardInstallmentTransactions.length > 0 && (
              <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-violet-600" />
                    Parcelas de Cartão em {activeMonthData.monthName} ({activeMonthData.cardInstallmentTransactions.length})
                  </span>
                  <span className="text-[10px] font-bold text-violet-700">
                    {formatCurrency(activeMonthData.cardInstallments)}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {activeMonthData.cardInstallmentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-[11px] bg-white p-2 rounded-xl border border-slate-100/80 shadow-2xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-violet-50 text-violet-600 rounded-md border border-violet-100 shrink-0">
                          {tx.installmentsTotal && tx.installmentsTotal > 1
                            ? `${tx.installmentCurrent}/${tx.installmentsTotal}`
                            : 'Crédito'}
                        </span>
                        <span className="font-semibold text-slate-700 truncate">
                          {tx.description.replace(/\s*\(\d+\/\d+\)/, '')}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800 shrink-0">
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigate to Statement link if available */}
            {onNavigateToStatement && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={onNavigateToStatement}
                  className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <Receipt size={13} />
                  <span>Ver extrato completo</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Period Summary KPI Pill Bar */}
      <div className="grid grid-cols-3 gap-2 px-1">
        <div className="bg-white border border-slate-100 rounded-2xl p-2.5 text-center shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Média Entradas
          </span>
          <span className="text-xs font-extrabold text-emerald-600 mt-0.5 block">
            {formatCurrency(periodStats.avgIncomes)}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-2.5 text-center shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Média Gastos
          </span>
          <span className="text-xs font-extrabold text-rose-500 mt-0.5 block">
            {formatCurrency(periodStats.avgExpenses)}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-2.5 text-center shadow-2xs">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Saldo Período
          </span>
          <span
            className={`text-xs font-extrabold mt-0.5 block ${
              periodStats.totalNet >= 0 ? 'text-indigo-600' : 'text-rose-600'
            }`}
          >
            {periodStats.totalNet >= 0 ? '+' : ''}
            {formatCurrency(periodStats.totalNet)}
          </span>
        </div>
      </div>
    </section>
  );
};
