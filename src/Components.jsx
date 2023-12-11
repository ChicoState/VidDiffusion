import React from "react";
import { useTransition, animated, useSpring } from "@react-spring/web";

export const DEFAULT_BUTTON_STYLES = "flex-none shadow-md hover:shadow-lg transition-all px-4 py-2 rounded-sm text-white bg-green-500 hover:bg-green-400 active:bg-green-600 active:shadow-none";

export function Button({ onClick, className, children }) {
    return (
        <button
            className={`${DEFAULT_BUTTON_STYLES} ${className}`}
            onClick={onClick}
        >{children}</button>
    );
}

// https://github.com/kil0meters/acm/blob/16ad65f183fd37d172da5e3bbd02ae0807585dd0/lilith/components/loading-button.tsx
export function LoadingButton({ onClick, className, children, loading }) {
    const contentStyles = useSpring({
        to: { marginLeft: loading ? "30px" : "0px" },
    });

    const spinnerStyles = useTransition(loading, {
        from: {
            opacity: 0,
            left: "-8px",
        },
        enter: {
            opacity: 1,
            left: "0px",
        },
        leave: {
            opacity: 0,
            left: "-8px",
        },
        trail: 200
    });

    return (
        <button onClick={() => {
            if (!loading && onClick) {
                onClick();
            }
        }} className={`${DEFAULT_BUTTON_STYLES} ${className}`}>
            <div className="relative">
                {spinnerStyles(
                    (styles, item) =>
                        item && (
                            <animated.svg
                                style={styles}
                                className="absolute animate-spin h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </animated.svg>
                        )
                )}

                <animated.span
                    style={contentStyles}
                    className={"h-5 flex items-center justify-center"}
                >
                    {children}
                </animated.span>
            </div>
        </button>
    );
}
