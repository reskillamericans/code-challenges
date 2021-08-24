import {assert} from 'chai';

import {Grid} from '../scripts/maze-challenge.js'

suite('Grid', () => {
    let g;

    setup(() => {
        g = new Grid(10, 600);
    });

    test('constructor', () => {
        assert.equal(g.size, 10);
        g = new Grid(20, 600);
        assert.equal(g.size, 20);
    });

    test('Cells accessor', () => {
        let c = g.cell(0, 0);
        assert.equal(c.mark, false);
    });

    test('Mark cells', () => {
        let c = g.cell(5, 5);

        c.mark = true;
        assert.equal(c.mark, true);
    });

    test('Test walls', () => {
        let c = g.cell(0, 0);

        for (let dir = 0; dir < 4; dir++) {
            assert.equal(c.testWall(dir), true);
        }

        c.removeWall(1);
        assert.equal(c.testWall(1), false);
    });

    test("Can't remove boundary.", () => {
        let c = g.cell(0, 0);

        c.removeWall(0);
        assert.equal(c.testWall(0), true);
    });

    test("Wall index", () => {
        assert.equal(g.wallIndex(0, 0, 0), undefined, 'up');
        assert.equal(g.wallIndex(0, 0, 1), 0, 'right');
        assert.equal(g.wallIndex(0, 0, 2), 100, 'down');
        assert.equal(g.wallIndex(0, 0, 3), undefined, 'left');

        assert.equal(g.wallIndex(1, 1, 0), 101, '1, 1 up');
        assert.equal(g.wallIndex(1, 1, 1), 11, '1, 1 right');
        assert.equal(g.wallIndex(1, 1, 2), 111, '1, 1 down');
        assert.equal(g.wallIndex(1, 1, 3), 10, '1, 1 left');

        assert.equal(g.wallIndex(9, 9, 0), 189, '9, 9 up');
        assert.equal(g.wallIndex(9, 9, 1), undefined, '9, 9 right');
        assert.equal(g.wallIndex(9, 9, 2), undefined, '9, 9 down');
        assert.equal(g.wallIndex(9, 9, 3), 98, '9, 9 left');
    });
});

