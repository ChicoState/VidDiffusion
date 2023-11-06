import React, { useEffect, useState } from "react";
import { Button } from "./Components.jsx";

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
        <div className="mb-4 flex flex-col gap-2">
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
                <Button onClick={() => setCurrentlyInstalling(0)}>
                    Install
                </Button>
                {currentlyInstalling !== null
                    && <span className="animate-pulse">Installing {items[currentlyInstalling].name}...</span>
                }
            </div>
        </div>
    );
}
