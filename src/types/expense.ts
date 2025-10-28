export interface Expense {
  id: string;
  platform: string;
  category: string;
  amount: number;
  date: string;
  isRecurring?: boolean;
}

export interface MonthlyData {
  monthlyLimit: number;
  expenses: Expense[];
}

export const CATEGORIES = [
  "Entertainment",
  "Food",
  "Shopping",
  "Transport",
  "Bills",
  "Subscriptions",
  "Healthcare",
  "Education",
  "Other",
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_KEYWORDS: Record<string, Category> = {
  netflix: "Entertainment",
  spotify: "Entertainment",
  prime: "Entertainment",
  hotstar: "Entertainment",
  youtube: "Entertainment",
  zomato: "Food",
  swiggy: "Food",
  uber: "Transport",
  ola: "Transport",
  amazon: "Shopping",
  flipkart: "Shopping",
  myntra: "Shopping",
  electricity: "Bills",
  water: "Bills",
  internet: "Bills",
  mobile: "Bills",
  gym: "Subscriptions",
  hospital: "Healthcare",
  pharmacy: "Healthcare",
  udemy: "Education",
  coursera: "Education",
};
