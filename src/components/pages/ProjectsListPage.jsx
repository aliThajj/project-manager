import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from "framer-motion";
import { toast } from "sonner";
import { containerVariants, itemVariants, projectGridVariants } from '../../utils/motionVariants';
import { useProjects } from '../../context/ProjectsContext';
import { AuthContext } from '../../context/AuthContext';
import { ModalContext } from '../../context/ModalContext';
import noProjectImage from '../../assets/no-projectss.png';
import noUserImage from '../../assets/nouser1.webp';
import ProjectItem from '../Projects/ProjectItem';
import ProjectState from '../Projects/ProjectState';
import ProjectSkeleton from '../Projects/ProjectSkeleton';
import Header from '../UI/Header';
import ConfirmDialog from '../Auth/ConfirmDialog';
import { DeleteIcon } from '../UI/Icons';


const ProjectsListPage = ({ onOpenAuthDialog }) => {
  const { user } = useContext(AuthContext);
  const { projects, projectsLoading, isSkeletonLoader, currentPage, totalPages, changePage, deleteProject } = useProjects();
  const { openDialog } = useContext(ModalContext);
  const [isDeleteId, setDelete] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    console.log("project list load:", projectsLoading)
    if (location.pathname !== '/projects') {
      console.log('mano')
    }
  }, [projectsLoading]);

  // call Handle Page Change Function
  const handlePageChange = (page) => {
    // Remove the duplicate check (it was preventing page 1 from reloading)
    window.scrollTo({ top: 0, behavior: 'smooth' });
    changePage(page);
  };

  // Generate visible page numbers with smart truncation
  const getVisiblePages = (currentPage, totalPages) => {
    const visiblePages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5; // Adjust based on screen size

    // Always show first page if it's active or if there's room
    if (currentPage === 1 || currentPage <= Math.ceil(maxVisiblePages / 2) + 1) {
      visiblePages.push(1);
    }

    // Calculate range around current page
    let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

    // Adjust if we're near the edges
    if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
      end = Math.min(maxVisiblePages, totalPages - 1);
      // Ensure we show enough pages if current page is 1
      if (currentPage === 1) {
        end = Math.min(maxVisiblePages + 1, totalPages - 1);
      }
    }
    if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
      start = Math.max(totalPages - maxVisiblePages + 1, 2);
    }

    // Add ellipsis if there's a gap between first page and start
    if (start > 2 && visiblePages[visiblePages.length - 1] !== '...') {
      visiblePages.push('...');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      // Don't duplicate page 1 if we already added it
      if (i !== 1 || visiblePages.indexOf(1) === -1) {
        visiblePages.push(i);
      }
    }

    // Add ellipsis if there's a gap between end and last page
    if (end < totalPages - 1) {
      visiblePages.push('...');
    }

    // Always show last page if not already included
    if (end < totalPages || currentPage === totalPages) {
      visiblePages.push(totalPages);
    }

    return visiblePages;
  };

  // open Confirm Delete Dialog
  const handleConfirmDelete = (id) => {
    setDelete(id);
    setTimeout(() => {
      openDialog('deleteProject', id); // Ensures state update completes before opening modal
    }, 0);
  };

  // Call Delete Context
  const handleDelete = async () => {
    try {
      const response = await deleteProject(isDeleteId);
      toast.success(response?.message || "Project deleted successfully");
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message
        || error.message
        || "Failed to delete project";
      toast.error(errorMessage);
      throw error;
    }
  };


  // Loading state
  if (isSkeletonLoader) {
    return <>
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full lg:w-3/4 bg-white rounded-lg p-4 lg:p-6">
        <Header variants={itemVariants}>Your Projects</Header>
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={projectGridVariants}>
          {[...Array(6)].map((_, index) => (
            <ProjectSkeleton key={index} />
          ))}
        </motion.div>
      </motion.div>
    </>;
  }

  // No user state
  if (!user && !projectsLoading) {
    return (
      <ProjectState
        image={noUserImage}
        title="Ready to Start?"
        description="Create an account or log in to start managing projects"
        buttonText="Create an account"
        onClick={onOpenAuthDialog}
      />
    );
  }

  // No projects state
  if (projects.length === 0 && !projectsLoading) {
    return (
      <ProjectState
        image={noProjectImage}
        title="No Projects Found"
        description="Get started by creating your first project"
        buttonText="Create new project"
        onClick={() => navigate('/projects/new')}
      />
    );
  }

  return <>
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full lg:w-3/4 bg-white rounded-lg p-4 lg:p-6">
      <Header variants={itemVariants}>Your Projects</Header>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6" variants={projectGridVariants}>
        {projects.map((project) => (
          <ProjectItem key={project.id} project={project} onDelete={handleConfirmDelete} />
        ))}
      </motion.div>

      {totalPages > 1 && (
        <motion.div
          variants={itemVariants}
          className="flex justify-center mt-8">
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[40px] flex justify-center"
              aria-label="Previous page">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {getVisiblePages(currentPage, totalPages).map((page, index) => (
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-gray-500 flex items-center justify-center min-w-[32px]">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md transition-colors min-w-[32px] flex items-center justify-center
              ${currentPage === page
                      ? 'bg-red-800 text-white font-medium'
                      : 'bg-gray-100 hover:bg-gray-200'}
              text-sm sm:text-base`}
                  aria-current={currentPage === page ? 'page' : undefined}>
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[40px] flex justify-center"
              aria-label="Next page">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </motion.div>
      )}

    </motion.div>

    <ConfirmDialog
      modalID="deleteProject"
      icon={<DeleteIcon />}
      caption="Delete your project?"
      description="If you continue, you will permanently delete this project. Are you sure you want to continue?"
      action="Delete"
      onHandleAction={handleDelete} />
  </>
};

export default ProjectsListPage;