import React, { useState, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import Input from "../UI/Input";
import { AuthContext } from "../../context/AuthContext";
import { ModalContext } from '../../context/ModalContext';
import ValiditionError from "../UI/ValiditionError";
import { toast } from "sonner";

export default function SettingsDialog() {
    const { user, updateName, updatePassword, authLoading } = useContext(AuthContext);
    const { closeDialog } = useContext(ModalContext);

    const [activeTab, setActiveTab] = useState('profile');
    const [formError, setFormError] = useState(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        watch,
        setError,
        clearErrors
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            username: '',
            currentPassword: '',
            newPassword: ''
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                username: user.displayName || '',
                currentPassword: '',
                newPassword: ''
            });
        }
    }, [user, reset]);

    useEffect(() => {
        setFormError(null);
        clearErrors();
    }, [activeTab]);

    function closeModal() {
        reset({
            username: user?.displayName || '',
            currentPassword: '',
            newPassword: ''
        });
        setFormError(null);
        closeDialog('settingsDialog');
    }

    const handleAuthError = (error) => {
        console.error('Auth Error:', error.code, error.message);

        let errorMessage = 'An error occurred. Please try again';
        let field = null;

        switch (error.code) {
            case 'auth/invalid-credential':
            case 'auth/wrong-password':
                errorMessage = 'Your current password is incorrect';
                field = 'currentPassword';
                break;

            case 'auth/weak-password':
                errorMessage = 'New password must be at least 6 characters';
                field = 'newPassword';
                break;

            case 'auth/requires-recent-login':
                errorMessage = 'Session expired. Please sign in again';
                break;

            case 'auth/too-many-requests':
                errorMessage = 'Too many attempts. Try again later';
                break;

            case 'auth/network-request-failed':
                errorMessage = 'Network error. Check your connection';
                break;

            default:
                if (error.message?.toLowerCase().includes('password')) {
                    field = 'newPassword';
                }
        }

        return { errorMessage, field };
    };

    const onSubmit = async (data) => {
        setFormError(null);
        clearErrors();

        try {
            if (activeTab === 'profile') {
                if (data.username !== user.displayName) {
                    const success = await updateName(data.username);
                    if (success) {
                        closeModal();
                        toast.success("Username updated successfully");
                        reset({ username: data.username });
                    } else {
                        toast.error("Failed to update Username");
                    }
                } else {
                    toast.info("No changes were made");
                    closeModal();
                }
            } else {
                clearErrors(['currentPassword', 'newPassword']);

                const result = await updatePassword(data.currentPassword, data.newPassword);

                if (result.success) {
                    toast.success("Password updated successfully");
                    closeModal();
                    reset({
                        currentPassword: '',
                        newPassword: ''
                    }, { keepValues: false });
                } else {
                    const { errorMessage, field } = handleAuthError(result);
                    if (field) {
                        setError(field, {
                            type: 'manual',
                            message: errorMessage,
                            shouldFocus: true
                        });
                    } else {
                        setFormError(errorMessage);
                    }
                    toast.error(errorMessage);
                }
            }
        } catch (error) {
            toast.error("Unexpected error");
            console.error("Unhandled error:", error);
        }
    };

    const currentUsername = watch('username');
    const currentPassword = watch('currentPassword');
    const newPassword = watch('newPassword');

    const isProfileValid = activeTab === 'profile' &&
        isDirty &&
        currentUsername !== user?.displayName &&
        !errors.username;

    const isPasswordValid = activeTab === 'password' &&
        currentPassword &&
        newPassword &&
        newPassword.length >= 6 &&
        !errors.currentPassword &&
        !errors.newPassword;

    const canSave = (activeTab === 'profile' && isProfileValid) ||
        (activeTab === 'password' && isPasswordValid);

    return (
        <Modal id='settingsDialog'>
            <div className="flex justify-center items-center">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Account Settings
                </h2>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mt-6">
                <button
                    className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'profile' ?
                        'text-slate-950 border-b-2 border-slate-900 dark:text-blue-400 dark:border-blue-400' :
                        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('profile')}>
                    Profile
                </button>
                <button
                    className={`flex-1 py-3 font-medium text-center transition-colors ${activeTab === 'password' ?
                        'text-slate-950 border-b-2 border-slate-900 dark:text-blue-400 dark:border-blue-400' :
                        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    onClick={() => setActiveTab('password')}>
                    Password
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
                {activeTab === 'profile' ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <div className="p-2 text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded">
                                {user?.email}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Email cannot be changed
                            </p>
                        </div>

                        <Input
                            label="Username"
                            error={errors.username?.message}
                            {...register("username", {
                                required: "Username is required",
                                minLength: {
                                    value: 3,
                                    message: "Must be at least 3 characters"
                                },
                                maxLength: {
                                    value: 30,
                                    message: "Must be less than 30 characters"
                                },
                                validate: (value) =>
                                    /^[a-zA-Z0-9_]+$/.test(value) ||
                                    "Only letters, numbers and underscores allowed"
                            })}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Input
                            label="Current Password"
                            type="password"
                            autoComplete="current-password"
                            error={errors.currentPassword?.message}
                            {...register("currentPassword", {
                                required: "Current password is required",
                                minLength: {
                                    value: 6,
                                    message: "Must be at least 6 characters"
                                }
                            })}
                        />
                        <Input
                            label="New Password"
                            type="password"
                            autoComplete="new-password"
                            error={errors.newPassword?.message}
                            {...register("newPassword", {
                                required: "New password is required",
                                minLength: {
                                    value: 6,
                                    message: "Must be at least 6 characters"
                                },
                                validate: {
                                    notSame: value =>
                                        value !== currentPassword ||
                                        "New password must be different"
                                }
                            })}
                        />
                    </div>
                )}

                {formError && <ValiditionError error={formError} />}

                <div className="flex w-full items-center justify-end gap-3 pt-4">
                    <button type="button" onClick={closeModal} className="secondary-btn">
                        Cancel
                    </button>
                    <Button
                        type="submit"
                        isLoading={authLoading}
                        disabled={!canSave || authLoading}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
