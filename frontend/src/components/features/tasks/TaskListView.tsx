import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Task } from "./types";
import { priorityColors, statusColors } from "./types";

interface TaskListViewProps {
  tasks: Task[];
}

export function TaskListView({ tasks }: TaskListViewProps) {
  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="grid grid-cols-12 p-4 border-b border-zinc-800 text-sm font-semibold text-zinc-400">
        <div className="col-span-5">Task</div>
        <div className="col-span-3">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2 text-right">Assignee</div>
      </div>
      <ScrollArea className="h-[calc(100vh-220px)]">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="grid grid-cols-12 p-4 border-b border-zinc-800/50 items-center hover:bg-zinc-800/30 transition-colors"
          >
            <div className="col-span-5 font-medium">
              <div>{task.title}</div>
              <div className="text-xs text-zinc-500 truncate pr-4">
                {task.description}
              </div>
            </div>
            <div className="col-span-3">
              <Badge
                variant="outline"
                className={`border-none ${statusColors[task.status]}`}
              >
                {task.status}
              </Badge>
            </div>
            <div className="col-span-2">
              <Badge
                variant="outline"
                className={`border-none ${priorityColors[task.priority]}`}
              >
                {task.priority}
              </Badge>
            </div>
            <div className="col-span-2 text-right text-sm text-zinc-400">
              {task.assignee}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}
