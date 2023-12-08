// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const Docker = require('dockerode');

const DOCKER_SOCKET_PATH = '/var/run/docker.sock';
const CONTAINER_NAME = 'viddiffusion';

module.exports.checkDockerInstalled = function() {
    return fs.existsSync(DOCKER_SOCKET_PATH);
}

module.exports.checkVidDiffusionContainer = async function() {
    var docker = new Docker();
    var image = docker.getImage(CONTAINER_NAME);
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
    }, { t: CONTAINER_NAME });

    await new Promise((resolve, reject) => {
        docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
    });
}

module.exports.videoToImages = async function() {
    var docker = new Docker();

    if (!fs.existsSync("./videoImages")) {
        fs.mkdirSync("./videoImages")
    }

    // run ffmpeg in the container, separate into images
    // then run container with custom command
}
