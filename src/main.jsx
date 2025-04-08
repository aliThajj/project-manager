import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { WelcomeProvider } from './context/WelcomeContext.jsx'
import { ModalProvider } from './context/ModalContext.jsx'
import { ProjectsProvider } from './context/ProjectsContext.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <ProjectsProvider>
    <AuthProvider>
      <WelcomeProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </WelcomeProvider>
    </AuthProvider>
  </ProjectsProvider>
  // </React.StrictMode>,
)
