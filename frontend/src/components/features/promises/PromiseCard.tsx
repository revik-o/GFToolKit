import { MoreVertical, Pencil, Trash2, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PromiseItem } from "./types";

const priorityColors = {
    Low: "bg-zinc-800 text-zinc-300 border-zinc-700",
    Medium: "bg-yellow-900/50 text-yellow-500 border-yellow-900",
    High: "bg-red-900/50 text-red-500 border-red-900",
};

interface PromiseCardProps {
    promise: PromiseItem;
    onEdit: (promise: PromiseItem) => void;
    onDelete: (id: string) => void;
}

export default function PromiseCard({
    promise,
    onEdit,
    onDelete,
}: PromiseCardProps) {
    return (
        <div className="group bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 hover:bg-zinc-900 hover:border-zinc-700 transition-all flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="hidden sm:flex h-12 w-12 rounded-full bg-zinc-800/80 items-center justify-center shrink-0 border border-zinc-700/50">
                <HeartHandshake
                    className={`h-6 w-6 ${promise.target_audience === "Him"
                        ? "text-blue-400"
                        : promise.target_audience === "Her"
                            ? "text-pink-400"
                            : "text-indigo-400"
                        }`}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h3
                        className="font-semibold text-lg text-zinc-100 truncate"
                        title={promise.title}
                    >
                        {promise.title}
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
                                <DropdownMenuItem
                                    className="hover:bg-zinc-800 cursor-pointer"
                                    onClick={() => onEdit(promise)}
                                >
                                    <Pencil size={14} className="mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/50 cursor-pointer"
                                    onClick={() => onDelete(promise.id)}
                                >
                                    <Trash2 size={14} className="mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <p
                    className="text-zinc-400 text-sm line-clamp-3 mb-3 sm:mb-2"
                    title={promise.description}
                >
                    {promise.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                    <Badge
                        variant="outline"
                        className={`${priorityColors[promise.priority]} bg-transparent`}
                    >
                        {promise.priority} Priority
                    </Badge>

                    <span
                        className={`px-2 py-0.5 rounded-md ${promise.target_audience === "Him"
                            ? "bg-blue-900/20 text-blue-400 border border-blue-900/30"
                            : promise.target_audience === "Her"
                                ? "bg-pink-900/20 text-pink-400 border border-pink-900/30"
                                : "bg-zinc-800/50 text-zinc-300 border border-zinc-700/50"
                            }`}
                    >
                        {promise.target_audience}
                    </span>
                    <span className="text-zinc-600 ml-auto sm:ml-0">
                        {new Date(promise.created_at).toLocaleDateString(undefined, {
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
                        <DropdownMenuItem
                            className="hover:bg-zinc-800 focus:bg-zinc-800 cursor-pointer"
                            onClick={() => onEdit(promise)}
                        >
                            <Pencil size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="hover:bg-red-900/50 focus:bg-red-900/50 text-red-400 hover:text-red-300 cursor-pointer"
                            onClick={() => onDelete(promise.id)}
                        >
                            <Trash2 size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
