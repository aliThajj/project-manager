import { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { useProjects } from "../../context/ProjectsContext";
import { AuthContext } from '../../context/AuthContext';
import Input from "../UI/Input";
import Button from "../UI/Button";
import Header from "../UI/Header";
import ProjectDetailsSkeleton from "../Projects/ProjectDetailsSkeleton";
import TaskList from "../Tasks/TaskList";

export default function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    projects,
    editProject,
    currentProjectTasks,
    fetchProjectTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    taskLimits: { maxLength: MAX_TASK_LENGTH, maxTasks: MAX_TASKS_PER_PROJECT }
  } = useProjects();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Task state
  const [newTask, setNewTask] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const project = projects.find(p => p.id === projectId);

    if (!user || !project) {
      navigate('/projects');
      return;
    }

    if (project.ownerId !== user.uid) {
      navigate('/projects');
      return;
    }

    // Load project data
    setTitle(project.title);
    setDescription(project.description);
    setDueDate(project.dueDate?.split('T')[0] || '');

    // Load project tasks
    fetchProjectTasks(projectId).then(() => {
      setIsLoadingData(false);
    });
  }, [projectId, projects, user, navigate, fetchProjectTasks]);

  // Task management functions
  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    if (currentProjectTasks.length >= MAX_TASKS_PER_PROJECT) {
      toast.error(`Maximum ${MAX_TASKS_PER_PROJECT} tasks per project`);
      return;
    }

    addTask(projectId, {
      title: newTask.trim(),
      completed: false,
      order: currentProjectTasks.length,
      createdAt: new Date().toISOString()
    });

    setNewTask("");
  };


  const handleChange = (e) => {
    if (e.target.value.length <= MAX_TASK_LENGTH) {
      setNewTask(e.target.value);
    }
  }
  const editLocalTask = (taskId, updates) => {
    if ('title' in updates) {
      if (updates.title.length > MAX_TASK_LENGTH) {
        toast.error(`Task title too long (max ${MAX_TASK_LENGTH} chars)`);
        return;
      }
      if (updates.title.trim().length < 1) {
        toast.error(`Task title cannot be empty`);
        return;
      }
    }

    updateTask(projectId, taskId, updates);
  };

  const handleRemoveTask = (taskId) => {
    deleteTask(projectId, taskId);
  };

  const handleReorder = async (newOrder) => {
    setIsDragging(true);
    try {
      await reorderTasks(projectId, newOrder);
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      toast.error("Failed to reorder tasks");
    } finally {
      setIsDragging(false);
    }
  };

  async function handleUpdate() {
    if (!title.trim() || !description.trim() || !dueDate.trim()) {
      toast.error("Please fill all fields!");
      return;
    }

    // Additional date validation
    const selectedDate = new Date(dueDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (selectedDate < now) {
      toast.error("Please select a future date!");
      return;
    }

    setIsLoading(true);

    try {
      await editProject(projectId, {
        title,
        description,
        dueDate,
        updatedAt: new Date().toISOString()
      });
      toast.success("Project updated successfully!");
      navigate(`/projects/${projectId}`);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full lg:w-1/2 bg-white rounded-lg p-4 lg:p-6">
        <Header variants={itemVariants}>Edit Project</Header>
        <ProjectDetailsSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full lg:w-1/2 flex flex-col bg-white p-4 lg:p-6"
      variants={containerVariants}
      initial="hidden"
      animate="show">
      <Header variants={itemVariants}>Edit Project</Header>

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
            Tasks {currentProjectTasks.length > 0 && `(${currentProjectTasks.length}/${MAX_TASKS_PER_PROJECT})`}
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
              disabled={currentProjectTasks.length >= MAX_TASKS_PER_PROJECT || isLoading || isDragging} />
            <Button
              secondary={true}
              onClick={handleAddTask}
              disabled={!newTask.trim() || currentProjectTasks.length >= MAX_TASKS_PER_PROJECT || isLoading || isDragging}>
              Add
            </Button>
          </div>

          <div className="flex justify-between">
            <span className="text-xs text-gray-500">
              {newTask.length}/{MAX_TASK_LENGTH} characters
            </span>
            {currentProjectTasks.length >= MAX_TASKS_PER_PROJECT && (
              <span className="text-xs text-red-500">
                Task limit reached
              </span>
            )}
          </div>
        </div>

        {/* Task List Component */}
        <TaskList
          tasks={currentProjectTasks}
          onReorder={handleReorder}
          onTaskUpdate={editLocalTask}
          onTaskDelete={handleRemoveTask}
          maxLength={MAX_TASK_LENGTH}
          maxTasks={MAX_TASKS_PER_PROJECT}
          isLoading={isLoading}
          isDragging={isDragging}
        />
      </motion.div>

      {/* Form Actions */}
      <motion.div
        className="flex items-center justify-end mt-8 mb-4 gap-3 w-full"
        variants={itemVariants}>
        <Link
          to={`/projects/${projectId}`}
          className="secondary-btn"
          disabled={isLoading || isDragging}>
          Cancel
        </Link>
        <Button
          isLoading={isLoading}
          onClick={handleUpdate}
          disabled={isLoading || isDragging}>
          Update Project
        </Button>
      </motion.div>
    </motion.div>
  );
}