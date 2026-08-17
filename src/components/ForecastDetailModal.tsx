import React from 'react';
import { X, ArrowUpRight, CreditCard, Calendar, Sparkles, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { MonthForecast, Category } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface ForecastDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: MonthForecast;
  categories: Category[];
}

export const ForecastDetailModal: React.FC<ForecastDetailModalProps> = ({
  isOpen,
  onClose,
  forecast,
  categories,
}) => {
  if (!isOpen) return null;

  const getCategory = (catId: string) =>
    categories.find((c) => c.id === catId) || {
      name: 'Geral',
      icon: 'Tag',
      color: '#6366f1',
      bgLight: '#eef2ff',
      textColor: '#4338ca',
    };

  const isPositive = forecast.netForecast >= 0;

  return (
    <div
      id="modal-forecast-details-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        id="modal-forecast-details-content"
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Previsão: {forecast.targetMonthStr}
              </h2>
              <p className="text-xs text-slate-400">Detalhamento dos valores previstos</p>
            </div>
          </div>
          <button
            id="btn-close-forecast-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-5 py-4 overflow-y-auto space-y-4">
          {/* Summary Box */}
          <div
            className={`p-4 rounded-2xl border ${
              isPositive
                ? 'bg-indigo-50/50 border-indigo-100 text-indigo-950'
                : 'bg-rose-50/50 border-rose-100 text-rose-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Saldo Disponível Estimado
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {isPositive ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {isPositive ? 'Positivo' : 'Negativo'}
              </span>
            </div>
            <div className="text-2xl font-extrabold mt-1 tracking-tight text-slate-800">
              {formatCurrency(forecast.netForecast)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Receitas ({formatCurrency(forecast.totalIncomeExpected)}) − Saídas ({formatCurrency(forecast.totalExpenseExpected)})
            </p>
          </div>

          {/* 1. Receitas Fixas & Previstas (incluindo Saldo Anterior) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wide">
                <ArrowUpRight size={14} className="text-emerald-600" />
                <span>1. Entradas Previstas</span>
              </div>
              <span className="text-xs font-bold text-emerald-600">
                +{formatCurrency(forecast.totalIncomeExpected)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2">
              {/* Item de Saldo Anterior Positivo */}
              {forecast.previousMonthBalance > 0 && (
                <div className="flex items-center justify-between text-xs p-2.5 bg-emerald-50 rounded-xl border border-emerald-200/80 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Wallet size={12} />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950">Saldo Anterior</span>
                      <span className="text-[10px] text-emerald-700 block">
                        Sobra do mês fechado positivo ({forecast.previousMonthStr || 'Mês anterior'})
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-emerald-700">
                    +{formatCurrency(forecast.previousMonthBalance)}
                  </span>
                </div>
              )}

              {forecast.items.fixedIncomes.length === 0 && forecast.previousMonthBalance === 0 ? (
                <p className="text-xs text-slate-400 italic py-1 text-center">
                  Nenhuma receita fixa cadastrada e sem saldo anterior positivo.
                </p>
              ) : (
                forecast.items.fixedIncomes.map((item) => {
                  const cat = getCategory(item.categoryId);
                  return (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: cat.bgLight, color: cat.textColor }}
                        >
                          <CategoryIcon name={cat.icon} size={12} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">{item.description}</span>
                          <span className="text-[10px] text-slate-400 block">
                            Dia {item.dayOfMonth} (Fixo Mensal)
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600">
                        +{formatCurrency(item.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Gastos Fixos Recorrentes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                <Calendar size={14} className="text-indigo-600" />
                <span>2. Gastos Fixos</span>
              </div>
              <span className="text-xs font-bold text-slate-800">
                -{formatCurrency(forecast.fixedExpenseTotal)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2">
              {forecast.items.fixedExpenses.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1 text-center">
                  Nenhum gasto fixo cadastrado.
                </p>
              ) : (
                forecast.items.fixedExpenses.map((item) => {
                  const cat = getCategory(item.categoryId);
                  return (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: cat.bgLight, color: cat.textColor }}
                        >
                          <CategoryIcon name={cat.icon} size={12} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">{item.description}</span>
                          <span className="text-[10px] text-slate-400 block">
                            Dia {item.dayOfMonth} ({cat.name})
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">
                        -{formatCurrency(item.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. Parcelas de Cartão de Crédito */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                <CreditCard size={14} className="text-indigo-600" />
                <span>3. Parcelas de Cartão do Mês</span>
              </div>
              <span className="text-xs font-bold text-slate-800">
                -{formatCurrency(forecast.creditCardInstallmentsTotal)}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2">
              {forecast.items.installments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1 text-center">
                  Nenhuma parcela de cartão prevista para este mês.
                </p>
              ) : (
                forecast.items.installments.map((item) => {
                  const cat = getCategory(item.categoryId);
                  return (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: cat.bgLight, color: cat.textColor }}
                        >
                          <CategoryIcon name={cat.icon} size={12} />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800">{item.description}</span>
                          <span className="text-[10px] text-indigo-600 font-bold block">
                            Cartão • Parcela {item.installmentCurrent || 1}/
                            {item.installmentsTotal || 1}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">
                        -{formatCurrency(item.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-white">
          <button
            id="btn-understand-forecast"
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-colors shadow-md shadow-indigo-600/30"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
