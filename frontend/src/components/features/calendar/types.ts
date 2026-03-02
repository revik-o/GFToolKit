import type { BackendEvent } from "@/store/api/calendarApi";
import { parseISO } from "date-fns";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  target_audience: string;
  start: Date;
  end: Date;
  isFullDay: boolean;
};

export const mapBackendEvent = (e: BackendEvent): CalendarEvent => ({
  id: e.id,
  title: e.title,
  description: e.description.Valid ? e.description.String : "",
  target_audience: e.target_audience,
  start: parseISO(e.start_time),
  end: parseISO(e.end_time),
  isFullDay: e.is_full_day,
});
