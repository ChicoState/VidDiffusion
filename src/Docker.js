
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
                /*
                Cmd: [
                    "python", "demo.py", "--prompt", promptstr,
                    "--output", "output/out1.png"
                ],
                */
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

            /*
            container.exec({
                Cmd: ["mv", "out1.png", "output"],
                AttachStdin: true,
                AttachStdout: true
            });
            */

        } catch (error) {
            reject(error);
        }
    });
}
