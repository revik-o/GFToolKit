import { useState } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Wallet, History, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FinanceRecord = {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    topic: string;
    target_audience: 'Him' | 'Her' | 'General';
    date?: string;
    month?: number;
    year?: number;
};

const mockHistory: FinanceRecord[] = [
    { id: '1', type: 'income', amount: 3500, topic: 'Salary', target_audience: 'Him', date: new Date().toISOString() },
    { id: '2', type: 'expense', amount: 150, topic: 'Groceries', target_audience: 'General', date: new Date().toISOString() },
    { id: '3', type: 'expense', amount: 45, topic: 'Gas', target_audience: 'Her', date: new Date(Date.now() - 86400000).toISOString() },
    { id: '4', type: 'expense', amount: 120, topic: 'Date Night Dinner', target_audience: 'General', date: new Date(Date.now() - 172800000).toISOString() },
];

const mockPlanned: FinanceRecord[] = [
    { id: '10', type: 'income', amount: 4000, topic: 'Expected Salary', target_audience: 'Him', month: 3, year: 2026 },
    { id: '11', type: 'income', amount: 3500, topic: 'Expected Salary', target_audience: 'Her', month: 3, year: 2026 },
    { id: '12', type: 'expense', amount: 1200, topic: 'Rent', target_audience: 'General', month: 3, year: 2026 },
    { id: '13', type: 'expense', amount: 400, topic: 'Groceries', target_audience: 'General', month: 3, year: 2026 },
    { id: '14', type: 'expense', amount: 100, topic: 'Gym', target_audience: 'Him', month: 3, year: 2026 },
];

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Finances() {
    const [mode, setMode] = useState<'history' | 'planning'>('history');
    const [audience, setAudience] = useState<'Him' | 'Her' | 'General'>('General');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12

    const [historyRecords, setHistoryRecords] = useState<FinanceRecord[]>(mockHistory);
    const [plannedRecords, setPlannedRecords] = useState<FinanceRecord[]>(mockPlanned);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

    // Computed History
    const filteredHistory = historyRecords.filter(r => r.target_audience === audience || audience === 'General');
    const totalIncome = filteredHistory.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = filteredHistory.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const totalBalance = totalIncome - totalExpense;

    // Computed Planned
    const totalPlannedIncome = plannedRecords.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalPlannedExpense = plannedRecords.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const projectedBalance = totalPlannedIncome - totalPlannedExpense;

    const handleDeleteHistory = (id: string) => setHistoryRecords(historyRecords.filter(r => r.id !== id));
    const handleDeletePlanned = (id: string) => setPlannedRecords(plannedRecords.filter(r => r.id !== id));

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const openModal = (type: 'income' | 'expense') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    return (
        <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
                    <p className="text-zinc-400 mt-1">Manage shared budgets and track transactions.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
                        <Button variant="ghost" size="sm" onClick={() => setMode('history')} className={mode === 'history' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'}>
                            <History size={16} className="mr-2" /> History
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setMode('planning')} className={mode === 'planning' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400'}>
                            <CalendarDays size={16} className="mr-2" /> Planning
                        </Button>
                    </div>

                    {mode === 'history' && (
                        <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
                            <Button variant="ghost" size="sm" onClick={() => setAudience('Him')} className={audience === 'Him' ? 'bg-blue-900/50 text-blue-300' : 'text-zinc-400'}>Him</Button>
                            <Button variant="ghost" size="sm" onClick={() => setAudience('Her')} className={audience === 'Her' ? 'bg-pink-900/50 text-pink-300' : 'text-zinc-400'}>Her</Button>
                            <Button variant="ghost" size="sm" onClick={() => setAudience('General')} className={audience === 'General' ? 'bg-zinc-800' : 'text-zinc-400'}>General</Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-px bg-zinc-900 w-full mb-8" />

            {/* HISTORY MODE */}
            {mode === 'history' && (
                <div className="max-w-5xl space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-zinc-400 text-sm font-medium">Total Balance</p>
                                <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                    <Wallet size={16} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-zinc-100">{formatMoney(totalBalance)}</p>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-zinc-400 text-sm font-medium">Total Income</p>
                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                    <ArrowUpRight size={16} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-emerald-400">{formatMoney(totalIncome)}</p>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-zinc-400 text-sm font-medium">Total Expenses</p>
                                <div className="h-8 w-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                                    <ArrowDownRight size={16} />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-red-400">{formatMoney(totalExpense)}</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Transaction History</h2>
                            <Button onClick={() => openModal('expense')} size="sm" className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                                <Plus size={16} className="mr-2" /> Add Transaction
                            </Button>
                        </div>

                        <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden">
                            {filteredHistory.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">No transactions for this view.</div>
                            ) : (
                                <div className="divide-y divide-zinc-800/60">
                                    {filteredHistory.map(record => (
                                        <div key={record.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${record.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                                                    {record.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-100">{record.topic}</p>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                                                        <span>{record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}</span>
                                                        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                                        <span>{record.target_audience}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className={`font-semibold ${record.type === 'income' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                                                    {record.type === 'income' ? '+' : '-'}{formatMoney(record.amount)}
                                                </p>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-300">
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-50">
                                                        <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer text-zinc-300"><Pencil size={14} className="mr-2" /> Edit</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-900/50 cursor-pointer" onClick={() => handleDeleteHistory(record.id)}><Trash2 size={14} className="mr-2" /> Delete</DropdownMenuItem>
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
            )}

            {/* PLANNING MODE */}
            {mode === 'planning' && (
                <div className="max-w-3xl space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
                        <div className="flex items-center gap-4">
                            <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                                <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700 font-medium">
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                    {months.map((m, i) => (
                                        <SelectItem key={i + 1} value={(i + 1).toString()}>{m} 2026</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-zinc-400">Projected Balance</p>
                            <p className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatMoney(projectedBalance)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button onClick={() => openModal('income')} className="flex-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30">
                            <Plus size={16} className="mr-2" /> Add Income
                        </Button>
                        <Button onClick={() => openModal('expense')} className="flex-1 bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700">
                            <Plus size={16} className="mr-2" /> Add Expense
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {plannedRecords.map(record => (
                            <div key={record.id} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-lg hover:border-zinc-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded flex items-center justify-center ${record.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {record.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-zinc-100">{record.topic}</h4>
                                        <p className="text-xs text-zinc-500">{record.target_audience}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-medium ${record.type === 'income' ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                        {formatMoney(record.amount)}
                                    </span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-300 -mr-2">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-50">
                                            <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer"><Pencil size={14} className="mr-2" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-900/50 cursor-pointer" onClick={() => handleDeletePlanned(record.id)}><Trash2 size={14} className="mr-2" /> Delete</DropdownMenuItem>
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
            )}

            {/* Shared Modal for Add/Edit */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{modalType === 'income' ? 'Add Income' : 'Add Expense'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Topic / Category</label>
                            <Input placeholder={modalType === 'income' ? 'e.g. Salary' : 'e.g. Groceries'} className="bg-zinc-800 border-zinc-700" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Amount ($)</label>
                            <Input type="number" placeholder="0.00" className="bg-zinc-800 border-zinc-700 text-lg" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Target Audience</label>
                            <Select defaultValue="General">
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

                        <Button onClick={() => setIsModalOpen(false)} className={`w-full mt-2 text-white ${modalType === 'income' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                            Save Record
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
