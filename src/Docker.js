const util = require('util');
const exec = util.promisify(require('child_process').exec);
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');

const DOCKER_SOCKET_PATH = '/var/run/docker.sock';
const IMAGE_NAME = 'viddiffusion';
const IMG_DIR = 'videoImages';
const OUT_DIR = 'output';

module.exports.getCurrentDirectory = function() {
    return process.cwd();
}

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

    console.log("converting file")

    fs.rmSync("./videoImages", { recursive: true });

    if (!fs.existsSync("./videoImages")) {
        fs.mkdirSync("./videoImages")
    }

    if (!fs.existsSync("./videoImages/output")) {
        fs.mkdirSync("./videoImages/output")
    }

    console.log(videoPath);
    let ext = videoPath.split(".").slice(-1);

    try {
        fs.linkSync(videoPath, `./videoImages/input.${ext}`)
    } catch (e) { } // ignore error -- file already exists

    const proc = child_process.spawn(
        '/bin/sh',
        ['-c', `ffmpeg -r 1 -i ./videoImages/input.${ext} -r 1 ./videoImages/frame%04d.bmp`],
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
}


module.exports.imagesToVideo = function() {

    console.log("converting file")

    const video_path = "./videoImages/output/out.mp4";

    const proc = child_process.spawn(
        '/bin/sh',
        ['-c', `ffmpeg -framerate 30 -pattern_type glob -i './videoImages/*.bmp' -c:v libx264 -pix_fmt yuv420p ${video_path}`],
        { cwd: process.cwd(), env: process.env }
    );

    return new Promise((resolve, reject) => {
        proc.on('close', (code) => {
            if (!fs.existsSync(video_path)) {
                console.log("ffmpeg recompile failed");
                reject();
            }

            console.log("ffmpeg recompile finished")
            if (code == 0) {
                resolve(video_path);
            } else {
                reject();
            }
        })
    });
}

module.exports.convertImages = async function(img_name, prompt_string) {
    const PREFIX = process.cwd();
    const indir = path.join(PREFIX, IMG_DIR);
    const outdir = path.join(path.join(PREFIX, indir), OUT_DIR);
    const infile = path.join(indir, img_name);
    const outfilename = "converted_" + img_name;
    const outfile = path.join(outdir, outfilename);
    const CMD = [
        "python", "demo.py", "--prompt", prompt_string,
        "--init-image", infile, "--strength", "0.5",
        "--output", outfile
    ];

    return new Promise(async (resolve, reject) => {
        let container;
        try {
            container = await docker.createContainer({
                Image: IMAGE_NAME,
                Cmd: CMD,
                Volumes: {
                    '/app/output': {}
                },
                HostConfig: {
                    Binds: [`${outdir}:/app/output`]
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
                stderr: true
            }, function(err, stream) {
                stream.pipe(process.stdout);
            });
        } catch (error) {
            reject(error);
        }
    });
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


