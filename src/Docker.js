// const util = require('util');
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

module.exports.checkFfmpegInstalled = function() {
    return fs.existsSync('/usr/local/bin/ffmpeg');
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
