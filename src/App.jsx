import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "sonner";
import { useContext } from 'react';
import MainLayout from './components/layout/MainLayout';
import ProjectsListPage from './components/pages/ProjectsListPage';
import ProjectDetailPage from './components/pages/ProjectDetailPage';
import AuthDialog from './components/Auth/AuthDialog';
import NewProject from './components/pages/NewProject';
import EditProject from './components/pages/EditProject';
import NotFoundPage from './components/pages/NotFoundPage';
import { ProjectsProvider } from './context/ProjectsContext';
import { AuthContext } from './context/AuthContext';
import { ModalContext } from './context/ModalContext';

const ProtectedRoute = ({ children }) => {
  const { openDialog } = useContext(ModalContext);
  const { user } = useContext(AuthContext);

  if (!user) {
    openDialog('authDialog');
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const { openDialog } = useContext(ModalContext);

  return (
    <>
      <Toaster position="top-center" richColors />
      <Router>
        <ProjectsProvider>
          <Routes>
            <Route element={<MainLayout onOpenAuthDialog={() => openDialog('authDialog')} />}>
              <Route index element={<Navigate to="/projects" replace />} />
              
              <Route path="projects">
                <Route index element={
                  <ProjectsListPage onOpenAuthDialog={() => openDialog('authDialog')} />
                } />

                <Route path="new" element={
                  <ProtectedRoute>
                    <NewProject />
                  </ProtectedRoute>
                } />

                <Route path=":projectId" element={
                  <ProtectedRoute>
                    <ProjectDetailPage />
                  </ProtectedRoute>
                } />

                <Route path=":projectId/edit" element={
                  <ProtectedRoute>
                    <EditProject />
                  </ProtectedRoute>
                } />
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>

          <AuthDialog id="authDialog" />
        </ProjectsProvider>
      </Router>
    </>
  );
};

export default App;