import { assert } from 'chai';

import { sym as symClassic, symModern } from '../scripts/symmetric-difference.js'
const tests = [
    {
        input: [[1, 2, 3], [5, 2, 1, 4]],
        expect: [3, 4, 5]
    },
    {
        input: [[1, 2, 3, 3], [5, 2, 1, 4]],
        expect: [3, 4, 5]
    },
    {
        input: [[1, 2, 3], [5, 2, 1, 4, 5]],
        expect: [3, 4, 5]
    },
    {
        input: [[1, 2, 5], [2, 3, 5], [3, 4, 5]],
        expect: [1, 4, 5]
    },
    {
        input: [[1, 1, 2, 5], [2, 2, 3, 5], [3, 4, 5, 5]],
        expect: [1, 4, 5]
    },
    {
        input: [[3, 3, 3, 2, 5], [2, 1, 5, 7], [3, 4, 6, 6], [1, 2, 3]],
        expect: [2, 3, 4, 6, 7]
    },
    {
        input: [[3, 3, 3, 2, 5], [2, 1, 5, 7], [3, 4, 6, 6], [1, 2, 3], [5, 3, 9, 8], [1]],
        expect: [1, 2, 4, 5, 6, 7, 8, 9]
    }
];

suite('Sym Classic', () => {
    for (let aTest of tests) {
        test(`${JSON.stringify(aTest.input)} => ${aTest.expect}`, () => {
            assert.deepEqual(symClassic(...aTest.input), aTest.expect);
        })
    }
});

suite('Sym Modern', () => {
    for (let aTest of tests) {
        test(`${JSON.stringify(aTest.input)} => ${aTest.expect}`, () => {
            assert.deepEqual(symModern(...aTest.input), aTest.expect);
        })
    }
});