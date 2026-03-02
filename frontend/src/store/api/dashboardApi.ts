import { baseApi } from "./baseApi";
import {
  format,
  subDays,
  startOfWeek,
  subWeeks,
  startOfMonth,
  subMonths,
  startOfYear,
  subYears,
  isAfter,
} from "date-fns";

export type DashboardMetricsData = {
  tasksNotDone: number;
  goalsTotal: number;
  promisesTotal: number;
  totalExpenses: number;
  herBattery: number;
  lastNotification: string;
};

export type ChartDataPoint = {
  name: string;
  Tasks: number;
  Goals: number;
  Promises: number;
  date: Date;
};

export type BackendItem = {
  created_at: string;
  updated_at: string;
  status?: { String: string };
  type?: string;
  amount?: number;
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<
      {
        metrics: DashboardMetricsData;
        chartData: Record<"day" | "week" | "month" | "year", ChartDataPoint[]>;
      },
      void
    >({
      async queryFn(_arg, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          const [tasksRes, goalsRes, promisesRes, financesRes, batteryRes] =
            await Promise.all([
              fetchWithBQ("/api/v1/task/readAll"),
              fetchWithBQ("/api/v1/goal/read?audience=General"),
              fetchWithBQ("/api/v1/promise/read?audience=General"),
              fetchWithBQ("/api/v1/finances/history"),
              fetchWithBQ("/api/v1/social/battery/read?audience=Her"),
            ]);

          const tasks = (tasksRes.data as BackendItem[]) || [];
          const goals = (goalsRes.data as BackendItem[]) || [];
          const promises = (promisesRes.data as BackendItem[]) || [];
          const finances = (financesRes.data as BackendItem[]) || [];
          const battery = (batteryRes.data as { level: number })?.level || 0;

          const tasksNotDone = tasks.filter(
            (t) => t.status?.String !== "Done",
          ).length;
          const totalExpenses = finances
            .filter((f) => f.type === "expense")
            .reduce((acc, f) => acc + (f.amount || 0), 0);

          const metrics: DashboardMetricsData = {
            tasksNotDone,
            goalsTotal: goals.length,
            promisesTotal: promises.length,
            totalExpenses,
            herBattery: battery,
            lastNotification: "Remember to pay the internet bill! 🔔",
          };

          const generateChartData = (
            tf: "day" | "week" | "month" | "year",
          ): ChartDataPoint[] => {
            const data: ChartDataPoint[] = [];
            const now = new Date();
            let periods = 7;

            if (tf === "day") periods = 7;
            if (tf === "week") periods = 4;
            if (tf === "month") periods = 6;
            if (tf === "year") periods = 5;

            for (let i = periods - 1; i >= 0; i--) {
              let name = "";
              let start = new Date();

              if (tf === "day") {
                start = subDays(now, i);
                name = format(start, "EEE");
              } else if (tf === "week") {
                start = startOfWeek(subWeeks(now, i));
                name = `Week ${format(start, "w")}`;
              } else if (tf === "month") {
                start = startOfMonth(subMonths(now, i));
                name = format(start, "MMM");
              } else if (tf === "year") {
                start = startOfYear(subYears(now, i));
                name = format(start, "yyyy");
              }

              const isDoneAndInPeriod = (
                items: BackendItem[],
                isTask = false,
              ) => {
                return items.filter((item) => {
                  const itemDate = new Date(item.updated_at || item.created_at);
                  const isAfterStart = isAfter(itemDate, start);
                  let isBeforeEnd = false;

                  if (tf === "day")
                    isBeforeEnd = !isAfter(itemDate, subDays(start, -1));
                  else if (tf === "week")
                    isBeforeEnd = !isAfter(itemDate, subWeeks(start, -1));
                  else if (tf === "month")
                    isBeforeEnd = !isAfter(itemDate, subMonths(start, -1));
                  else if (tf === "year")
                    isBeforeEnd = !isAfter(itemDate, subYears(start, -1));

                  if (isTask) {
                    return (
                      item.status?.String === "Done" &&
                      isAfterStart &&
                      isBeforeEnd
                    );
                  }
                  return isAfterStart && isBeforeEnd;
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

          const chartData = {
            day: generateChartData("day"),
            week: generateChartData("week"),
            month: generateChartData("month"),
            year: generateChartData("year"),
          };

          return { data: { metrics, chartData } };
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to fetch dashboard data",
            },
          };
        }
      },
    }),
  }),
});

export const { useGetDashboardDataQuery } = dashboardApi;
