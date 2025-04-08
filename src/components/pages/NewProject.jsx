import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { useProjects } from "../../context/ProjectsContext";
import Input from "../UI/Input";
import Button from "../UI/Button";
import Header from "../UI/Header";

export default function NewProject() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addProject } = useProjects();
    const navigate = useNavigate();


    // Get today's date in YYYY-MM-DD format for the min attribute
    const today = new Date().toISOString().split('T')[0];

    async function handleSave() {
        if (!title.trim() || !description.trim() || !dueDate.trim()) {
            toast.error("Please fill all fields!");
            return;
        }

        // Additional date validation
        const selectedDate = new Date(dueDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Reset time part for accurate comparison

        if (selectedDate < now) {
            toast.error("Please select a future date!");
            return;
        }

        setIsLoading(true);

        try {
            await addProject({ title, description, dueDate });
            setIsLoading(false);
            toast.success("Project added successfully!");
            navigate('/projects');

            setTitle("");
            setDescription("");
            setDueDate("");
        } catch (err) {
            toast.error(`Error: ${err.message}`);
            setIsLoading(false);
        }
    }

    return (
        <motion.div
            className="w-full lg:w-1/2 flex flex-col bg-white p-4 lg:p-6 add-page"
            variants={containerVariants}
            initial="hidden"
            animate="show">
            <Header variants={itemVariants}>New Project</Header>
            <motion.div className="w-full" variants={itemVariants}>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} type="text" label="Title" />
            </motion.div>
            <motion.div className="w-full" variants={itemVariants}>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} label="Description" textarea />
            </motion.div>
            <motion.div className="w-full" variants={itemVariants}>
                <Input
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    type="date"
                    label="Due Date"
                    min={today} // This will disable past dates in the date picker
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
                <Link to="/projects" className="secondary-btn">Cancel</Link>
                <Button
                    isLoading={isLoading}
                    onClick={handleSave}>
                    Add Project
                </Button>
            </motion.div>
        </motion.div>
    );
}