// Grid coordinates (rw, col), begin at (0, 0) for the upper
// left and continue to the right and down.

export {Grid, runChallenge};

function runChallenge(solution) {
    let canvasSize = 600
    let g = new Grid(10, canvasSize);

    let stage = document.getElementById('challenge');
    stage.innerHTML = `
        <canvas width="${canvasSize}" height="${canvasSize}" id=grid></canvas>
    `;

    let ctx = document.getElementById('grid').getContext('2d');

    g.draw(ctx);

    try {
        for (let val of solution(g)) {
            g.draw(ctx);
        }
    } catch (e) {
        console.log(`Solution threw an exception: ${e}`);
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
        // Allocate the cell if not created already.
        if (this.cell[i] === undefined) {
            this.cell[i] = new Cell(this, rw, col);
        }
        return this.cell[i];
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
            console.warn(`Attempt to remove a boundary wall (${this.rw}, ${this.col} ${directions[dir]}) is not allowed.`);
            return;
        }
        this.grid.walls[i] = false;
    }

    // x,y Canvas rectangle for cell.
    rect() {
        let cellSize = this.grid.cellSize;
        return [margin + this.col * cellSize, margin + this.rw * cellSize,
                margin + (this.col + 1) * cellSize, margin + (this.rw + 1) * cellSize];
    }    
}