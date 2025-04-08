import { createContext, useContext, useState, useEffect } from "react";

import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db, auth } from "../Firebase/firebase";

// Create the context
export const ProjectsContext = createContext();

// Provider component
export const ProjectsProvider = ({ children }) => {
  // States for project data and UI
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [isSkeletonLoader, setSkeletonLoader] = useState(false);
  const [error, setError] = useState(null);
  // const [deleteStatus, setDeleteStatus] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [pageCursors, setPageCursors] = useState([]); // Stores all cursors in order [page1Cursor, page2Cursor, ...]
  const pageSize = 6; // Number of items per page


  /**
   * Fetch projects for a specific page
   * @param {number} page - The page number to fetch
   */

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
    // setProjectsLoading(true);
    console.log('start Fetching Projects + loeader is : ', projectsLoading)
    try {
      const user = auth.currentUser;
      if (!user) return;

      const projectsRef = collection(db, "users", user.uid, "projects");
      console.log('start Fetching Projects + loeader is : ', projectsLoading)

      // For page 1, fetch directly (no cursor needed)
      if (page === 1) {
        const q = query(
          projectsRef,
          orderBy("createdAt", "desc"),
          limit(pageSize)
        );
        const snapshot = await getDocs(q);
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // after fetch
        setProjects(projectsData);
        setProjectsLoading(false);
        return;
      }

      // For pages > 1, use preloaded cursor
      if (pageCursors[page - 2]) { // page-2 because array is 0-indexed (page1 cursor = index 0)
        const q = query(
          projectsRef,
          orderBy("createdAt", "desc"),
          startAfter(pageCursors[page - 2]),
          limit(pageSize)
        );

        const snapshot = await getDocs(q);
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectsData);
      } else {
        console.error("Cursor not found for page", page);
      }

      setCurrentPage(page);
    } catch (error) {
      setError(error.message);
      console.error("❌ Error fetching projects:", error);
    }
  };

  /**
   * Change the current page
   * @param {number} newPage - The page number to navigate to
   */
  const changePage = async (newPage) => {
    setSkeletonLoader(true) // show
    if (newPage < 1 || newPage > totalPages) return;

    // Force a re-fetch even if it's the same page (to handle deletions/additions)
    await fetchProjects(newPage);

    // Update currentPage after fetch is done
    setCurrentPage(newPage);
    setSkeletonLoader(false);
  };

  /**
   * Preload ALL cursors at once (runs on initial load)
   * This ensures we have all necessary cursors before pagination begins
   */
  const preloadAllCursors = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const projectsRef = collection(db, "users", user.uid, "projects");
    const cursors = [];
    let lastVisible = null;

    // Fetch total count to determine how many pages exist
    const countSnapshot = await getDocs(projectsRef);
    const totalProjects = countSnapshot.size;
    setTotalProjectsCount(totalProjects);
    const totalPages = Math.ceil(totalProjects / pageSize);
    setTotalPages(totalPages);

    // Fetch cursors for ALL pages
    for (let p = 1; p <= totalPages; p++) {
      const q = query(
        projectsRef,
        orderBy("createdAt", "desc"),
        ...(lastVisible ? [startAfter(lastVisible)] : []),
        limit(pageSize)
      );

      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        lastVisible = snap.docs[snap.docs.length - 1];
        cursors[p - 1] = lastVisible; // Store in array (index 0 = page 1 cursor)
      } else {
        break;
      }
    }

    setPageCursors(cursors);
  };

  /**
   * Add a new project to Firestore
   * @param {object} projectData - The project data to add
   */
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

      // Refresh pagination data
      await fetchProjects(1); // fetch project
      await preloadAllCursors();
      await changePage(1); // Go back to page 1
      setSkeletonLoader(false);

      return docRef.id;
    } catch (error) {
      console.error("❌ Failed to add project:", error);
      throw error;
    }
  };

  /**
   * Update an existing project
   * @param {string} projectId - The ID of the project to update
   * @param {object} updates - The updates to apply
   */
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

  /**
   * Delete a project
   * @param {string} projectId - The ID of the project to delete
   */
  const deleteProject = async (projectId) => {
    // setSkeletonLoader(true);
    // SetTimeout for showing loader in button of delete 
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

      // 4. Handle page adjustment ONLY if current page is now empty
      if (projects.length === 1 && currentPage > 1) {
        await changePage(currentPage - 1); // Go back if last item on page

      } else {
        await fetchProjects(currentPage); // Re-fetch current page otherwise
      }

      // 5. Remove Loader 
      setSkeletonLoader(false);

      return { success: true, message: "Project deleted successfully!" };
    } catch (err) {
      setSkeletonLoader(false);
      return { success: false, message: err.message };
    }
  };

  /**
   * Logout and reset state
   */
  // const logoutUser = async () => {
  //   await auth.signOut();
  //   console.log('signout from projectContext')
  //   setProjects([]);
  //   setCurrentPage(1);
  //   setPageCursors([]);
  // };


  // Set Loader  after login context 
  // const setCustomLoader = () => {
  //   setProjectsLoading(true);
  //   console.log('setCustom : ', projectsLoading)
  // };

  // const removeCustomLoader = () => {
  //   setProjectsLoading(false);
  //   console.log('removeCustom : ', projectsLoading)

  // }


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
  return (
    <ProjectsContext.Provider
      value={{
        projects,
        projectsLoading,
        isSkeletonLoader,
        error,
        // deleteStatus,
        currentPage,
        totalPages,
        changePage,
        addProject,
        editProject,
        deleteProject,
        getProjectById
        // logoutUser,
        // setCustomLoader,
        // removeCustomLoader
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

// Custom hook to use the context
export const useProjects = () => useContext(ProjectsContext);