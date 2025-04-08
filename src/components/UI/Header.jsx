import { motion } from "framer-motion"; //  npm install framer-motion
import styles from './header.module.css';

export default function Header({ children , ...props }) {
    return (
        <motion.header className={styles.header} {...props}>
            <h1 className='text-2xl text-center font-semibold text-gray-800 mb-8'>{children}</h1>
        </motion.header>
    )
};
