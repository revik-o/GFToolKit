import { useCallback, useEffect, useState } from 'react';
import {
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Plus
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addDays,
    startOfMonth,
    endOfMonth,
    parseISO,
    isWithinInterval
} from 'date-fns';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

type BackendEvent = {
    id: string;
    title: string;
    description: { String: string; Valid: boolean };
    target_audience: string;
    start_time: string;
    end_time: string;
    is_full_day: boolean;
    repeat_type: string;
};

type CalendarEvent = {
    id: string;
    title: string;
    description: string;
    target_audience: string;
    start: Date;
    end: Date;
    isFullDay: boolean;
};

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'Month' | 'Week' | 'Day'>('Month');
    const [audience, setAudience] = useState<'Him' | 'Her' | 'General'>('General');
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    const [events, setEvents] = useState<CalendarEvent[]>([]);

    // Form states
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDesc, setNewEventDesc] = useState('');
    const [newEventStart, setNewEventStart] = useState('');
    const [newEventEnd, setNewEventEnd] = useState('');
    const [newEventAudience, setNewEventAudience] = useState('General');

    const loadEvents = useCallback(async () => {
        // Based on backend, handles all queries via this endpoint for now 
        const year = format(currentDate, 'yyyy');
        const month = format(currentDate, 'MM');

        // Using simple month fetch as backend stubs week/day to month handler anyway
        const { data, error } = await fetchApi<BackendEvent[]>(`/api/v1/calendar/read/month?audience=${audience}&year=${year}&month=${month}`);

        if (error) {
            toast.error('Failed to load events');
            return;
        }

        if (data) {
            setEvents(data.map(e => ({
                id: e.id,
                title: e.title,
                description: e.description.Valid ? e.description.String : '',
                target_audience: e.target_audience,
                start: parseISO(e.start_time),
                end: parseISO(e.end_time),
                isFullDay: e.is_full_day
            })));
        }
    }, [currentDate, audience]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const handleCreateEvent = async () => {
        if (!newEventTitle || !newEventStart || !newEventEnd) {
            toast.error('Please fill required fields (Title, Start, End)');
            return;
        }

        const { data, error } = await fetchApi<BackendEvent>('/api/v1/calendar/create', {
            method: 'POST',
            body: JSON.stringify({
                title: newEventTitle,
                description: newEventDesc,
                target_audience: newEventAudience,
                start_time: new Date(newEventStart).toISOString(),
                end_time: new Date(newEventEnd).toISOString(),
                is_full_day: false,
                repeat_type: 'none'
            })
        });

        if (error) {
            toast.error('Failed to create event');
            return;
        }

        toast.success('Event created');
        setIsEventModalOpen(false);
        setNewEventTitle('');
        setNewEventDesc('');
        setNewEventStart('');
        setNewEventEnd('');

        if (data) {
            setEvents([...events, {
                id: data.id,
                title: data.title,
                description: data.description.Valid ? data.description.String : '',
                target_audience: data.target_audience,
                start: parseISO(data.start_time),
                end: parseISO(data.end_time),
                isFullDay: data.is_full_day
            }]);
        } else {
            loadEvents(); // fallback if data isn't returned correctly
        }
    };


    // Calendar Math
    const nextDates = () => {
        if (viewMode === 'Month') setCurrentDate(addMonths(currentDate, 1));
        else if (viewMode === 'Week') setCurrentDate(addDays(currentDate, 7));
        else setCurrentDate(addDays(currentDate, 1));
    };
    const prevDates = () => {
        if (viewMode === 'Month') setCurrentDate(subMonths(currentDate, 1));
        else if (viewMode === 'Week') setCurrentDate(addDays(currentDate, -7));
        else setCurrentDate(addDays(currentDate, -1));
    };
    const goToToday = () => setCurrentDate(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(viewMode === 'Week' ? currentDate : monthStart);
    const endDate = viewMode === 'Week' ? endOfWeek(currentDate) : endOfWeek(monthEnd);

    const dateFormat = viewMode === 'Day' ? "EEEE, MMMM do, yyyy" : "MMMM yyyy";
    const days = viewMode === 'Day' ? [currentDate] : eachDayOfInterval({ start: startDate, end: endDate });

    const getEventsForDay = (day: Date) => {
        return events.filter(e => {
            return isSameDay(day, e.start) || isWithinInterval(day, { start: e.start, end: e.end });
        });
    };

    const EventPill = ({ event }: { event: CalendarEvent }) => (
        <div title={`${event.title} - ${format(event.start, 'h:mm a')}`}
            className={`text-xs truncate px-1.5 py-0.5 mt-1 rounded text-white shadow-sm
             ${event.target_audience === 'Him' ? 'bg-blue-600' :
                    event.target_audience === 'Her' ? 'bg-pink-600' : 'bg-indigo-600'}`}>
            {format(event.start, 'HH:mm')} {event.title}
        </div>
    );

    return (
        <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
                    <p className="text-zinc-400 mt-1 capitalize">
                        {viewMode === 'Week' ? `Week of ${format(startDate, 'MMM do, yyyy')}` : format(currentDate, dateFormat)}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
                        <Button variant="ghost" size="sm" onClick={() => setViewMode('Month')} className={viewMode === 'Month' ? 'bg-zinc-800' : 'text-zinc-400'}>Month</Button>
                        <Button variant="ghost" size="sm" onClick={() => setViewMode('Week')} className={viewMode === 'Week' ? 'bg-zinc-800' : 'text-zinc-400'}>Week</Button>
                        <Button variant="ghost" size="sm" onClick={() => setViewMode('Day')} className={viewMode === 'Day' ? 'bg-zinc-800' : 'text-zinc-400'}>Day</Button>
                    </div>

                    <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
                        <Button variant="ghost" size="sm" onClick={() => setAudience('Him')} className={audience === 'Him' ? 'bg-blue-900/50 text-blue-300' : 'text-zinc-400'}>Him</Button>
                        <Button variant="ghost" size="sm" onClick={() => setAudience('Her')} className={audience === 'Her' ? 'bg-pink-900/50 text-pink-300' : 'text-zinc-400'}>Her</Button>
                        <Button variant="ghost" size="sm" onClick={() => setAudience('General')} className={audience === 'General' ? 'bg-zinc-800' : 'text-zinc-400'}>General</Button>
                    </div>

                    <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                                <Plus size={16} className="mr-2" /> Add Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CalendarIcon className="text-indigo-400 shrink-0" size={20} /> Create Event
                                </DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400 font-medium ml-1">Title</label>
                                    <Input placeholder="Event Title" className="bg-zinc-800 border-zinc-700" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400 font-medium ml-1">Description (Optional)</label>
                                    <Input placeholder="Description" className="bg-zinc-800 border-zinc-700" value={newEventDesc} onChange={(e) => setNewEventDesc(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-400 font-medium ml-1">Start Time</label>
                                        <Input type="datetime-local" className="bg-zinc-800 border-zinc-700 [color-scheme:dark]" value={newEventStart} onChange={(e) => setNewEventStart(e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-400 font-medium ml-1">End Time</label>
                                        <Input type="datetime-local" className="bg-zinc-800 border-zinc-700 [color-scheme:dark]" value={newEventEnd} onChange={(e) => setNewEventEnd(e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-400 font-medium ml-1">Who is this for?</label>
                                    <Select value={newEventAudience} onValueChange={setNewEventAudience}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                            <SelectValue placeholder="Audience" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                                            <SelectItem value="Him">Him</SelectItem>
                                            <SelectItem value="Her">Her</SelectItem>
                                            <SelectItem value="General">General</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleCreateEvent} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full mt-2">Save Event</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
                <Button variant="outline" size="icon" onClick={prevDates} className="h-8 w-8 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50">
                    <ChevronLeft size={16} />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="h-8 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50">
                    Today
                </Button>
                <Button variant="outline" size="icon" onClick={nextDates} className="h-8 w-8 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50">
                    <ChevronRight size={16} />
                </Button>
            </div>

            {/* MONTH VIEW */}
            {viewMode === 'Month' && (
                <div className="flex-1 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50 shadow-sm flex flex-col">
                    <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900 shrink-0">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-2.5 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 flex-1 min-h-[500px]">
                        {days.map((day, i) => {
                            const dayEvents = getEventsForDay(day);
                            return (
                                <div
                                    key={day.toString()}
                                    className={`min-h-[100px] border-b border-r border-zinc-800/50 p-2 flex flex-col transition-colors hover:bg-zinc-800/20
                                      ${!isSameMonth(day, monthStart) ? 'bg-zinc-950/80 text-zinc-600' : 'text-zinc-300'}
                                      ${i % 7 === 6 ? 'border-r-0' : ''}
                                      ${i >= days.length - 7 ? 'border-b-0' : ''}
                                    `}
                                >
                                    <div className={`self-end flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium mb-1
                                      ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-900 ring-offset-zinc-900 ring-offset-2' : ''}
                                    `}>
                                        {format(day, 'd')}
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-1">
                                        {dayEvents.map(e => <EventPill key={e.id} event={e} />)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === 'Week' && (
                <div className="flex-1 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50 shadow-sm flex flex-col">
                    <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900 shrink-0">
                        {days.map(day => (
                            <div key={day.toString()} className="py-3 px-2 border-r border-zinc-800 last:border-r-0 flex flex-col items-center justify-center">
                                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-1">{format(day, 'EEE')}</span>
                                <span className={`text-lg font-bold flex h-8 w-8 items-center justify-center rounded-full
                                    ${isSameDay(day, new Date()) ? 'bg-indigo-600 text-white' : 'text-zinc-200'}`}>
                                    {format(day, 'd')}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 flex-1 min-h-[500px]">
                        {days.map((day, i) => {
                            const dayEvents = getEventsForDay(day);
                            return (
                                <div key={day.toString()} className={`border-r border-zinc-800/50 p-2 ${i === 6 ? 'border-r-0' : ''}`}>
                                    <div className="space-y-1.5 h-full overflow-y-auto">
                                        {dayEvents.length === 0 ? (
                                            <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <span className="text-xs text-zinc-600 font-medium">No events</span>
                                            </div>
                                        ) : (
                                            dayEvents.map(e => (
                                                <div key={e.id} className="bg-zinc-800/80 rounded border border-zinc-700/50 p-2 hover:bg-zinc-700/80 transition-colors shadow-sm cursor-pointer group">
                                                    <div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-zinc-300">
                                                        <Clock size={12} className="text-zinc-500" />
                                                        {format(e.start, 'h:mm a')}
                                                    </div>
                                                    <p className="font-semibold text-sm text-zinc-100 line-clamp-2 leading-tight">{e.title}</p>
                                                    {e.target_audience !== 'General' && (
                                                        <span className={`inline-block mt-1.5 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-sm
                                                            ${e.target_audience === 'Him' ? 'bg-blue-900/40 text-blue-400' : 'bg-pink-900/40 text-pink-400'}`}>
                                                            {e.target_audience}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* DAY VIEW */}
            {viewMode === 'Day' && (
                <div className="flex-1 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50 shadow-sm flex flex-col md:flex-row">
                    <div className="md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center justify-center shrink-0">
                        <span className="text-6xl font-black text-indigo-500 mb-2">{format(currentDate, 'dd')}</span>
                        <span className="text-xl font-bold text-zinc-200">{format(currentDate, 'EEEE')}</span>
                        <span className="text-sm font-medium text-zinc-500">{format(currentDate, 'MMMM, yyyy')}</span>
                        <div className="h-px bg-zinc-800 w-full my-6"></div>
                        <div className="w-full text-center">
                            <p className="text-2xl font-bold text-zinc-100">{getEventsForDay(currentDate).length}</p>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-1">Events Today</p>
                        </div>
                    </div>
                    <ScrollArea className="flex-1 bg-zinc-950 p-6 h-[500px] md:h-auto">
                        <div className="max-w-3xl mx-auto space-y-4">
                            {getEventsForDay(currentDate).length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                                    <CalendarIcon size={48} className="text-zinc-700/50 mb-4" />
                                    <p className="font-medium text-lg">No events scheduled.</p>
                                    <p className="text-sm mt-1">Take a break or plan something fun!</p>
                                </div>
                            ) : (
                                getEventsForDay(currentDate).sort((a, b) => a.start.getTime() - b.start.getTime()).map(e => (
                                    <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-zinc-700 transition-colors shadow-sm group">
                                        <div className="flex flex-col items-center justify-center min-w-[100px] shrink-0 bg-zinc-950 rounded-lg p-3 border border-zinc-800/80">
                                            <span className="text-sm font-bold text-zinc-300">{format(e.start, 'h:mm a')}</span>
                                            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">TO</span>
                                            <span className="text-sm font-bold text-zinc-300">{format(e.end, 'h:mm a')}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">{e.title}</h3>
                                            {e.description && <p className="text-zinc-400 text-sm mt-1.5">{e.description}</p>}
                                        </div>
                                        <div className="shrink-0">
                                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest
                                                ${e.target_audience === 'Him' ? 'bg-blue-500/10 text-blue-400' :
                                                    e.target_audience === 'Her' ? 'bg-pink-500/10 text-pink-400' : 'bg-zinc-800 text-zinc-300'}`}>
                                                {e.target_audience}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}

