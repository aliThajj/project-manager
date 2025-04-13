import React from "react";

export default function Button({ children, isLoading, danger, secondary, ...props }) {
    // Red Button with Loader
    if (danger) {
        return (
            <button
                className={`w-full zbo relative md:inline-block md:w-auto px-4 py-3 md:py-2 bg-red-200 hover:bg-red-300 text-red-700  rounded-lg font-semibold text-sm md:ml-2 md:order-2 ${isLoading ? "text-transparent bg-red-300" : ""}`}
                disabled={isLoading}
                {...props}>
                {/* Always render children (but make them transparent when loading) */}
                <span className={isLoading ? "opacity-0" : ""}>
                    {children}
                </span>

                {/* Show loader if loading */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-black border-t-2 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </button>
        );
    }
    if (secondary) {
        return (
            <button
                className="px-4 py-2 h-[40px] rounded-md hover:bg-slate-700 hover:text-stone-100 bg-stone-600 text-stone-100 relative transition-colors duration-200"
                {...props}>
                {children}
            </button>
        );
    }

    // Basic Button with Loader
    return (
        <button
            className={`px-4 py-2 h-[40px] rounded-md bg-slate-700 text-stone-100 hover:bg-stone-600 hover:text-stone-100 relative transition-colors duration-200 ${isLoading ? "text-transparent" : ""}`}
            disabled={isLoading}
            {...props}>
            {/* Always render children (but make them transparent when loading) */}
            <span className={isLoading ? "opacity-0" : ""}>
                {children}
            </span>

            {/* Show loader if loading */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-2 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </button>
    );
}