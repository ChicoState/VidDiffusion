const doLs = import("./DoLs.js");

test('DoLs returns string', async () => {
    expect(typeof await (await doLs).doLs()).toBe('string');
});
