import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-alimentacao',
    name: 'Alimentação',
    icon: 'Utensils',
    color: '#f97316', // orange-500
    bgLight: '#fff7ed', // orange-50
    textColor: '#c2410c', // orange-700
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-moradia',
    name: 'Moradia',
    icon: 'Home',
    color: '#3b82f6', // blue-500
    bgLight: '#eff6ff', // blue-50
    textColor: '#1d4ed8', // blue-700
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-transporte',
    name: 'Transporte',
    icon: 'Car',
    color: '#8b5cf6', // violet-500
    bgLight: '#f5f3ff', // violet-50
    textColor: '#6d28d9', // violet-700
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-lazer',
    name: 'Lazer',
    icon: 'Film',
    color: '#ec4899', // pink-500
    bgLight: '#fdf2f8', // pink-50
    textColor: '#be185d', // pink-700
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-saude',
    name: 'Saúde',
    icon: 'HeartPulse',
    color: '#10b981', // emerald-500
    bgLight: '#ecfdf5', // emerald-50
    textColor: '#047857', // emerald-700
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-outros',
    name: 'Outros',
    icon: 'Package',
    color: '#64748b', // slate-500
    bgLight: '#f8fafc', // slate-50
    textColor: '#334155', // slate-700
    type: 'expense',
    isDefault: true,
  },
  {
    id: 'cat-salario',
    name: 'Salário',
    icon: 'DollarSign',
    color: '#059669', // emerald-600
    bgLight: '#ecfdf5',
    textColor: '#065f46',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-extra',
    name: 'Extra',
    icon: 'Sparkles',
    color: '#10b981', // emerald-500
    bgLight: '#ecfdf5',
    textColor: '#047857',
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat-educacao',
    name: 'Educação',
    icon: 'BookOpen',
    color: '#6366f1', // indigo-500
    bgLight: '#eef2ff',
    textColor: '#4338ca',
    type: 'expense',
    isDefault: false,
  },
];

export const AVAILABLE_ICONS = [
  { name: 'Utensils', label: 'Alimentação' },
  { name: 'Home', label: 'Moradia' },
  { name: 'Car', label: 'Transporte' },
  { name: 'Film', label: 'Lazer' },
  { name: 'HeartPulse', label: 'Saúde' },
  { name: 'Package', label: 'Outros' },
  { name: 'DollarSign', label: 'Dinheiro' },
  { name: 'ShoppingBag', label: 'Compras' },
  { name: 'Coffee', label: 'Café' },
  { name: 'Fuel', label: 'Combustível' },
  { name: 'Smartphone', label: 'Celular' },
  { name: 'BookOpen', label: 'Educação' },
  { name: 'Gift', label: 'Presentes' },
  { name: 'Sparkles', label: 'Beleza' },
  { name: 'Zap', label: 'Contas' },
  { name: 'Briefcase', label: 'Trabalho' },
  { name: 'Tv', label: 'Streaming' },
  { name: 'Dumbbell', label: 'Academia' },
  { name: 'PawPrint', label: 'Pets' },
  { name: 'Plane', label: 'Viagem' },
];

export const AVAILABLE_COLORS = [
  { hex: '#f97316', bgLight: '#fff7ed', textColor: '#c2410c', name: 'Laranja' },
  { hex: '#3b82f6', bgLight: '#eff6ff', textColor: '#1d4ed8', name: 'Azul' },
  { hex: '#8b5cf6', bgLight: '#f5f3ff', textColor: '#6d28d9', name: 'Roxo' },
  { hex: '#ec4899', bgLight: '#fdf2f8', textColor: '#be185d', name: 'Rosa' },
  { hex: '#10b981', bgLight: '#ecfdf5', textColor: '#047857', name: 'Verde' },
  { hex: '#059669', bgLight: '#ecfdf5', textColor: '#065f46', name: 'Esmeralda' },
  { hex: '#eab308', bgLight: '#fefce8', textColor: '#a16207', name: 'Amarelo' },
  { hex: '#ef4444', bgLight: '#fef2f2', textColor: '#b91c1c', name: 'Vermelho' },
  { hex: '#6366f1', bgLight: '#eef2ff', textColor: '#4338ca', name: 'Índigo' },
  { hex: '#06b6d4', bgLight: '#ecfeff', textColor: '#0e7490', name: 'Ciano' },
  { hex: '#14b8a6', bgLight: '#f0fdfa', textColor: '#0f766e', name: 'Teal' },
  { hex: '#64748b', bgLight: '#f8fafc', textColor: '#334155', name: 'Cinza' },
];
