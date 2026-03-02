import { Activity } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ChartDataPoint } from "@/store/api/dashboardApi";

interface DashboardChartProps {
  data: ChartDataPoint[];
  timeframe: "day" | "week" | "month" | "year";
  setTimeframe: (val: "day" | "week" | "month" | "year") => void;
}

export function DashboardChart({
  data,
  timeframe,
  setTimeframe,
}: DashboardChartProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 flex-1 min-h-[400px]">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl text-zinc-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" /> Completion
              Activity
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Tracks accomplished tasks, goals, and promises over time.
            </CardDescription>
          </div>
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("day")}
              className={
                timeframe === "day"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }
            >
              Day
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("week")}
              className={
                timeframe === "week"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }
            >
              Week
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("month")}
              className={
                timeframe === "month"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }
            >
              Month
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTimeframe("year")}
              className={
                timeframe === "year"
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }
            >
              Year
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              stroke="#a1a1aa"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#a1a1aa"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "8px",
                color: "#f4f4f5",
              }}
              itemStyle={{ color: "#f4f4f5" }}
              cursor={{ fill: "#27272a", opacity: 0.4 }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="Tasks" fill="#818cf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Goals" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Promises" fill="#f472b6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
