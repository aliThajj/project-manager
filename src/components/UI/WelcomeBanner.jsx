import React, { useEffect, useRef, useContext } from "react";
import Typed from "typed.js";
import "./WelcomeBanner.css";
import { AuthContext } from "../../context/AuthContext";

export default function WelcomeBanner() {
    const { user } = useContext(AuthContext);
    const typedRef = useRef(null);

    useEffect(() => {
        console.log(user?.displayName); // Debugging

        if (user?.displayName) {
            const options = {
                strings: [user.displayName.toUpperCase()],
                typeSpeed: 100,
                showCursor: false,
            };

            const typed = new Typed(typedRef.current, options);

            return () => {
                typed.destroy(); // Cleanup on unmount
            };
        }
    }, [user]);

    return (
        <div className="welcome-banner">
            <div className="welcome-content">
                <h1>Welcome</h1>
                <p className="user-name">
                    <span ref={typedRef}></span>
                </p>
                <p className="welcome-message">Your productivity journey starts here.</p>
            </div>
        </div>
    );
}
