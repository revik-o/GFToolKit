import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { CheckSquare, Target, HeartHandshake, Wallet, Zap, Bell, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfWeek, subWeeks, startOfMonth, subMonths, startOfYear, subYears, isAfter } from 'date-fns';

type DashboardData = {
    tasksNotDone: number;
    goalsTotal: number;
    promisesTotal: number;
    totalExpenses: number;
    herBattery: number;
    lastNotification: string;
};

// Generic Chart Data point
type ChartDataPoint = {
    name: string;
    Tasks: number;
    Goals: number;
    Promises: number;
    date: Date;
};

type BackendItem = {
    created_at: string;
    updated_at: string;
    status?: { String: string };
    type?: string;
    amount?: number;
};


export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<DashboardData>({
        tasksNotDone: 0,
        goalsTotal: 0,
        promisesTotal: 0,
        totalExpenses: 0,
        herBattery: 0,
        lastNotification: 'Meeting at 5PM today', // Mock
    });

    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('week');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Fetch basic metrics
                const [tasksRes, goalsRes, promisesRes, financesRes, batteryRes] = await Promise.all([
                    fetchApi<BackendItem[]>('/api/v1/task/readAll'),
                    fetchApi<BackendItem[]>('/api/v1/goal/read?audience=General'),
                    fetchApi<BackendItem[]>('/api/v1/promise/read?audience=General'),
                    fetchApi<BackendItem[]>('/api/v1/finances/history'), // Uses General by default or we fetch all
                    fetchApi<{ level: number }>('/api/v1/social/battery/read?audience=Her')
                ]);

                const tasks = tasksRes.data || [];
                const goals = goalsRes.data || [];
                const promises = promisesRes.data || [];
                const finances = financesRes.data || [];
                const battery = batteryRes.data?.level || 0;

                const tasksNotDone = tasks.filter((t: BackendItem) => t.status?.String !== 'Done').length;
                const totalExpenses = finances.filter((f: BackendItem) => f.type === 'expense').reduce((acc: number, f: BackendItem) => acc + (f.amount || 0), 0);

                setMetrics({
                    tasksNotDone,
                    goalsTotal: goals.length,
                    promisesTotal: promises.length,
                    totalExpenses,
                    herBattery: battery,
                    lastNotification: 'Remember to pay the internet bill! 🔔' // Normally would come from WS
                });

                // Process Chart Data (Items marked as completed/created by timeframe)
                // Assuming all items have created_at or updated_at.
                const generateChartData = (tf: 'day' | 'week' | 'month' | 'year'): ChartDataPoint[] => {
                    const data: ChartDataPoint[] = [];
                    const now = new Date();
                    let periods = 7;

                    if (tf === 'day') periods = 7; // Last 7 days
                    if (tf === 'week') periods = 4; // Last 4 weeks
                    if (tf === 'month') periods = 6; // Last 6 months
                    if (tf === 'year') periods = 5; // Last 5 years

                    for (let i = periods - 1; i >= 0; i--) {
                        let name = '';
                        let start = new Date();

                        if (tf === 'day') {
                            start = subDays(now, i);
                            name = format(start, 'EEE'); // Mon, Tue
                        } else if (tf === 'week') {
                            start = startOfWeek(subWeeks(now, i));
                            name = `Week ${format(start, 'w')}`;
                        } else if (tf === 'month') {
                            start = startOfMonth(subMonths(now, i));
                            name = format(start, 'MMM'); // Jan, Feb
                        } else if (tf === 'year') {
                            start = startOfYear(subYears(now, i));
                            name = format(start, 'yyyy');
                        }

                        // Filter items that were created or updated in this timeframe and are "Done" or equivalent
                        const isDoneAndInPeriod = (items: BackendItem[], isTask = false) => {
                            return items.filter(item => {
                                const itemDate = new Date(item.updated_at || item.created_at);
                                const isAfterStart = isAfter(itemDate, start);
                                let isBeforeEnd = false;

                                if (tf === 'day') isBeforeEnd = !isAfter(itemDate, subDays(start, -1));
                                else if (tf === 'week') isBeforeEnd = !isAfter(itemDate, subWeeks(start, -1));
                                else if (tf === 'month') isBeforeEnd = !isAfter(itemDate, subMonths(start, -1));
                                else if (tf === 'year') isBeforeEnd = !isAfter(itemDate, subYears(start, -1));

                                if (isTask) {
                                    return item.status?.String === 'Done' && isAfterStart && isBeforeEnd;
                                }
                                return isAfterStart && isBeforeEnd; // Goals/Promises don't have explicit Done, showing creation/updates
                            }).length;
                        };

                        data.push({
                            name,
                            date: start,
                            Tasks: isDoneAndInPeriod(tasks, true),
                            Goals: isDoneAndInPeriod(goals),
                            Promises: isDoneAndInPeriod(promises),
                        });
                    }
                    return data;
                };

                setChartData(generateChartData(timeframe));

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, [timeframe]);


    if (loading) {
        return <div className="flex h-full items-center justify-center text-zinc-400">Loading Dashboard...</div>;
    }

    return (
        <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6 md:p-8 overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-zinc-400 mt-1">Overview of your shared life and upcoming activities.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Active Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-100">{metrics.tasksNotDone}</div>
                        <p className="text-xs text-zinc-500 mt-1">To Do / In Progress</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Goals</CardTitle>
                        <Target className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-100">{metrics.goalsTotal}</div>
                        <p className="text-xs text-zinc-500 mt-1">Shared targets</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Promises</CardTitle>
                        <HeartHandshake className="h-4 w-4 text-pink-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-100">{metrics.promisesTotal}</div>
                        <p className="text-xs text-zinc-500 mt-1">Active commitments</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Expenses</CardTitle>
                        <Wallet className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-100">${metrics.totalExpenses}</div>
                        <p className="text-xs text-zinc-500 mt-1">Total spended</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Her Battery</CardTitle>
                        <Zap className={`h-4 w-4 ${metrics.herBattery > 50 ? 'text-emerald-400' : 'text-yellow-400'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-100">{metrics.herBattery}%</div>
                        <p className="text-xs text-zinc-500 mt-1">Current level</p>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Last Alert</CardTitle>
                        <Bell className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-medium text-zinc-100 line-clamp-2">{metrics.lastNotification}</div>
                        <p className="text-xs text-zinc-500 mt-1">Recent notification</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-zinc-900 border-zinc-800 flex-1 min-h-[400px]">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-400" /> Completion Activity
                            </CardTitle>
                            <CardDescription className="text-zinc-400">Tracks accomplished tasks, goals, and promises over time.</CardDescription>
                        </div>
                        <div className="flex bg-zinc-950 border border-zinc-800 rounded-md p-1">
                            <Button variant="ghost" size="sm" onClick={() => setTimeframe('day')} className={timeframe === 'day' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}>Day</Button>
                            <Button variant="ghost" size="sm" onClick={() => setTimeframe('week')} className={timeframe === 'week' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}>Week</Button>
                            <Button variant="ghost" size="sm" onClick={() => setTimeframe('month')} className={timeframe === 'month' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}>Month</Button>
                            <Button variant="ghost" size="sm" onClick={() => setTimeframe('year')} className={timeframe === 'year' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}>Year</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#f4f4f5' }}
                                itemStyle={{ color: '#f4f4f5' }}
                                cursor={{ fill: '#27272a', opacity: 0.4 }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="Tasks" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Goals" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Promises" fill="#f472b6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}

