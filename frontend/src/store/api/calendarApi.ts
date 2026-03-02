import { baseApi } from "./baseApi";

export type BackendEvent = {
  id: string;
  title: string;
  description: { String: string; Valid: boolean };
  target_audience: string;
  start_time: string;
  end_time: string;
  is_full_day: boolean;
  repeat_type: string;
};

export const calendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendarEvents: builder.query<
      BackendEvent[],
      { audience: string; year: string; month: string }
    >({
      query: ({ audience, year, month }) =>
        `/api/v1/calendar/read/month?audience=${audience}&year=${year}&month=${month}`,
      providesTags: ["Calendar"],
    }),
    createCalendarEvent: builder.mutation<
      BackendEvent,
      {
        title: string;
        description: string;
        target_audience: string;
        start_time: string;
        end_time: string;
        is_full_day: boolean;
        repeat_type: string;
      }
    >({
      query: (body) => ({
        url: "/api/v1/calendar/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Calendar"],
    }),
  }),
});

export const { useGetCalendarEventsQuery, useCreateCalendarEventMutation } =
  calendarApi;
