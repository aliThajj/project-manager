import { useParams, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useProjects } from '../../context/ProjectsContext';
import { AuthContext } from '../../context/AuthContext';
import { ModalContext } from '../../context/ModalContext';
import { DeleteIcon } from '../UI/Icons';
import SelectedProject from '../Projects/SelectedProject';
import ProjectState from '../Projects/ProjectState';
import ConfirmDialog from '../Auth/ConfirmDialog';
import ProjectDetailsSkeleton from '../Projects/ProjectDetailsSkeleton';
import Header from '../UI/Header';
// import noProjectImage from '../../assets/no-projects.png';
import NotFoundImg from '../../assets/project-not-found.png';

import { containerVariants, itemVariants } from "../../utils/motionVariants";


const ProjectDetailPage = ({ onOpenAuthDialog }) => {
  const { projectId } = useParams();
  const { projects, deleteProject, getProjectById } = useProjects();
  const { user } = useContext(AuthContext);
  const { openDialog } = useContext(ModalContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user) {
        onOpenAuthDialog();
        navigate('/projects');
        return;
      }

      // First try local
      let found = projects.find(p => p.id === projectId);

      // If not found locally, try fetching from Firestore
      if (!found) {
        found = await getProjectById(projectId);
      }

      if (!found) {
        setProject(null);
        setLoading(false);
        return;
      }

      // Auth check
      if (found.ownerId !== user.uid) {
        navigate('/projects');
        return;
      }

      setProject(found);
      setLoading(false);
    };

    fetchProject();
  }, [user, projectId, projects]);


  const handleEdit = () => {
    navigate(`/projects/${projectId}/edit`);
  };

  const handleConfirmDelete = (projectId) => {
    setTimeout(() => {
      openDialog('deleteProject', projectId);
    }, 0);
  };

  const handleDelete = async () => {
    navigate('/projects');
    try {
      const response = await deleteProject(projectId, 'details');
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

  // In Loading
  if (loading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full lg:w-3/4 bg-white rounded-lg p-4 lg:p-6">
        <Header variants={itemVariants}>Project Details</Header>
        <ProjectDetailsSkeleton />
      </motion.div>
    );
  }

  // In Error of fetch Project
  if (!project) {
    return (
      <ProjectState
        image={NotFoundImg}
        title=" Project Not Found"
        description="This project may have been deleted or is no longer available"
        buttonText="Back To Projects"
        onClick={() => navigate('/projects')}
      />
    );
  }

  // Show Project Case
  return (
    <>
      <div className="w-full lg:w-3/4">
        <SelectedProject project={project} onDelete={handleConfirmDelete} onEdit={handleEdit} />
      </div>
      <ConfirmDialog
        modalID="deleteProject"
        icon={<DeleteIcon />}
        caption="Delete your project?"
        description="If you continue, you will permanently delete this project. Are you sure you want to continue?"
        action="Delete"
        onHandleAction={handleDelete}
      />
    </>
  );
};

export default ProjectDetailPage;
