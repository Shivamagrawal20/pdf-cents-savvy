import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/types/expense";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

export const ExpenseList = ({ expenses, onDeleteExpense }: ExpenseListProps) => {
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest expense entries</CardDescription>
      </CardHeader>
      <CardContent>
        {sortedExpenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No expenses recorded yet</p>
        ) : (
          <div className="space-y-3">
            {sortedExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{expense.platform}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {expense.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(expense.date), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">₹{expense.amount.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
