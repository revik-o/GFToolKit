import { format, isSameDay, isSameMonth } from "date-fns";
import type { CalendarEvent } from "./types";

interface CalendarMonthViewProps {
  days: Date[];
  monthStart: Date;
  events: CalendarEvent[];
}

export const EventPill = ({ event }: { event: CalendarEvent }) => (
  <div
    title={`${event.title} - ${format(event.start, "h:mm a")}`}
    className={`text-xs truncate px-1.5 py-0.5 mt-1 rounded text-white shadow-sm
         ${
           event.target_audience === "Him"
             ? "bg-blue-600"
             : event.target_audience === "Her"
               ? "bg-pink-600"
               : "bg-indigo-600"
         }`}
  >
    {format(event.start, "HH:mm")} {event.title}
  </div>
);

export function CalendarMonthView({
  days,
  monthStart,
  events,
}: CalendarMonthViewProps) {
  const getEventsForDay = (day: Date) => {
    return events.filter((e) => {
      return isSameDay(day, e.start) || (e.start <= day && e.end >= day);
    });
  };

  return (
    <div className="flex-1 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50 shadow-sm flex flex-col">
      <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900 shrink-0">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider"
          >
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
                              ${!isSameMonth(day, monthStart) ? "bg-zinc-950/80 text-zinc-600" : "text-zinc-300"}
                              ${i % 7 === 6 ? "border-r-0" : ""}
                              ${i >= days.length - 7 ? "border-b-0" : ""}
                            `}
            >
              <div
                className={`self-end flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium mb-1
                              ${isSameDay(day, new Date()) ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-900 ring-offset-zinc-900 ring-offset-2" : ""}
                            `}
              >
                {format(day, "d")}
              </div>
              <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-1">
                {dayEvents.map((e) => (
                  <EventPill key={e.id} event={e} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
