import React, { createContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,
    signOut,
    updateProfile,
    updatePassword as firebaseUpdatePassword, // <-- fixed here
    EmailAuthProvider,
    reauthenticateWithCredential
} from "firebase/auth";
import { auth } from "../Firebase/firebase";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName
                });
            } else {
                setUser(null);
            }
            setAuthLoading(false);
            setAuthError(null);
        });

        return unsubscribe;
    }, []);

    const login = (firebaseUser) => {
        setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
        });
        setAuthError(null);
    };

    const logout = async () => {
        setAuthLoading(true);
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            setAuthError(error.message);
            console.error("Logout error:", error);
        } finally {
            setAuthLoading(false);
        }
    };

    const updateName = async (newName) => {
        setAuthLoading(true);
        try {
            await updateProfile(auth.currentUser, {
                displayName: newName
            });
            setUser(prev => ({ ...prev, displayName: newName }));
            return true;
        } catch (error) {
            setAuthError(error.message);
            console.error("Name update error:", error);
            return false;
        } finally {
            setAuthLoading(false);
        }
    };

    const updatePassword = async (currentPassword, newPassword) => {
        setAuthLoading(true);
        try {
            const user = auth.currentUser;

            if (!user) throw new Error("No user is logged in");

            const credential = EmailAuthProvider.credential(user.email, currentPassword);

            // Reauthenticate the user
            await reauthenticateWithCredential(user, credential);

            // Update password using the correctly aliased method
            await firebaseUpdatePassword(user, newPassword);

            return { success: true };
        } catch (error) {
            console.error("Password update failed:", error);
            return { success: false, error: error.message, code: error.code };
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            authLoading,
            authError,
            login,
            logout,
            updateName,
            updatePassword
        }}>
            {children}
        </AuthContext.Provider>
    );
};
