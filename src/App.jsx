import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    // onOpenAuthDialog();
    openDialog('authDialog');
    return <Navigate to="/" replace />; // Cleaner redirect
  }

  return children;
};

const App = () => {
  const { openDialog } = useContext(ModalContext);

  // const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  return <>
    <Toaster position="top-center" richColors />
    <BrowserRouter>
      <ProjectsProvider>
        <Routes>
          <Route element={<MainLayout onOpenAuthDialog={() => openDialog('authDialog')} />}>
            {/* All routes now point to /projects for consistency */}
            <Route index element={<Navigate to="/projects" replace />} />

            <Route path="projects">
              <Route index element={
                <ProjectsListPage onOpenAuthDialog={() => openDialog('authDialog')} />
              } />

              <Route path="new" element={
                <ProtectedRoute onOpenAuthDialog={() => openDialog('authDialog')}>
                  <NewProject />
                </ProtectedRoute>
              } />

              <Route path=":projectId" element={
                <ProtectedRoute onOpenAuthDialog={() => openDialog('authDialog')}>
                  <ProjectDetailPage />
                </ProtectedRoute>
              } />

              {/* Add edit route if needed */}
              <Route path=":projectId/edit" element={
                <ProtectedRoute onOpenAuthDialog={() => openDialog('authDialog')}>
                  <EditProject />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>

        <AuthDialog id="authDialog" />
      </ProjectsProvider>
    </BrowserRouter>
  </>
};

export default App;