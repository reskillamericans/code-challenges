import {assert} from 'chai';

import {VisualArray, createArrayProxy} from '../scripts/sorting-challenge.js'

suite('VisualArray', () => {
    let a;

    setup(() => {
        a = new VisualArray(20);
    });

    test('constructor', () => {
        assert.equal(a.size, 20);
        assert.equal(a.data.length, 20);
    });
});

suite('ArrayProxy', () => {
    let a;
    let h;

    setup(() => {
        [a, h] = createArrayProxy(20);
    });

    test('constructor', () => {
        assert(a.length, 20);
        assert.equal(a[0], undefined);
        assert.equal(h.size, 20);
        assert.equal(h.isRecording, false);
    });

    test('set and get', () => {
        h.measuring(true);
        a[0] = 123;
        h.measuring(false);
        assert.equal(a[0], 123);
        assert.equal(h.stats.sets, 1);
        assert.equal(h.stats.gets, 0);
    });

    test('only count array refs', () => {
        h.measuring(true);
        a[0] = a.length;
        h.measuring(false);
        assert.equal(a[0], 20);
        assert.equal(h.stats.sets, 1);
        assert.equal(h.stats.gets, 0);
    });

    test('extra properties', () => {
        assert.throws(() => {
            a.funny = 123;
        }, /not allowed/);
    });

    test('checked bounds', () => {
        for (let i of [-1, 21]) {
            assert.throws(() => a[i] = 123, /out of bounds/);
        }
    });

    test('history', () => {
        h.recording(true);
        a[0] = 123;
        a[1] = a[0] + 1;
        h.recording(false);
        let hist = h.getHistory();
        assert.equal(h.history.length, 0);
        assert.deepEqual(hist, [
            { event: 'set', index: 0, newValue: 123, oldValue: undefined },
            { event: 'get', index: 0, value: 123 },
            { event: 'set', index: 1, newValue: 124, oldValue: undefined }
        ]);
    });
});