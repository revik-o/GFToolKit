import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "./types";
import { useCreateTaskMutation } from "@/store/api/tasksApi";

export function TaskCreateModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<Task["status"]>("To Do");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [assignee, setAssignee] = useState("Him");

  const [createTask] = useCreateTaskMutation();

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      await createTask({
        title,
        description: desc,
        status,
        priority,
        assignee_id: assignee,
      }).unwrap();

      toast.success("Task created");
      setIsOpen(false);
      setTitle("");
      setDesc("");
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
          <Plus size={16} className="mr-2" /> New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Task Title (e.g., Pay Rent)"
            className="bg-zinc-800 border-zinc-700"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            placeholder="Description (Optional)"
            className="bg-zinc-800 border-zinc-700"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as Task["status"])}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priority}
              onValueChange={(v) => setPriority(v as Task["priority"])}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger className="bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Assign To" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="Him">Him</SelectItem>
              <SelectItem value="Her">Her</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleCreateTask}
            className="bg-indigo-600 hover:bg-indigo-500 text-white w-full mt-2"
          >
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
