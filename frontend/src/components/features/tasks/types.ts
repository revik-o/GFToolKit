export type Task = {
  id: string;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  assignee: string;
};

export const priorityColors = {
  Low: "bg-zinc-800 text-zinc-300",
  Medium: "bg-yellow-900/50 text-yellow-500",
  High: "bg-red-900/50 text-red-500",
};

export const statusColors = {
  "To Do": "bg-zinc-800 text-zinc-300",
  "In Progress": "bg-blue-900/50 text-blue-500",
  Done: "bg-green-900/50 text-green-500",
};

import type { BackendTask } from "@/store/api/tasksApi";

export const mapBackendTask = (bt: BackendTask): Task => ({
  id: bt.id,
  title: bt.title,
  description: bt.description.Valid ? bt.description.String : "",
  status: (bt.status.Valid ? bt.status.String : "To Do") as Task["status"],
  priority: (bt.priority.Valid
    ? bt.priority.String
    : "Medium") as Task["priority"],
  assignee: bt.assignee_id.Valid ? bt.assignee_id.String : "Unassigned",
});
