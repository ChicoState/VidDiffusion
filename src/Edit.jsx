import React, { useState, createContext, useContext, createRef, useEffect } from "react";


import { Button, LoadingButton } from "./Components.jsx";
import { FileContext } from "./app.jsx";

const ImageFramesView = () => {
    const { file, setFile: _ } = useContext(FileContext);

    const [images, setImages] = useState([]);
    const [resultImages, setResultImages] = useState([])

    const [imagePreviewsLoading, setImagePreviewsLoading] = useState(false);
    const [generateImagesLoading, setGenerateImagesLoading] = useState(false);

    const PREFIX = "/Users/kilometers/Projects/VidDiffusion";
    // const PREFIX = await window.electronAPI.getCurrentDirectory();
    // console.log(`PREFIX: ${PREFIX}`);

    const generateImages = async () => {
        setGenerateImagesLoading(true);
        let files = await window.electronAPI.videoToImages(file.path);
        setGenerateImagesLoading(false);
        setImages(files);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <h1 className="font-bold">Image Frames</h1>
                <LoadingButton className="ml-auto" onClick={generateImages} loading={generateImagesLoading}>Generate Images</LoadingButton>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center justify-items-center mb-8">
                {images.map((image, i) =>
                    <>
                        <img className="rounded-md shadow-md" key={`${image}-1`} src={`file://${PREFIX}/videoImages/${image}?someQueryParam=false`}></img>
                        <span key={`${image}-2`} className="text-2xl">→</span>
                        {resultImages[i]
                            ? <img key={`${image}-3`} src={`file://${PREFIX}/${resultImages[i]}`}></img>
                            : <div
                                key={`${image}-3`}
                                className={`${imagePreviewsLoading ? "animate-pulse" : ""} ml-auto font-mono aspect-square bg-neutral-200 p-5 rounded-md flex items-center justify-items-center`}><span>NOT GENERATED</span></div>}
                    </>
                )}
            </div>
        </div>
    );
};

const PromptForm = () => {
    const [updateStyleLoading, setUpdateStyleLoading] = useState(false);
    const [textData, setTextData] = useState("");

    const onSubmit = async () => {
        setUpdateStyleLoading(true);
        console.log(textData);
    }

    return (
        <div>
            <h1 className="font-bold">Edit Video</h1>

            <p className="text-neutral-700 mb-2">Enter a prompt to transform your video into another style.</p>

            <textarea className="border-black rounded-md resize-y w-full border-2 p-2" onChange={(e) => setTextData(e.target.value)} value={textData} />

            <LoadingButton type="submit" loading={updateStyleLoading} onClick={onSubmit}>Update Style</LoadingButton>
        </div>
    );
};

export const EditView = () => {
    const [activeTab, setActiveTab] = useState(0);

    return <div className="flex flex-col gap-4">
        <PromptForm />

        <ImageFramesView />
    </div>;
};
