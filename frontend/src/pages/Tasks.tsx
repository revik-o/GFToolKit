import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchApi } from '@/lib/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, LayoutList, LayoutGrid, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock Data structure based on our schema
type Task = {
    id: string;
    title: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    assignee: string;
};



const priorityColors = {
    Low: 'bg-zinc-800 text-zinc-300',
    Medium: 'bg-yellow-900/50 text-yellow-500',
    High: 'bg-red-900/50 text-red-500',
};

const statusColors = {
    'To Do': 'bg-zinc-800 text-zinc-300',
    'In Progress': 'bg-blue-900/50 text-blue-500',
    'Done': 'bg-green-900/50 text-green-500',
};

// Map backend API to frontend types
export type BackendTask = {
    id: string;
    title: string;
    description: { String: string; Valid: boolean };
    status: { String: string; Valid: boolean };
    priority: { String: string; Valid: boolean };
    assignee_id: { String: string; Valid: boolean };
    author_id: string;
    created_at: string;
    updated_at: string;
};

export default function Tasks() {
    const [viewMode, setViewMode] = useState<'List' | 'Dashboard'>('Dashboard');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const [newTaskStatus, setNewTaskStatus] = useState<Task['status']>('To Do');
    const [newTaskPriority, setNewTaskPriority] = useState<Task['priority']>('Medium');
    const [newTaskAssignee, setNewTaskAssignee] = useState('Him');

    const loadTasks = async () => {
        const { data, error } = await fetchApi<BackendTask[]>('/api/v1/task/readAll');
        if (error) {
            toast.error('Failed to load tasks');
            return;
        }
        if (data) {
            setTasks(data.map(mapBackendTask));
        }
    };

    useEffect(() => {
        loadTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const mapBackendTask = (bt: BackendTask): Task => ({
        id: bt.id,
        title: bt.title,
        description: bt.description.Valid ? bt.description.String : '',
        status: (bt.status.Valid ? bt.status.String : 'To Do') as Task['status'],
        priority: (bt.priority.Valid ? bt.priority.String : 'Medium') as Task['priority'],
        assignee: bt.assignee_id.Valid ? bt.assignee_id.String : 'Unassigned',
    });



    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) {
            toast.error('Task title is required');
            return;
        }

        const { data, error } = await fetchApi<BackendTask>('/api/v1/task/create', {
            method: 'POST',
            body: JSON.stringify({
                title: newTaskTitle,
                description: newTaskDesc,
                status: newTaskStatus,
                priority: newTaskPriority,
                assignee_id: newTaskAssignee
            })
        });

        if (error) {
            toast.error('Failed to create task');
            return;
        }

        if (data) {
            setTasks([...tasks, mapBackendTask(data)]);
            setIsModalOpen(false);
            setNewTaskTitle('');
            setNewTaskDesc('');
            toast.success('Task created');
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const sourceStatus = result.source.droppableId as Task['status'];
        const destinationStatus = result.destination.droppableId as Task['status'];

        if (sourceStatus === destinationStatus && result.source.index === result.destination.index) return;

        const updatedTasks = Array.from(tasks);
        const draggedItemIndex = updatedTasks.findIndex(t => t.id === result.draggableId);

        if (draggedItemIndex > -1) {
            const [draggedItem] = updatedTasks.splice(draggedItemIndex, 1);
            draggedItem.status = destinationStatus;

            updatedTasks.splice(result.destination.index, 0, draggedItem);
            setTasks(updatedTasks);

            const { error } = await fetchApi(`/api/v1/task/update?id=${draggedItem.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    status: destinationStatus
                })
            });

            if (error) {
                toast.error('Failed to update task status');
                // Could revert state here
            }
        }
    };

    const renderDashboardView = () => (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 h-[calc(100vh-180px)] w-full overflow-x-auto pb-4">
                {(['To Do', 'In Progress', 'Done'] as const).map((status) => (
                    <div key={status} className="flex-1 min-w-[300px] flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 font-semibold flex justify-between items-center">
                            <span>{status}</span>
                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">{tasks.filter(t => t.status === status).length}</Badge>
                        </div>

                        <Droppable droppableId={status}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex-1 p-4 overflow-y-auto space-y-3"
                                >
                                    {tasks.filter(t => t.status === status).map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`bg-zinc-950 p-4 rounded-lg border flex flex-col gap-3 ${snapshot.isDragging ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-zinc-800 hover:border-zinc-700'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className="font-medium text-zinc-100">{task.title}</span>
                                                        <GripVertical size={16} className="text-zinc-600" />
                                                    </div>
                                                    {task.description && <p className="text-sm text-zinc-400 line-clamp-2">{task.description}</p>}

                                                    <div className="flex justify-between items-center mt-2">
                                                        <Badge variant="outline" className={`border-none ${priorityColors[task.priority]}`}>
                                                            {task.priority}
                                                        </Badge>
                                                        <div className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
                                                            {task.assignee}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );

    const renderListView = () => (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="grid grid-cols-12 p-4 border-b border-zinc-800 text-sm font-semibold text-zinc-400">
                <div className="col-span-5">Task</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-2 text-right">Assignee</div>
            </div>
            <ScrollArea className="h-[calc(100vh-220px)]">
                {tasks.map(task => (
                    <div key={task.id} className="grid grid-cols-12 p-4 border-b border-zinc-800/50 items-center hover:bg-zinc-800/30 transition-colors">
                        <div className="col-span-5 font-medium">
                            <div>{task.title}</div>
                            <div className="text-xs text-zinc-500 truncate pr-4">{task.description}</div>
                        </div>
                        <div className="col-span-3">
                            <Badge variant="outline" className={`border-none ${statusColors[task.status]}`}>{task.status}</Badge>
                        </div>
                        <div className="col-span-2">
                            <Badge variant="outline" className={`border-none ${priorityColors[task.priority]}`}>{task.priority}</Badge>
                        </div>
                        <div className="col-span-2 text-right text-sm text-zinc-400">
                            {task.assignee}
                        </div>
                    </div>
                ))}
            </ScrollArea>
        </div>
    );

    return (
        <div className="flex h-full flex-col bg-zinc-950 text-zinc-50 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-zinc-400 mt-1">Manage shared and personal responsibilities</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center rounded-md bg-zinc-900 p-1 border border-zinc-800">
                        <Button variant="ghost" size="sm" onClick={() => setViewMode('Dashboard')} className={viewMode === 'Dashboard' ? 'bg-zinc-800' : 'text-zinc-400'}>
                            <LayoutGrid size={16} className="mr-2" /> Board
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setViewMode('List')} className={viewMode === 'List' ? 'bg-zinc-800' : 'text-zinc-400'}>
                            <LayoutList size={16} className="mr-2" /> List
                        </Button>
                    </div>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
                                <Plus size={16} className="mr-2" /> New Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-50 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Create Task</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    placeholder="Task Title (e.g., Pay Rent)"
                                    className="bg-zinc-800 border-zinc-700"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                />
                                <Input
                                    placeholder="Description (Optional)"
                                    className="bg-zinc-800 border-zinc-700"
                                    value={newTaskDesc}
                                    onChange={(e) => setNewTaskDesc(e.target.value)}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Select value={newTaskStatus} onValueChange={(v) => setNewTaskStatus(v as Task['status'])}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                            <SelectItem value="To Do">To Do</SelectItem>
                                            <SelectItem value="In Progress">In Progress</SelectItem>
                                            <SelectItem value="Done">Done</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as Task['priority'])}>
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                            <SelectValue placeholder="Priority" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-800 border-zinc-700">
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                        <SelectValue placeholder="Assign To" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-800 border-zinc-700">
                                        <SelectItem value="Him">Him</SelectItem>
                                        <SelectItem value="Her">Her</SelectItem>
                                        <SelectItem value="Unassigned">Unassigned</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button onClick={handleCreateTask} className="bg-indigo-600 hover:bg-indigo-500 text-white w-full mt-2">Create Task</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {viewMode === 'Dashboard' ? renderDashboardView() : renderListView()}
        </div>
    );
}
