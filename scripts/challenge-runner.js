export { Runner };
class Runner {
    constructor(stage, simulator, solutionFunction) {
        this.controls = {};
        this.mode = 'paused';
        this.steps = 0;
        this.delay = 300;
        this.stage = stage;
        this.simulator = simulator;
        simulator.appendVisualization(stage);
        this.appendControls();
        if (solutionFunction !== undefined) {
            this.attachSolution(solutionFunction);
        }
        this.animate();
    }
    attachSolution(solutionFunction) {
        this.solutionFunction = solutionFunction;
    }
    appendControls() {
        this.stage.insertAdjacentHTML('beforeend', Runner.controlsHTML);
        for (let i in Runner.controlIDs) {
            let id = Runner.controlIDs[i];
            this.controls[id] = document.getElementById(id);
            if (Runner.controlEvents[i] !== undefined) {
                this.controls[id].addEventListener(Runner.controlEvents[i], this[Runner.handlers[i]].bind(this));
            }
        }
    }
    onPauseRun() {
        if (this.mode === 'step') {
            return;
        }
        this.mode = this.mode === 'paused' ? 'run' : 'paused';
        this.setPauseRunText();
    }
    onStep() {
        this.mode = 'step';
        this.setPauseRunText();
    }
    onRestart() {
        this.solutionIterator = undefined;
        this.mode = 'paused';
        this.setPauseRunText();
        this.simulator.reset();
        this.steps = 0;
        this.simulator.update();
        this.update();
    }
    onSpeed() {
        this.delay = parseInt(this.controls['speed'].value);
    }
    setPauseRunText() {
        this.controls['pause-run-btn'].innerText = this.mode === 'run' ? "Pause" : "Run";
    }
    update() {
        this.controls['steps-txt'].innerText = `${this.steps}${this.mode === 'complete' ? "!" : ""}`;
    }
    animate() {
        let self = this;
        function nextFrame() {
            requestAnimationFrame(() => self.animate());
        }
        if (this.mode === 'run') {
            setTimeout(nextFrame, self.delay);
        }
        else {
            nextFrame();
        }
        // Not yet attached to a solution.
        if (this.solutionFunction === undefined) {
            return;
        }
        if (!(this.mode === 'run' || this.mode === 'step')) {
            return;
        }
        if (this.solutionIterator === undefined) {
            try {
                this.solutionIterator = this.solutionFunction(...this.simulator.solutionArgs());
            }
            catch (e) {
                console.log(`Solution threw an exception: ${e}`);
                this.mode = 'complete';
            }
            this.steps++;
        }
        else {
            try {
                if (this.solutionIterator.next().done) {
                    this.mode = 'complete';
                }
                this.steps++;
            }
            catch (e) {
                console.log(`Solution threw an exception: ${e}`);
                this.mode = 'complete';
            }
        }
        this.simulator.update();
        this.update();
        // Step is a 1-shot.
        if (this.mode === 'step') {
            this.mode = 'paused';
        }
    }
}
Runner.controlIDs = ['pause-run-btn', 'step-btn', 'restart-btn', 'speed', 'steps-txt'];
Runner.controlEvents = ['click', 'click', 'click', 'change', undefined];
Runner.handlers = ['onPauseRun', 'onStep', 'onRestart', 'onSpeed', undefined];
Runner.controlsHTML = `
        <div class="panel">
        <button id="pause-run-btn">Run</button>
        <button id="step-btn">Step</button>
        <button id="restart-btn">Restart</button>
        Steps: <span id="steps-txt">0</span>
        </div>
        <div class="panel">
            Speed: <select id="speed">
                <option value="1000">Slow</option>
                <option value="300" selected>Medium</option>
                <option value="100">Fast</option>
                <option value="0">Hyper-speed</option>
            </select>
        </div>`;
//# sourceMappingURL=challenge-runner.js.map