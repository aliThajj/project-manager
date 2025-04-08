// Page Animation
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Animates child elements sequentially
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};


// Projects Animation
export const projectGridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Each child animates with a delay
    },
  },
};

export const projectItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

// Single Project View
export const statusBadgeVariants = {
  hover: {
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  }
};

export const iconHoverVariants = {
  refresh: {
    rotate: 45,
    transition: { duration: 0.3 }
  },
  calendar: {
    rotate: 15,
    transition: { duration: 0.3 }
  }
};

export const cardHoverVariants = {
  lift: {
    y: -5,
    transition: { duration: 0.2 }
  }
};

export const descriptionVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { delay: 0.4, duration: 0.5 }
  }
};

export const buttonVariants = {
  hover: {
    scale: 1.1,
    transition: { type: "spring", stiffness: 500, damping: 10 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

// For skeleton Load in single Prject
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};
