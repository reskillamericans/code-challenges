import {assert} from 'chai';

import {Grid} from '../scripts/maze-challenge.js'

suite('Grid', () => {
    test('constructor', () => {
        let g = new Grid();
        assert.equal(g.size, 10);
        g = new Grid(20);
        assert.equal(g.size, 20);
    });

    test('Cells accessor', () => {
        let g = new Grid();
        let c = g.cell(0, 0);
        assert.equal(c.mark, false);
    });

    test('Mark cells', () => {
        let g = new Grid();
        let c = g.cell(5, 5);

        c.mark = true;
        assert.equal(c.mark, true);
    });

    test('Test walls', () => {
        let g = new Grid();
        let c = g.cell(0, 0);

        for (let dir = 0; dir < 4; dir++) {
            assert.equal(c.testWall(dir), true);
        }

        c.removeWall(1);
        assert.equal(c.testWall(1), false);
    });

    test("Can't remove boundary.", () => {
        let g = new Grid();
        let c = g.cell(0, 0);

        c.removeWall(0);
        assert.equal(c.testWall(0), true);
    });
});

