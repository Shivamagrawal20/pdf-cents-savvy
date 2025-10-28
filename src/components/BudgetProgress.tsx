import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

interface BudgetProgressProps {
  spent: number;
  limit: number;
}

export const BudgetProgress = ({ spent, limit }: BudgetProgressProps) => {
  const percentage = (spent / limit) * 100;
  const remaining = limit - spent;

  const getProgressColor = () => {
    if (percentage >= 100) return "bg-destructive";
    if (percentage >= 80) return "bg-warning";
    return "bg-success";
  };

  const getAlert = () => {
    if (percentage >= 100) {
      return {
        icon: AlertCircle,
        variant: "destructive" as const,
        message: "Budget exceeded! You've spent more than your monthly limit.",
      };
    }
    if (percentage >= 80) {
      return {
        icon: AlertTriangle,
        variant: "default" as const,
        message: "Warning! You've reached 80% of your monthly budget.",
        className: "border-warning/50 bg-warning/5 text-warning-foreground",
      };
    }
    return {
      icon: CheckCircle,
      variant: "default" as const,
      message: "You're on track! Keep up the good spending habits.",
      className: "border-success/50 bg-success/5 text-success-foreground",
    };
  };

  const alert = getAlert();
  const Icon = alert.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Budget</CardTitle>
        <CardDescription>Track your spending against your monthly limit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className="font-semibold">₹{spent.toFixed(2)} / ₹{limit.toFixed(2)}</span>
          </div>
          <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{percentage.toFixed(1)}% used</span>
            <span className={remaining >= 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
              ₹{Math.abs(remaining).toFixed(2)} {remaining >= 0 ? "remaining" : "over budget"}
            </span>
          </div>
        </div>

        <Alert variant={alert.variant} className={alert.className}>
          <Icon className="h-4 w-4" />
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
