import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ModalContext } from '../../context/ModalContext';
import ConfirmDialog from '../Auth/ConfirmDialog';
import { LogoutIcon } from '../UI/Icons';
import './sidebar.css';
import SettingsDialog from '../Auth/SettingDialog';

export default function Sidebar({ onOpenAuthDialog }) {
  const [isMaximize, setIsMaximize] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { openDialog } = useContext(ModalContext)
  const navigate = useNavigate();


  // Confirm Logout 
  const handleConfirmLogout = () => {
    // logout(navigate);
    openDialog('signout')
  };

  // handle Logout
  const handleLogout = async () => {
    try {
      const response = await logout(navigate);
      toast.success(response?.message || "You Logout successfully");
      return response;

    } catch (error) {
      const errorMessage = error.response?.data?.message
        || error.message
        || "Failed to Logout , try again later";
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleOpenSetting = () => {
    openDialog('settingsDialog')
  }

  // Add Button Function
  function handleAddProject() {
    console.log("Add project clicked - user state:", user ? user.uid : "no user");
    if (!user) {
      console.log("No user - opening auth dialog");
      onOpenAuthDialog?.(); // Safe call with optional chaining
      return; // Prevent further execution
    }
    console.log("User exists - navigating to /projects/new");
    navigate('/projects/new');
  };

  // Open / close Sidebar
  function handleOpenSideBar() {
    setIsMaximize(!isMaximize);
  }

  return <>
    <aside className={`aside-container ${isMaximize ? 'expanded' : 'narrow'}`}>
      {/* Top Section - Menu */}
      <div className={`tool-group p-4 flex border-b border-slate-700  ${isMaximize ? "justify-between" : "justify-center"} items-center`}>
        {isMaximize && <h4 className="text-xl font-bold">Menu</h4>}
        <button
          onClick={handleOpenSideBar}
          className="px-2 py-2 rounded-md bg-slate-700 text-stone-100 hover:bg-stone-600 transition-colors duration-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
          </svg>
        </button>

        {!isMaximize && (
          <div className="tool-tip">
            Menu
          </div>
        )}
      </div>

      {/* Middle Content Add Project */}
      <div className=" middle-grow">
        <div className="flex flex-col items-center h-full">
          {/* New Project Button*/}
          <div className="tool-group py-2 border-b border-slate-700 w-full ">
            <button
              onClick={handleAddProject}
              className={`text ${!isMaximize ? "justify-center" : "justify-start"}`}

            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6 font-bold">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
              </svg>

              {isMaximize && <span className="ml-3">New Project</span>}
            </button>

            {!isMaximize && (
              <div className="tool-tip">
                New Project
              </div>
            )}
          </div>


          {/* Project Link Button*/}
          <div className="tool-group py-2 border-b border-slate-700 w-full">
            <Link
              to="/projects"
              className={`text ${!isMaximize ? "justify-center" : "justify-start"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 font-bold">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
              </svg>


              {isMaximize && <span className="ml-3">Projects</span>}
            </Link>

            {!isMaximize && (
              <div className="tool-tip">
                Projects
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Bottom Section - Sign Out */}
      {user && (
        <div className='user-side border-t border-slate-700 flex flex-col '>
          <div className="tool-group py-2 border-b border-slate-700">
            <button
              onClick={handleOpenSetting}
              className={`text ${!isMaximize ? "justify-center" : ""}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="size-6 font-bold">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              {isMaximize && <span className="ml-3">Setting</span>}
            </button>

            {!isMaximize && (
              <div className="tool-tip">
                Setting
              </div>
            )}
          </div>


          <div className="signup tool-group py-2 ">
            <button
              onClick={handleConfirmLogout}
              className={`text ${!isMaximize ? "justify-center" : ""}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="size-6 font-bold">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              {isMaximize && <span className="ml-3">Sign Out</span>}
            </button>

            {!isMaximize && (
              <div className="tool-tip">
                Sign Out
              </div>
            )}
          </div>
        </div>
      )}
    </aside>

    <ConfirmDialog
      modalID="signout"
      icon={<LogoutIcon />}
      caption="Log Out Now?"
      description="You'll need to log in again to view your account. Any pending actions may be canceled"
      action="Logout"
      onHandleAction={handleLogout} />

    <SettingsDialog id='settingsDialog' />
  </>;
}