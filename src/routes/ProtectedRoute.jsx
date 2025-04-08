// import { useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import { ModalContext } from '../context/ModalContext';

// export const ProtectedRoute = ({ children }) => {
//     const { openDialog } = useContext(ModalContext);
//     const { user } = useContext(AuthContext);

//     if (!user) {
//         openDialog('authDialog');
//         return <Navigate to="/" replace />;
//     }

//     return children;
// };