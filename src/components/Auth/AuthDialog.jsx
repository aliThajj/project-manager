import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { auth, db } from "../../Firebase/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { WelcomeContext } from "../../context/WelcomeContext";
import { ModalContext } from '../../context/ModalContext';
import ValiditionError from "../UI/ValiditionError";

export default function AuthDialog() {
    const { login } = useContext(AuthContext);
    const { closeDialog } = useContext(ModalContext)

    const { handleShowBanner } = useContext(WelcomeContext);

    const [isSignUp, setIsSignUp] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm({ mode: 'onBlur' });

    function handleAuthSwitch() {
        setIsSignUp(!isSignUp);
        reset();
        setAuthError(null);
    }

    function closeModal() {
        reset();
        setAuthError(null);
        // onClose();
        closeDialog('authDialog');
    }

    const onSubmit = async (data) => {
        setIsLoading(true);
        setAuthError(null);

        try {
            let userCredential;

            if (isSignUp) {
                // Sign Up User
                userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                await updateProfile(userCredential.user, { displayName: data.username });

                // Save user info in Firestore
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: data.email,
                    username: data.username,
                    createdAt: new Date(),
                });

            } else {
                // Sign In User
                userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
            }

            const user = userCredential.user;
            // console.log("User logged in:", user);

            // Update AuthContext after successful authentication
            login(user);

            // Close modal & show success banner
            closeModal();
            handleShowBanner();

        } catch (error) {
            console.log(error.code)
            switch (error.code) {
                case "auth/email-already-in-use":
                    setAuthError('Email is already in use');
                    break;
                case "auth/invalid-email":
                    setAuthError('Invalid email address');
                    break;
                case "auth/wrong-password":
                    setAuthError('Incorrect password');
                    break;
                case "auth/user-not-found":
                case "auth/invalid-credential":
                    setAuthError('User not found');
                    break;
                default:
                    setAuthError('Authentication failed');
                    console.error("Auth Error:", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal id='authDialog' className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
                {isSignUp ? "Create an Account" : "Sign In"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                {isSignUp && (
                    <Input
                        label="Username"
                        error={errors.username?.message}
                        {...register("username", {
                            required: "Username is required",
                            minLength: { value: 3, message: "Username must be at least 3 characters" },
                        })}
                    />
                )}

                <Input
                    label="Email"
                    type="email"
                    error={errors.email?.message}
                    {...register("email", {
                        required: "Email is required",
                        pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email format" },
                    })}
                />

                <Input
                    label="Password"
                    type="password"
                    error={errors.password?.message}
                    {...register("password", {
                        required: "Password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                />

                {/* Show Authentication Errors */}
                {authError && <ValiditionError error={authError} />}

                <div className="my-4">

                    <button
                        type="button"
                        // onClick={handleAuthSwitch}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAuthSwitch();
                        }}
                        className="text-sm text-stone-400 mb-4 hover:underline text-center block w-full">
                        {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                    </button>

                    <div className="flex w-full items-center justify-end gap-3">
                        <button type="button" onClick={closeModal} className="secondary-btn">
                            Cancel
                        </button>
                        <Button type="submit" isLoading={isLoading}>
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
