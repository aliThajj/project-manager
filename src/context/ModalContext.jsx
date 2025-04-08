import { createContext, useState, useContext } from "react";

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modals, setModals] = useState({}); // Object to store multiple modals

    const openDialog = (id) => {
        setModals((prev) => ({ ...prev, [id]: true }));
        // console.log(`OPEN: ${id}`, modals);

    };

    const closeDialog = (id) => {
        setModals((prev) => ({ ...prev, [id]: false }));
        // console.log(`CLOSE: ${id}`, modals);

    };

    return (
        <ModalContext.Provider value={{ openDialog, closeDialog, modals }}>
            {children}
        </ModalContext.Provider>
    );
};

// Custom hook for easy access
export const useModal = () => useContext(ModalContext);
