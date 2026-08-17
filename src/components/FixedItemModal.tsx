import React, { useState, useEffect } from 'react';
import { X, Check, Repeat, Calendar, Trash2 } from 'lucide-react';
import { FixedItem, Category, TransactionType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface FixedItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: FixedItem | null;
  categories: Category[];
  onSaveFixedItem: (item: FixedItem) => void;
  onDeleteFixedItem?: (itemId: string) => void;
}

export const FixedItemModal: React.FC<FixedItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  categories,
  onSaveFixedItem,
  onDeleteFixedItem,
}) => {
  const [description, setDescription] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState<number>(5);
  const [active, setActive] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setDescription(itemToEdit.description);
        setRawAmount(itemToEdit.amount.toString().replace('.', ','));
        setType(itemToEdit.type);
        setCategoryId(itemToEdit.categoryId);
        setDayOfMonth(itemToEdit.dayOfMonth);
        setActive(itemToEdit.active);
      } else {
        setDescription('');
        setRawAmount('');
        setType('expense');
        setDayOfMonth(10);
        setActive(true);
        const defaultCat = categories.find((c) => c.type === 'expense');
        setCategoryId(defaultCat ? defaultCat.id : categories[0]?.id || '');
      }
    }
  }, [isOpen, itemToEdit, categories]);

  if (!isOpen) return null;

  const numericAmount = parseFloat(rawAmount.replace(',', '.')) || 0;
  const filteredCategories = categories.filter((c) =>
    type === 'expense' ? c.type === 'expense' || c.type === 'both' : c.type === 'income' || c.type === 'both'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || numericAmount <= 0) return;

    const newItem: FixedItem = {
      id: itemToEdit ? itemToEdit.id : `fix-${Date.now()}`,
      description: description.trim(),
      amount: numericAmount,
      type,
      categoryId: categoryId || filteredCategories[0]?.id || 'cat-outros',
      dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
      active,
      repeatMonthly: true,
    };

    onSaveFixedItem(newItem);
    onClose();
  };

  return (
    <div
      id="modal-fixed-item-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        id="modal-fixed-item-sheet"
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Repeat size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {itemToEdit ? 'Editar Item Fixo' : 'Novo Item Fixo'}
              </h2>
              <p className="text-xs text-slate-400">Recorrência mensal automática para previsão</p>
            </div>
          </div>
          <button
            id="btn-close-fixed-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Tipo: Receita Fixa ou Gasto Fixo */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="btn-fixed-type-expense"
              onClick={() => setType('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Gasto Fixo (Contas)
            </button>
            <button
              type="button"
              id="btn-fixed-type-income"
              onClick={() => setType('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Receita Fixa (Salário)
            </button>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="input-fixed-desc" className="text-xs font-bold text-slate-700 block mb-1">
              Nome do Item Fixo
            </label>
            <input
              id="input-fixed-desc"
              type="text"
              required
              placeholder="Ex: Salário, Aluguel, Internet, Plano de Saúde, Academia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              autoFocus
            />
          </div>

          {/* Valor Mensal */}
          <div>
            <label htmlFor="input-fixed-amount" className="text-xs font-bold text-slate-700 block mb-1">
              Valor Mensal (R$)
            </label>
            <input
              id="input-fixed-amount"
              type="text"
              inputMode="decimal"
              required
              placeholder="0,00"
              value={rawAmount}
              onChange={(e) => setRawAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
              className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-indigo-600 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Categoria
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 border border-slate-100 rounded-2xl scrollbar-none">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 font-bold ring-1 ring-indigo-500/20'
                        : 'border-transparent text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgLight, color: cat.textColor }}
                    >
                      <CategoryIcon name={cat.icon} size={12} />
                    </div>
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dia do Mês */}
          <div>
            <label htmlFor="input-fixed-day" className="text-xs font-bold text-slate-700 block mb-1">
              Dia de Vencimento / Recebimento no Mês (1 a 31)
            </label>
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              <input
                id="input-fixed-day"
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10) || 1)}
                className="w-24 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400 font-medium">Todo dia {dayOfMonth} de cada mês</span>
            </div>
          </div>

          {/* Ativo no Cálculo */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-950 block">Item Ativo</span>
              <span className="text-[11px] text-indigo-600/90 font-medium">
                Considerar na previsão de saldo do próximo mês
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="checkbox-fixed-active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
          {itemToEdit && onDeleteFixedItem && (
            <button
              type="button"
              id="btn-delete-fixed-item"
              onClick={() => {
                onDeleteFixedItem(itemToEdit.id);
                onClose();
              }}
              className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Excluir item fixo"
            >
              <Trash2 size={18} />
            </button>
          )}

          <button
            id="btn-save-fixed-item"
            onClick={handleSubmit}
            disabled={!description.trim() || numericAmount <= 0}
            className={`flex-1 py-3 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-md transition-all ${
              description.trim() && numericAmount > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-indigo-600/30 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Check size={16} className="stroke-[3]" />
            <span>Salvar Item Fixo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
