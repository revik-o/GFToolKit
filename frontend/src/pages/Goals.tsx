import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Plus, MoreVertical, Pencil, Trash2, Target } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Goal = {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  target_audience: "Him" | "Her" | "General";
  created_at: string;
};

export type BackendGoal = {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  target_audience: "Him" | "Her" | "General";
  created_at: string;
  updated_at: string;
};

const priorityColors = {
  Low: "bg-zinc-800 text-zinc-300 border-zinc-700",
  Medium: "bg-yellow-900/50 text-yellow-500 border-yellow-900",
  High: "bg-red-900/50 text-red-500 border-red-900",
};

export default function Goals() {
  const [audience, setAudience] = useState<"Him" | "Her" | "General">(
    "General",
  );
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Goal["priority"]>("Medium");
  const [newAudience, setNewAudience] = useState<"Him" | "Her" | "General">(
    "General",
  );

  const loadGoals = useCallback(async () => {
    const { data, error } = await fetchApi<BackendGoal[]>(
      `/api/v1/goal/read?audience=${audience}`,
    );
    if (error) {
      toast.error("Failed to load goals");
      return;
    }
    if (data) {
      setGoals(
        data.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description,
          priority: g.priority,
          target_audience: g.target_audience,
          created_at: g.created_at,
        })),
      );
    }
  }, [audience]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = async () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      toast.error("Title and description are required");
      return;
    }

    const { error } = await fetchApi("/api/v1/goal/create", {
      method: "POST",
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        target_audience: newAudience,
      }),
    });

    if (error) {
      toast.error("Failed to create goal");
      return;
    }

    toast.success("Goal created");
    setIsModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    loadGoals(); // Refresh list
  };

  const handleDelete = async (id: string) => {
    const { error } = await fetchApi(`/api/v1/goal/delete?id=${id}`, {
      method: "DELETE",
    });

    if (error) {
      toast.error("Failed to delete goal");
      return;
    }

    toast.success("Goal deleted");
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-zinc-400 mt-1">
            Track shared ambitions and personal milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudience("Him")}
              className={
                audience === "Him"
                  ? "bg-blue-900/50 text-blue-300"
                  : "text-zinc-400"
              }
            >
              Him
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudience("Her")}
              className={
                audience === "Her"
                  ? "bg-pink-900/50 text-pink-300"
                  : "text-zinc-400"
              }
            >
              Her
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudience("General")}
              className={
                audience === "General" ? "bg-zinc-800" : "text-zinc-400"
              }
            >
              General
            </Button>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                <Plus size={16} className="mr-2" /> Create Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Goal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Goal Title"
                  className="bg-zinc-800 border-zinc-700"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Describe your goal..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={newPriority}
                    onValueChange={(v) => setNewPriority(v as Goal["priority"])}
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

                  <Select
                    value={newAudience}
                    onValueChange={(v) =>
                      setNewAudience(v as "Him" | "Her" | "General")
                    }
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Audience" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="Him">Him</SelectItem>
                      <SelectItem value="Her">Her</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateGoal}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white w-full mt-2"
                >
                  Save Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4 pb-8 max-w-4xl">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="group bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-900 hover:border-zinc-700 transition-all flex flex-col sm:flex-row gap-4 sm:items-center"
          >
            <div className="hidden sm:flex h-12 w-12 rounded-full bg-zinc-800/80 items-center justify-center shrink-0 border border-zinc-700/50">
              <Target
                className={`h-6 w-6 ${
                  goal.target_audience === "Him"
                    ? "text-blue-400"
                    : goal.target_audience === "Her"
                      ? "text-pink-400"
                      : "text-indigo-400"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1 gap-2">
                <h3 className="font-semibold text-lg text-zinc-100 truncate">
                  {goal.title}
                </h3>
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2 -mt-1 text-zinc-400"
                      >
                        <MoreVertical size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-900 border-zinc-800 text-zinc-50 w-32"
                    >
                      <DropdownMenuItem className="hover:bg-zinc-800 cursor-pointer">
                        <Pencil size={14} className="mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/50 cursor-pointer"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 size={14} className="mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-zinc-400 text-sm line-clamp-2 sm:line-clamp-1 mb-3 sm:mb-2">
                {goal.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                <Badge
                  variant="outline"
                  className={`${priorityColors[goal.priority]} bg-transparent`}
                >
                  {goal.priority} Priority
                </Badge>

                <span
                  className={`px-2 py-0.5 rounded-md ${
                    goal.target_audience === "Him"
                      ? "bg-blue-900/20 text-blue-400 border border-blue-900/30"
                      : goal.target_audience === "Her"
                        ? "bg-pink-900/20 text-pink-400 border border-pink-900/30"
                        : "bg-zinc-800/50 text-zinc-300 border border-zinc-700/50"
                  }`}
                >
                  {goal.target_audience}
                </span>
                <span className="text-zinc-600 ml-auto sm:ml-0">
                  {new Date(goal.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 w-32"
                >
                  <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer">
                    <Pencil size={14} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-red-900/50 focus:bg-red-900/50 text-red-400 hover:text-red-300 cursor-pointer"
                    onClick={() => handleDelete(goal.id)}
                  >
                    <Trash2 size={14} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {goals.length === 0 && (
          <div className="py-12 text-center text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl">
            No goals found. Start aiming for something!
          </div>
        )}
      </div>
    </div>
  );
}
