/* eslint-disable no-constant-binary-expression */
import {
  CheckSquare,
  Target,
  HeartHandshake,
  Wallet,
  Zap,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardMetricsData } from "@/store/api/dashboardApi";

interface DashboardMetricsProps {
  metrics: DashboardMetricsData;
}

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8 ">
      {false && <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Active Tasks
          </CardTitle>
          <CheckSquare className="h-4 w-4 text-indigo-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            {metrics.tasksNotDone}
          </div>
          <p className="text-xs text-zinc-500 mt-1">To Do / In Progress</p>
        </CardContent>
      </Card>}

      <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Total Goals
          </CardTitle>
          <Target className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            {metrics.goalsTotal}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Shared targets</p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Promises
          </CardTitle>
          <HeartHandshake className="h-4 w-4 text-pink-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            {metrics.promisesTotal}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Active commitments</p>
        </CardContent>
      </Card>

      {false && <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Expenses
          </CardTitle>
          <Wallet className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            ${metrics.totalExpenses}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Total spended</p>
        </CardContent>
      </Card>}

      <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Her Battery
          </CardTitle>
          <Zap
            className={`h-4 w-4 ${metrics.herBattery > 50 ? "text-emerald-400" : "text-yellow-400"}`}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-zinc-100">
            {metrics.herBattery}%
          </div>
          <p className="text-xs text-zinc-500 mt-1">Current level</p>
        </CardContent>
      </Card>

      {false && <Card className="bg-zinc-900 border-zinc-800 text-zinc-50 hover:bg-zinc-800/80 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-zinc-400">
            Last Alert
          </CardTitle>
          <Bell className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium text-zinc-100 line-clamp-2">
            {metrics.lastNotification}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Recent notification</p>
        </CardContent>
      </Card>}
    </div>
  );
}
