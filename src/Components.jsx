import React from "react";

export function Button({ onClick, className, children }) {
    return (
        <button
            className={`flex-none shadow-md hover:shadow-lg transition-all px-4 py-2 rounded-sm text-white bg-green-500 hover:bg-green-400 active:bg-green-600 active:shadow-none ${className}`}
            onClick={onClick}
        >{children}</button>
    );
}
