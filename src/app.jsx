import React, { useState, createContext, useContext, createRef, useEffect } from "react";
import { createRoot } from 'react-dom/client';
import { InstallBanner } from "./InstallBanner.jsx";
import Tabs from "./Tabs";
import ImageDropZone from './ImageDropZone';
// import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

// import { NavigationContainer } from '@react-navigation/native';

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
    const videoRef = createRef();

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
        console.log(input.files[0].path);
        // ipc to main and run stable diffusion mods
    };

    useEffect(() => {
        if (file && videoRef.current) {
            let reader = new FileReader();
            let videoSrc = document.querySelector("#video-source");
            let videoElement = document.querySelector("#video-element");

            reader.onload = (e) => {
                console.log(e);
                videoSrc.src = e.target.result;
                videoSrc.type = "video/mp4";
                console.log(videoSrc);
                videoElement.load();
            };

            console.log(file);
            reader.readAsDataURL(file);
        }
    }, [videoRef]);

    return (
        <div className="mx-auto w-52 flex flex-col gap-4">
            {file ?
                <video
                    id="video-element"
                    ref={videoRef}
                    className="border-slate-700 border p-4 rounded-md bg-slate-50"
                    controls>
                    <source id="video-source" />
                    Cannot load video source
                </video>
                : <button onDrop={dropHandler}
                    onDragEnter={dragEnterHandler}
                    onDragLeave={dragEnterHandler}
                    onClick={clickHandler}
                    className="select-none border-dashed border-4 bg-blue-50 border-blue-300 rounded-xl aspect-square w-full flex items-center justify-center">
                    <span>
                        Add your file
                    </span>
                    <input
                        accept="video/*"
                        onChange={fileChanged}
                        id="fileInput" type="file" className="fixed top-[-100%]" />
                </button>
            }
        </div>
    );
}

const CodeBlock = ({ text }) => {
    const copyClick = () => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="relative">
            <pre className="bg-slate-50 border border-slate-300 text-slate-800 p-2 rounded-md overflow-x-auto">
                {text}

            </pre>
            <button onClick={copyClick} className="aspect-square absolute top-1 right-2 hover:underline">
                copy
            </button>
        </div>
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

function print_ls() {
    window.electronAPI.doLs().then((val) => {
        console.log(`${val}`);
    });
};

const PromptForm = () => {
    function handleSubmit(e) {
        // prevent the browser from reloading the page
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const formJson = Object.fromEntries(formData.entries());

        console.log(formJson);
    }

    return (
        <form method="post" onSubmit={handleSubmit}>
            <label>
                <textarea name="prompt" rows={4} cols={40}/>
            </label>
            <hr />
            <button type="reset">Reset form</button>
            <hr />
            <button type="submit">Submit form</button>
        </form>
    );
};

// https://stackoverflow.com/questions/62239420/steps-to-populate-dynamic-dropdown-using-arrays-in-reactjs-using-react-hooks
const Presets = () => {
    const [selectedPreset, setSelectedPreset] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("");

    const presetList = [
        { name: 'Pixar' },
        { name: 'Post-Apocalypse' },
        { name: 'Zombie' },
        { name: 'Picasso' },
        { name: 'Cartoon' },
        { name: 'Anime' },
    ];

    const filterList = [
        { name: 'Old' },
        { name: 'Glowing' },
        { name: 'Young' },
        { name: 'Rich' },
        { name: 'Sexy' },
        { name: 'Sad' },
    ];

    function handlePresetSelect(e) {
        console.log("Selected preset", e.target.value);
        setSelectedPreset(e.target.value);
        setSelectedFilter("");
    }

    function handleFilterSelect(e) {
        console.log("Selected filter", e.target.value);
        setSelectedFilter(e.target.value);
        setSelectedPreset("");
    }

    return (
        <div className="App">
            <h1>Preset Selection</h1>

            <div className="Container">
                <select
                    name="Presets"
                    onChange={e => handlePresetSelect(e)}
                    value={selectedPreset}
                >
                    <option value="">Choose a preset</option>
                    {presetList.map((preset, key) => (
                        <option key={key} value={preset.name}>
                            {preset.name}
                        </option>
                    ))}
                </select>

                <select
                    name="Filters"
                    onChange={e => handleFilterSelect(e)}
                    value={selectedFilter}
                >
                    <option value="">Choose a filter</option>
                    {filterList.map((filter, key) => (
                        <option key={key} value={filter.name}>
                            {filter.name}
                        </option>
                    ))}
                </select>

            </div>
        </div>
    );
};


const App = () => {
    const [file, setFile] = useState(null);

    window.electronAPI.doLs().then((val) => {
        console.log(`${val}`);
    });


    return (

        <FileContext.Provider value={{ file, setFile }}>
        <Tabs>
            <div label="Video">
                <Header />
                <InstallBanner listOfItems={[
                    { name: "conda", isInstalled: true },
                    { name: "model", isInstalled: false },
                    { name: "thing3", isInstalled: false },
                    { name: "thing4", isInstalled: true },
                    { name: "thing5", isInstalled: false },
                ]} />
                <DragAndDrop />
                {file && <Tutorial />}
            </div >


        <div label="Edit">
            <h1>Edit Video</h1>
            <Tabs>
            <div label="Prompt">
                <PromptForm />
            </div>
            <div label="Preset">
                <Presets />
            </div>
            <div label="From Image">
                <ImageDropZone />
            </div>
            </Tabs>

            <hr/>
            <hr/>
            <div>
            <button>Convert</button>
            </div>
        </div>

        <div label="Export">
        <button onClick={print_ls}>
            run ls
        </button>
        </div>

        </Tabs>
        </FileContext.Provider>




    );
};

const root = createRoot(document.getElementById("root"));
root.render(<App />);
