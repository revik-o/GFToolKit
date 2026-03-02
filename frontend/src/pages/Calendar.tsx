import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { useGetCalendarEventsQuery } from "@/store/api/calendarApi";
import { mapBackendEvent } from "@/components/features/calendar/types";
import { EventCreateModal } from "@/components/features/calendar/EventCreateModal";
import { CalendarMonthView } from "@/components/features/calendar/CalendarMonthView";
import { CalendarWeekView } from "@/components/features/calendar/CalendarWeekView";
import { CalendarDayView } from "@/components/features/calendar/CalendarDayView";
import { toast } from "sonner";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"Month" | "Week" | "Day">("Month");
  const [audience, setAudience] = useState<"Him" | "Her" | "General">(
    "General",
  );

  const year = format(currentDate, "yyyy");
  const month = format(currentDate, "MM");

  const {
    data: backendEvents,
    isLoading,
    error,
  } = useGetCalendarEventsQuery({
    audience,
    year,
    month,
  });

  if (error) {
    toast.error("Failed to load events");
  }

  const events = useMemo(() => {
    if (!backendEvents) return [];
    return backendEvents.map(mapBackendEvent);
  }, [backendEvents]);

  const nextDates = () => {
    if (viewMode === "Month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "Week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addDays(currentDate, 1));
  };
  const prevDates = () => {
    if (viewMode === "Month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "Week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addDays(currentDate, -1));
  };
  const goToToday = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(viewMode === "Week" ? currentDate : monthStart);
  const endDate =
    viewMode === "Week" ? endOfWeek(currentDate) : endOfWeek(monthEnd);

  const dateFormat = viewMode === "Day" ? "EEEE, MMMM do, yyyy" : "MMMM yyyy";
  const days =
    viewMode === "Day"
      ? [currentDate]
      : eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-zinc-400 mt-1 capitalize">
            {viewMode === "Week"
              ? `Week of ${format(startDate, "MMM do, yyyy")}`
              : format(currentDate, dateFormat)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("Month")}
              className={viewMode === "Month" ? "bg-zinc-800" : "text-zinc-400"}
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("Week")}
              className={viewMode === "Week" ? "bg-zinc-800" : "text-zinc-400"}
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("Day")}
              className={viewMode === "Day" ? "bg-zinc-800" : "text-zinc-400"}
            >
              Day
            </Button>
          </div>

          <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudience("Him")}
              className={
                audience === "Him"
                  ? "bg-blue-900/50 text-blue-300"
                  : "text-zinc-400"
              }
            >
              Him
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudience("Her")}
              className={
                audience === "Her"
                  ? "bg-pink-900/50 text-pink-300"
                  : "text-zinc-400"
              }
            >
              Her
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudience("General")}
              className={
                audience === "General" ? "bg-zinc-800" : "text-zinc-400"
              }
            >
              General
            </Button>
          </div>

          <EventCreateModal />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={prevDates}
          className="h-8 w-8 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
        >
          <ChevronLeft size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="h-8 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextDates}
          className="h-8 w-8 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 animate-pulse bg-zinc-900/50 rounded-xl" />
      ) : viewMode === "Month" ? (
        <CalendarMonthView
          days={days}
          monthStart={monthStart}
          events={events}
        />
      ) : viewMode === "Week" ? (
        <CalendarWeekView days={days} events={events} />
      ) : (
        <CalendarDayView currentDate={currentDate} events={events} />
      )}
    </div>
  );
}
