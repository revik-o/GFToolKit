import {
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FinanceRecord } from "@/store/api/financesApi";

interface FinancePlanningViewProps {
  plannedRecords: FinanceRecord[];
  selectedMonth: number;
  setSelectedMonth: (val: number) => void;
  openModal: (type: "income" | "expense") => void;
  handleDeletePlanned: (id: string) => void;
  formatMoney: (val: number) => string;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function FinancePlanningView({
  plannedRecords,
  selectedMonth,
  setSelectedMonth,
  openModal,
  handleDeletePlanned,
  formatMoney,
}: FinancePlanningViewProps) {
  const totalPlannedIncome = plannedRecords
    .filter((r) => r.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPlannedExpense = plannedRecords
    .filter((r) => r.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const projectedBalance = totalPlannedIncome - totalPlannedExpense;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-4">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(val) => setSelectedMonth(parseInt(val))}
          >
            <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 font-medium">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
              {months.map((m, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {m} 2026
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-right">
          <p className="text-sm text-zinc-400">Projected Balance</p>
          <p
            className={`text-2xl font-bold ${projectedBalance >= 0 ? "text-emerald-400" : "text-red-400"}`}
          >
            {formatMoney(projectedBalance)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={() => openModal("income")}
          className="flex-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30"
        >
          Add Income
        </Button>
        <Button
          onClick={() => openModal("expense")}
          className="flex-1 bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
        >
          Add Expense
        </Button>
      </div>

      <div className="space-y-3">
        {plannedRecords.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-lg hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-8 w-8 rounded flex items-center justify-center ${record.type === "income" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
              >
                {record.type === "income" ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
              </div>
              <div>
                <h4 className="font-medium text-zinc-100">{record.topic}</h4>
                <p className="text-xs text-zinc-500">
                  {record.target_audience}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`font-medium ${record.type === "income" ? "text-emerald-400" : "text-zinc-300"}`}
              >
                {formatMoney(record.amount)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-300 -mr-2"
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-zinc-900 border-zinc-800 text-zinc-50"
                >
                  <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                    <Pencil size={14} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/50 cursor-pointer"
                    onClick={() => handleDeletePlanned(record.id)}
                  >
                    <Trash2 size={14} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        {plannedRecords.length === 0 && (
          <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
            No budget items set for this month.
          </div>
        )}
      </div>
    </div>
  );
}
