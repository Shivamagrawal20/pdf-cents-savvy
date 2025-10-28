import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { toast } from "sonner";

interface MonthlyLimitDialogProps {
  currentLimit: number;
  onUpdateLimit: (limit: number) => void;
}

export const MonthlyLimitDialog = ({ currentLimit, onUpdateLimit }: MonthlyLimitDialogProps) => {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(currentLimit.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numLimit = parseFloat(limit);
    
    if (isNaN(numLimit) || numLimit <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    onUpdateLimit(numLimit);
    setOpen(false);
    toast.success("Monthly limit updated successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Set Budget Limit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Monthly Budget Limit</DialogTitle>
          <DialogDescription>
            Define your monthly spending limit to track and manage your expenses effectively.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="limit">Monthly Limit (₹)</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              placeholder="50000"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            Update Limit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
