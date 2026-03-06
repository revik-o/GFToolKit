import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NoteItem } from "./types";

const getAudienceColor = (audience: "Him" | "Her" | "General") => {
    if (audience === "Him") return "bg-blue-900/30 text-blue-400";
    if (audience === "Her") return "bg-pink-900/30 text-pink-400";
    return "bg-zinc-800 text-zinc-300";
};

interface NoteCardProps {
    note: NoteItem;
    onEdit: (note: NoteItem) => void;
    onDelete: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
    return (
        <div className="relative group bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors h-fit shadow-sm shadow-zinc-900/50">
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
                        <DropdownMenuItem
                            className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                            onClick={() => onEdit(note)}
                        >
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="hover:bg-red-900/50 focus:bg-red-900/50 text-red-400 hover:text-red-300 cursor-pointer"
                            onClick={() => onDelete(note.id)}
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
                    className={`px-2 py-1 rounded-md ${getAudienceColor(
                        note.target_audience
                    )}`}
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
    );
}
