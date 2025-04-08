import { motion } from "framer-motion";
import { containerVariants, itemVariants } from '../../utils/motionVariants';
import Button from "../UI/Button";

export default function ProjectState({ image, title, description, buttonText, onClick }) {
    return <>
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="w-full flex flex-col items-center justify-center gap-5 bg-white rounded-lg px-1">
            <motion.img variants={itemVariants} src={image} alt={title} className="w-40 h-40 object-cover" />
            <motion.h2 variants={itemVariants} className="text-xl font-bold text-stone-500">{title}</motion.h2>
            <motion.p variants={itemVariants} className="text-stone-400 text-center">{description}</motion.p>
            <motion.div variants={itemVariants}>
                <Button onClick={onClick}>{buttonText}</Button>
            </motion.div>
        </motion.div>
    </>
};
