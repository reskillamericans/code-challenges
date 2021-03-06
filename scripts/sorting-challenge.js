import { Runner } from './challenge-runner.js';
export { runChallenge, createArrayProxy };
function runChallenge(solutionFunction) {
    let stage = document.getElementById('challenge');
    let sim = new SortingSimulator();
    new Runner(stage, sim, solutionFunction);
}
class SortingSimulator {
    constructor() {
        this.arrayStage = document.createElement('div');
        this.arrayStage.className = 'visual-array';
        this.reset();
    }
    appendVisualization(stage) {
        stage.appendChild(this.arrayStage);
        this.update();
    }
    update() {
        this.array.update();
    }
    reset() {
        this.array = new VisualArray(SortingSimulator.arraySize, this.arrayStage);
    }
    solutionArgs() {
        return [this.array.data];
    }
}
SortingSimulator.arraySize = 50;
class VisualArray {
    constructor(size, stage) {
        this.elements = [];
        this.lastHistory = [];
        this.size = size;
        [this.data, this.handler] = createArrayProxy(size);
        this.target = this.handler.data;
        for (let i = 0; i < size; i++) {
            this.target[i] = this.randomInt();
        }
        // Remove any previous dom elements in the stage.
        // @ts-ignore - Missing replaceChildren definition in lib.dom.d.ts!!!?
        stage.replaceChildren();
        for (let i = 0; i < size; i++) {
            let elt = document.createElement('div');
            this.elements.push(elt);
            elt.className = 'arrayElt';
            elt.textContent = this.target[i].toString();
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
                this.elements[e.index].innerText = e.newValue.toString();
                this.elements[e.index].className = 'arrayElt write';
            }
        }
        this.reads.innerText = this.handler.stats.gets.toString();
        this.writes.innerText = this.handler.stats.sets.toString();
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
                // @ts-ignore - Returning a misc property of the array object (like length).
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
//# sourceMappingURL=sorting-challenge.js.map