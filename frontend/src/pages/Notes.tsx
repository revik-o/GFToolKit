import { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Note = {
  id: string;
  title: string;
  description: string;
  target_audience: "Him" | "Her" | "General";
  created_at: string;
};

export type BackendNote = {
  id: string;
  title: string;
  description: string;
  target_audience: "Him" | "Her" | "General";
  created_at: string;
  updated_at: string;
};

const getAudienceColor = (audience: "Him" | "Her" | "General") => {
  if (audience === "Him") return "bg-blue-900/30 text-blue-400";
  if (audience === "Her") return "bg-pink-900/30 text-pink-400";
  return "bg-zinc-800 text-zinc-300";
};

export default function Notes() {
  const [audience, setAudience] = useState<"Him" | "Her" | "General">(
    "General",
  );
  const [notes, setNotes] = useState<Note[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAudience, setNewAudience] = useState<"Him" | "Her" | "General">(
    "General",
  );

  // Edit Form state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAudience, setEditAudience] = useState<"Him" | "Her" | "General">("General");

  useEffect(() => {
    let isMounted = true;
    const loadNotes = async () => {
      const { data, error } = await fetchApi<BackendNote[]>(
        `/api/v1/note/read?audience=${audience}`,
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
          })),
        );
      }
    };
    loadNotes();
    return () => { isMounted = false; };
  }, [audience]);

  const refreshNotes = () => {
    fetchApi<BackendNote[]>(`/api/v1/note/read?audience=${audience}`).then(({ data }) => {
      if (data) {
        setNotes(
          data.map((n) => ({
            id: n.id, title: n.title, description: n.description, target_audience: n.target_audience, created_at: n.created_at,
          }))
        );
      }
    });
  };

  const handleCreateNote = async () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      toast.error("Title and description are required");
      return;
    }

    const { error } = await fetchApi("/api/v1/note/create", {
      method: "POST",
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        target_audience: newAudience,
      }),
    });

    if (error) {
      toast.error("Failed to create note");
      return;
    }

    toast.success("Note created");
    setIsModalOpen(false);
    setNewTitle("");
    setNewDesc("");
    refreshNotes(); // Refresh list
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

  const handleEditOpen = (note: Note) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditDesc(note.description);
    setEditAudience(note.target_audience);
    setIsEditModalOpen(true);
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;
    if (!editTitle.trim() || !editDesc.trim()) {
      toast.error("Title and description are required");
      return;
    }

    const { error } = await fetchApi("/api/v1/note/update", {
      method: "PUT",
      body: JSON.stringify({
        id: editingNote.id,
        title: editTitle,
        description: editDesc,
        target_audience: editAudience,
      }),
    });

    if (error) {
      toast.error("Failed to update note");
      return;
    }

    toast.success("Note updated");
    setIsEditModalOpen(false);
    setEditingNote(null);
    refreshNotes(); // Refresh list
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
                <Plus size={16} className="mr-2" /> Create note
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New Note</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Note Title"
                  className="bg-zinc-800 border-zinc-700"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Write your note description here..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
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

                <Button
                  onClick={handleCreateNote}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white w-full mt-2"
                >
                  Save Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Note</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Note Title"
                  className="bg-zinc-800 border-zinc-700"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Write your note description here..."
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <Select
                  value={editAudience}
                  onValueChange={(v) =>
                    setEditAudience(v as "Him" | "Her" | "General")
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

                <Button
                  onClick={handleUpdateNote}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white w-full mt-2"
                >
                  Update Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start pb-8">
        {notes.map((note) => (
          <div
            key={note.id}
            className="relative group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors h-fit shadow-sm shadow-zinc-900/50"
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {note.title}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mr-2 -mt-1 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800 shrink-0"
                  >
                    <MoreVertical size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-zinc-900 border-zinc-800 text-zinc-50 w-32"
                >
                  <DropdownMenuItem className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer" onClick={() => handleEditOpen(note)}>
                    <Pencil size={14} className="mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="hover:bg-red-900/50 focus:bg-red-900/50 text-red-400 hover:text-red-300 cursor-pointer"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 size={14} className="mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-zinc-400 text-sm whitespace-pre-wrap">
              {note.description}
            </p>
            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs font-medium">
              <span
                className={`px-2 py-1 rounded-md ${getAudienceColor(note.target_audience)}`}
              >
                {note.target_audience}
              </span>
              <span className="text-zinc-500">
                {new Date(note.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
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
