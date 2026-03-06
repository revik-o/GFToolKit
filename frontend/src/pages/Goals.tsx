import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { GoalItem, BackendGoal } from "@/components/features/goals/types";
import GoalCreateModal from "@/components/features/goals/GoalCreateModal";
import GoalEditModal from "@/components/features/goals/GoalEditModal";
import GoalCard from "@/components/features/goals/GoalCard";

export default function Goals() {
  const [audience, setAudience] = useState<"Him" | "Her" | "General">(
    "General"
  );
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadGoals = async () => {
      const { data, error } = await fetchApi<BackendGoal[]>(
        `/api/v1/goal/read?audience=${audience}`
      );
      if (!isMounted) return;
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
          }))
        );
      }
    };
    loadGoals();
    return () => {
      isMounted = false;
    };
  }, [audience]);

  const refreshGoals = () => {
    fetchApi<BackendGoal[]>(`/api/v1/goal/read?audience=${audience}`).then(
      ({ data }) => {
        if (data) {
          setGoals(
            data.map((g) => ({
              id: g.id,
              title: g.title,
              description: g.description,
              priority: g.priority,
              target_audience: g.target_audience,
              created_at: g.created_at,
            }))
          );
        }
      }
    );
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

  const handleEditOpen = (goal: GoalItem) => {
    setEditingGoal(goal);
    setIsEditModalOpen(true);
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
              className={audience === "General" ? "bg-zinc-800" : "text-zinc-400"}
            >
              General
            </Button>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus size={16} className="mr-2" /> Create Goal
          </Button>

          <GoalCreateModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSuccess={() => {
              setIsModalOpen(false);
              refreshGoals();
            }}
          />

          <GoalEditModal
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            goal={editingGoal}
            onSuccess={() => {
              setIsEditModalOpen(false);
              refreshGoals();
            }}
          />
        </div>
      </div>

      <div className="space-y-4 pb-8">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onEdit={handleEditOpen}
            onDelete={handleDelete}
          />
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
