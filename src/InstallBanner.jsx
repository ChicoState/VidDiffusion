import React, { useEffect, useState } from "react";

function InstallItem({ name, isInstalled }) {
    if (isInstalled) {
        return (
            <div className="rounded bg-blue-50 border-2 border-blue-500 p-4">
                <span>{name}</span>
            </div>
        );
    } else {
        return (
            <div className="rounded bg-red-50 border-2 border-red-500 p-4">
                <span>{name}</span>
            </div>
        )
    }
}

export function InstallBanner({
    listOfItems
}) {
    listOfItems.sort((a, b) => a.isInstalled < b.isInstalled ? -1 : 1);
    const [items, setItems] = useState(listOfItems);
    const [currentlyInstalling, setCurrentlyInstalling] = useState(null);

    useEffect(() => {
        if (currentlyInstalling != null) {
            if (currentlyInstalling >= listOfItems.length || items[currentlyInstalling].isInstalled) {
                setCurrentlyInstalling(null);
            } else {
                setTimeout(() => {
                    let newItems = [...items];
                    newItems[currentlyInstalling].isInstalled = true;
                    newItems.sort((a, b) => a.isInstalled < b.isInstalled ? -1 : 1);

                    setItems(newItems);
                }, 1000);
            }
        }
    }, [items, currentlyInstalling]);

    return (
        <div className="px-4 mb-4 flex flex-col gap-2">
            <span className="font-bold">Dependencies</span>
            <div className="flex gap-2">
                {listOfItems.map((item, i) =>
                    <InstallItem
                        key={i}
                        name={item.name}
                        isInstalled={item.isInstalled}
                    />
                )}
            </div>
            <div className="flex items-center gap-4">
                <button
                    className="flex-none shadow-md hover:shadow-lg transition-all px-4 py-2 rounded-sm text-white bg-green-500 hover:bg-green-400 active:bg-green-600 active:shadow-none"
                    onClick={() => setCurrentlyInstalling(0)}
                >Install</button>
                {currentlyInstalling !== null
                    && <span className="animate-pulse">Installing {items[currentlyInstalling].name}...</span>
                }
            </div>
        </div>
    );
}
