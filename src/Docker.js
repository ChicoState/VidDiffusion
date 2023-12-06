// const util = require('util');
// const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
// var Docker = require('dockerode');

const DOCKER_SOCKET_PATH = '/var/run/docker.sock';

module.exports.checkDockerInstalled = async function checkDockerInstalled() {
    return fs.existsSync(DOCKER_SOCKET_PATH);
}
