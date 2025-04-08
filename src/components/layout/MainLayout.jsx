import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectsContext';
import { WelcomeContext } from '../../context/WelcomeContext';
import WelcomeBanner from '../UI/WelcomeBanner';
import LoadingSpinner from '../UI/LoadingSpinner';

const MainLayout = ({ onOpenAuthDialog }) => {
  const { user, authLoading } = useContext(AuthContext);
  const { projectsLoading } = useProjects();
  const { isWelcome } = useContext(WelcomeContext);

  // useEffect(() => {
  //   console.log('Effect ==> ProjectLoading', projectsLoading)
  // }, [projectsLoading])

  // Show spinner when:
  // 1. Auth is loading (initial check)
  // OR
  // 2. User exists AND projects are loading
  const shouldShowSpinner = authLoading || (user && projectsLoading);

  return (
    <>
      {isWelcome && <WelcomeBanner />}
      <main className="h-full min-h-screen flex">
        {/*  Always show sidebar */}
        <Sidebar onOpenAuthDialog={!user ? onOpenAuthDialog : undefined} />

        <div className={`flex-1 flex justify-center mt-8 px-3 ${shouldShowSpinner && 'items-center'}`}>
          {shouldShowSpinner ? (
            <LoadingSpinner />
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </>
  );
};

export default MainLayout;