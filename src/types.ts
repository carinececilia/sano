export type TransactionType = 'expense' | 'income';

export type PaymentMethod = 'cash_debit_pix' | 'fixed' | 'credit_card';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string; // Tailwind color class or hex
  bgLight: string;
  textColor: string;
  type: 'expense' | 'income' | 'both';
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD
  installmentsTotal?: number;
  installmentCurrent?: number;
  installmentGroupId?: string;
  isFixed?: boolean;
  repeatMonthly?: boolean;
  notes?: string;
  createdAt: string;
}

export interface FixedItem {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  dayOfMonth: number;
  active: boolean;
  repeatMonthly: boolean;
  notes?: string;
}

export interface MonthForecast {
  targetMonthStr: string; // e.g. "Setembro de 2026"
  targetMonthKey: string; // e.g. "2026-09"
  previousMonthStr?: string; // e.g. "Agosto de 2026"
  previousMonthBalance: number; // Saldo positivo trazido do mês anterior
  fixedIncomeTotal: number;
  fixedExpenseTotal: number;
  creditCardInstallmentsTotal: number;
  scheduledTransactionsTotal: number;
  totalIncomeExpected: number;
  totalExpenseExpected: number;
  netForecast: number;
  items: {
    fixedIncomes: FixedItem[];
    fixedExpenses: FixedItem[];
    installments: Transaction[];
    scheduled: Transaction[];
  };
}

export type ActiveTab = 'dashboard' | 'statement' | 'settings';

export interface UserProfile {
  name: string;
  email?: string;
  photoUrl?: string;
  pin?: string;
  isPinEnabled?: boolean;
  currency?: string;
  monthlySavingsGoal?: number;
}
