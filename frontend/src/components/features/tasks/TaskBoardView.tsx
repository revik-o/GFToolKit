import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Task } from "./types";
import { priorityColors } from "./types";
import { useUpdateTaskMutation } from "@/store/api/tasksApi";
import { toast } from "sonner";

interface TaskBoardViewProps {
  tasks: Task[];
}

export function TaskBoardView({ tasks }: TaskBoardViewProps) {
  const [updateTask] = useUpdateTaskMutation();

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId as Task["status"];
    const destinationStatus = result.destination.droppableId as Task["status"];

    if (
      sourceStatus === destinationStatus &&
      result.source.index === result.destination.index
    )
      return;

    try {
      await updateTask({
        id: result.draggableId,
        status: destinationStatus,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task status");
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 h-[calc(100vh-180px)] w-full overflow-x-auto pb-4">
        {(["To Do", "In Progress", "Done"] as const).map((status) => (
          <div
            key={status}
            className="flex-1 min-w-[300px] flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-800 font-semibold flex justify-between items-center">
              <span>{status}</span>
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                {tasks.filter((t) => t.status === status).length}
              </Badge>
            </div>

            <Droppable droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex-1 p-4 overflow-y-auto space-y-3"
                >
                  {tasks
                    .filter((t) => t.status === status)
                    .map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-zinc-950 p-4 rounded-lg border flex flex-col gap-3 ${snapshot.isDragging ? "border-indigo-500 shadow-lg shadow-indigo-500/20" : "border-zinc-800 hover:border-zinc-700"}`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-zinc-100">
                                {task.title}
                              </span>
                              <GripVertical
                                size={16}
                                className="text-zinc-600"
                              />
                            </div>
                            {task.description && (
                              <p className="text-sm text-zinc-400 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex justify-between items-center mt-2">
                              <Badge
                                variant="outline"
                                className={`border-none ${priorityColors[task.priority]}`}
                              >
                                {task.priority}
                              </Badge>
                              <div className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
                                {task.assignee}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
