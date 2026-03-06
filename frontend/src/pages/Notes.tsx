import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import type { NoteItem, BackendNote } from "@/components/features/notes/types";
import NoteCreateModal from "@/components/features/notes/NoteCreateModal";
import NoteEditModal from "@/components/features/notes/NoteEditModal";
import NoteCard from "@/components/features/notes/NoteCard";

export default function Notes() {
  const [audience, setAudience] = useState<"Him" | "Her" | "General">(
    "General"
  );
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadNotes = async () => {
      const { data, error } = await fetchApi<BackendNote[]>(
        `/api/v1/note/read?audience=${audience}`
      );
      if (!isMounted) return;
      if (error) {
        toast.error("Failed to load notes");
        return;
      }
      if (data) {
        setNotes(
          data.map((n) => ({
            id: n.id,
            title: n.title,
            description: n.description,
            target_audience: n.target_audience,
            created_at: n.created_at,
          }))
        );
      }
    };
    loadNotes();
    return () => {
      isMounted = false;
    };
  }, [audience]);

  const refreshNotes = () => {
    fetchApi<BackendNote[]>(`/api/v1/note/read?audience=${audience}`).then(
      ({ data }) => {
        if (data) {
          setNotes(
            data.map((n) => ({
              id: n.id,
              title: n.title,
              description: n.description,
              target_audience: n.target_audience,
              created_at: n.created_at,
            }))
          );
        }
      }
    );
  };

  const handleDelete = async (id: string) => {
    const { error } = await fetchApi(`/api/v1/note/delete?id=${id}`, {
      method: "DELETE",
    });

    if (error) {
      toast.error("Failed to delete note");
      return;
    }

    toast.success("Note deleted");
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleEditOpen = (note: NoteItem) => {
    setEditingNote(note);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-zinc-400 mt-1">
            Capture your thoughts, ideas, and reminders.
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
            <Plus size={16} className="mr-2" /> Create note
          </Button>

          <NoteCreateModal
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSuccess={() => {
              setIsModalOpen(false);
              refreshNotes();
            }}
          />

          <NoteEditModal
            isOpen={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
            note={editingNote}
            onSuccess={() => {
              setIsEditModalOpen(false);
              refreshNotes();
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start pb-8">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            onEdit={handleEditOpen}
            onDelete={handleDelete}
          />
        ))}
        {notes.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 italic">
            No notes found for this category.
          </div>
        )}
      </div>
    </div>
  );
}
