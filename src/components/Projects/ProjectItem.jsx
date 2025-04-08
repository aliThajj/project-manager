import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { projectItemVariants } from "../../utils/motionVariants";

const ProjectItem = ({ project, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();


  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Date calculations
  const updatedAtDate = project.updatedAt?.seconds
    ? new Date(project.updatedAt.seconds * 1000)
    : new Date(project.updatedAt);

  const dueDate = new Date(project.dueDate);
  const today = new Date();
  const timeDiff = dueDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  // Status configuration
  const statusConfig = {
    message: daysLeft < 0 ? `Overdue` :
      daysLeft === 0 ? "Today" :
        daysLeft === 1 ? "Tomorrow" :
          `${daysLeft}d`,
    color: daysLeft < 0 ? "bg-red-100 text-red-800" :
      daysLeft === 0 ? "bg-amber-100 text-amber-800" :
        daysLeft <= 3 ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-800",
    borderColor: daysLeft < 0 ? "border-red-200" :
      daysLeft === 0 ? "border-amber-200" :
        daysLeft <= 3 ? "border-orange-200" : "border-gray-200"
  };

  const handleMenuAction = (action) => {
    setIsMenuOpen(false);
    if (action === 'delete') {
      onDelete(project.id)
    };

    if (action === 'edit') {
      navigate(`/projects/${project.id}/edit`)
    }
  };

  return (
    <motion.div
      variants={projectItemVariants}
      className="group relative"
      ref={menuRef}>
      <Link
        to={`/projects/${project.id}`}
        className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-300 h-full">
        {/* Status + Menu Button */}
        <div className="flex justify-between items-start mb-3">
          <span className={`${statusConfig.color} ${statusConfig.borderColor} text-xs font-medium px-2.5 py-1 rounded-full border`}>
            {statusConfig.message}
          </span>

          <div className="relative">
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              aria-label="Project actions"
              aria-expanded={isMenuOpen}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuAction('edit');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Edit Project
                  </button>
                  {/* <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuAction('duplicate');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Duplicate
                  </button> */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuAction('delete');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Project Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          {project.title}
        </h3>

        {/* Project Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description || "No description provided"}
        </p>

        {/* Metadata Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{updatedAtDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>

          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Hover Arrow Indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 group-hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProjectItem;