const util = require('util');
const exec = util.promisify(require('child_process').exec);
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');

const DOCKER_SOCKET_PATH = '/var/run/docker.sock';
const IMAGE_NAME = 'viddiffusion';

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
        ['-c', `ffmpeg -r 1 -i ./videoImages/input.${ext} -r 1 ./videoImages/frame%04d.png`],
        { cwd: process.cwd(), env: process.env }
    );

    return new Promise((resolve, reject) => {
        proc.on('close', (code) => {
            console.log("ffmpeg invocation finished")
            if (code == 0) {
                let files = fs.readdirSync('./videoImages/');
                resolve(files.filter((f) => f.endsWith(".png")));
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
        ['-c', `ffmpeg -framerate 30 -pattern_type glob -i './videoImages/output/*.png' -c:v libx264 -pix_fmt yuv420p ${video_path}`],
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

module.exports.convertImages = async function(_, { imageName, prompt }) {
    if (!fs.existsSync("./cache/base")) {
        fs.mkdirSync("./cache/base", { recursive: true })
        fs.mkdirSync("./cache/hf", { recursive: true })
    }

    const inDir = path.join(process.cwd(), "videoImages");
    const cacheDir = path.join(process.cwd(), "cache");

    var docker = new Docker();

    let cmd = [
        "python", "demo.py", "--device", "CPU", "--prompt", prompt,
        "--init-image", `/app/videoImages/${imageName}`, "--strength", "0.5",
        "--output", `/app/videoImages/output/${imageName}`
    ];

    console.log(cmd);

    let container;
    container = await docker.createContainer({
        Image: IMAGE_NAME,
        Cmd: cmd,
        HostConfig: {
            Binds: [
                `${inDir}:/app/videoImages`,
                `${cacheDir}/base:/app/cache`,
                `${cacheDir}/hf:/root/.cache`
            ]
        },
        Tty: true
    });

    await container.start();

    container.attach({
        stream: true,
        stdout: true,
        stderr: true
    }, function(err, stream) {
        stream.pipe(process.stdout);
    });

    let ret = await container.wait();
    await container.remove();
    console.log(ret);

    return path.join(path.join(inDir, "output"), imageName);
}
