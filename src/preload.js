const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    doLs: (title) => ipcRenderer.invoke('do-ls', title)
})
