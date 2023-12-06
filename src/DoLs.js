
const util = require('util');
const exec = util.promisify(require('child_process').exec);


export async function doLs() {
    const { stdout, stderr } = await exec('ls');
    // console.log('stdout:', stdout);
    // console.error('stderr:', stderr);
    return stdout;
}


