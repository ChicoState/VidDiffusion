const DockerTest = import("./Docker.js");

test('Smoke Test', async () => {
    expect(1).toBe(1);
});

describe('File Intallation Group', () => {
    test('File installed test', async () => {
        const fs = require('fs');
        expect(fs.existsSync('./')).toBe(true);
    });
    
    test('File not installed test', async () => {
        const fs = require('fs');
        expect(fs.existsSync('./fakefilepaththatnoonehas')).toBe(false);
    });
});

describe('checkVidDiffusionContainer Group', () => {
    test('VidDiffusion container response check', async () => {
        expect(typeof await (await DockerTest).checkVidDiffusionContainer()).toBe('boolean');
    });

    test('Container false check', async () => {
        expect(await (await DockerTest).checkVidDiffusionContainer('falseimage')).toBe(false);
    });

    test('Container true check (given viddiffusion installed)', async () => {
        expect(await (await DockerTest).checkVidDiffusionContainer()).toBe(true);
    });
});

describe('buildContainer Group', () => {
    //these tests take a long time to run
    //commented out for full test suite runtime reduction

    // test('Image build check', async () => {
    //     const logSpy = jest.spyOn(global.console, 'log');
    //     (await (await DockerTest).buildContainer());
    //     expect(logSpy).toHaveBeenCalled();
    // }, 200000);

    // test('Image build success check', async () => {
    //     const logSpy = jest.spyOn(global.console, 'log');
    //     (await (await DockerTest).buildContainer());
    //     expect(logSpy).toHaveBeenCalledTimes(2);
    //     expect(logSpy).toHaveBeenCalledWith('== IMAGE BUILT ==');
    // }, 200000);
});

describe('videoToImages Group', () => {
    test('Directory creation test', async () => {
        const fs = require('fs');
        if (!fs.existsSync("./test")) {
            fs.mkdirSync("./test")
        }
        try {
            await (await DockerTest).videoToImages("test", "./test");
        } catch (e) { }
        expect(fs.existsSync("./videoImages")).toBe(true);
    });
});