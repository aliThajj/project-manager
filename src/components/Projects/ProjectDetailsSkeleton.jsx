import { motion } from "framer-motion";
import { fadeUpVariants } from "../../utils/motionVariants";

export default function ProjectDetailsSkeleton() {
    return (
        <motion.div
            variants={fadeUpVariants}
            className="max-w-full animate-pulse">
            {/* Title */}
            <div className="h-8 bg-gray-200 rounded w-2/3 mb-6"></div>

            {/* Description */}
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>


                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>


                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>

            {/* Meta data / tags / footer */}
            <div className="flex justify-between items-center gap-3 mt-8">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
        </motion.div>
    );
}
