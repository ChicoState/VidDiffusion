import React, { useState, createContext, useContext } from "react";
import { createRoot } from 'react-dom/client';

export const FileContext = createContext(null);

const Header = () => {
    return (
        <div className="flex p-4">
            <h1 className="italic font-extrabold text-2xl">VidDiffusion</h1>
        </div>
    );
};

const DragAndDrop = () => {
    const [isDraggedOver, setIsDraggedOver] = useState(false);
    const { file, setFile } = useContext(FileContext);

    const dropHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // can't get this to work for some reason, just gives an empty array
        // let file = e.dataTransfer.files[0];
        // setSelectedFile(file.path);
    };

    const dragEnterHandler = () => {
        console.log("entered/left");
        setIsDraggedOver(!isDraggedOver);
    }

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    const clickHandler = (_e) => {
        const input = document.getElementById("fileInput");
        input.click();
    };

    const fileChanged = (_e) => {
        const input = document.getElementById("fileInput");
        setFile(input.files[0]);
    };

    return (
        <div className="mx-auto w-52 flex flex-col gap-4">
            <button onDrop={dropHandler}
                onDragEnter={dragEnterHandler}
                onDragLeave={dragEnterHandler}
                onClick={clickHandler}
                className="select-none border-dashed border-4 bg-blue-50 border-blue-300 rounded-xl aspect-square w-full flex items-center justify-center">
                <span>
                    Add your file
                </span>
                <input
                    onChange={fileChanged}
                    id="fileInput" type="file" className="fixed top-[-100%]" />
            </button>
            {file && <div className="border-slate-700 border p-4 rounded-md bg-slate-50">
                {file.path.split('/').pop()}
            </div>}
        </div>
    );
}

const CodeBlock = ({ text }) => {
    const copyClick = () => {
        navigator.clipboard.writeText(text);
    };

    return (
        <pre className="bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-md relative">
            {text}

            <button onClick={copyClick} className="aspect-square absolute top-1 right-2 hover:underline">
                copy
            </button>
        </pre>
    )
}

const Tutorial = () => {
    const { file, setFile: _setFile } = useContext(FileContext);

    return (
        <div className="mx-auto max-w-screen-sm py-6 px-8">
            <ol className="list-decimal list-outside gap-4">
                <li className="mb-4">
                    First, split the file into frames
                    <CodeBlock text={[
                        "mkdir -p out",
                        `ffmpeg -i ${file.path} out/img%04d.png`
                    ].join("\n")} />

                </li>
                <li className="mb-4">
                    Do stable diffusion stuff
                    <CodeBlock text={[
                        "I have absolutely no idea what goes here"
                    ]} />
                </li>
                <li className="mb-4">
                    Convert the frames back into a video
                    <CodeBlock text={[
                        `ffmpeg -i out/img%04d.png out.mkv`
                    ].join("\n")} />

                </li>
            </ol>
        </div>
    );
};

const App = () => {
    const [file, setFile] = useState(null);

    return (
        <FileContext.Provider value={{ file, setFile }}>
            <div>
                <Header />
                <DragAndDrop />
                {file && <Tutorial />}
            </div >
        </FileContext.Provider>
    );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
