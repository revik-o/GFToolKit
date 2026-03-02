import {
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Pencil,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FinanceRecord } from "@/store/api/financesApi";

interface FinanceHistoryViewProps {
  historyRecords: FinanceRecord[];
  openModal: (type: "income" | "expense") => void;
  handleDeleteHistory: (id: string) => void;
  formatMoney: (val: number) => string;
}

export function FinanceHistoryView({
  historyRecords,
  openModal,
  handleDeleteHistory,
  formatMoney,
}: FinanceHistoryViewProps) {
  const totalIncome = historyRecords
    .filter((r) => r.type === "income")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = historyRecords
    .filter((r) => r.type === "expense")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  return (
    <div className="max-w-5xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-sm font-medium">Total Balance</p>
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-100">
            {formatMoney(totalBalance)}
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-sm font-medium">Total Income</p>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-400">
            {formatMoney(totalIncome)}
          </p>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-400 text-sm font-medium">Total Expenses</p>
            <div className="h-8 w-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-400">
            {formatMoney(totalExpense)}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Transaction History</h2>
          <Button
            onClick={() => openModal("expense")}
            size="sm"
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
          >
            Add Transaction
          </Button>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
          {historyRecords.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No transactions for this view.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {historyRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${record.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"}`}
                    >
                      {record.type === "income" ? (
                        <ArrowUpRight size={18} />
                      ) : (
                        <ArrowDownRight size={18} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">
                        {record.topic}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                        <span>
                          {record.date
                            ? new Date(record.date).toLocaleDateString()
                            : "N/A"}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                        <span>{record.target_audience}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p
                      className={`font-semibold ${record.type === "income" ? "text-emerald-400" : "text-zinc-100"}`}
                    >
                      {record.type === "income" ? "+" : "-"}
                      {formatMoney(record.amount)}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-300"
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-zinc-900 border-zinc-800 text-zinc-50"
                      >
                        <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-zinc-300">
                          <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/50 cursor-pointer"
                          onClick={() => handleDeleteHistory(record.id)}
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
