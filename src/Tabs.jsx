import React, { useEffect, useState } from "react";

function Tab({ isActive, label, disabled, onClick }) {
    let dynamicClasses;

    if (disabled) {
        dynamicClasses = 'cursor-default bg-neutral-300 text-neutral-700';
    } else if (isActive) {
        dynamicClasses = 'cursor-pointer bg-black text-white';
    } else {
        dynamicClasses = 'cursor-pointer bg-neutral-50 text-black hover:bg-neutral-100 active:bg-white';
    }

    return (
        <li
            className={`py-2 px-4 rounded-md transition-all ${dynamicClasses}`}
            onClick={() => {
                if (!disabled)
                    onClick();
            }}
        >
            {label}
        </li>
    );
}

export function Tabs({ children, className, activeTab, tabClicked }) {
    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <ol className="flex gap-2">
                {children.map((child, i) => {
                    const { label, disabled } = child.props;
                    console.log(disabled);

                    return (
                        <Tab
                            isActive={i == activeTab}
                            key={label}
                            label={label}
                            disabled={disabled}
                            onClick={() => {
                                tabClicked(i);
                            }}
                        />
                    );
                })}
            </ol>

            {children[activeTab]}
        </div>
    );
}
