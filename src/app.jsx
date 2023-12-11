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
import { Button, LoadingButton } from "./Components.jsx";
import { Dependencies } from "./Dependencies.jsx";
import { EditView } from "./Edit.jsx";

export const FileContext = createContext();
export const MainTabContext = createContext();
export const DockerInstalledContext = createContext();
export const FfmpegInstalledContext = createContext();
export const StableDiffusionSetupContext = createContext();
export const ImagesContext = createContext();
export const ConvertedImagesContext = createContext();

const Header = () => {
    return (
        <div className="flex p-4">
            <h1 className="italic font-extrabold text-2xl">VidDiffusion</h1>
        </div>
    );
};


const ContinueButton = () => {
    const { file, setFile: _ } = useContext(FileContext);
    const { activeTab: __, setActiveTab } = useContext(MainTabContext);

    if (file) {
        return <div className="w-full flex justify-center mt-4">
            <Button className={"px-8"} onClick={() => setActiveTab(1)}>Edit ›</Button>
        </div>
    }
}

const App = () => {
    const [file, setFile] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [dockerInstalled, setDockerInstalled] = useState(false);
    const [ffmpegInstalled, setFfmpegInstalled] = useState(false);
    const [stableDiffusionInstalled, setStableDiffusionInstalled] = useState(false);
    const [images, setImages] = useState([]);
    const [convertedImages, setConvertedImages] = useState([]);

    // on startup, we check whether or not docker is installed.
    useEffect(() => {
        try {
            (async () => {
                let res = await window.electronAPI.checkDockerInstalled();
                setDockerInstalled(res);

                res = await window.electronAPI.checkFfmpegInstalled();
                setFfmpegInstalled(res);

                res = await window.electronAPI.checkVidDiffusion();
                setStableDiffusionInstalled(res);

                if (!res) {
                    res = await window.electronAPI.buildContainer();
                    setStableDiffusionInstalled(true);
                }
            })();
        } catch (e) {
            console.log(e);
        }
    }
        , []);

    return (
        <FileContext.Provider value={{ file, setFile }}>
            <MainTabContext.Provider value={{ activeTab, setActiveTab }}>
                <DockerInstalledContext.Provider value={{ dockerInstalled, setDockerInstalled }}>
                    <FfmpegInstalledContext.Provider value={{ ffmpegInstalled, setFfmpegInstalled }}>
                        <StableDiffusionSetupContext.Provider value={{ stableDiffusionInstalled, setStableDiffusionInstalled }}>
                            <ImagesContext.Provider value={{ images, setImages }}>
                                <ConvertedImagesContext.Provider value={{ convertedImages, setConvertedImages }}>
                                    <Header />

                                    <Tabs className={"px-4"} activeTab={activeTab} tabClicked={setActiveTab}>
                                        <div label="Upload Video">
                                            <ImageDropZone />
                                            <ContinueButton />
                                        </div>

                                        <div label="Edit" disabled={file == undefined}>
                                            <EditView />
                                        </div >

                                        <div label="Dependencies">
                                            <Dependencies />
                                        </div >
                                    </Tabs>

                                    {!dockerInstalled && <div className="fixed shadow-md flex items-center gap-2 w-min p-2 rounded bg-slate-800 inset-x-0 mx-auto bottom-4">
                                        <span className="text-yellow-500 font-bold pl-2">Warning: </span>
                                        <span className="text-white whitespace-nowrap">Missing dependencies.</span>
                                        <Button className="ml-2" onClick={() => setActiveTab(2)}>Install</Button>
                                    </div>}

                                </ConvertedImagesContext.Provider>
                            </ImagesContext.Provider>
                        </StableDiffusionSetupContext.Provider>
                    </FfmpegInstalledContext.Provider>
                </DockerInstalledContext.Provider>
            </MainTabContext.Provider>
        </FileContext.Provider >
    );

};


const root = createRoot(document.getElementById("root"));
root.render(<App />);
