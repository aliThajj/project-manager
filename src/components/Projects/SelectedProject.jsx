import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "../UI/Header";
import ProjectTasks from "../Tasks/ProjectTasks";
import { useProjects } from "../../context/ProjectsContext";
import {
  containerVariants,
  itemVariants,
  projectGridVariants,
  projectItemVariants,
  statusBadgeVariants,
  iconHoverVariants,
  cardHoverVariants,
  descriptionVariants,
  buttonVariants
} from "../../utils/motionVariants";
import { CalendarIcon, ClockIcon, ExclamationTriangleIcon, RotateIcon } from "../UI/Icons";

export default function SelectedProject({ project, onEdit, onDelete }) {
  const { fetchProjectTasks } = useProjects();

  // Fetch tasks when project changes
  useEffect(() => {
    if (project?.id) {
      fetchProjectTasks(project.id);
    }
  }, [project?.id, fetchProjectTasks]);

  // Format dates with weekday for better context
  const formattedDueDate = new Date(project.dueDate).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const updatedAtDate = project.updatedAt?.seconds
    ? new Date(project.updatedAt.seconds * 1000)
    : new Date(project.updatedAt);
  const formattedUpdatedDate = updatedAtDate.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Enhanced days left calculation
  const dueDate = new Date(project.dueDate);
  const today = new Date();
  const timeDiff = dueDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Status configuration
  const statusConfig = {
    message: daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}` :
      daysLeft === 0 ? "Due today" :
        daysLeft === 1 ? "Due tomorrow" :
          `${daysLeft} days remaining`,
    color: daysLeft < 0 ? "bg-red-50 text-red-700 border-red-200" :
      daysLeft === 0 ? "bg-amber-50 text-amber-700 border-amber-200" :
        daysLeft <= 3 ? "bg-orange-50 text-orange-700 border-orange-200" :
          "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: daysLeft < 0 ? (
      <ClockIcon className="w-4 h-4" />
    ) : daysLeft === 0 ? (
      <ExclamationTriangleIcon className="w-4 h-4" />
    ) : (
      <CalendarIcon className="w-4 h-4" />
    )
  };

  return <>
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm"
      initial="hidden"
      animate="show"
      variants={containerVariants}>
      <Header variants={itemVariants}>Project Details</Header>

      <motion.div
        className="flex flex-col-reverse lg:flex-row lg:items-center gap-2 lg:gap-4 mt-12 mb-8"
        variants={itemVariants}>
        <h1 className="text-3xl font-bold text-stone-600">{project.title}</h1>
        <motion.div
          className={`w-fit inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium lg:mt-2 ${statusConfig.color} border`}
          variants={statusBadgeVariants}
          whileHover="hover">
          <span className="mr-2 -ml-1">{statusConfig.icon}</span>
          <span className="font-semibold">{statusConfig.message}</span>
        </motion.div>
      </motion.div>

      {/* Date Cards Container */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        variants={projectGridVariants}
      >
        {/* Updated Date Card */}
        <motion.div
          className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors group"
          variants={projectItemVariants}
          whileHover={cardHoverVariants.lift}
        >
          <div className="flex items-start gap-3">
            <motion.div
              className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors"
              variants={iconHoverVariants}
              whileHover="refresh">
              <RotateIcon className="w-5 h-5 text-blue-600" />
            </motion.div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">LAST UPDATED</p>
              <p className="text-sm font-semibold text-gray-900">{formattedUpdatedDate}</p>
              <p className="text-xs text-gray-400 mt-1">{updatedAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </motion.div>

        {/* Due Date Card */}
        <motion.div
          className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors group"
          variants={projectItemVariants}
          whileHover={cardHoverVariants.lift}>
          <div className="flex items-start gap-3">
            <motion.div
              className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors"
              variants={iconHoverVariants}
              whileHover="calendar">
              <CalendarIcon className="w-5 h-5 text-purple-600" />
            </motion.div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">DUE DATE</p>
              <p className="text-sm font-semibold text-gray-900">{formattedDueDate}</p>
              <p className={`text-xs mt-1 ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                {daysLeft < 0 ? 'Past deadline' : daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days left`}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <motion.p
        className="text-gray-700 whitespace-pre-wrap mb-8"
        variants={descriptionVariants}>
        {project.description}
      </motion.p>

      {/* Tasks Section - Now properly connected */}
      <ProjectTasks projectId={project.id} />

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between mt-8">
        <motion.div
          whileHover={{ x: -2 }}
          transition={{ type: "spring", stiffness: 400 }}>
          <Link
            to='/projects'
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Projects</span>
          </Link>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <motion.button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-xs"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Edit project">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Edit</span>
          </motion.button>

          <motion.button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-xs"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            aria-label="Delete project">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Delete</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  </>;
}