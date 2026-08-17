/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Category,
  Transaction,
  FixedItem,
  ActiveTab,
  MonthForecast,
} from './types';
import {
  loadCategories,
  saveCategories,
  loadFixedItems,
  saveFixedItems,
  loadTransactions,
  saveTransactions,
  loadUserProfile,
  saveUserProfile,
  DEFAULT_USER_PROFILE,
  calculateMonthForecast,
  resetAllDataToDefault,
  clearAllData,
} from './utils/storage';
import { getCurrentMonthKey, getNextMonthKey } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StatementView } from './components/StatementView';
import { SettingsView } from './components/SettingsView';
import { QuickExpenseModal } from './components/QuickExpenseModal';
import { ForecastDetailModal } from './components/ForecastDetailModal';
import { CategoryModal } from './components/CategoryModal';
import { FixedItemModal } from './components/FixedItemModal';
import { UserProfileModal } from './components/UserProfileModal';
import { PinLockScreen } from './components/PinLockScreen';
import { UserProfile } from './types';
import { Check, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [categories, setCategories] = useState<Category[]>([]);
  const [fixedItems, setFixedItems] = useState<FixedItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Modals state
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isForecastDetailsOpen, setIsForecastDetailsOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isFixedItemModalOpen, setIsFixedItemModalOpen] = useState(false);
  const [fixedItemToEdit, setFixedItemToEdit] = useState<FixedItem | null>(null);
  const [isUserProfileOpen, setIsUserProfileOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Initial load
  useEffect(() => {
    const cats = loadCategories();
    const fixs = loadFixedItems();
    const txs = loadTransactions();
    const profile = loadUserProfile();
    setCategories(cats);
    setFixedItems(fixs);
    setTransactions(txs);
    setUserProfile(profile);

    if (profile.isPinEnabled && profile.pin) {
      setIsLocked(true);
    }
  }, []);

  // Sync state to storage
  const handleUpdateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    saveCategories(newCategories);
  };

  const handleUpdateFixedItems = (newFixedItems: FixedItem[]) => {
    setFixedItems(newFixedItems);
    saveFixedItems(newFixedItems);
  };

  const handleUpdateTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    saveTransactions(newTransactions);
  };

  const handleUpdateUserProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    saveUserProfile(updatedProfile);
    showToast('Preferências atualizadas com sucesso!');
  };

  // Next Month Forecast calculation (The "Brain" of the App)
  const currentMonthKey = getCurrentMonthKey();
  const nextMonthKey = getNextMonthKey(currentMonthKey);
  const forecast: MonthForecast = useMemo(() => {
    return calculateMonthForecast(nextMonthKey, fixedItems, transactions);
  }, [nextMonthKey, fixedItems, transactions]);

  // Handler for Quick Expense / Income submission
  const handleSaveQuickTransactions = (
    newTxList: Omit<Transaction, 'id' | 'createdAt'>[],
    newFixedItem?: Omit<FixedItem, 'id'>
  ) => {
    const createdTransactions: Transaction[] = newTxList.map((item, index) => ({
      ...item,
      id: `tx-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
    }));

    const updatedTransactions = [...createdTransactions, ...transactions];
    handleUpdateTransactions(updatedTransactions);

    // If a new fixed item is requested
    if (newFixedItem) {
      const createdFixed: FixedItem = {
        ...newFixedItem,
        id: `fix-${Date.now()}`,
      };
      const updatedFixed = [createdFixed, ...fixedItems];
      handleUpdateFixedItems(updatedFixed);

      const day = newFixedItem.dayOfMonth < 10 ? `0${newFixedItem.dayOfMonth}` : newFixedItem.dayOfMonth;
      if (newFixedItem.type === 'income') {
        showToast(`Receita recorrente agendada: todo dia ${day} de cada mês!`);
      } else {
        showToast(`Gasto fixo agendado: todo dia ${day} de cada mês!`);
      }
    } else if (createdTransactions.length > 1) {
      showToast(`${createdTransactions.length} parcelas registradas com sucesso!`);
    } else {
      showToast(
        `${createdTransactions[0]?.type === 'income' ? 'Receita' : 'Gasto'} adicionado com sucesso!`
      );
    }
  };

  // Handler for single transaction deletion
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    handleUpdateTransactions(updated);
    showToast('Lançamento excluído.');
  };

  // Category CRUD Handlers
  const handleSaveCategory = (cat: Category) => {
    const exists = categories.some((c) => c.id === cat.id);
    let updated: Category[];
    if (exists) {
      updated = categories.map((c) => (c.id === cat.id ? cat : c));
      showToast(`Categoria "${cat.name}" atualizada.`);
    } else {
      updated = [...categories, cat];
      showToast(`Categoria "${cat.name}" criada.`);
    }
    handleUpdateCategories(updated);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const updated = categories.filter((c) => c.id !== categoryId);
    handleUpdateCategories(updated);
    showToast('Categoria excluída.');
  };

  // Fixed Items CRUD Handlers
  const handleSaveFixedItem = (item: FixedItem) => {
    const exists = fixedItems.some((f) => f.id === item.id);
    let updated: FixedItem[];
    if (exists) {
      updated = fixedItems.map((f) => (f.id === item.id ? item : f));
      showToast(`Item fixo "${item.description}" atualizado.`);
    } else {
      updated = [item, ...fixedItems];
      showToast(`Item fixo "${item.description}" criado.`);
    }
    handleUpdateFixedItems(updated);
  };

  const handleToggleFixedItem = (id: string, active: boolean) => {
    const updated = fixedItems.map((f) => (f.id === id ? { ...f, active } : f));
    handleUpdateFixedItems(updated);
  };

  const handleDeleteFixedItem = (id: string) => {
    const updated = fixedItems.filter((f) => f.id !== id);
    handleUpdateFixedItems(updated);
    showToast('Item fixo excluído.');
  };

  // Data Export / Import / Reset Handlers
  const handleExportData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      categories,
      fixedItems,
      transactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `organizador-financeiro-${currentMonthKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso!');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.categories) handleUpdateCategories(parsed.categories);
        if (parsed.fixedItems) handleUpdateFixedItems(parsed.fixedItems);
        if (parsed.transactions) handleUpdateTransactions(parsed.transactions);
        showToast('Dados importados com sucesso!');
      } catch (err) {
        showToast('Erro ao importar arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSeedData = () => {
    const reset = resetAllDataToDefault();
    setCategories(reset.categories);
    setFixedItems(reset.fixedItems);
    setTransactions(reset.transactions);
    showToast('Dados de exemplo restaurados!');
  };

  const handleClearAllData = () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os registros e itens fixos?')) {
      const cleared = clearAllData();
      setCategories(cleared.categories);
      setFixedItems([]);
      setTransactions([]);
      showToast('Todos os registros foram limpos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header & Mobile Bottom Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
      />

      {/* Main Screen Container */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            forecast={forecast}
            transactions={transactions}
            fixedItems={fixedItems}
            categories={categories}
            userProfile={userProfile}
            onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            onOpenForecastDetails={() => setIsForecastDetailsOpen(true)}
            onOpenUserProfile={() => setIsUserProfileOpen(true)}
            onDeleteTransaction={handleDeleteTransaction}
            onNavigateToStatement={() => setActiveTab('statement')}
          />
        )}

        {activeTab === 'statement' && (
          <StatementView
            transactions={transactions}
            fixedItems={fixedItems}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenQuickExpense={() => setIsQuickExpenseOpen(true)}
            onNavigateToFixed={() => setActiveTab('fixed')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            categories={categories}
            fixedItems={fixedItems}
            userProfile={userProfile}
            onOpenUserProfile={() => setIsUserProfileOpen(true)}
            onOpenNewCategory={() => {
              setCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            onEditCategory={(cat) => {
              setCategoryToEdit(cat);
              setIsCategoryModalOpen(true);
            }}
            onDeleteCategory={handleDeleteCategory}
            onOpenNewFixedItem={() => {
              setFixedItemToEdit(null);
              setIsFixedItemModalOpen(true);
            }}
            onEditFixedItem={(item) => {
              setFixedItemToEdit(item);
              setIsFixedItemModalOpen(true);
            }}
            onToggleFixedItem={handleToggleFixedItem}
            onDeleteFixedItem={handleDeleteFixedItem}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetSeedData={handleResetSeedData}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* PIN Lock Screen if device security is locked */}
      {isLocked && userProfile.isPinEnabled && userProfile.pin && (
        <PinLockScreen
          userProfile={userProfile}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-xs animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal 1: Inserção Rápida de Gastos (Foco em Baixa Fricção) */}
      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        categories={categories}
        onSaveTransaction={handleSaveQuickTransactions}
      />

      {/* Modal 2: Previsão do Próximo Mês Detalhada */}
      <ForecastDetailModal
        isOpen={isForecastDetailsOpen}
        onClose={() => setIsForecastDetailsOpen(false)}
        forecast={forecast}
        categories={categories}
      />

      {/* Modal 3: Cadastro / Edição de Categorias */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        categoryToEdit={categoryToEdit}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Modal 4: Cadastro / Edição de Itens Fixos Recorrentes */}
      <FixedItemModal
        isOpen={isFixedItemModalOpen}
        onClose={() => {
          setIsFixedItemModalOpen(false);
          setFixedItemToEdit(null);
        }}
        itemToEdit={fixedItemToEdit}
        categories={categories}
        onSaveFixedItem={handleSaveFixedItem}
        onDeleteFixedItem={handleDeleteFixedItem}
      />

      {/* Modal 5: Preferências do Usuário (Nome, Senha/PIN, Foto) */}
      <UserProfileModal
        isOpen={isUserProfileOpen}
        onClose={() => setIsUserProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleUpdateUserProfile}
      />
    </div>
  );
}
