import React, { useEffect, useState } from 'react';
import Card from '@tailus-ui/Card';
import { Title, Text } from '@tailus-ui/typography';
import Button from '@tailus-ui/Button';
import Input from '@tailus-ui/Input';
import { getTasks, updateTask, createTask, generateTasks } from '../../api';
import { CheckCircle2, Circle, Plus, ListTodo, Sparkles, Loader2 } from 'lucide-react';

const TodoList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await getTasks();
            if (response.data.status === 'success') {
                setTasks(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateTasks = async () => {
        setGenerating(true);
        try {
            const response = await generateTasks();
            if (response.data.status === 'success') {
                // If new tasks were added, refresh the list
                if (response.data.data.length > 0) {
                    // Add new tasks to the top or refetch
                    fetchTasks();
                }
            }
        } catch (error) {
            console.error("Failed to generate tasks", error);
        } finally {
            setGenerating(false);
        }
    };

    const handleToggleComplete = async (task) => {
        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, is_completed: !t.is_completed } : t
        );
        setTasks(updatedTasks);

        try {
            await updateTask(task.id, { is_completed: !task.is_completed });

            // If task was marked as completed, trigger AI generation
            if (!task.is_completed) {
                handleGenerateTasks();
            }

        } catch (error) {
            console.error("Failed to update task", error);
            // Revert on failure
            fetchTasks();
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const response = await createTask({ title: newTaskTitle });
            if (response.data.status === 'success') {
                setTasks([response.data.data, ...tasks]);
                setNewTaskTitle('');
            }
        } catch (error) {
            console.error("Failed to create task", error);
        }
    };

    return (
        <Card className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ListTodo className="size-5 text-purple-500" />
                    <Title size="base" className="font-bold">AI To-Do List</Title>
                </div>
                <div className="flex items-center gap-2">
                    <Button.Root size="xs" variant="ghost" onClick={handleGenerateTasks} disabled={generating}>
                        {generating ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3 text-yellow-500" />}
                    </Button.Root>
                    <div className="text-xs text-gray-400">
                        {tasks.filter(t => t.is_completed).length}/{tasks.length} Done
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[250px] pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                {loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        No tasks yet. Add one or click the sparkle icon for AI suggestions.
                    </div>
                ) : (
                    <>
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => handleToggleComplete(task)}
                                className={`
                                    group flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50
                                    ${task.is_completed ? "bg-gray-50 border-gray-100 dark:bg-gray-900/30 dark:border-gray-800 opacity-60" : "bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-800"}
                                `}
                            >
                                <div className={`
                                    flex-shrink-0 transition-colors
                                    ${task.is_completed ? "text-green-500" : "text-gray-300 group-hover:text-gray-400"}
                                `}>
                                    {task.is_completed ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <Text className={`truncate text-sm ${task.is_completed ? "line-through text-gray-500" : ""}`}>
                                        {task.title}
                                    </Text>
                                </div>

                                {task.task_type === 'PROFILE' && (
                                    <Sparkles className="size-3 text-blue-400 flex-shrink-0" />
                                )}
                            </div>
                        ))}
                    </>
                )}
                {generating && (
                    <div className="flex items-center justify-center gap-2 p-2 text-xs text-purple-500 animate-pulse">
                        <Sparkles className="size-3" />
                        Thinking of next steps...
                    </div>
                )}
            </div>

            {/* Add Task Input */}
            <form onSubmit={handleAddTask} className="flex gap-2">
                <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a personal task..."
                    className="flex-1 text-sm h-9"
                    size="sm"
                />
                <Button.Root type="submit" size="sm" disabled={!newTaskTitle.trim()} variant="outlined">
                    <Button.Icon type="only">
                        <Plus className="size-4" />
                    </Button.Icon>
                </Button.Root>
            </form>
        </Card>
    );
};

export default TodoList;
