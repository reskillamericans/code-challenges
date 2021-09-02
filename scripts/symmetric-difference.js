export { sym, symModern };

// This is a sample used on freeCodeCamp's site.
//
// This version does not use Set (I had thought their code simulator
// did not allow it - but later I tried it and it did).  Anyway, this uses
// an Object to simulate a Set.
//
// https://www.freecodecamp.org/learn/coding-interview-prep/algorithms/find-the-symmetric-difference
//
function sym(...args) {
    let diff = {};

    for (let a of args) {
        let newDiff = {};

        for (let item of a) {
            if (!diff[item]) {
                newDiff[item] = true;
            }
        }

        for (let item in diff) {
            if (a.indexOf(parseInt(item)) === -1) {
                newDiff[item] = true;
            }
        }

        diff = newDiff;
    }

    return keys(diff);
}

function keys(o) {
    let result = [];
    for (let item in o) {
        result.push(parseInt(item));
    }
    return result;
}

// =============================================================
// This is how I would write it in ES6
// =============================================================
function symModern(...args) {
    let diff = new Set();

    for (let a of args) {
        diff = symDiff2(diff, new Set(a));
    }

    return Array.from(diff.values()).sort((a, b) => a - b);
}

function symDiff2(a, b) {
    let diff = new Set();

    for (let item of a) {
        if (!b.has(item)) {
            diff.add(item);
        }
    }

    for (let item of b) {
        if (!a.has(item)) {
            diff.add(item);
        }
    }

    return diff;
}
