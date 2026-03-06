import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import type {
  PromiseItem,
  BackendPromise,
} from "@/components/features/promises/types";
import PromiseCreateModal from "@/components/features/promises/PromiseCreateModal";
import PromiseEditModal from "@/components/features/promises/PromiseEditModal";
import PromiseCard from "@/components/features/promises/PromiseCard";

export default function Promises() {
  const [audience, setAudience] = useState<"Him" | "Her" | "General">(
    "General"
  );
  const [promises, setPromises] = useState<PromiseItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingPromise, setEditingPromise] = useState<PromiseItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadPromises = async () => {
      const { data, error } = await fetchApi<BackendPromise[]>(
        `/api/v1/promise/read?audience=${audience}`
      );
      if (!isMounted) return;
      if (error) {
        toast.error("Failed to load promises");
        return;
      }
      if (data) {
        setPromises(
          data.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            priority: p.priority,
            target_audience: p.target_audience,
            created_at: p.created_at,
          }))
        );
      }
    };
    loadPromises();
    return () => {
      isMounted = false;
    };
  }, [audience]);

  const refreshPromises = () => {
    fetchApi<BackendPromise[]>(`/api/v1/promise/read?audience=${audience}`).then(
      ({ data }) => {
        if (data) {
          setPromises(
            data.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              priority: p.priority,
              target_audience: p.target_audience,
              created_at: p.created_at,
            }))
          );
        }
      }
    );
  };

  const handleDelete = async (id: string) => {
    const { error } = await fetchApi(`/api/v1/promise/delete?id=${id}`, {
      method: "DELETE",
    });

    if (error) {
      toast.error("Failed to delete promise");
      return;
    }

    toast.success("Promise deleted");
    setPromises(promises.filter((p) => p.id !== id));
  };

  const handleEditOpen = (promise: PromiseItem) => {
    setEditingPromise(promise);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promises</h1>
          <p className="text-zinc-400 mt-1">
            Keep track of the commitments you make to each other.
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
            <Plus size={16} className="mr-2" /> Create Promise
          </Button>

          <PromiseCreateModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSuccess={() => {
              setIsModalOpen(false);
              refreshPromises();
            }}
          />

          <PromiseEditModal
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            promise={editingPromise}
            onSuccess={() => {
              setIsEditModalOpen(false);
              refreshPromises();
            }}
          />
        </div>
      </div>

      <div className="space-y-4 pb-8">
        {promises.map((promise) => (
          <PromiseCard
            key={promise.id}
            promise={promise}
            onEdit={handleEditOpen}
            onDelete={handleDelete}
          />
        ))}

        {promises.length === 0 && (
          <div className="py-12 text-center text-zinc-500 italic border border-dashed border-zinc-800 rounded-xl">
            No promises found.
          </div>
        )}
      </div>
    </div>
  );
}
