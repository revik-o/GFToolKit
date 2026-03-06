import { useState } from "react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { GoalItem } from "./types";

interface GoalCreateModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function GoalCreateModal({
    isOpen,
    onOpenChange,
    onSuccess,
}: GoalCreateModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<GoalItem["priority"]>("Medium");
    const [audience, setAudience] = useState<"Him" | "Her" | "General">("General");

    const handleCreateGoal = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error("Title and description are required");
            return;
        }

        const { error } = await fetchApi("/api/v1/goal/create", {
            method: "POST",
            body: JSON.stringify({
                title,
                description,
                priority,
                target_audience: audience,
            }),
        });

        if (error) {
            toast.error("Failed to create goal");
            return;
        }

        toast.success("Goal created");
        setTitle("");
        setDescription("");
        onSuccess();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New Goal</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Input
                        placeholder="Goal Title"
                        className="bg-zinc-800 border-zinc-700"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="flex min-h-[120px] w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        placeholder="Describe your goal..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            value={priority}
                            onValueChange={(v) => setPriority(v as GoalItem["priority"])}
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
                            value={audience}
                            onValueChange={(v) => setAudience(v as "Him" | "Her" | "General")}
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
    );
}
