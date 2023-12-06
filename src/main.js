const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { doLs } = require("./DoLs.js");
const Docker = require('dockerode');
// const { buildImage, runContainer } = require('./DockerHelper.js');

const { buildImage, runContainer } = require('./Docker.js');


const isDev = process.env.NODE_ENV !== 'development';
const isMac = process.platform === 'darwin';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    if (isDev) { // Open devtools if in dev env
        mainWindow.webContents.openDevTools();
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    ipcMain.handle('do-ls', doLs);

    createWindow();

    performDockerTasks().then(() => {
        var docker = new Docker();
        docker.listContainers(
            { all: true },
            function(err, containers) {
                console.log('total number of containers: ' + containers.length);
                containers.forEach(function (container) {
                    console.log(
                        `Container ${container.Names} - ` +
                        `current status ${container.Status} - ` +
                        `based on image ${container.Image}`);
                });
            }
        );
    });


    // createContainer();
});


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function createOutputDir(dirname) {
    homedir = os.homedir();
    outdir = path.join(os.homedir(), dirname)
}

function createDirectory(dirname) {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname)
    }
}

async function performDockerTasks() {
    try {
        await buildImage();
        await runContainer();
        console.log("Done");
    } catch (error) {
        console.error("Error during Docker operations:", error);
    }
}

