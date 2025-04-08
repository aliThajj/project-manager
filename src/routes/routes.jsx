import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import ProjectsListPage from '../components/pages/ProjectsListPage';
import ProjectDetailPage from '../components/pages/ProjectDetailPage';
import NewProject from '../components/pages/NewProject';
import EditProject from '../components/pages/EditProject';
import { AuthContext } from '../context/AuthContext';
import { ModalContext } from '../context/ModalContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const AuthHandler = () => {
  const { openDialog, closeDialog, modals } = useContext(ModalContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (!user && location.state?.authRequired && !location.state?.isSigningOut && !modals['authDialog']) {
      console.log("Opening authDialog because auth is required.");
      openDialog('authDialog');
    }
  }, [user, location.state, openDialog, modals]);

  useEffect(() => {
    if (user && modals['authDialog']) {
      console.log("Closing authDialog because user is logged in.");
      closeDialog('authDialog');
    }
  }, [user, modals, closeDialog]);

  return null;
};



const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    console.log("Redirecting to home due to missing user.");
    return <Navigate to="/" state={{ authRequired: true, from: location }} replace />;
  }

  return children;
};


export const AppRoutes = () => {
  const { loading } = useContext(AuthContext);
  const { openDialog } = useContext(ModalContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <AuthHandler />
      <Routes>
        <Route index element={
          <ProjectsListPage onOpenAuthDialog={() => openDialog('authDialog')} />
        } />

        <Route path="projects">
          <Route index element={
            <ProjectsListPage onOpenAuthDialog={() => openDialog('authDialog')} />
          } />

          <Route path="new" element={
            <ProtectedRoute>
              <NewProject onOpenAuthDialog={() => openDialog('authDialog')} />
            </ProtectedRoute>
          } />

          <Route path=":projectId">
            <Route index element={
              <ProtectedRoute>
                <ProjectDetailPage onOpenAuthDialog={() => openDialog('authDialog')} />
              </ProtectedRoute>
            } />
            <Route path="edit" element={
              <ProtectedRoute>
                <EditProject onOpenAuthDialog={() => openDialog('authDialog')} />
              </ProtectedRoute>
            } />
          </Route>
        </Route>
      </Routes>
    </>
  );
};
