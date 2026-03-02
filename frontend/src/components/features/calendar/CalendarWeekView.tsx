import { format, isSameDay } from "date-fns";
import { Clock } from "lucide-react";
import type { CalendarEvent } from "./types";

interface CalendarWeekViewProps {
  days: Date[];
  events: CalendarEvent[];
}

export function CalendarWeekView({ days, events }: CalendarWeekViewProps) {
  const getEventsForDay = (day: Date) => {
    return events.filter((e) => {
      return isSameDay(day, e.start) || (e.start <= day && e.end >= day);
    });
  };

  return (
    <div className="flex-1 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50 shadow-sm flex flex-col">
      <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900 shrink-0">
        {days.map((day) => (
          <div
            key={day.toString()}
            className="py-3 px-2 border-r border-zinc-800 last:border-r-0 flex flex-col items-center justify-center"
          >
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider leading-none mb-1">
              {format(day, "EEE")}
            </span>
            <span
              className={`text-lg font-bold flex h-8 w-8 items-center justify-center rounded-full
                            ${isSameDay(day, new Date()) ? "bg-indigo-600 text-white" : "text-zinc-200"}`}
            >
              {format(day, "d")}
            </span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 min-h-[500px]">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div
              key={day.toString()}
              className={`border-r border-zinc-800/50 p-2 ${i === 6 ? "border-r-0" : ""}`}
            >
              <div className="space-y-1.5 h-full overflow-y-auto">
                {dayEvents.length === 0 ? (
                  <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-xs text-zinc-600 font-medium">
                      No events
                    </span>
                  </div>
                ) : (
                  dayEvents.map((e) => (
                    <div
                      key={e.id}
                      className="bg-zinc-800/80 rounded border border-zinc-700/50 p-2 hover:bg-zinc-700/80 transition-colors shadow-sm cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-xs font-medium text-zinc-300">
                        <Clock size={12} className="text-zinc-500" />
                        {format(e.start, "h:mm a")}
                      </div>
                      <p className="font-semibold text-sm text-zinc-100 line-clamp-2 leading-tight">
                        {e.title}
                      </p>
                      {e.target_audience !== "General" && (
                        <span
                          className={`inline-block mt-1.5 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-sm
                                                    ${e.target_audience === "Him" ? "bg-blue-900/40 text-blue-400" : "bg-pink-900/40 text-pink-400"}`}
                        >
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
  );
}
