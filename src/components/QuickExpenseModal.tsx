import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Calendar,
  CreditCard,
  Repeat,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import { Category, PaymentMethod, Transaction, TransactionType, FixedItem } from '../types';
import {
  getTodayDateString,
  getYesterdayDateString,
  formatCurrency,
  addMonthsToDate,
  formatDateBR,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveTransaction: (
    transactions: Omit<Transaction, 'id' | 'createdAt'>[],
    newFixedItem?: Omit<FixedItem, 'id'>
  ) => void;
}

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [rawAmount, setRawAmount] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_debit_pix');
  const [installments, setInstallments] = useState<number>(1);
  const [customInstallments, setCustomInstallments] = useState<string>('');
  const [repeatMonthly, setRepeatMonthly] = useState<boolean>(true);
  const [isIncomeRecurring, setIsIncomeRecurring] = useState<boolean>(true);
  const [date, setDate] = useState<string>(getTodayDateString());
  const [description, setDescription] = useState<string>('');
  const [showCustomDate, setShowCustomDate] = useState<boolean>(false);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Filter categories by type
  const availableCategories = categories.filter((c) =>
    type === 'expense'
      ? c.type === 'expense' || c.type === 'both'
      : c.type === 'income' || c.type === 'both'
  );

  // Auto-focus input and reset initial values when opened
  useEffect(() => {
    if (isOpen) {
      setRawAmount('');
      setDescription('');
      setDate(getTodayDateString());
      setShowCustomDate(false);
      setPaymentMethod('cash_debit_pix');
      setInstallments(1);
      setCustomInstallments('');
      setRepeatMonthly(true);

      // Select default category
      const firstCat = categories.find((c) =>
        type === 'expense' ? c.type === 'expense' : c.type === 'income'
      );
      if (firstCat) {
        setSelectedCategoryId(firstCat.id);
        setIsIncomeRecurring(firstCat.id === 'cat-salario');
      } else if (categories.length > 0) {
        setSelectedCategoryId(categories[0].id);
        setIsIncomeRecurring(categories[0].id === 'cat-salario');
      }

      // Fast auto-focus on the numeric input as mandated by requirements
      const timer = setTimeout(() => {
        if (amountInputRef.current) {
          amountInputRef.current.focus();
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, categories]);

  if (!isOpen) return null;

  // Numeric parsing
  const numericAmount = parseFloat(rawAmount.replace(',', '.')) || 0;
  const activeInstallmentsCount = customInstallments ? parseInt(customInstallments, 10) || 1 : installments;
  const installmentValue =
    activeInstallmentsCount > 0 ? numericAmount / activeInstallmentsCount : numericAmount;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.,]/g, '');
    setRawAmount(val);
  };

  const handleAddQuickValue = (increment: number) => {
    const current = parseFloat(rawAmount.replace(',', '.')) || 0;
    const next = (current + increment).toFixed(2).replace('.', ',');
    setRawAmount(next);
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    if (type === 'income') {
      if (catId === 'cat-salario') {
        setIsIncomeRecurring(true);
      } else if (catId === 'cat-extra') {
        setIsIncomeRecurring(false);
      }
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      if (amountInputRef.current) {
        amountInputRef.current.focus();
      }
      return;
    }

    const finalDescription =
      description.trim() ||
      selectedCategory?.name ||
      (type === 'expense' ? 'Gasto' : 'Receita');

    const txList: Omit<Transaction, 'id' | 'createdAt'>[] = [];
    let fixedItemToCreate: Omit<FixedItem, 'id'> | undefined = undefined;

    if (type === 'expense' && paymentMethod === 'credit_card' && activeInstallmentsCount > 1) {
      const groupId = `grp-${Date.now()}`;
      for (let i = 0; i < activeInstallmentsCount; i++) {
        const installmentDate = addMonthsToDate(date, i);
        txList.push({
          description: `${finalDescription} (${i + 1}/${activeInstallmentsCount})`,
          amount: parseFloat(installmentValue.toFixed(2)),
          type: 'expense',
          categoryId: selectedCategoryId || 'cat-outros',
          paymentMethod: 'credit_card',
          date: installmentDate,
          installmentsTotal: activeInstallmentsCount,
          installmentCurrent: i + 1,
          installmentGroupId: groupId,
        });
      }
    } else {
      const isFixed = type === 'expense' ? paymentMethod === 'fixed' : isIncomeRecurring;
      const isRepeating = type === 'expense' ? isFixed && repeatMonthly : isIncomeRecurring;

      txList.push({
        description: finalDescription,
        amount: numericAmount,
        type,
        categoryId: selectedCategoryId || (type === 'expense' ? 'cat-outros' : 'cat-salario'),
        paymentMethod: isFixed ? 'fixed' : 'cash_debit_pix',
        date,
        isFixed,
        repeatMonthly: isRepeating,
      });

      if (isFixed && isRepeating) {
        const [, , dayStr] = date.split('-');
        fixedItemToCreate = {
          description: finalDescription,
          amount: numericAmount,
          type,
          categoryId: selectedCategoryId || (type === 'expense' ? 'cat-outros' : 'cat-salario'),
          dayOfMonth: parseInt(dayStr, 10) || 1,
          active: true,
          repeatMonthly: true,
        };
      }
    }

    onSaveTransaction(txList, fixedItemToCreate);
    onClose();
  };

  return (
    <div
      id="modal-quick-expense-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        id="modal-quick-expense-sheet"
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Indicator */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Inserção Rápida
            </span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Gasto vs Receita switch */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                id="tab-expense-toggle"
                onClick={() => setType('expense')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowDownCircle size={13} />
                <span>Gasto</span>
              </button>
              <button
                type="button"
                id="tab-income-toggle"
                onClick={() => setType('income')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  type === 'income'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <ArrowUpCircle size={13} />
                <span>Receita</span>
              </button>
            </div>

            <button
              type="button"
              id="btn-close-quick-expense"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {/* 1. VALOR - Sleek Large Display */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              {type === 'expense' ? 'Valor a Registrar' : 'Valor da Receita'}
            </p>

            <div className="flex items-baseline justify-center gap-2">
              <span className="text-2xl font-light text-slate-400">R$</span>
              <input
                ref={amountInputRef}
                id="input-expense-amount"
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.,]?[0-9]*"
                placeholder="0,00"
                value={rawAmount}
                onChange={handleAmountChange}
                className="w-full max-w-[220px] text-center text-4xl font-bold text-indigo-600 bg-transparent border-none outline-none tracking-tight placeholder:text-indigo-300/60"
                autoComplete="off"
              />
            </div>

            {/* Quick Increment Buttons */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {[10, 20, 50, 100].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => handleAddQuickValue(inc)}
                  className="px-3 py-1 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 rounded-lg hover:bg-indigo-50 active:scale-95 transition-all shadow-xs"
                >
                  +{inc}
                </button>
              ))}
              {rawAmount && (
                <button
                  type="button"
                  onClick={() => setRawAmount('')}
                  className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-rose-500 bg-white border border-slate-200 rounded-lg"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* 2. CATEGORIA - Sleek Horizontal Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">Categoria (1 toque)</label>
              {selectedCategory && (
                <span className="text-[11px] font-semibold text-indigo-600">
                  {selectedCategory.name}
                </span>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`chip-cat-${cat.id}`}
                    type="button"
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all shrink-0 ${
                      isSelected
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs ring-1 ring-indigo-500/30'
                        : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} size={14} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. RECORRÊNCIA DE RECEITA (ex: Salário) */}
          {type === 'income' && (
            <div className="space-y-2">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3.5 flex items-center justify-between transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/90 text-emerald-700 flex items-center justify-center shrink-0">
                    <Repeat size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Receita Recorrente (Fixo Mensal)
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Repete todo mês a partir da data de início
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="checkbox-income-recurring"
                    checked={isIncomeRecurring}
                    onChange={(e) => setIsIncomeRecurring(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Informação explícita de repetição a partir da data */}
              {isIncomeRecurring && (
                <div className="bg-white border border-emerald-200/80 rounded-2xl p-3 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Dia de Repetição Mensal:</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      Todo dia {parseInt(date.split('-')[2] || '1', 10)}
                    </span>
                  </div>

                  {/* Atalhos rápidos para dia do salário/renda */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                    {[1, 5, 10, 15, 20, 25, 30].map((d) => {
                      const curDay = parseInt(date.split('-')[2] || '1', 10);
                      const isCur = curDay === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            const [y, m] = date.split('-');
                            const padded = String(d).padStart(2, '0');
                            setDate(`${y}-${m}-${padded}`);
                          }}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            isCur
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          Dia {d < 10 ? `0${d}` : d}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-emerald-800/90 font-medium bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                    ✨ Primeiro lançamento em <strong>{formatDateBR(date)}</strong>. A partir daí, esta receita será considerada <strong>todo dia {parseInt(date.split('-')[2] || '1', 10)}</strong> nos meses seguintes para a previsão.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. FORMA DE PAGAMENTO (Only for Expense) */}
          {type === 'expense' && (
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">
                Forma de Pagamento
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. À Vista / PIX / Débito */}
                <button
                  type="button"
                  id="btn-pay-cash"
                  onClick={() => setPaymentMethod('cash_debit_pix')}
                  className={`h-11 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                    paymentMethod === 'cash_debit_pix'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  À VISTA (PIX)
                </button>

                {/* 2. Gasto Fixo */}
                <button
                  type="button"
                  id="btn-pay-fixed"
                  onClick={() => setPaymentMethod('fixed')}
                  className={`h-11 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                    paymentMethod === 'fixed'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  GASTO FIXO
                </button>

                {/* 3. Cartão de Crédito */}
                <button
                  type="button"
                  id="btn-pay-credit"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`h-11 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  CRÉDITO
                </button>
              </div>

              {/* Se for Gasto Fixo: Opção de repetir mensalmente */}
              {paymentMethod === 'fixed' && (
                <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat size={16} className="text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block">
                        Repetir mensalmente nesta data
                      </span>
                      <span className="text-[11px] text-indigo-600/90 font-medium">
                        Alimenta a previsão automática do próximo mês
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="checkbox-repeat-monthly"
                      checked={repeatMonthly}
                      onChange={(e) => setRepeatMonthly(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              )}

              {/* Se for Cartão de Crédito: Abre o seletor de parcelas */}
              {paymentMethod === 'credit_card' && (
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <CreditCard size={14} className="text-indigo-600" />
                      Número de Parcelas
                    </span>
                    {numericAmount > 0 && activeInstallmentsCount > 1 && (
                      <span className="text-xs font-bold text-indigo-700">
                        {activeInstallmentsCount}x de {formatCurrency(installmentValue)}
                      </span>
                    )}
                  </div>

                  {/* Installment pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {[1, 2, 3, 4, 6, 10, 12].map((n) => (
                      <button
                        key={n}
                        type="button"
                        id={`btn-installment-${n}x`}
                        onClick={() => {
                          setInstallments(n);
                          setCustomInstallments('');
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          installments === n && !customInstallments
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-indigo-200 text-indigo-900 hover:bg-indigo-100'
                        }`}
                      >
                        {n}x
                      </button>
                    ))}
                    {/* Custom input */}
                    <div className="flex items-center gap-1 bg-white border border-indigo-200 rounded-xl px-2 py-0.5">
                      <span className="text-[11px] text-indigo-600 font-bold">Outro:</span>
                      <input
                        type="number"
                        min="1"
                        max="72"
                        placeholder="Ex: 8"
                        value={customInstallments}
                        onChange={(e) => setCustomInstallments(e.target.value)}
                        className="w-10 text-xs text-center font-bold text-indigo-900 outline-none"
                      />
                    </div>
                  </div>

                  {activeInstallmentsCount > 1 && (
                    <p className="text-[11px] text-indigo-600 font-medium pt-0.5">
                      * As {activeInstallmentsCount} parcelas serão distribuídas nos meses seguintes para a previsão.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. DATA (Pré-preenchida com "Hoje") */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Data do Lançamento</label>
              <span className="text-[11px] font-semibold text-slate-400">
                {formatDateBR(date)}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                id="btn-date-today"
                onClick={() => {
                  setDate(getTodayDateString());
                  setShowCustomDate(false);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  date === getTodayDateString() && !showCustomDate
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Hoje
              </button>

              <button
                type="button"
                id="btn-date-yesterday"
                onClick={() => {
                  setDate(getYesterdayDateString());
                  setShowCustomDate(false);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  date === getYesterdayDateString() && !showCustomDate
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Ontem
              </button>

              <button
                type="button"
                id="btn-date-custom-toggle"
                onClick={() => setShowCustomDate(!showCustomDate)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1 transition-all ${
                  showCustomDate || (date !== getTodayDateString() && date !== getYesterdayDateString())
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar size={13} />
                <span>Outra</span>
              </button>
            </div>

            {showCustomDate && (
              <div className="pt-1">
                <input
                  id="input-custom-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* 5. DESCRIÇÃO OPCIONAL */}
          <div>
            <label
              htmlFor="input-expense-desc"
              className="text-xs font-bold text-slate-700 block mb-1"
            >
              Descrição <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <input
              id="input-expense-desc"
              type="text"
              placeholder={`Padrão: ${selectedCategory?.name || 'Gasto'}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </form>

        {/* Bottom Action Button */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <button
            id="btn-submit-quick-expense"
            onClick={handleSubmit}
            disabled={numericAmount <= 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
              numericAmount > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-indigo-600/30 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Check size={18} className="stroke-[3]" />
            <span>
              {numericAmount > 0
                ? `Salvar ${type === 'expense' ? 'Gasto' : 'Receita'} de ${formatCurrency(numericAmount)}`
                : 'Informe o valor para salvar'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
