import { MonthlyData, Expense } from "@/types/expense";

const STORAGE_KEY = "moneysaver_data";

export const getStoredData = (): MonthlyData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  return {
    monthlyLimit: 50000,
    expenses: [],
  };
};

export const saveData = (data: MonthlyData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const addExpense = (expense: Expense): void => {
  const data = getStoredData();
  data.expenses.push(expense);
  saveData(data);
};

export const deleteExpense = (id: string): void => {
  const data = getStoredData();
  data.expenses = data.expenses.filter((exp) => exp.id !== id);
  saveData(data);
};

export const updateMonthlyLimit = (limit: number): void => {
  const data = getStoredData();
  data.monthlyLimit = limit;
  saveData(data);
};

export const getTotalExpenses = (): number => {
  const data = getStoredData();
  return data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
};

export const getExpensesByCategory = (): Record<string, number> => {
  const data = getStoredData();
  const categoryTotals: Record<string, number> = {};
  
  data.expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  return categoryTotals;
};
