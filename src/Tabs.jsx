import React, { useEffect, useState } from "react";

function Tab({ isActive, label, onClick }) {
    let dynamicClasses;

    if (isActive) {
        dynamicClasses = 'bg-black text-white';
    } else {
        dynamicClasses = 'bg-neutral-50 text-black hover:bg-neutral-100 active:bg-white';
    }

    return (
        <li
            className={`py-2 px-4 rounded-md cursor-pointer transition-all ${dynamicClasses}`}
            onClick={onClick}
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
                    const { label } = child.props;

                    return (
                        <Tab
                            isActive={i == activeTab}
                            key={label}
                            label={label}
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
