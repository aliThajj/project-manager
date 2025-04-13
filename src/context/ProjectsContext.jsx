import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  collection, doc, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, serverTimestamp,
  query, orderBy, limit, startAfter,
  onSnapshot, writeBatch
} from "firebase/firestore";
import { db, auth } from "../Firebase/firebase";

export const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  // Project states
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isSkeletonLoader, setSkeletonLoader] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [pageCursors, setPageCursors] = useState([]);
  const pageSize = 6;

  // Task states
  const [currentProjectTasks, setCurrentProjectTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  // Task configuration constants
  const MAX_TASK_LENGTH = 100;        // Maximum characters per task title
  const MAX_TASKS_PER_PROJECT = 15;   // Maximum tasks allowed per project
  const MIN_TASK_LENGTH = 1;          // Minimum characters required for task title

  // TASK LIMIT CONFIGURATION
  const taskLimits = {
    maxLength: MAX_TASK_LENGTH,
    maxTasks: MAX_TASKS_PER_PROJECT,
    minLength: MIN_TASK_LENGTH
  };


  // ========================
  // PROJECT FUNCTIONS
  // ========================

  // Load initial data on login
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setProjects([]);
        setCurrentPage(1);
        setPageCursors([]);
        setProjectsLoading(false);
        console.log('not user => Set Project loading false');
        return;
      }
      if (user) {
        setProjectsLoading(true);
        // Preload all cursors first, then fetch page 1
        await preloadAllCursors();
        await fetchProjects(1);
      }
    });

    return () => unsubscribeAuth();
  }, []);



  // Fetch Projects
  const fetchProjects = async (page) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const projectsRef = collection(db, "users", user.uid, "projects");
      if (page === 1) {
        const q = query(projectsRef, orderBy("createdAt", "desc"), limit(pageSize));
        const snapshot = await getDocs(q);
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setProjectsLoading(false);
        return;
      }
      if (pageCursors[page - 2]) {
        const q = query(
          projectsRef,
          orderBy("createdAt", "desc"),
          startAfter(pageCursors[page - 2]),
          limit(pageSize)
        );
        const snapshot = await getDocs(q);
        setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
      setCurrentPage(page);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching projects:", error);
    }
  };


  // Change page with proper loading states
  const changePage = async (newPage) => {
    setSkeletonLoader(true);
    if (newPage < 1 || newPage > totalPages) return;

    // Force a re-fetch even if it's the same page
    await fetchProjects(newPage);

    // Update currentPage after fetch is done
    setCurrentPage(newPage);
    setSkeletonLoader(false);
  };

  // Preload ALL cursors at once (critical for pagination)
  const preloadAllCursors = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const projectsRef = collection(db, "users", user.uid, "projects");
    const cursors = [];
    let lastVisible = null;

    // Fetch total count first
    const countSnapshot = await getDocs(projectsRef);
    const totalProjects = countSnapshot.size;
    setTotalProjectsCount(totalProjects);
    const calculatedTotalPages = Math.ceil(totalProjects / pageSize);
    setTotalPages(calculatedTotalPages);

    // Fetch cursors for ALL pages
    for (let p = 1; p <= calculatedTotalPages; p++) {
      const q = query(
        projectsRef,
        orderBy("createdAt", "desc"),
        ...(lastVisible ? [startAfter(lastVisible)] : []),
        limit(pageSize)
      );

      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        lastVisible = snap.docs[snap.docs.length - 1];
        cursors[p - 1] = lastVisible;
      } else {
        break;
      }
    }

    setPageCursors(cursors);
  };

  // Add project with proper pagination updates
  const addProject = async (projectData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const projectWithMeta = {
        ...projectData,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const projectsRef = collection(db, "users", user.uid, "projects");
      const docRef = await addDoc(projectsRef, projectWithMeta);

      // Refresh all pagination data
      await fetchProjects(1);
      await preloadAllCursors();
      await changePage(1);
      setSkeletonLoader(false);

      return docRef.id;
    } catch (error) {
      console.error("❌ Failed to add project:", error);
      throw error;
    }
  };

  // Edit project
  const editProject = async (projectId, updates) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const projectRef = doc(db, "users", user.uid, "projects", projectId);
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete project with proper pagination handling
  const deleteProject = async (projectId) => {
    setTimeout(() => {
      setSkeletonLoader(true);
    }, 500);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const projectRef = doc(db, "users", user.uid, "projects", projectId);
      await deleteDoc(projectRef);

      // 1. Update total count
      const newTotal = totalProjectsCount - 1;
      setTotalProjectsCount(newTotal);
      const newTotalPages = Math.ceil(newTotal / pageSize);
      setTotalPages(newTotalPages);

      // 2. Remove from local state
      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      // 3. Refresh pagination cursors (critical!)
      await preloadAllCursors();

      // 4. Handle page adjustment
      if (projects.length === 1 && currentPage > 1) {
        await changePage(currentPage - 1);
      } else {
        await fetchProjects(currentPage);
      }

      setSkeletonLoader(false);
      return { success: true, message: "Project deleted successfully!" };
    } catch (err) {
      setSkeletonLoader(false);
      return { success: false, message: err.message };
    }
  };

  // Get project by ID
  const getProjectById = async (projectId) => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const projectRef = doc(db, "users", user.uid, "projects", projectId);
      const docSnap = await getDoc(projectRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err) {
      console.error("Error fetching project by ID:", err);
      return null;
    }
  };

  // ========================
  // TASK FUNCTIONS
  // ========================

  /**
   * Validates a task title against configured limits
   * @param {string} title - The task title to validate
   * @throws {Error} When validation fails
   */
  const validateTaskTitle = (title) => {
    if (!title || title.trim().length < MIN_TASK_LENGTH) {
      throw new Error(`Task title must be at least ${MIN_TASK_LENGTH} character`);
    }
    if (title.length > MAX_TASK_LENGTH) {
      throw new Error(`Task title too long (max ${MAX_TASK_LENGTH} characters)`);
    }
  };

  /**
   * Validates the number of tasks against the maximum allowed
   * @param {number} currentCount - Current number of tasks
   * @throws {Error} When task limit is exceeded
   */
  const validateTaskCount = (currentCount) => {
    if (currentCount >= MAX_TASKS_PER_PROJECT) {
      throw new Error(`Maximum ${MAX_TASKS_PER_PROJECT} tasks per project`);
    }
  };

  // ========================
  // TASK FUNCTIONS
  // ========================

  // Real-time task listener with order tracking
  useEffect(() => {
    if (!currentProjectId) return;
    const user = auth.currentUser;
    if (!user) return;

    const tasksRef = collection(db, "users", user.uid, "projects", currentProjectId, "tasks");
    const q = query(tasksRef, orderBy("order", "asc")); // Critical for drag-and-drop

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCurrentProjectTasks(tasks);
    });

    return () => unsubscribe();
  }, [currentProjectId]);

  // Fetch tasks for a project (initial load)
  const fetchProjectTasks = useCallback(async (projectId) => {
    if (!projectId) return;
    setTasksLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const tasksRef = collection(db, "users", user.uid, "projects", projectId, "tasks");
      const q = query(tasksRef, orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      setCurrentProjectId(projectId);
      setCurrentProjectTasks(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })));
    } catch (error) {
      setError(error.message);
      console.error("Failed to fetch tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  /**
   * Adds a new task to a project with validation
   * @param {string} projectId - The project ID to add the task to
   * @param {object} taskData - Task data including title, order, etc.
   * @throws {Error} When validation fails or Firestore operation fails
   */
  const addTask = async (projectId, taskData) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Validate task title
      validateTaskTitle(taskData.title);

      // Prepare task data with metadata
      const taskWithMeta = {
        ...taskData,
        title: taskData.title.trim(), // Clean up whitespace
        createdAt: taskData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const tasksRef = collection(db, "users", user.uid, "projects", projectId, "tasks");
      await addDoc(tasksRef, taskWithMeta);
    } catch (error) {
      console.error("Failed to add task:", error);
      throw error; // Re-throw for component to handle
    }
  };

  /**
   * Updates an existing task with validation
   * @param {string} projectId - The project ID containing the task
   * @param {string} taskId - The task ID to update
   * @param {object} updates - The updates to apply
   * @throws {Error} When validation fails or Firestore operation fails
   */
  const updateTask = async (projectId, taskId, updates) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      // Validate title if it's being updated
      if (updates.title) {
        validateTaskTitle(updates.title);
        updates.title = updates.title.trim(); // Clean up whitespace
      }

      const taskRef = doc(db, "users", user.uid, "projects", projectId, "tasks", taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Deletes a task from a project
   * @param {string} projectId - The project ID containing the task
   * @param {string} taskId - The task ID to delete
   * @throws {Error} When Firestore operation fails
   */
  const deleteTask = async (projectId, taskId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const taskRef = doc(db, "users", user.uid, "projects", projectId, "tasks", taskId);
      await deleteDoc(taskRef);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Reorders tasks with batch update (for drag-and-drop)
   * @param {string} projectId - The project ID containing the tasks
   * @param {Array} newOrder - Array of tasks in new order
   * @throws {Error} When Firestore operation fails
   */
  const reorderTasks = async (projectId, newOrder) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const batch = writeBatch(db);
      newOrder.forEach((task, newIndex) => {
        const taskRef = doc(db, "users", user.uid, "projects", projectId, "tasks", task.id);
        batch.update(taskRef, { order: newIndex });
      });
      await batch.commit();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };


  // ========================
  // CONTEXT VALUE
  // ========================
  return (
    <ProjectsContext.Provider
      value={{
        // Project management
        projects,
        projectsLoading,
        isSkeletonLoader,
        error,
        currentPage,
        totalPages,
        changePage,
        addProject,
        editProject,
        deleteProject,
        getProjectById,
        // Task management
        currentProjectId,
        currentProjectTasks,
        tasksLoading,
        taskLimits,
        fetchProjectTasks,
        addTask,
        updateTask,
        deleteTask,
        reorderTasks,
        validateTaskTitle,
        validateTaskCount,
        setCurrentProjectId,
      }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectsContext);