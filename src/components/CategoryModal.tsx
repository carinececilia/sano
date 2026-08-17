import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Category, TransactionType } from '../types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../utils/categories';
import { CategoryIcon } from './CategoryIcon';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onSaveCategory: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Utensils');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [type, setType] = useState<TransactionType>('expense');

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setIcon(categoryToEdit.icon);
        const matchColor =
          AVAILABLE_COLORS.find((c) => c.hex === categoryToEdit.color) || AVAILABLE_COLORS[0];
        setSelectedColor(matchColor);
        setType(categoryToEdit.type === 'income' ? 'income' : 'expense');
      } else {
        setName('');
        setIcon('ShoppingBag');
        setSelectedColor(AVAILABLE_COLORS[3]);
        setType('expense');
      }
    }
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCategory: Category = {
      id: categoryToEdit ? categoryToEdit.id : `cat-custom-${Date.now()}`,
      name: name.trim(),
      icon,
      color: selectedColor.hex,
      bgLight: selectedColor.bgLight,
      textColor: selectedColor.textColor,
      type,
      isDefault: categoryToEdit?.isDefault || false,
    };

    onSaveCategory(newCategory);
    onClose();
  };

  return (
    <div
      id="modal-category-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        id="modal-category-sheet"
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
              style={{ backgroundColor: selectedColor.bgLight, color: selectedColor.textColor }}
            >
              <CategoryIcon name={icon} size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <p className="text-xs text-slate-400">Estrutura simples de nível único</p>
            </div>
          </div>
          <button
            id="btn-close-category-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Nome da Categoria */}
          <div>
            <label
              htmlFor="input-cat-name"
              className="text-xs font-bold text-slate-700 block mb-1"
            >
              Nome da Categoria
            </label>
            <input
              id="input-cat-name"
              type="text"
              required
              placeholder="Ex: Assinaturas, Mercado, Pet, Farmácia..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              autoFocus
            />
          </div>

          {/* Tipo de Categoria */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Tipo de Categoria
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-cat-type-expense"
                onClick={() => setType('expense')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                id="btn-cat-type-income"
                onClick={() => setType('income')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  type === 'income'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Receita
              </button>
            </div>
          </div>

          {/* Paleta de Cores */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Cor de Identificação
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_COLORS.map((col) => {
                const isSelected = selectedColor.hex === col.hex;
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className="h-9 rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs"
                    style={{ backgroundColor: col.hex }}
                    aria-label={col.name}
                  >
                    {isSelected && <Check size={16} className="text-white drop-shadow-sm stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor de Ícones */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Ícone da Categoria
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1.5 bg-slate-50 border border-slate-100 rounded-2xl scrollbar-none">
              {AVAILABLE_ICONS.map((ic) => {
                const isSelected = icon === ic.name;
                return (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setIcon(ic.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-white shadow-xs text-indigo-600 font-bold ring-1 ring-indigo-500/20'
                        : 'border-transparent text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <CategoryIcon name={ic.name} size={18} />
                    <span className="text-[9px] mt-1 truncate max-w-full">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center gap-2">
          {categoryToEdit && !categoryToEdit.isDefault && onDeleteCategory && (
            <button
              type="button"
              id="btn-delete-cat"
              onClick={() => {
                onDeleteCategory(categoryToEdit.id);
                onClose();
              }}
              className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Excluir categoria"
            >
              <Trash2 size={18} />
            </button>
          )}

          <button
            id="btn-save-category"
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`flex-1 py-3 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-md transition-all ${
              name.trim()
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-indigo-600/30 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Check size={16} className="stroke-[3]" />
            <span>Salvar Categoria</span>
          </button>
        </div>
      </div>
    </div>
  );
};
