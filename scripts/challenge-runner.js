export { Runner };
class Runner {
    constructor(stage, simulator) {
        this.controls = {};
        this.mode = 'paused';
        this.steps = 0;
        this.stage = stage;
        this.simulator = simulator;
        simulator.appendVisualization(stage);
        this.appendControls();
        this.animate();
    }
    makeRunner() {
        return (solutionFunction) => {
            this.attachSolution(solutionFunction);
        };
    }
    appendControls() {
        this.stage.insertAdjacentHTML('beforeEnd', Runner.controlsHTML);
        for (let i in controlIDs) {
            let id = controlIDs[i];
            controls[id] = document.getElementById(id);
            if (controlEvents[i] !== undefined) {
                controls[id].addEventListener(controlEvents[i], () => {
                    this[handlers[i]]();
                });
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
    setPauseRunText() {
        this.controls['pause-run-btn'].innerText = this.mode === 'run' ? "Pause" : "Run";
    }
    update() {
        this.controls['steps-txt'].innerText = `${this.steps}${this.mode === 'complete' ? "!" : ""}`;
    }
    animate() {
        function nextFrame() {
            requestAnimationFrame(() => this.animate());
        }
        if (this.mode === 'run') {
            setTimeout(nextFrame, this.delay);
        }
        else {
            nextFrame();
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
                steps++;
            }
            catch (e) {
                console.log(`Solution threw an exception: ${e}`);
                mode = 'complete';
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
        Steps: <span id="steps">${steps}</span>
        </div>
        <div class="panel">
            Speed: <select id="speed">
                <option value="1000">Slow</option>
                <option value="300" selected>Medium</option>
                <option value="100">Fast</option>
                <option value="0">Hyper-speed</option>
            </select>
        </div>`;
