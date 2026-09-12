const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
const elements = new Map();
function element(id) {
    if (!elements.has(id)) {
        const classes = new Set();
        elements.set(id, {
            style: {}, innerHTML: '', innerText: '', handlers: {},
            classList: {
                add: (...names) => names.forEach(name => classes.add(name)),
                remove: (...names) => names.forEach(name => classes.delete(name)),
                contains: name => classes.has(name),
            },
            addEventListener(name, handler) { this.handlers[name] = handler; },
        });
    }
    return elements.get(id);
}
let frames = 0;
const context = vm.createContext({
    console: { log() {} },
    navigator: { userAgent: '', mediaDevices: {
        async getUserMedia() { throw new Error('Permission denied'); },
    } },
    window: { location: { protocol: 'http:' } },
    document: { getElementById: element, addEventListener() {} },
    setTimeout() {}, setInterval() { return 1; }, clearInterval() {},
    requestAnimationFrame() { frames++; },
});

// Skip WebGL startup; run the actual page handlers and input logic.
vm.runInContext(script.replace('        initThree();', ''), context);
vm.runInContext(`
    fadeAudioIn = () => {};
    initCamera = async () => { throw new Error('Camera unavailable'); };
    updateParticles = () => {};
    renderer = { render() {} };
    transitionTo = () => {};
    successCelebration = () => { currentState = STATE.CELEBRATION; };
`, context);

(async () => {
    const start = element('start-btn');
    await start.handlers.click.call(start);
    assert.equal(vm.runInContext('currentState === STATE.IDLE', context), true);
    assert.equal(element('start-overlay').classList.contains('hidden'), true);

    for (const input of ['isSpacePressed', 'isTouching']) {
        vm.runInContext(`currentState = STATE.BLOWING; blowProgress = 0;
            isSpacePressed = false; isTouching = false; ${input} = true;`, context);
        for (let frame = 0; frame < 126; frame++) vm.runInContext('render()', context);
        assert.equal(vm.runInContext('currentState === STATE.CELEBRATION', context), true);
    }
    assert.equal(frames, 252, 'Only the render loop schedules animation frames');

    vm.runInContext(`currentState = STATE.BLOWING; blowProgress = 5;
        isSpacePressed = false; isTouching = false; checkAudio();`, context);
    assert.equal(vm.runInContext('blowProgress', context), 4.7);

    const event = { stopPropagation() {} };
    for (let repeat = 0; repeat < 2; repeat++) {
        element('close-card-btn').handlers.click(event);
        assert.equal(element('surprise-layer').classList.contains('hidden'), true);
        assert.equal(vm.runInContext('interactionMode', context), 1);
        element('floating-gift-btn').handlers.click(event);
        assert.equal(element('surprise-layer').classList.contains('hidden'), false);
        assert.equal(vm.runInContext('interactionMode', context), 0);
    }
    console.log('PASS: denied microphone fallback, input release, single frame loop, card close/reopen');
})().catch(error => { console.error(error); process.exitCode = 1; });
