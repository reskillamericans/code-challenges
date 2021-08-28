export {runChallenge, VisualArray, createArrayProxy};

let delay = 300;
const arraySize = 50;

// paused, run, or step, complete
let mode = 'paused';
let steps = 0;
let stepsText;
let array;
let solution;

// Solution generator.
let soln;

function runChallenge(solutionArg) {
    let canvasSize = 600
    solution = solutionArg;

    let challenge = document.getElementById('challenge');
    challenge.innerHTML = `
        <div id="array"></div>
        <div class="panel">
            <button id="pause-run-btn">Run</button>
            <button id="step-btn">Step</button>
            <button id="restart-btn">Restart</button>
            Steps: <span id="steps">${steps}</span>
        </div>
        <div class="panel">
            Speed: <select id="speed">
                <option value="1000">Slow</option>
                <option value="300" selected>Medium</option>
                <option value="100">Fast</option>
                <option value="0">Hyper-speed</option>
            </select>
        </div>
    `;

    array = new VisualArray(arraySize, challenge.querySelector('#array'));

    stepsText = document.getElementById('steps');

    let pauseRunBtn = document.getElementById('pause-run-btn');
    pauseRunBtn.addEventListener('click', () => {
        if (mode === 'step') {
            return;
        }
        mode = mode === 'paused' ? 'run' : 'paused';
        pauseRunBtn.innerText = mode === 'run' ? "Pause" : "Run";
        console.log(mode);
    });

    let stepBtn = document.getElementById('step-btn');
    stepBtn.addEventListener('click', () => {
        mode = 'step';
        pauseRunBtn.innerText = 'Run';
    });

    let restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', () => {
        soln = undefined;
        mode = 'paused';
        pauseRunBtn.innerText = 'Run';
        array = new VisualArray(arraySize, document.getElementById('array'));
        steps = 0;
        stepsText.innerText = `${steps}`;
    });

    let speedOption = document.getElementById('speed');
    speedOption.addEventListener('change', (e) => {
        delay = parseInt(speedOption.value);
    });

    animate();
}

function animate() {
    // After a delay - request the next frame to be drawn - but
    // only allow next "step" in the solution (defined by yield).
    setTimeout(() => requestAnimationFrame(() => animate()), mode === 'run' ? delay : 0);
    if (mode === 'run' || mode === 'step') {
        if (soln === undefined) {
            try {
                soln = solution(array.data);
            } catch (e) {
                console.log(`Solution threw an exception: ${e}`);
                mode = 'complete';
            }
            steps++;
        } else {
            try {
                // The generator actually finished.  Mark solution complete.
                if (soln.next().done) {
                    mode = 'complete';
                }
                steps++;
            } catch (e) {
                console.log(`Solution threw an exception: ${e}`);
                mode = 'complete';
            }
        }
        array.update();
        stepsText.innerText = `${steps}${mode === 'complete' ? "!" : ""}`;
        // Step is a 1-shot.
        if (mode === 'step') {
            mode = 'paused';
        }
    }
}

class VisualArray {
    size;
    data;
    handler;
    target;
    elements = [];
    reads;
    writes;
    lastHistory = [];

    constructor(size, stage) {
        this.size = size;
        [this.data, this.handler] = createArrayProxy(size);
        this.target = this.handler.data;
        for (let i = 0; i < size; i++) {
            this.target[i] = this.randomInt();
        }
        
        // Remove any previous dom elements in the stage.
        stage.replaceChildren();

        for (let i = 0; i < size; i++) {
            let elt = document.createElement('div');
            this.elements.push(elt);
            elt.className = 'arrayElt';
            elt.textContent = this.target[i];
            stage.appendChild(elt);
        }

        let panel = document.createElement('div');
        panel.className = 'panel stats';
        panel.innerHTML = 'Reads: <span id="reads">0</span>&nbsp;Writes: <span id="writes">0</span>';
        this.reads = panel.querySelector('#reads');
        this.writes = panel.querySelector('#writes');

        stage.appendChild(panel);
    }

    update() {
        let h = this.handler.getHistory();
        for (let e of this.lastHistory) {
            this.elements[e.index].className = 'arrayElt';
        }
        for (let e of h) {
            if (e.event === 'get') {
                this.elements[e.index].className = 'arrayElt read';
            }
        }
        for (let e of h) {
            if (e.event === 'set') {
                this.elements[e.index].innerText = e.newValue;
                this.elements[e.index].className = 'arrayElt write';
            }
        }
        this.reads.innerText = this.handler.stats.gets;
        this.writes.innerText = this.handler.stats.sets;
        this.lastHistory = h;
    }

    randomInt() {
        return Math.floor(Math.random() * 3 * this.size + 1);
    }
}

function createArrayProxy(size) {
    let handler = {
        size: size,
        data: new Array(size),
        stats: {
            gets: 0,
            sets: 0
        },
        history: [],

        getHistory() {
            let result = handler.history;
            handler.history = [];
            return result;
        },

        get: (target, prop) => {
            let i = parseInt(prop);
            if (isNaN(i)) {
                return target[prop];
            }
            if (i < 0 || i >= handler.size) {
                throw Error(`Index ${i} is out of bounds (only indices are between 0 and ${handler.size - 1} (inclusive)).`);
            }
            handler.stats.gets++;
            handler.history.push({
                event: 'get',
                index: i,
                value: target[i]
            });
            return target[i];
        },

        set: (target, prop, value) => {
            let i = parseInt(prop);
            if (isNaN(i)) {
                throw Error(`Setting property ${prop} on array object is not allowed.`);
            }
            if (i < 0 || i >= handler.size) {
                throw Error(`Index ${i} is out of bounds (indices allowed between 0 and ${handler.size - 1} (inclusive)).`);
            }
            handler.stats.sets++;
            handler.history.push({
                event: 'set',
                index: i,
                newValue: value,
                oldValue: target[i]
            });
            target[i] = value;
            return true;
        }
    };

    return [new Proxy(handler.data, handler), handler];
}