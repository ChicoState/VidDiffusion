const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    checkDockerInstalled: () => ipcRenderer.invoke('check-docker-installed'),
    checkFfmpegInstalled: () => ipcRenderer.invoke('check-ffmpeg-installed'),
    checkVidDiffusion: () => ipcRenderer.invoke('check-vid-diffusion'),
    buildContainer: () => ipcRenderer.invoke('build-container'),
    videoToImages: (videoPath) => ipcRenderer.invoke('video-to-images', videoPath)
})
