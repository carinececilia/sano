import { Category, Transaction, FixedItem, MonthForecast, UserProfile } from '../types';
import { DEFAULT_CATEGORIES } from './categories';
import {
  getCurrentMonthKey,
  getNextMonthKey,
  getPreviousMonthKey,
  getMonthYearLabel,
  getTodayDateString,
  addMonthsToDate,
} from './formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'fin_organizer_transactions_v1',
  CATEGORIES: 'fin_organizer_categories_v1',
  FIXED_ITEMS: 'fin_organizer_fixed_items_v1',
  USER_PROFILE: 'fin_organizer_user_profile_v1',
  HAS_SEEDED: 'fin_organizer_seeded_v1',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Carine',
  email: 'carine@exemplo.com',
  photoUrl: '',
  pin: '',
  isPinEnabled: false,
  currency: 'BRL (R$)',
};

// Initial realistic seed items
export function getInitialSeedData(): {
  categories: Category[];
  fixedItems: FixedItem[];
  transactions: Transaction[];
} {
  const categories = [...DEFAULT_CATEGORIES];
  const today = getTodayDateString();
  const currentMonth = getCurrentMonthKey(); // e.g. "2026-08"
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Fixed recurring incomes and expenses
  const fixedItems: FixedItem[] = [
    {
      id: 'fix-1',
      description: 'Salário Empresa',
      amount: 5500.0,
      type: 'income',
      categoryId: 'cat-salario',
      dayOfMonth: 5,
      active: true,
      repeatMonthly: true,
    },
    {
      id: 'fix-2',
      description: 'Aluguel & Condomínio',
      amount: 1650.0,
      type: 'expense',
      categoryId: 'cat-moradia',
      dayOfMonth: 10,
      active: true,
      repeatMonthly: true,
    },
    {
      id: 'fix-3',
      description: 'Internet Fibra 500MB',
      amount: 119.9,
      type: 'expense',
      categoryId: 'cat-moradia',
      dayOfMonth: 15,
      active: true,
      repeatMonthly: true,
    },
    {
      id: 'fix-4',
      description: 'Plano de Saúde',
      amount: 380.0,
      type: 'expense',
      categoryId: 'cat-saude',
      dayOfMonth: 20,
      active: true,
      repeatMonthly: true,
    },
    {
      id: 'fix-5',
      description: 'Streaming & Mídia',
      amount: 55.9,
      type: 'expense',
      categoryId: 'cat-lazer',
      dayOfMonth: 12,
      active: true,
      repeatMonthly: true,
    },
  ];

  // Helper to format date in current month
  const pad = (n: number) => String(n).padStart(2, '0');
  const dCur = (day: number) => `${year}-${pad(month)}-${pad(day)}`;
  const nextMonthKey = getNextMonthKey(currentMonth);
  const [nextY, nextM] = nextMonthKey.split('-').map(Number);
  const dNext = (day: number) => `${nextY}-${pad(nextM)}-${pad(day)}`;

  const transactions: Transaction[] = [
    // Current month salary
    {
      id: 'tx-seed-inc-1',
      description: 'Salário Empresa',
      amount: 5500.0,
      type: 'income',
      categoryId: 'cat-salario',
      paymentMethod: 'fixed',
      date: dCur(5),
      isFixed: true,
      repeatMonthly: true,
      createdAt: new Date().toISOString(),
    },
    // Current month fixed rent
    {
      id: 'tx-seed-fix-1',
      description: 'Aluguel & Condomínio',
      amount: 1650.0,
      type: 'expense',
      categoryId: 'cat-moradia',
      paymentMethod: 'fixed',
      date: dCur(10),
      isFixed: true,
      repeatMonthly: true,
      createdAt: new Date().toISOString(),
    },
    // Supermarket
    {
      id: 'tx-seed-exp-1',
      description: 'Supermercado Mensal',
      amount: 485.6,
      type: 'expense',
      categoryId: 'cat-alimentacao',
      paymentMethod: 'cash_debit_pix',
      date: dCur(8),
      createdAt: new Date().toISOString(),
    },
    // Fuel
    {
      id: 'tx-seed-exp-2',
      description: 'Abastecimento Carro',
      amount: 180.0,
      type: 'expense',
      categoryId: 'cat-transporte',
      paymentMethod: 'cash_debit_pix',
      date: dCur(11),
      createdAt: new Date().toISOString(),
    },
    // Restaurant
    {
      id: 'tx-seed-exp-3',
      description: 'Almoço Restaurante',
      amount: 42.5,
      type: 'expense',
      categoryId: 'cat-alimentacao',
      paymentMethod: 'cash_debit_pix',
      date: dCur(14),
      createdAt: new Date().toISOString(),
    },
    // Credit card installment 1 of 3 (bought in current month)
    {
      id: 'tx-seed-cc-1a',
      description: 'Tênis de Corrida (1/3)',
      amount: 149.9,
      type: 'expense',
      categoryId: 'cat-saude',
      paymentMethod: 'credit_card',
      date: dCur(12),
      installmentsTotal: 3,
      installmentCurrent: 1,
      installmentGroupId: 'grp-tenis',
      createdAt: new Date().toISOString(),
    },
    // Credit card installment 2 of 3 (due next month)
    {
      id: 'tx-seed-cc-1b',
      description: 'Tênis de Corrida (2/3)',
      amount: 149.9,
      type: 'expense',
      categoryId: 'cat-saude',
      paymentMethod: 'credit_card',
      date: dNext(12),
      installmentsTotal: 3,
      installmentCurrent: 2,
      installmentGroupId: 'grp-tenis',
      createdAt: new Date().toISOString(),
    },
    // Credit card installment 3 of 3 (due in 2 months)
    {
      id: 'tx-seed-cc-1c',
      description: 'Tênis de Corrida (3/3)',
      amount: 149.9,
      type: 'expense',
      categoryId: 'cat-saude',
      paymentMethod: 'credit_card',
      date: addMonthsToDate(dCur(12), 2),
      installmentsTotal: 3,
      installmentCurrent: 3,
      installmentGroupId: 'grp-tenis',
      createdAt: new Date().toISOString(),
    },
    // Another installment from previous purchase: Celular Novo (2/4 in cur, 3/4 in next)
    {
      id: 'tx-seed-cc-2a',
      description: 'Smartphone Novo (2/4)',
      amount: 320.0,
      type: 'expense',
      categoryId: 'cat-outros',
      paymentMethod: 'credit_card',
      date: dCur(20),
      installmentsTotal: 4,
      installmentCurrent: 2,
      installmentGroupId: 'grp-phone',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tx-seed-cc-2b',
      description: 'Smartphone Novo (3/4)',
      amount: 320.0,
      type: 'expense',
      categoryId: 'cat-outros',
      paymentMethod: 'credit_card',
      date: dNext(20),
      installmentsTotal: 4,
      installmentCurrent: 3,
      installmentGroupId: 'grp-phone',
      createdAt: new Date().toISOString(),
    },
    // Farmácia
    {
      id: 'tx-seed-exp-4',
      description: 'Farmácia & Vitaminas',
      amount: 89.4,
      type: 'expense',
      categoryId: 'cat-saude',
      paymentMethod: 'cash_debit_pix',
      date: dCur(16),
      createdAt: new Date().toISOString(),
    },
    // Cinema
    {
      id: 'tx-seed-exp-5',
      description: 'Cinema e Pipoca',
      amount: 68.0,
      type: 'expense',
      categoryId: 'cat-lazer',
      paymentMethod: 'cash_debit_pix',
      date: today,
      createdAt: new Date().toISOString(),
    },
  ];

  return { categories, fixedItems, transactions };
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) {
      const initial = getInitialSeedData();
      saveCategories(initial.categories);
      return initial.categories;
    }
    const parsed: Category[] = JSON.parse(raw);
    
    // Ensure default income categories 'cat-salario' and 'cat-extra' exist
    let modified = false;
    const hasSalario = parsed.some((c) => c.id === 'cat-salario');
    const hasExtra = parsed.some((c) => c.id === 'cat-extra');

    let updated = parsed.map((c) => {
      if (c.id === 'cat-salario' && c.name === 'Salário & Renda') {
        modified = true;
        return { ...c, name: 'Salário' };
      }
      return c;
    });

    if (!hasSalario) {
      const salarioCat = DEFAULT_CATEGORIES.find((c) => c.id === 'cat-salario');
      if (salarioCat) {
        updated.push(salarioCat);
        modified = true;
      }
    }

    if (!hasExtra) {
      const extraCat = DEFAULT_CATEGORIES.find((c) => c.id === 'cat-extra');
      if (extraCat) {
        updated.push(extraCat);
        modified = true;
      }
    }

    if (modified) {
      saveCategories(updated);
    }
    return updated;
  } catch (e) {
    console.error('Error loading categories:', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories:', e);
  }
}

export function loadFixedItems(): FixedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FIXED_ITEMS);
    if (!raw) {
      const initial = getInitialSeedData();
      saveFixedItems(initial.fixedItems);
      return initial.fixedItems;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading fixed items:', e);
    return [];
  }
}

export function saveFixedItems(items: FixedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FIXED_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving fixed items:', e);
  }
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      const initial = getInitialSeedData();
      saveTransactions(initial.transactions);
      return initial.transactions;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading transactions:', e);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
}

/**
 * Calculates the positive surplus from a month (if revenues > expenses).
 * Returns 0 if expenses exceed revenues.
 */
export function calculateMonthSurplus(
  monthKey: string,
  fixedItems: FixedItem[],
  transactions: Transaction[]
): number {
  const activeFixedIncomes = fixedItems.filter((i) => i.active && i.type === 'income');
  const activeFixedExpenses = fixedItems.filter((i) => i.active && i.type === 'expense');

  const totalFixedIncomes = activeFixedIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalFixedExpenses = activeFixedExpenses.reduce((sum, i) => sum + i.amount, 0);

  const txsInMonth = transactions.filter((tx) => tx.date.startsWith(monthKey));

  const variableIncomes = txsInMonth.filter((t) => t.type === 'income' && !t.isFixed).reduce((s, t) => s + t.amount, 0);
  const totalIncomes = totalFixedIncomes + variableIncomes;

  const cardInstallments = txsInMonth.filter((t) => t.type === 'expense' && t.paymentMethod === 'credit_card').reduce((s, t) => s + t.amount, 0);
  const variableExpenses = txsInMonth.filter((t) => t.type === 'expense' && t.paymentMethod !== 'credit_card' && !t.isFixed).reduce((s, t) => s + t.amount, 0);
  const totalExpenses = totalFixedExpenses + cardInstallments + variableExpenses;

  const diff = totalIncomes - totalExpenses;
  return diff > 0 ? diff : 0;
}

export interface MonthSummaryTotals {
  monthKey: string;
  totalFixedIncomes: number;
  totalVariableIncomes: number;
  previousMonthBalance: number;
  totalIncomes: number;
  totalFixedExpenses: number;
  totalCardInstallments: number;
  totalVariableExpenses: number;
  totalExpenses: number;
  netBalance: number;
}

/**
 * Calculates complete month totals including recurring/fixed items, credit card installments,
 * variable additions, and positive previous month surplus.
 */
export function calculateMonthTotals(
  monthKey: string,
  fixedItems: FixedItem[],
  transactions: Transaction[]
): MonthSummaryTotals {
  const activeFixedIncomes = fixedItems.filter((i) => i.active && i.type === 'income');
  const activeFixedExpenses = fixedItems.filter((i) => i.active && i.type === 'expense');

  const totalFixedIncomes = activeFixedIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalFixedExpenses = activeFixedExpenses.reduce((sum, i) => sum + i.amount, 0);

  const txsInMonth = transactions.filter((tx) => tx.date.startsWith(monthKey));

  // Variable incomes (excluding fixed)
  const variableIncomeTxs = txsInMonth.filter(
    (tx) => tx.type === 'income' && !tx.isFixed
  );
  const totalVariableIncomes = variableIncomeTxs.reduce((acc, tx) => acc + tx.amount, 0);

  // Credit card installments
  const cardInstallmentsTxs = txsInMonth.filter(
    (tx) => tx.paymentMethod === 'credit_card' && tx.type === 'expense'
  );
  const totalCardInstallments = cardInstallmentsTxs.reduce((acc, tx) => acc + tx.amount, 0);

  // Variable expenses (excluding fixed & credit card)
  const variableExpenseTxs = txsInMonth.filter(
    (tx) => tx.type === 'expense' && tx.paymentMethod !== 'credit_card' && !tx.isFixed
  );
  const totalVariableExpenses = variableExpenseTxs.reduce((acc, tx) => acc + tx.amount, 0);

  // Saldo anterior positivo do mês anterior (se receitas > gastos)
  const prevKey = getPreviousMonthKey(monthKey);
  const previousMonthBalance = calculateMonthSurplus(prevKey, fixedItems, transactions);

  // Total Incomes: Entradas Fixas + Entradas Adicionadas + Saldo Anterior
  const totalIncomes = totalFixedIncomes + totalVariableIncomes + previousMonthBalance;

  // Total Expenses: Gastos Fixos + Parcelas de Cartão + Gastos Adicionados
  const totalExpenses = totalFixedExpenses + totalCardInstallments + totalVariableExpenses;

  const netBalance = totalIncomes - totalExpenses;

  return {
    monthKey,
    totalFixedIncomes,
    totalVariableIncomes,
    previousMonthBalance,
    totalIncomes,
    totalFixedExpenses,
    totalCardInstallments,
    totalVariableExpenses,
    totalExpenses,
    netBalance,
  };
}

/**
 * Calculates Next Month Forecast using the direct mathematical formula requested:
 * Entradas Previstas = Receitas Fixas + Entradas Agendadas + Saldo Anterior (Sobra do Mês Positivo)
 * Previsão Mês Seguinte = Entradas Previstas - (Gastos Fixos + Parcelas de Cartão do Mês + Contas Agendadas)
 */
export function calculateMonthForecast(
  targetMonthKey: string,
  fixedItems: FixedItem[],
  transactions: Transaction[]
): MonthForecast {
  const targetMonthStr = getMonthYearLabel(targetMonthKey);
  const previousMonthKey = getPreviousMonthKey(targetMonthKey);
  const previousMonthStr = getMonthYearLabel(previousMonthKey);

  // Valor que sobrou do Mês anterior que fechou positivo (onde gastos < receitas)
  const previousMonthBalance = calculateMonthSurplus(previousMonthKey, fixedItems, transactions);

  // 1. Receitas Fixas: Active fixed items of type 'income'
  const activeFixedIncomes = fixedItems.filter((item) => item.active && item.type === 'income');
  const fixedIncomeTotal = activeFixedIncomes.reduce((sum, item) => sum + item.amount, 0);

  // 2. Gastos Fixos: Active fixed items of type 'expense'
  const activeFixedExpenses = fixedItems.filter((item) => item.active && item.type === 'expense');
  const fixedExpenseTotal = activeFixedExpenses.reduce((sum, item) => sum + item.amount, 0);

  // 3. Transactions already recorded/scheduled for the target month
  const targetMonthTransactions = transactions.filter((tx) => tx.date.startsWith(targetMonthKey));

  // 3a. Cartão de Crédito Installments falling into the target month
  const creditCardInstallments = targetMonthTransactions.filter(
    (tx) => tx.paymentMethod === 'credit_card' && tx.type === 'expense'
  );
  const creditCardInstallmentsTotal = creditCardInstallments.reduce((sum, tx) => sum + tx.amount, 0);

  // 3b. Scheduled single expenses for the target month that are not fixed and not credit card
  const scheduledExpenses = targetMonthTransactions.filter(
    (tx) => tx.paymentMethod !== 'credit_card' && !tx.isFixed && tx.type === 'expense'
  );
  const scheduledTransactionsTotal = scheduledExpenses.reduce((sum, tx) => sum + tx.amount, 0);

  // 3c. Scheduled single incomes for the target month that are not fixed
  const scheduledIncomes = targetMonthTransactions.filter(
    (tx) => !tx.isFixed && tx.type === 'income'
  );
  const scheduledIncomesTotal = scheduledIncomes.reduce((sum, tx) => sum + tx.amount, 0);

  // Entradas Previstas somam: Receitas Fixas + Entradas Avulsas + Saldo Positivo Anterior
  const totalIncomeExpected = fixedIncomeTotal + scheduledIncomesTotal + previousMonthBalance;
  const totalExpenseExpected =
    fixedExpenseTotal + creditCardInstallmentsTotal + scheduledTransactionsTotal;

  const netForecast = totalIncomeExpected - totalExpenseExpected;

  return {
    targetMonthStr,
    targetMonthKey,
    previousMonthStr,
    previousMonthBalance,
    fixedIncomeTotal,
    fixedExpenseTotal,
    creditCardInstallmentsTotal,
    scheduledTransactionsTotal,
    totalIncomeExpected,
    totalExpenseExpected,
    netForecast,
    items: {
      fixedIncomes: activeFixedIncomes,
      fixedExpenses: activeFixedExpenses,
      installments: creditCardInstallments,
      scheduled: [...scheduledExpenses, ...scheduledIncomes],
    },
  };
}

export function resetAllDataToDefault(): {
  categories: Category[];
  fixedItems: FixedItem[];
  transactions: Transaction[];
} {
  const seed = getInitialSeedData();
  saveCategories(seed.categories);
  saveFixedItems(seed.fixedItems);
  saveTransactions(seed.transactions);
  return seed;
}

export function clearAllData(): {
  categories: Category[];
  fixedItems: FixedItem[];
  transactions: Transaction[];
} {
  const categories = [...DEFAULT_CATEGORIES];
  saveCategories(categories);
  saveFixedItems([]);
  saveTransactions([]);
  return { categories, fixedItems: [], transactions: [] };
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading user profile:', e);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving user profile:', e);
  }
}
