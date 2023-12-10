import React, { useContext } from "react";

import { DockerInstalledContext, FfmpegInstalledContext, StableDiffusionSetupContext } from "./app.jsx";

function MissingBadge() {
    return (
        <div className="ml-auto bg-red-500 text-white italic px-4 py-2">
            Missing
        </div>
    );
}

function InstalledBadge() {
    return (
        <div className="ml-auto bg-green-500 text-white italic px-4 py-2">
            Installed
        </div>
    );
}

export function Dependencies() {
    const { dockerInstalled, setDockerInstalled } = useContext(DockerInstalledContext);
    const { ffmpegInstalled, setFfmpegInstalled } = useContext(FfmpegInstalledContext);
    const { stableDiffusionInstalled, setStableDiffusionInstalled } = useContext(StableDiffusionSetupContext);

    return (
        <div className="flex flex-col gap-4 px-2 lg:w-3/4 mx-auto">
            <div className="flex flex-col">
                <div className="flex items-center">
                    <span className="font-bold">Docker</span>
                    {dockerInstalled ? <InstalledBadge /> : <MissingBadge />}
                </div>
                {!dockerInstalled && <div className="text-neutral-700">
                    The Docker daemon is either not installed or not running. To install Docker, consult <a className="text-blue-500 hover:underline" href="https://docs.docker.com/engine/install">the Docker documentation.</a>
                </div>}
            </div>

            <div className="flex flex-col">
                <div className="flex items-center">
                    <span className="font-bold">FFmpeg</span>
                    {ffmpegInstalled ? <InstalledBadge /> : <MissingBadge />}
                </div>
                {!ffmpegInstalled && <div className="text-neutral-700">
                    For installation instructures see <a className="text-blue-500 hover:underline" href="https://ffmpeg.org">the FFmpeg website.</a>
                </div>}
            </div>

            <div>
                <div className="flex items-center">
                    <span className="font-bold">StableDiffusion</span>
                    <div className="ml-auto cursor-pointer" onClick={() => {
                        setStableDiffusionInstalled(true);
                    }}>{stableDiffusionInstalled ? <InstalledBadge /> : <MissingBadge />}</div>
                </div>
            </div>
        </div>
    );
}
