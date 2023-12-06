const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    checkDockerInstalled: () => ipcRenderer.invoke('check-docker-installed')
})
