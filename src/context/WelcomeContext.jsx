import React, { createContext, useState, useCallback, useRef, useEffect } from "react";

export const WelcomeContext = createContext();

export const WelcomeProvider = ({ children }) => {
    const [isWelcome, setIsWelcome] = useState(false);
    const timeoutRef = useRef(null); // Ref to store the timeout ID

    const handleShowBanner = useCallback(() => {
        setIsWelcome(true);

        // Clear any existing timeout to avoid overlapping
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Set a new timeout to hide the banner
        timeoutRef.current = setTimeout(() => {
            setIsWelcome(false);
        }, 1800); // 1.8 seconds

        // console.log('welcomeContext: Success');
    }, []);


    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <WelcomeContext.Provider value={{ handleShowBanner, isWelcome }}>
            {children}
        </WelcomeContext.Provider>
    );
};