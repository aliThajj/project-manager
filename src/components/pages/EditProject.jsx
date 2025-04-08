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

export default function EditProject() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { projects, editProject } = useProjects();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

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

    setTitle(project.title);
    setDescription(project.description);
    setDueDate(project.dueDate?.split('T')[0] || '');
    setIsLoadingData(false);
  }, [projectId, projects, user, navigate]);

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
      className="w-full lg:w-1/2 flex flex-col bg-white p-4 lg:p-6 add-page"
      variants={containerVariants}
      initial="hidden"
      animate="show">
      <Header variants={itemVariants}>Edit Project</Header>
      <motion.div className="w-full" variants={itemVariants}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          type="text"
          label="Title"
        />
      </motion.div>
      <motion.div className="w-full" variants={itemVariants}>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          label="Description"
          textarea
        />
      </motion.div>
      <motion.div className="w-full" variants={itemVariants}>
        <Input
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          type="date"
          label="Due Date"
          min={today}
        />

        {dueDate ? (
          <p className="mt-1 text-sm text-gray-500">
            Due on {new Date(dueDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">Choose a future date when this project should be completed (due date)</p>
        )}
      </motion.div>

      <motion.div className="flex items-center justify-end mt-8 mb-4 gap-3 w-full" variants={itemVariants}>
        <Link to={`/projects/${projectId}`} className="secondary-btn">
          Cancel
        </Link>
        <Button
          isLoading={isLoading}
          onClick={handleUpdate}>
          Update Project
        </Button>
      </motion.div>
    </motion.div>
  );
}