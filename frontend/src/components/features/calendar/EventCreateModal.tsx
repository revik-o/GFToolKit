import { useState } from "react";
import { CalendarIcon, Plus } from "lucide-react";
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
import { useCreateCalendarEventMutation } from "@/store/api/calendarApi";

export function EventCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [audience, setAudience] = useState("General");

  const [createEvent] = useCreateCalendarEventMutation();

  const handleCreateEvent = async () => {
    if (!title || !start || !end) {
      toast.error("Please fill required fields (Title, Start, End)");
      return;
    }

    try {
      await createEvent({
        title,
        description: desc,
        target_audience: audience,
        start_time: new Date(start).toISOString(),
        end_time: new Date(end).toISOString(),
        is_full_day: false,
        repeat_type: "none",
      }).unwrap();

      toast.success("Event created");
      setIsOpen(false);
      setTitle("");
      setDesc("");
      setStart("");
      setEnd("");
      setAudience("General");
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error("Failed to create event");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
          <Plus size={16} className="mr-2" /> Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="text-indigo-400 shrink-0" size={20} />{" "}
            Create Event
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium ml-1">
              Title
            </label>
            <Input
              placeholder="Event Title"
              className="bg-zinc-800 border-zinc-700"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium ml-1">
              Description (Optional)
            </label>
            <Input
              placeholder="Description"
              className="bg-zinc-800 border-zinc-700"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium ml-1">
                Start Time
              </label>
              <Input
                type="datetime-local"
                className="bg-zinc-800 border-zinc-700 [color-scheme:dark]"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-medium ml-1">
                End Time
              </label>
              <Input
                type="datetime-local"
                className="bg-zinc-800 border-zinc-700 [color-scheme:dark]"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-medium ml-1">
              Who is this for?
            </label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectItem value="Him">Him</SelectItem>
                <SelectItem value="Her">Her</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleCreateEvent}
            className="bg-indigo-600 hover:bg-indigo-500 text-white w-full mt-2"
          >
            Save Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
