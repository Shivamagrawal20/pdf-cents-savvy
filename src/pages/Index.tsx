import { useState, useEffect } from "react";
import { Wallet, TrendingDown, PiggyBank, DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { BudgetProgress } from "@/components/BudgetProgress";
import { CategoryChart } from "@/components/CategoryChart";
import { MonthlyLimitDialog } from "@/components/MonthlyLimitDialog";
import { getStoredData, saveData, getTotalExpenses, getExpensesByCategory } from "@/utils/storage";
import { Expense } from "@/types/expense";

const Index = () => {
  const [data, setData] = useState(getStoredData());
  const [totalExpenses, setTotalExpenses] = useState(getTotalExpenses());
  const [categoryData, setCategoryData] = useState(getExpensesByCategory());

  useEffect(() => {
    setTotalExpenses(getTotalExpenses());
    setCategoryData(getExpensesByCategory());
  }, [data]);

  const handleAddExpense = (expenseData: {
    platform: string;
    category: string;
    amount: number;
    date: string;
  }) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      ...expenseData,
    };

    const updatedData = {
      ...data,
      expenses: [...data.expenses, newExpense],
    };

    saveData(updatedData);
    setData(updatedData);
  };

  const handleDeleteExpense = (id: string) => {
    const updatedData = {
      ...data,
      expenses: data.expenses.filter((exp) => exp.id !== id),
    };

    saveData(updatedData);
    setData(updatedData);
  };

  const handleUpdateLimit = (limit: number) => {
    const updatedData = {
      ...data,
      monthlyLimit: limit,
    };

    saveData(updatedData);
    setData(updatedData);
  };

  const remaining = data.monthlyLimit - totalExpenses;
  const percentage = (totalExpenses / data.monthlyLimit) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">MoneySaver</h1>
            <p className="text-muted-foreground">Smart Personal Expense Manager</p>
          </div>
          <MonthlyLimitDialog currentLimit={data.monthlyLimit} onUpdateLimit={handleUpdateLimit} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Monthly Budget"
            value={`₹${data.monthlyLimit.toFixed(2)}`}
            icon={Wallet}
            variant="default"
          />
          <StatCard
            title="Total Spent"
            value={`₹${totalExpenses.toFixed(2)}`}
            icon={TrendingDown}
            variant={percentage >= 100 ? "destructive" : percentage >= 80 ? "warning" : "default"}
            subtitle={`${percentage.toFixed(1)}% of budget`}
          />
          <StatCard
            title="Remaining"
            value={`₹${Math.max(0, remaining).toFixed(2)}`}
            icon={PiggyBank}
            variant={remaining >= 0 ? "success" : "destructive"}
          />
          <StatCard
            title="Transactions"
            value={data.expenses.length.toString()}
            icon={DollarSign}
            variant="default"
            subtitle="this month"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <BudgetProgress spent={totalExpenses} limit={data.monthlyLimit} />
            <CategoryChart categoryData={categoryData} />
          </div>
        </div>

        {/* Expense List */}
        <ExpenseList expenses={data.expenses} onDeleteExpense={handleDeleteExpense} />
      </div>
    </div>
  );
};

export default Index;
