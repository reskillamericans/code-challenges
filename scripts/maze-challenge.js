// Grid coordinates (rw, col), begin at (0, 0) for the upper
// left and continue to the right and down.
import { Runner } from './challenge-runner.js';
export { runChallenge, Grid };
function runChallenge(solutionFunction) {
    let stage = document.getElementById('challenge');
    let sim = new GridSimulator();
    new Runner(stage, sim, solutionFunction);
}
class GridSimulator {
    constructor() {
        this.reset();
    }
    appendVisualization(stage) {
        stage.insertAdjacentHTML('beforeend', GridSimulator.gridHTML);
        this.ctx = document.getElementById('grid').getContext('2d');
        this.update();
    }
    update() {
        if (this.ctx !== undefined) {
            this.grid.draw(this.ctx);
        }
    }
    reset() {
        this.grid = new Grid(GridSimulator.gridSize, GridSimulator.canvasSize);
    }
    solutionArgs() {
        return [this.grid];
    }
}
GridSimulator.canvasSize = 600;
GridSimulator.gridSize = 10;
GridSimulator.gridHTML = `
        <canvas id="grid"
                width="${GridSimulator.canvasSize}"
                height="${GridSimulator.canvasSize}">
        </canvas>
    `;
const directions = ['up', 'right', 'down', 'left'];
class Grid {
    constructor(size, canvasSize) {
        this.size = size;
        this.canvasSize = canvasSize;
        this.cellSize = (this.canvasSize - 2 * Grid.margin) / this.size;
        this.cells = new Array(Math.pow(this.size, 2));
        this.walls = new Array(2 * Math.pow(this.size, 2));
        // Walls are below and to the right of the  corresponding cell.
        for (let i = 0; i < this.walls.length; i++) {
            this.walls[i] = true;
        }
    }
    draw(ctx) {
        ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        ctx.lineWidth = Grid.lineWidth;
        ctx.fillStyle = '#fff8dc';
        // Draw background first, so borders may overlap them.
        for (let rw = 0; rw < this.size; rw++) {
            for (let col = 0; col < this.size; col++) {
                let c = this.cell(rw, col);
                let rc = c.rect();
                if (c.mark) {
                    ctx.fillRect(rc[0], rc[1], rc[2] - rc[0], rc[3] - rc[1]);
                }
            }
        }
        ctx.strokeRect(Grid.margin, Grid.margin, this.canvasSize - 2 * Grid.margin, this.canvasSize - 2 * Grid.margin);
        for (let rw = 0; rw < this.size; rw++) {
            for (let col = 0; col < this.size; col++) {
                let c = this.cell(rw, col);
                let rc = c.rect();
                // Note that we extend all lines 1 pixel on the ends.
                // This is to ensure that lines that meet in a corner
                // do not display a "notch" artifact and corners look
                // clean.
                // Bottom
                if (rw < this.size - 1 && c.testWall(2)) {
                    ctx.beginPath();
                    ctx.moveTo(rc[0] - 1, rc[3]);
                    ctx.lineTo(rc[2] + 1, rc[3]);
                    ctx.stroke();
                }
                // Right
                if (col < this.size - 1 && c.testWall(1)) {
                    ctx.beginPath();
                    ctx.moveTo(rc[2], rc[1] - 1);
                    ctx.lineTo(rc[2], rc[3] + 1);
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
            throw Error(`Cell wall direction must be between 0 and 3, not ${dir}.`);
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
        return col + rw * this.size + ((dir % 2 === 0) ? Math.pow(this.size, 2) : 0);
    }
}
Grid.margin = 5;
Grid.lineWidth = 3;
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
        return [Grid.margin + this.col * cellSize, Grid.margin + this.rw * cellSize,
            Grid.margin + (this.col + 1) * cellSize, Grid.margin + (this.rw + 1) * cellSize];
    }
    toString() {
        return `Cell (${this.rw}, ${this.col})`;
    }
}
//# sourceMappingURL=maze-challenge.js.map