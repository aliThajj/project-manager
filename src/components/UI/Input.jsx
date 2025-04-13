import { forwardRef, useState } from "react";
import ValiditionError from "./ValiditionError";

const Input = forwardRef(function Input({ label, textarea, error, type, ...props }, ref) {
    const [showPassword, setShowPassword] = useState(false);
    const togglePassword = () => setShowPassword(prev => !prev);

    const isPasswordField = ["Password", "Current Password", "New Password"].includes(label);
    const hasIcon = ["Username", "Email", "Password", "Current Password", "New Password"].includes(label);

    const containerClasses = `
        w-full rounded-lg p-3 border
        ${error ? "border-red-500" : "border-stone-300"}
        ${hasIcon ? "flex items-center gap-2" : ""}
        focus-within:border-stone-600`;

    const inputClasses = `w-full bg-transparent outline-none placeholder-stone-500`;

    // Use internal control for type
    const inputType = isPasswordField ? (showPassword ? "text" : "password") : type || "text";

    return (
        // <div className="my-4">
        <div>
            {textarea ? (
                <textarea
                    ref={ref}
                    className={`min-h-32 ${containerClasses} ${inputClasses}`}
                    placeholder={label}
                    {...props}
                />
            ) : (
                <div className={containerClasses}>
                    {icon(label)}
                    <input
                        ref={ref}
                        type={inputType}
                        className={inputClasses}
                        placeholder={label}
                        autoFocus={false}
                        {...props}
                    />
                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                togglePassword();
                            }}
                            className="text-stone-500 hover:text-stone-700"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                    )}
                </div>
            )}
            {error && <ValiditionError error={error} />}
        </div>
    );
});
// Icon selector
const icon = (label) => {
    switch (label) {
        case "Username":
            return <UserIcon />;
        case "Email":
            return <EmailIcon />;
        case "Password":
        case "Current Password":
        case "New Password":
            return <PasswordIcon />;
        default:
            return null;
    }
};

// Icon components
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
);

const EmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

const PasswordIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.522 5.25 12 5.25c4.478 0 8.268 2.693 9.542 6.75-1.274 4.057-5.064 6.75-9.542 6.75-4.478 0-8.268-2.693-9.542-6.75z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19.5c-4.478 0-8.268-2.693-9.542-6.75a10.054 10.054 0 012.091-3.368m3.9-2.526A9.969 9.969 0 0112 4.5c4.478 0 8.268 2.693 9.542 6.75a10.05 10.05 0 01-4.276 5.151M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3l18 18" />
    </svg>
);

export default Input;
