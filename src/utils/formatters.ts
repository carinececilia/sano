// Utility helpers for formatting currency, dates, and numbers in pt-BR

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyParts(value: number): { symbol: string; integer: string; decimal: string } {
  const formatted = formatCurrency(value);
  // Example: "R$ 1.234,56"
  const parts = formatted.split(',');
  const symbolAndInt = parts[0] || 'R$ 0';
  const decimal = parts[1] || '00';
  return {
    symbol: 'R$',
    integer: symbolAndInt.replace('R$', '').trim(),
    decimal: `,${decimal}`,
  };
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export function formatRelativeDate(dateStr: string): string {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  if (dateStr === today) return 'Hoje';
  if (dateStr === yesterday) return 'Ontem';

  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  return `${day} de ${monthNames[date.getMonth()]}, ${dayNames[date.getDay()]}`;
}

export function getMonthYearLabel(monthKey: string): string {
  // monthKey is "YYYY-MM"
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex]} de ${year}`;
}

export function getNextMonthKey(currentMonthKey: string): string {
  const [year, month] = currentMonthKey.split('-').map(Number);
  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
}

export function getPreviousMonthKey(currentMonthKey: string): string {
  const [year, month] = currentMonthKey.split('-').map(Number);
  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1 + monthsToAdd, day);
  
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
