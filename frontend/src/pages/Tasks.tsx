import { useState, useMemo } from "react";
import { LayoutList, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetTasksQuery } from "@/store/api/tasksApi";
import { TaskBoardView } from "@/components/features/tasks/TaskBoardView";
import { TaskListView } from "@/components/features/tasks/TaskListView";
import { TaskCreateModal } from "@/components/features/tasks/TaskCreateModal";
import { mapBackendTask } from "@/components/features/tasks/types";
import { toast } from "sonner";

export default function Tasks() {
  const [viewMode, setViewMode] = useState<"List" | "Dashboard">("Dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: backendTasks, isLoading, error } = useGetTasksQuery();

  if (error) {
    toast.error("Failed to load tasks");
  }

  const tasks = useMemo(() => {
    if (!backendTasks) return [];
    return backendTasks.map(mapBackendTask);
  }, [backendTasks]);

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-zinc-400 mt-1">
            Manage shared and personal responsibilities
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("Dashboard")}
              className={
                viewMode === "Dashboard" ? "bg-zinc-800" : "text-zinc-400"
              }
            >
              <LayoutGrid size={16} className="mr-2" /> Board
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("List")}
              className={viewMode === "List" ? "bg-zinc-800" : "text-zinc-400"}
            >
              <LayoutList size={16} className="mr-2" /> List
            </Button>
          </div>

          <TaskCreateModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse h-[calc(100vh-180px)] w-full bg-zinc-900/50 rounded-xl" />
      ) : viewMode === "Dashboard" ? (
        <TaskBoardView tasks={tasks} />
      ) : (
        <TaskListView tasks={tasks} />
      )}
    </div>
  );
}
