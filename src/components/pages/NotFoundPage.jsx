import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../../utils/motionVariants";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const leftEyeRef = useRef(null);
    const rightEyeRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!leftEyeRef.current || !rightEyeRef.current) return;

            const ghost = document.querySelector('.ghost');
            if (!ghost) return;

            const ghostRect = ghost.getBoundingClientRect();
            const ghostCenterX = ghostRect.left + ghostRect.width / 2;
            const ghostCenterY = ghostRect.top + ghostRect.height / 3;

            // Calculate angle between cursor and ghost center
            const angle = Math.atan2(e.clientY - ghostCenterY, e.clientX - ghostCenterX);

            // Smaller eye movement range for mobile
            const maxDistance = window.innerWidth < 640 ? 2 : 3;
            const leftEyeX = Math.cos(angle) * maxDistance;
            const leftEyeY = Math.sin(angle) * maxDistance;
            const rightEyeX = Math.cos(angle) * maxDistance;
            const rightEyeY = Math.sin(angle) * maxDistance;

            leftEyeRef.current.style.transform = `translate(${leftEyeX}px, ${leftEyeY}px)`;
            rightEyeRef.current.style.transform = `translate(${rightEyeX}px, ${rightEyeY}px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <motion.div variants={containerVariants}
            initial="hidden"
            animate="show" className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 w-full rounded-lg">
            <div className="text-center w-full max-w-md mx-auto px-4">
                {/* Animated 404 text - smaller on mobile */}
                <motion.div variants={itemVariants} className="relative">
                    <h1 className="text-7xl sm:text-9xl font-bold text-gray-800 opacity-10">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-3xl sm:text-5xl font-bold text-slate-800 px-2">Page Not Found</h2>
                    </div>
                </motion.div>

                {/* Ghost animation - smaller on mobile */}
                <motion.div variants={itemVariants} className="mt-8 sm:mt-12 mb-12 sm:mb-16 relative w-24 h-24 sm:w-32 sm:h-32 mx-auto">
                    <div className="ghost absolute w-full h-full bg-white rounded-full shadow-lg animate-float">
                        <div className="face absolute top-1/4 left-1/2 transform -translate-x-1/2 w-3/5">
                            <div className="eyes flex justify-between relative">
                                <div className="eye-container absolute left-0 w-3 h-3 sm:w-4 sm:h-4">
                                    <div
                                        ref={leftEyeRef}
                                        className="eye w-full h-full bg-slate-800 rounded-full transition-transform duration-100"
                                    ></div>
                                </div>
                                <div className="eye-container absolute right-0 w-3 h-3 sm:w-4 sm:h-4">
                                    <div
                                        ref={rightEyeRef}
                                        className="eye w-full h-full bg-slate-800 rounded-full transition-transform duration-100"
                                    ></div>
                                </div>
                            </div>
                            <div className="mouth absolute top-5 sm:top-6 left-1/2 transform -translate-x-1/2 w-5 h-1.5 sm:w-6 sm:h-2 bg-slate-800 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <div className="shadow absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-3 sm:w-20 sm:h-4 bg-gray-300 blur-md rounded-full animate-float-slow"></div>
                </motion.div>

                <motion.p variants={itemVariants} className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg px-2">
                    Oops! The page you're looking for has vanished into the digital void.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-slate-800 hover:bg-stone-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-sm sm:text-base">
                        ← Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-white hover:bg-gray-100 text-slate-800 border border-slate-800 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-sm sm:text-base">
                        Go Home
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
}