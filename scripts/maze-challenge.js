// Grid coordinates (rw, col), begin at (0, 0) for the upper
// left and continue to the right and down.

export {Grid, runChallenge};

let delay = 300;

// paused, run, or step, complete
let mode = 'paused';
let steps = 0;
let stepsText;
let grid;
let solution;
let ctx;

// Solution generator.
let soln;

function runChallenge(solutionArg) {
    let canvasSize = 600
    grid = new Grid(10, canvasSize);
    solution = solutionArg;

    let stage = document.getElementById('challenge');
    stage.innerHTML = `
        <canvas id="grid" width="${canvasSize}" height="${canvasSize}"></canvas>
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

    ctx = document.getElementById('grid').getContext('2d');
    grid.draw(ctx);

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
        grid = new Grid(10, canvasSize);
        steps = 0;
        grid.draw(ctx);
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
                soln = solution(grid);
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
        grid.draw(ctx);
        stepsText.innerText = `${steps}${mode === 'complete' ? "!" : ""}`;
        // Step is a 1-shot.
        if (mode === 'step') {
            mode = 'paused';
        }
    }
}

// For directions 0(N), 1(E), 2(S), and 3(W).
const directions = ['up', 'right', 'down', 'left'];
const drw = [0, 1, 0, -1];
const dcol = [-1, 0, 1, 0];
const margin = 5;
const lineWidth = 3;

class Grid {
    constructor(size, canvasSize) {
        this.size = size;
        this.canvasSize = canvasSize;
        this.cellSize = (this.canvasSize - 2 * margin) / this.size;
        this.cells = new Array(this.size ** 2);
        this.walls = new Array(2 * this.size ** 2);

        // Walls are below and to the right of the  corresponding cell.
        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i] = true;
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);

        ctx.lineWidth = 3;
        ctx.strokeRect(margin, margin, this.canvasSize - 2 * margin, this.canvasSize - 2 * margin);

        for (let rw = 0; rw < this.size; rw++) {
            for (let col = 0; col < this.size; col++) {
                let c = this.cell(rw, col);
                let rc = c.rect();
                // Bottom
                if (rw < this.size - 1 && c.testWall(2)) {
                    ctx.beginPath();
                    ctx.moveTo(rc[0], rc[3]);
                    ctx.lineTo(rc[2], rc[3]);
                    ctx.stroke();
                }

                // Right
                if (col < this.size - 1 && c.testWall(1)) {
                    ctx.beginPath();
                    ctx.moveTo(rc[2], rc[1]);
                    ctx.lineTo(rc[2], rc[3]);
                    ctx.stroke();
                }
            }
        }
    }

    cell(rw, col) {
        let i = rw * this.size + col;
        // Out of bounds reference to the grid - return undefined.
        if (rw < 0 || col < 0 || rw >= this.size || col >= this.size) {
            return undefined;
        }
        // Allocate the cell if not created already.
        if (this.cells[i] === undefined) {
            this.cells[i] = new Cell(this, rw, col);
        }
        return this.cells[i];
    }

    wallIndex(rw, col, dir) {
        if (!(typeof dir === 'number' && dir >= 0 && dir <= 3)) {
            throw Error(`Cell.wall(i) index must be between 0 and 3, not ${i}.`);
        }
        if (dir == 0) {
            rw -= 1;
        }
        if (dir == 3) {
            col -= 1;
        }
        // Immutable walls return undefined index.
        if (rw < 0 || col < 0 ||
            rw === this.size - 1 && dir == 2 ||
            col === this.size - 1 && dir == 1) {
            return undefined;
        }
        // Walls stored row-order, all vertical first, then horizontals;
        return col + rw * this.size + ((dir % 2 === 0) ? this.size ** 2 : 0);
    }
}

class Cell {
    constructor(grid, rw, col) {
        this.grid = grid;
        this.rw = rw;
        this.col = col;
        this._mark = false;
    }

    get mark() {
        return this._mark;
    }

    set mark(f) {
        if (typeof f !== 'boolean') {
            console.warn(`Cell.mark is expected to be a boolean (true or false) value, not ${f}.`);
        }
        this._mark = f;
    }

    testWall(dir) {
        let i = this.grid.wallIndex(this.rw, this.col, dir);
        if (i === undefined) {
            return true;
        }
        return this.grid.walls[i];
    }

    removeWall(dir) {
        let i = this.grid.wallIndex(this.rw, this.col, dir);
        if (i === undefined) {
            console.warn(`Attempt to remove a boundary wall at ${this} ${directions[dir]} is not allowed.`);
            return;
        }
        if (!this.grid.walls[i]) {
            console.info(`Wall at ${this} ${directions[dir]} is already removed.`);
        }
        this.grid.walls[i] = false;
    }

    // x,y Canvas rectangle for cell.
    rect() {
        let cellSize = this.grid.cellSize;
        return [margin + this.col * cellSize, margin + this.rw * cellSize,
                margin + (this.col + 1) * cellSize, margin + (this.rw + 1) * cellSize];
    }

    toString() {
        return `Cell (${this.rw}, ${this.col})`;
    }
}