import { motion } from "framer-motion";
import { projectItemVariants } from "../../utils/motionVariants";
export default function ProjectSkeleton() {
    return (
        <motion.div variants={projectItemVariants}>
            <div className="bg-gray-100 rounded-lg p-4 h-40 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mt-6"></div>
            </div>
        </motion.div>
    );
};
