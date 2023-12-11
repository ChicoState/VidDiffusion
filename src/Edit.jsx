import React, { useState, createContext, useContext, createRef, useEffect } from "react";


import { Button, DEFAULT_BUTTON_STYLES, FLAT_BUTTON_STYLES, LoadingButton } from "./Components.jsx";
import { ConvertedImagesContext, FileContext, ImagesContext } from "./app.jsx";
import { update } from "@react-spring/web";

const ImageFramesView = ({ images, onImagesAdded, convertedImages }) => {
    const { file, setFile: _ } = useContext(FileContext);

    const [imagePreviewsLoading, setImagePreviewsLoading] = useState(false);
    const [generateImagesLoading, setGenerateImagesLoading] = useState(false);
    const [generateVideoLoading, setGenerateVideoLoading] = useState(false);

    const [prefix, setPrefix] = useState();

    useEffect(() => {
        (async () => {
            setPrefix(await window.electronAPI.getCurrentDirectory());
        })();

        if (images.length == 0)
            generateImages();
    }, []);

    const generateImages = async () => {
        setGenerateImagesLoading(true);
        let files = await window.electronAPI.videoToImages(file.path);
        setGenerateImagesLoading(false);
        onImagesAdded(files);
    };

    const generateVideo = async () => {
        setGenerateImagesLoading(true);
        let file = await window.electronAPI.imagesToVideo();
        setGenerateImagesLoading(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <h1 className="font-bold">Image Frames</h1>
                <LoadingButton className={`${FLAT_BUTTON_STYLES} ml-auto`} onClick={generateImages} loading={generateImagesLoading}>Generate Images</LoadingButton>
                <LoadingButton className={FLAT_BUTTON_STYLES} onClick={generateVideo} loading={generateVideoLoading}>Generate Video</LoadingButton>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center justify-items-center mb-8">
                {images.map((image, i) =>
                    <>
                        <img className="rounded-md shadow-md" key={`${image}-1`} src={`file://${prefix}/videoImages/${image}?someQueryParam=false`}></img>
                        <span key={`${image}-2`} className="text-2xl">→</span>
                        {convertedImages[i]
                            ? <img key={`${image}-3`} src={`file://${prefix}/${convertedImages[i]}`}></img>
                            : <div
                                key={`${image}-3`}
                                className={`${imagePreviewsLoading ? "animate-pulse" : ""} ml-auto font-mono aspect-square bg-neutral-200 p-5 rounded-md flex items-center justify-items-center`}><span>NOT GENERATED</span></div>}
                    </>
                )}
            </div>
        </div>
    );
};

const PromptForm = ({ images, imageDoneConverting }) => {
    const [updateStyleLoading, setUpdateStyleLoading] = useState(false);
    const [prompt, setPrompt] = useState("");

    const onSubmit = async () => {
        setUpdateStyleLoading(true);

        console.log(prompt);
        for (let imageName of images) {
            await window.electronAPI.convertImages({ imageName, prompt });
            imageDoneConverting(imageName);
        }

        setUpdateStyleLoading(false);
    }

    return (
        <div>
            <h1 className="font-bold">Edit Video</h1>

            <p className="text-neutral-700 mb-2">Enter a prompt to transform your video into another style.</p>

            <textarea className="border-black rounded-md resize-y w-full border-2 p-2" onChange={(e) => setPrompt(e.target.value)} value={prompt} />

            <div className="flex gap-4 items-center">
                <LoadingButton className={DEFAULT_BUTTON_STYLES} loading={updateStyleLoading} onClick={onSubmit}>Update Style</LoadingButton>
                {images && updateStyleLoading && <span className="animate-pulse">Estimated completion time: {Math.floor(3 * images.length / 60)} hours</span>}
            </div>
        </div>
    );
};

export const EditView = () => {
    const { images, setImages } = useContext(ImagesContext);
    const { convertedImages, setConvertedImages } = useContext(ConvertedImagesContext);

    return <div className="flex flex-col gap-4">
        <PromptForm images={images} imageDoneConverting={(img) => setConvertedImages([...convertedImages, img])} />
        <ImageFramesView onImagesAdded={setImages} images={images} convertedImages={convertedImages} />
    </div>;
};
