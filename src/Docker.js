const util = require('util');
const exec = util.promisify(require('child_process').exec);
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');

const DOCKER_SOCKET_PATH = '/var/run/docker.sock';
const IMAGE_NAME = 'viddiffusion';
const CONTAINER_NAME = 'viddiffusion-container';

module.exports.checkDockerInstalled = function() {
    return fs.existsSync(DOCKER_SOCKET_PATH);
}

module.exports.checkFfmpegInstalled = async function() {
    try {
        const { stdout, stderr } = await exec('which ffmpeg');
        const exists = fs.existsSync(stdout);
        return true;
    } catch (e) {
        return false;
    }
    // return fs.existsSync(stdout);
}

module.exports.checkVidDiffusionContainer = async function() {
    var docker = new Docker();
    var image = docker.getImage(IMAGE_NAME);
    try {
        await image.inspect();
        return true;
    } catch (e) {
        return false;
    }
}

module.exports.buildContainer = async function() {
    console.log("=== BUILDING CONTAINER ===");

    try {
        await buildImage();
    } catch (e) {
        console.log("Failed to build container")
    }

    console.log("== IMAGE BUILT == ");
}

async function buildImage() {
    var docker = new Docker();

    let stream = await docker.buildImage({
        context: "./src",
        src: ['Dockerfile']
    }, { t: IMAGE_NAME });

    await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
    });
}

module.exports.videoToImages = function(_, videoPath) {
    var docker = new Docker();

    console.log("converting file")

    if (!fs.existsSync("./videoImages")) {
        fs.mkdirSync("./videoImages")
    }

    console.log(videoPath);
    let ext = videoPath.split(".").slice(-1);

    for (const file of fs.readdirSync("./videoImages/")) {
        fs.unlinkSync(path.join("./videoImages", file));
    }

    try {
        fs.linkSync(videoPath, `./videoImages/input.${ext}`)
    } catch (e) { } // ignore error -- file already exists

    const proc = child_process.spawn(
        '/bin/sh',
        ['-c', `ffmpeg -i ./videoImages/input.${ext} -r 1/1 ./videoImages/frame%04d.bmp`],
        { cwd: process.cwd(), env: process.env }
    );

    return new Promise((resolve, reject) => {
        proc.on('close', (code) => {
            console.log("ffmpeg invocation finished")
            if (code == 0) {
                let files = fs.readdirSync('./videoImages/');
                resolve(files.filter((f) => f.endsWith(".bmp")));
            } else {
                reject();
            }
        })
    });



    // var auxContainer;
    // return new Promise((resolve, reject) => docker.createContainer({
    //     Image: IMAGE_NAME,
    //     AttachStdin: false,
    //     AttachStdout: true,
    //     AttachStderr: true,
    //     Binds: [`${PREFIX}/videoImages:/videoImages`],
    //     Tty: true,
    //     OpenStdin: false,
    //     StdinOnce: false
    // }).then(function(container) {
    //     auxContainer = container;
    //     return auxContainer.start();
    // }).then(function(data) {
    //     return auxContainer.resize({
    //         h: process.stdout.rows,
    //         w: process.stdout.columns
    //     });
    // }).then(function(data) {
    //     return auxContainer.stop();
    // }).then(function(data) {
    //     return auxContainer.remove();
    // }).then(function(data) {
    //     console.log(data);
    // }).catch(function(err) {
    //     reject(err);
    // }));
}


/*
// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');
// const os = require('os');
// const fs = require('fs');
const Docker = require('dockerode');



function createContainer() {
    var docker = new Docker();
    var auxContainer;

    docker.createContainer({
        Image: 'ubuntu',
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
        OpenStdin: false,
        StdinOnce: false

    }).then(function(container) {
        auxContainer = container;
        return auxContainer.start();
    }).then(function(data) {
        return auxContainer.resize({
            h: process.stdout.rows,
            w: process.stdout.columns
        });
    }).then(function(data) {
        return auxContainer.stop();
    }).then(function(data) {
        return auxContainer.remove();
    }).then(function(data) {
        console.log('container removed');
    }).catch(function(err) {
        console.log(err);
    });
}


const docker = new Docker({
    socketPath: '/var/run/docker.sock'
});

const dirname = '/home/csb/projects/VidDiffusion/src';
export async function buildImage() {
    return new Promise((resolve, reject) => {
        docker.buildImage({
            context: dirname,
            src: ['Dockerfile']
        }, { t: 'viddiffusion' }, (err, stream) => {
            if (err) {
                return reject(err);
            }
            docker.modem.followProgress(stream, (err, output) => {
                if (err) {
                    reject(err)
                } else {
                    resolve();
                }
            });
        });
    });
}

export async function runContainer() {
    const promptstr = "Street-art of Aubrey Plaza in the style of Banksy, photorealism";
    return new Promise(async (resolve, reject) => {
        let container;
        try {
            container = await docker.createContainer({
                Image: 'viddiffusion',
                // Cmd: ["python", "demo.py", "--prompt", promptstr],
                // Cmd: [ "bash" ],
                // Cmd: [
                //     "python", "demo.py", "--prompt", promptstr,
                //     "--output", "output/out1.png"
                // ],
                Volumes: {
                    '/app/output': {}
                },
                HostConfig: {
                    Binds: [`${dirname}/output:/app/output`]
                },
                Tty: true
            });

            container.start((err, data) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(data);
                    resolve(data);
                }
            });
            container.attach({
                stream: true,
                stdout: true,
                stderr: true }, function (err, stream) {
                    stream.pipe(process.stdout);
            });

            container.exec({
                Cmd: [
                    "python", "demo.py", "--prompt", promptstr,
                    "--output", "output/out2.png"
                ],
                Tty: true,
                Detach: true,
                AttachStdin: true,
                AttachStdout: true
            });

            // container.exec({
            //     Cmd: ["mv", "out1.png", "output"],
            //     AttachStdin: true,
            //     AttachStdout: true
            // });

        } catch (error) {
            reject(error);
        }
    });
}
// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const Docker = require('dockerode');

const DOCKER_SOCKET_PATH = '/var/run/docker.sock';
const CONTAINER_NAME = 'viddiffusion';

module.exports.checkDockerInstalled = function() {
    return fs.existsSync(DOCKER_SOCKET_PATH);
};
*/


