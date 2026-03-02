import { useState } from "react";
import { useGetDashboardDataQuery } from "@/store/api/dashboardApi";
import { DashboardMetrics } from "@/components/features/dashboard/DashboardMetrics";
import { DashboardChart } from "@/components/features/dashboard/DashboardChart";
import { toast } from "sonner";

export default function Dashboard() {
  const { data: dashboardData, isLoading, error } = useGetDashboardDataQuery();
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month" | "year">(
    "week",
  );

  if (error) {
    toast.error("Failed to load dashboard data");
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex h-full items-center justify-center text-zinc-400">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6 md:p-8 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Overview of your shared life and upcoming activities.
        </p>
      </div>

      <DashboardMetrics metrics={dashboardData.metrics} />

      <DashboardChart
        data={dashboardData.chartData[timeframe]}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
      />
    </div>
  );
}
