import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface FinanceModalProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  modalType: "income" | "expense";
}

export function FinanceModal({
  isOpen,
  setIsOpen,
  modalType,
}: FinanceModalProps) {
  const [topic, setTopic] = useState("");
  const [amount, setAmount] = useState("");
  const [audience, setAudience] = useState("General");

  // MOCK SAVE behavior since API integration depends on where it's called
  const handleSave = () => {
    setIsOpen(false);
    setTopic("");
    setAmount("");
    setAudience("General");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {modalType === "income" ? "Add Income" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Topic / Category
            </label>
            <Input
              placeholder={
                modalType === "income" ? "e.g. Salary" : "e.g. Groceries"
              }
              className="bg-zinc-800 border-zinc-700"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Amount ($)
            </label>
            <Input
              type="number"
              placeholder="0.00"
              className="bg-zinc-800 border-zinc-700 text-lg"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">
              Target Audience
            </label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="Him">Him</SelectItem>
                <SelectItem value="Her">Her</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            className={`w-full mt-2 text-white ${modalType === "income" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-indigo-600 hover:bg-indigo-500"}`}
          >
            Save Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
