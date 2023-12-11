const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    buildContainer: () => ipcRenderer.invoke('build-container'),
    checkDockerInstalled: () => ipcRenderer.invoke('check-docker-installed'),
    checkFfmpegInstalled: () => ipcRenderer.invoke('check-ffmpeg-installed'),
    checkVidDiffusion: () => ipcRenderer.invoke('check-vid-diffusion'),
    convertImages: (arg) => ipcRenderer.invoke('convert-images', arg),
    getCurrentDirectory: () => ipcRenderer.invoke('get-current-directory'),
    imagesToVideo: () => ipcRenderer.invoke('images-to-video'),
    videoToImages: (videoPath) => ipcRenderer.invoke('video-to-images', videoPath),
})
