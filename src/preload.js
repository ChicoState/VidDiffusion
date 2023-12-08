const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    checkDockerInstalled: () => ipcRenderer.invoke('check-docker-installed'),
    checkVidDiffusion: () => ipcRenderer.invoke('check-vid-diffusion'),
    buildContainer: () => ipcRenderer.invoke('build-container')
})
