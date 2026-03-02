import { useState, useMemo } from 'react';
import { History, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FinanceHistoryView } from '@/components/features/finances/FinanceHistoryView';
import { FinancePlanningView } from '@/components/features/finances/FinancePlanningView';
import { FinanceModal } from '@/components/features/finances/FinanceModal';
import {
    useGetFinanceHistoryQuery,
    useGetFinancePlannedQuery,
    useDeleteFinanceRecordMutation
} from '@/store/api/financesApi';
import { toast } from 'sonner';

export default function Finances() {
    const [mode, setMode] = useState<'history' | 'planning'>('history');
    const [audience, setAudience] = useState<'Him' | 'Her' | 'General'>('General');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
    const currentYear = new Date().getFullYear();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense'>('expense');

    const { data: historyData, isLoading: historyLoading } = useGetFinanceHistoryQuery({ audience });
    const { data: plannedData, isLoading: plannedLoading } = useGetFinancePlannedQuery({ audience: 'General', month: selectedMonth, year: currentYear });

    const [deleteRecord] = useDeleteFinanceRecordMutation();

    const historyRecords = useMemo(() => historyData || [], [historyData]);
    const plannedRecords = useMemo(() => plannedData || [], [plannedData]);

    const handleDeleteHistory = async (id: string) => {
        try {
            await deleteRecord(id).unwrap();
            toast.success('Record deleted');
        } catch (error) {
            console.error('Failed to delete record:', error);
            toast.error('Failed to delete record');
        }
    };

    const handleDeletePlanned = async (id: string) => {
        try {
            await deleteRecord(id).unwrap();
            toast.success('Record deleted');
        } catch (error) {
            console.error('Failed to delete record:', error);
            toast.error('Failed to delete record');
        }
    };

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

            {(historyLoading || plannedLoading) ? (
                <div className="flex-1 animate-pulse bg-zinc-900/50 rounded-xl" />
            ) : mode === 'history' ? (
                <FinanceHistoryView
                    historyRecords={historyRecords}
                    openModal={openModal}
                    handleDeleteHistory={handleDeleteHistory}
                    formatMoney={formatMoney}
                />
            ) : (
                <FinancePlanningView
                    plannedRecords={plannedRecords}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    openModal={openModal}
                    handleDeletePlanned={handleDeletePlanned}
                    formatMoney={formatMoney}
                />
            )}

            <FinanceModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                modalType={modalType}
            />
        </div>
    );
}
