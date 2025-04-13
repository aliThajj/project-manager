import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, Reorder } from "framer-motion";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { useProjects } from "../../context/ProjectsContext";
import Input from "../UI/Input";
import Button from "../UI/Button";
import Header from "../UI/Header";
import TaskList from "../Tasks/TaskList";


export default function NewProject() {
    // State for form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");

    // State for task management
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get context values
    const {
        addProject,
        addTask,
        taskLimits: { maxLength: MAX_TASK_LENGTH, maxTasks: MAX_TASKS_PER_PROJECT },
        validateTaskTitle,
        validateTaskCount
    } = useProjects();
    const navigate = useNavigate();

    // Constants
    const today = new Date().toISOString().split('T')[0];

    /**
     * Adds a new task to the local state with validation
     */
    const handleAddTask = () => {
        try {
            // Validate before adding
            validateTaskTitle(newTask);
            validateTaskCount(tasks.length);

            setTasks([...tasks, {
                id: Date.now().toString(),
                title: newTask.trim(),
                completed: false,
                order: tasks.length,
                createdAt: new Date().toISOString()
            }]);

            setNewTask("");
        } catch (error) {
            toast.error(error.message);
        }
    };


    const handleChange = (e) => {
        if (e.target.value.length <= MAX_TASK_LENGTH) {
            setNewTask(e.target.value);
        }
    }

    /**
     * Edits a task in local state with validation
     */
    const editLocalTask = (taskId, updates) => {
        try {
            if ('title' in updates) {
                validateTaskTitle(updates.title);
                updates.title = updates.title.trim();
            }

            setTasks(tasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            ));
        } catch (error) {
            toast.error(error.message);
        }
    };

    /**
     * Removes a task from local state
     */
    const handleRemoveTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    /**
     * Validates and submits the project form
     */
    async function handleSave() {
        // Basic form validation
        if (!title.trim() || !description.trim() || !dueDate.trim()) {
            toast.error("Please fill all required fields!");
            return;
        }

        const selectedDate = new Date(dueDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        if (selectedDate < now) {
            toast.error("Due date must be in the future!");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Create the project
            const projectId = await addProject({
                title: title.trim(),
                description: description.trim(),
                dueDate,
            });

            // 2. Add all tasks with their correct order
            const taskCreationPromises = tasks.map((task, index) =>
                addTask(projectId, {
                    title: task.title,
                    completed: task.completed,
                    order: index,
                    createdAt: new Date(task.createdAt)
                })
            );

            await Promise.all(taskCreationPromises);

            toast.success("Project created successfully!");
            navigate('/projects');

        } catch (err) {
            console.error("Project creation error:", err);
            toast.error(`Failed to create project: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <motion.div
            className="w-full lg:w-1/2 flex flex-col bg-white p-4 lg:p-6"
            variants={containerVariants}
            initial="hidden"
            animate="show">
            {/* Project Header */}
            <Header variants={itemVariants}>New Project</Header>

            {/* Project Title */}
            <motion.div className="w-full mb-5" variants={itemVariants}>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    type="text"
                    label="Title"
                    placeholder="Project name"
                    required
                    disabled={isLoading || isDragging}
                />
            </motion.div>

            {/* Project Description */}
            <motion.div className="w-full mb-4" variants={itemVariants}>
                <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    label="Description"
                    textarea
                    rows={4}
                    placeholder="Describe your project..."
                    required
                    disabled={isLoading || isDragging}
                />
            </motion.div>

            {/* Due Date Picker */}
            <motion.div className="w-full mb-8" variants={itemVariants}>
                <Input
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    type="date"
                    label="Due Date"
                    min={today}
                    required
                    disabled={isLoading || isDragging} />

                {dueDate ? (
                    <p className="mt-1 text-sm text-gray-500">
                        Due on {new Date(dueDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                ) : (
                    <p className="mt-1 text-sm text-gray-500">
                        Choose a future date for this project
                    </p>
                )}
            </motion.div>

            {/* Tasks Section */}
            <motion.div className="w-full mt-4" variants={itemVariants}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tasks {tasks.length > 0 && `(${tasks.length}/${MAX_TASKS_PER_PROJECT})`}
                    </label>

                    {/* Task Input */}
                    <div className="flex items-center gap-2 mb-2">
                        <Input
                            value={newTask}
                            onChange={handleChange} 
                            type="text"
                            placeholder="New task description"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            maxLength={MAX_TASK_LENGTH}
                            disabled={tasks.length >= MAX_TASKS_PER_PROJECT || isLoading || isDragging} />
                        <Button
                            secondary={true}
                            onClick={handleAddTask}
                            disabled={!newTask.trim() || tasks.length >= MAX_TASKS_PER_PROJECT || isLoading || isDragging}>
                            Add
                        </Button>
                    </div>

                    <div className="flex justify-between">
                        <span className="text-xs text-gray-500">
                            {newTask.length}/{MAX_TASK_LENGTH} characters
                        </span>
                        {tasks.length >= MAX_TASKS_PER_PROJECT && (
                            <span className="text-xs text-red-500">
                                Task limit reached
                            </span>
                        )}
                    </div>
                </div>

                <TaskList
                    tasks={tasks}
                    onReorder={setTasks}
                    onTaskUpdate={editLocalTask}
                    onTaskDelete={handleRemoveTask}
                    maxLength={MAX_TASK_LENGTH}
                    maxTasks={MAX_TASKS_PER_PROJECT}
                    isLoading={isLoading}
                    isDragging={isDragging} />
            </motion.div>

            {/* Form Actions */}
            <motion.div
                className="flex items-center justify-end mt-8 mb-4 gap-3 w-full"
                variants={itemVariants}>
                <Link
                    to="/projects"
                    className="secondary-btn"
                    disabled={isLoading || isDragging}>
                    Cancel
                </Link>
                <Button
                    isLoading={isLoading}
                    onClick={handleSave}
                    disabled={isLoading || isDragging}>
                    Create Project
                </Button>
            </motion.div>
        </motion.div>
    );
}