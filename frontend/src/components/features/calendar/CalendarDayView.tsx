import { format, isSameDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent } from "./types";

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
}

export function CalendarDayView({ currentDate, events }: CalendarDayViewProps) {
  const getEventsForDay = (day: Date) => {
    return events.filter((e) => {
      return isSameDay(day, e.start) || (e.start <= day && e.end >= day);
    });
  };

  return (
    <div className="flex-1 rounded-xl border border-zinc-800 overflow-hidden bg-zinc-900/50 shadow-sm flex flex-col md:flex-row">
      <div className="md:w-64 border-b md:border-b-0 md:border-r border-zinc-800 bg-zinc-900 p-6 flex flex-col items-center justify-center shrink-0">
        <span className="text-6xl font-black text-indigo-500 mb-2">
          {format(currentDate, "dd")}
        </span>
        <span className="text-xl font-bold text-zinc-200">
          {format(currentDate, "EEEE")}
        </span>
        <span className="text-sm font-medium text-zinc-500">
          {format(currentDate, "MMMM, yyyy")}
        </span>
        <div className="h-px bg-zinc-800 w-full my-6"></div>
        <div className="w-full text-center">
          <p className="text-2xl font-bold text-zinc-100">
            {getEventsForDay(currentDate).length}
          </p>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold mt-1">
            Events Today
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1 bg-zinc-950 p-6 h-[500px] md:h-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {getEventsForDay(currentDate).length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              <CalendarIcon size={48} className="text-zinc-700/50 mb-4" />
              <p className="font-medium text-lg">No events scheduled.</p>
              <p className="text-sm mt-1">
                Take a break or plan something fun!
              </p>
            </div>
          ) : (
            getEventsForDay(currentDate)
              .sort((a, b) => a.start.getTime() - b.start.getTime())
              .map((e) => (
                <div
                  key={e.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-zinc-700 transition-colors shadow-sm group"
                >
                  <div className="flex flex-col items-center justify-center min-w-[100px] shrink-0 bg-zinc-950 rounded-lg p-3 border border-zinc-800/80">
                    <span className="text-sm font-bold text-zinc-300">
                      {format(e.start, "h:mm a")}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">
                      TO
                    </span>
                    <span className="text-sm font-bold text-zinc-300">
                      {format(e.end, "h:mm a")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                      {e.title}
                    </h3>
                    {e.description && (
                      <p className="text-zinc-400 text-sm mt-1.5">
                        {e.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest
                                        ${
                                          e.target_audience === "Him"
                                            ? "bg-blue-500/10 text-blue-400"
                                            : e.target_audience === "Her"
                                              ? "bg-pink-500/10 text-pink-400"
                                              : "bg-zinc-800 text-zinc-300"
                                        }`}
                    >
                      {e.target_audience}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
