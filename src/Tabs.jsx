import React, { useState } from "react";

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

export function Tabs({ children, className }) {
    let [activeTab, setActiveTab] = useState(children[0].props.label);

    return (
        <div className={`flex flex-col gap-4 ${className}`}>
            <ol className="flex gap-2">
                {children.map((child) => {
                    const { label } = child.props;

                    return (
                        <Tab
                            isActive={activeTab == label}
                            key={label}
                            label={label}
                            onClick={() => {
                                setActiveTab(label);
                            }}
                        />
                    );
                })}
            </ol>

            {children.find((child) => child.props.label === activeTab)}
        </div>
    );
}
