import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/types/expense";
import { autoCategorizePlatform } from "@/utils/categorization";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface ExpenseFormProps {
  onAddExpense: (expense: { platform: string; category: string; amount: number; date: string }) => void;
}

export const ExpenseForm = ({ onAddExpense }: ExpenseFormProps) => {
  const [platform, setPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handlePlatformChange = (value: string) => {
    setPlatform(value);
    if (!category) {
      setCategory(autoCategorizePlatform(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!platform || !amount || !date) {
      toast.error("Please fill in all fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onAddExpense({
      platform,
      category: category || "Other",
      amount: numAmount,
      date,
    });

    setPlatform("");
    setCategory("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    
    toast.success("Expense added successfully!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Expense</CardTitle>
        <CardDescription>Track your spending across different platforms</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform / Merchant</Label>
            <Input
              id="platform"
              placeholder="e.g., Netflix, Zomato, Amazon"
              value={platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
