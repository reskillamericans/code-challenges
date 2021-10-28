"use strict";
function solveNQueens(n) {
    let state = new NQueens(n);
    state.getSolutions(0);
    return state.formatSolutions();
}
;
class NQueens {
    constructor(n) {
        this.rows = new Set();
        this.cols = new Set();
        this.diag = new Set();
        this.revDiag = new Set();
        this.queens = new Set();
        this.solutions = [];
        this.n = n;
    }
    push(pos) {
        if (this.rows.has(pos.row) || this.cols.has(pos.col) ||
            this.diag.has(pos.row - pos.col) || this.revDiag.has(pos.row + pos.col)) {
            return false;
        }
        this.rows.add(pos.row);
        this.cols.add(pos.col);
        this.diag.add(pos.row - pos.col);
        this.revDiag.add(pos.row + pos.col);
        this.queens.add(pos);
        return true;
    }
    pop(pos) {
        this.rows.delete(pos.row);
        this.cols.delete(pos.col);
        this.diag.delete(pos.row - pos.col);
        this.revDiag.delete(pos.row + pos.col);
        this.queens.delete(pos);
    }
    // Get solutions where next queen is in the col-th column
    // (all prior columns already occupied).
    getSolutions(col) {
        for (let row = 0; row < this.n; row++) {
            let pos = new Pos(row, col);
            if (this.push(pos)) {
                if (col === this.n - 1) {
                    this.solutions.push(new Set(this.queens));
                }
                else {
                    this.getSolutions(col + 1);
                }
                this.pop(pos);
            }
        }
    }
    formatSolutions() {
        return Array.from(this.solutions).map(x => this.formatSolution(x));
    }
    formatSolution(s) {
        let result = [];
        for (let p of s) {
            result[p.row] = this.formatRow(p.col);
        }
        return result;
    }
    formatRow(col) {
        return '.'.repeat(col) + 'Q' + '.'.repeat(this.n - col - 1);
    }
}
let posValues = new Map();
class Pos {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        if (posValues.has(this.key())) {
            return posValues.get(this.key());
        }
        posValues.set(this.key(), this);
    }
    key() {
        return `${this.row}, ${this.col}`;
    }
}
console.log(solveNQueens(8).join('\n'));
for (let n = 1; n < 15; n++) {
    console.log(`${n}: ${solveNQueens(n).length} solutions.`);
}
//# sourceMappingURL=n-queens.js.map