import React from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { MonthForecast } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ForecastCardProps {
  forecast: MonthForecast;
  onOpenDetails: () => void;
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ forecast, onOpenDetails }) => {
  const isPositive = forecast.netForecast >= 0;

  return (
    <div
      id="card-forecast-next-month"
      className="bg-indigo-600 rounded-3xl p-5 shadow-lg shadow-indigo-200/50 text-white relative overflow-hidden transition-all duration-200"
    >
      {/* Subtle overlay accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

      {/* Top Header Row of the Card */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-100 opacity-90">
            Saldo Disponível Estimado
          </p>
          <p className="text-[11px] text-indigo-200/90 font-medium">
            {forecast.targetMonthStr}
          </p>
        </div>

        <button
          id="btn-view-forecast-breakdown"
          onClick={onOpenDetails}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-100 hover:text-white bg-white/15 hover:bg-white/20 px-2.5 py-1 rounded-full transition-all"
        >
          <span>Detalhes</span>
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Main Metric: Disponível Previsto */}
      <h2
        className={`text-3xl font-bold mb-4 tracking-tight ${
          isPositive ? 'text-white' : 'text-rose-200'
        }`}
      >
        {formatCurrency(forecast.netForecast)}
      </h2>

      {/* Grid 2-column: Entradas Previstas vs Saídas Previstas */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-indigo-400/30">
        <div>
          <p className="text-[10px] uppercase font-bold text-indigo-100/80 tracking-wider mb-1">
            Entradas Previstas
          </p>
          <p className="text-sm font-bold text-white">
            + {formatCurrency(forecast.totalIncomeExpected)}
          </p>
          {forecast.previousMonthBalance > 0 && (
            <p className="text-[10px] text-emerald-200/90 font-semibold mt-0.5 tracking-tight">
              (+{formatCurrency(forecast.previousMonthBalance)} de saldo anterior)
            </p>
          )}
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-indigo-100/80 tracking-wider mb-1">
            Saídas Previstas
          </p>
          <p className="text-sm font-bold text-white">
            - {formatCurrency(forecast.totalExpenseExpected)}
          </p>
        </div>
      </div>
    </div>
  );
};

