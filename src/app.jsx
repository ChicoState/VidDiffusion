// app.jsx

import React, {
    useState,
    createContext,
    useContext,
    createRef,
    useEffect
} from "react";

import { createRoot } from 'react-dom/client';
import { InstallBanner } from "./InstallBanner.jsx";
import ImageDropZone from './ImageDropZone';
import { Tabs } from "./Tabs.jsx";
import { Button } from "./Components.jsx";
import { Dependencies } from "./Dependencies.jsx";

export const FileContext = createContext(null);
export const MainTabContext = createContext(null);
export const DockerInstalledContext = createContext(false);
export const StableDiffusionSetupContext = createContext(false);

const Header = () => {
    return (
        <div className="flex p-4">
            <h1 className="italic font-extrabold text-2xl">VidDiffusion</h1>
        </div>
    );
};


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

function LsView() {
    let [lsOutput, setLsOutput] = useState("");

    const updateLs = () => {
        window.electronAPI.doLs().then((val) => {
            setLsOutput(val);
        });
    }

    return (
        <div className="gap-4 flex flex-col">
            <Button className={"mr-auto"} onClick={updateLs}>
                Run LS
            </Button>
            <CodeBlock text={lsOutput} />
        </div>
    );

}

const PromptForm = () => {

    function handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const formJson = Object.fromEntries(formData.entries());

        console.log(formJson);
    }
    return (
        <form onSubmit={handleSubmit}>
            <textarea className="border-black rounded-md resize-y w-full border-2 p-2" name="prompt" />

            <Button type="submit">Generate</Button>
        </form>
    );
}

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
    }

    function handleFilterSelect(e) {
        console.log("Selected filter", e.target.value);
        setSelectedFilter(e.target.value);
    }

    const selectStyles = "p-2 border-2 border-black rounded-md"

    return (
        <div className="App">
            <div className="flex flex-col gap-4">
                <select
                    className={selectStyles}
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
                    className={selectStyles}
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

                <Button type="submit">Generate</Button>
            </div>
        </div>
    );
}

const ContinueButton = () => {
    const { file, setFile: _ } = useContext(FileContext);
    const { activeTab: __, setActiveTab } = useContext(MainTabContext);

    if (file) {
        return <div className="w-full flex justify-center mt-4">
            <Button className={"px-8"} onClick={() => setActiveTab(1)}>Edit ›</Button>
        </div>
    }
}


const EditView = () => {
    const [activeTab, setActiveTab] = useState(0);

    return <>
        <h1 className="font-bold mb-2">Edit Video</h1>

        <Tabs activeTab={activeTab} tabClicked={setActiveTab}>
            <div label="Prompt">
                <PromptForm />
            </div>
            <div label="Preset">
                <Presets />
            </div>
            <div label="From Image">
                <ImageDropZone />
                <Button type="submit">Generate</Button>
            </div>
        </Tabs>
    </>;
};

/*
const DragAndDrop = () => {
    const [isDraggedOver, setIsDraggedOver] = useState(false);
    const { file, setFile } = useContext(FileContext);
    const videoRef = createRef();

    const removeFile = () => {
        setFile(null);
    }

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
        <>
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
        <div>
        { file ?
        <Button
            onClick={removeFile}
            style={{ position: 'absolute', right: 10, top: 10 }}>
            Remove
            >
        </Button>
        :
        <></>
        }
        </div>
        </>
    );
}
*/

const App = () => {
    const [file, setFile] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [dockerInstalled, setDockerInstalled] = useState(false);
    const [stableDiffusionInstalled, setStableDiffusionInstalled] = useState(false);

    // on startup, we check whether or not docker is installed.
    useEffect(async () => {
        let res = await window.electronAPI.checkDockerInstalled();
        setDockerInstalled(res);

        res = await window.electronAPI.checkVidDiffusion();
        setStableDiffusionInstalled(res);

        if (!res) {
            res = await window.electronAPI.buildContainer();
            setStableDiffusionInstalled(true);
        }
    }, []);


    return (
        <FileContext.Provider value={{ file, setFile }}>
            <MainTabContext.Provider value={{ activeTab, setActiveTab }}>
                <DockerInstalledContext.Provider value={{ dockerInstalled, setDockerInstalled }}>
                    <StableDiffusionSetupContext.Provider value={{ stableDiffusionInstalled, setStableDiffusionInstalled }}>
                        <Header />

                        <Tabs className={"px-4"} activeTab={activeTab} tabClicked={setActiveTab}>
                            <div label="Upload Video">
                                <ImageDropZone />
                                <ContinueButton />
                            </div>

                            <div label="Edit">
                                <EditView />
                            </div >

                            <div label="Dependencies">
                                <Dependencies />
                            </div >

                            <div label="ls">
                                <LsView />
                            </div>
                        </Tabs>

                        {!dockerInstalled && <div className="fixed shadow-md flex items-center gap-2 w-min p-2 rounded bg-slate-800 inset-x-0 mx-auto bottom-4">
                            <span className="text-yellow-500 font-bold pl-2">Warning: </span>
                            <span className="text-white whitespace-nowrap">Missing dependencies.</span>
                            <Button className="ml-2" onClick={() => setActiveTab(2)}>Install</Button>
                        </div>}
                    </StableDiffusionSetupContext.Provider>
                </DockerInstalledContext.Provider>
            </MainTabContext.Provider>
        </FileContext.Provider>
    );

};


const root = createRoot(document.getElementById("root"));
root.render(<App />);
