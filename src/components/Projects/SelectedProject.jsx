import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Header from "../UI/Header";
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
} from "../../utils/motionVariants"; // Update the path

export default function SelectedProject({ project, onEdit, onDelete }) {
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

  // Richer status configuration
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
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ) : daysLeft === 0 ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  };

  return (
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
        {/* Status Badge */}
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
        variants={projectGridVariants}>
        {/* Updated Date Card */}
        <motion.div
          className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors group"
          variants={projectItemVariants}
          whileHover={cardHoverVariants.lift}>
          <div className="flex items-start gap-3">
            <motion.div
              className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors"
              variants={iconHoverVariants}
              whileHover="refresh">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
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
        className="text-gray-700 whitespace-pre-wrap mb-20"
        variants={descriptionVariants}>
        {project.description}
      </motion.p>


      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between mb-6" >
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
          {/* Edit Button  */}
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

          {/* Delete Button  */}
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
  );
}