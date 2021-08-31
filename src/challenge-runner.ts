export { Runner };

interface Simulator {
    appendVisualization(stage: HTMLElement): void;
    reset(): void;
    update(): void;
    solutionArgs(): any[];
}

type Mode = 'paused' | 'run' | 'step' | 'complete';

type SolutionFunction = (...args: any) => Generator<void, void>;

class Runner {
    stage : HTMLElement;
    simulator: Simulator;
    controls: {[key: string]: HTMLElement} = {};
    mode: Mode = 'paused';
    steps = 0;
    delay = 300;
    solutionFunction?: SolutionFunction;
    solutionIterator?: Iterator<void, void>;

    static readonly controlIDs = ['pause-run-btn', 'step-btn', 'restart-btn', 'speed', 'steps-txt'];
    static readonly controlEvents = ['click', 'click', 'click', 'change', undefined];
    static readonly handlers: (keyof Runner | undefined)[] = ['onPauseRun', 'onStep', 'onRestart', 'onSpeed', undefined];
    static readonly controlsHTML = `
        <div class="panel">
        <button id="pause-run-btn">Run</button>
        <button id="step-btn">Step</button>
        <button id="restart-btn">Restart</button>
        Steps: <span id="steps">0</span>
        </div>
        <div class="panel">
            Speed: <select id="speed">
                <option value="1000">Slow</option>
                <option value="300" selected>Medium</option>
                <option value="100">Fast</option>
                <option value="0">Hyper-speed</option>
            </select>
        </div>`;

    constructor(stage: HTMLElement, simulator: Simulator) {
        this.stage = stage;
        this.simulator = simulator;
        simulator.appendVisualization(stage);
        this.appendControls();
        this.animate();
    }

    // Return a partial function to attach a solution function.
    makeRunner(): (fn: SolutionFunction) => void {
        return (solutionFunction: SolutionFunction) => {
            this.attachSolution(solutionFunction);
        }
    }

    attachSolution(solutionFunction: SolutionFunction) {
        this.solutionFunction = solutionFunction;
    }

    appendControls() {
        this.stage.insertAdjacentHTML('beforeend', Runner.controlsHTML);
        for (let i in Runner.controlIDs) {
            let id = Runner.controlIDs[i];
            this.controls[id] = document.getElementById(id)!;
            if (Runner.controlEvents[i] !== undefined) {
                this.controls[id].addEventListener(Runner.controlEvents[i] as string,
                    (<Function> this[Runner.handlers[i] as keyof Runner]).bind(this) as EventListener);
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
        this.delay = parseInt((<HTMLOptionElement> this.controls['speed']).value);
    }

    setPauseRunText() {
        this.controls['pause-run-btn'].innerText = this.mode === 'run' ? "Pause" : "Run"
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
        } else {
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
            } catch (e) {
                console.log(`Solution threw an exception: ${e}`);
                this.mode = 'complete';
            }
            this.steps++;
        } else {
            try {
                if (this.solutionIterator.next().done) {
                    this.mode = 'complete';
                }
                this.steps++;
            } catch (e) {
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