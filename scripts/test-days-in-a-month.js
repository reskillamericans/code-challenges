var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { assert } from 'chai';
import puppeteer from 'puppeteer';
import { evaluateDomFunction, pct } from './days-in-a-month.js';
suite('pct', () => {
    test('assorted percentages', () => {
        const tests = [
            [0, '0.00%'],
            [1, '100.00%'],
            [0.5, '50.00%'],
            [0.01, '1.00%'],
            [0.0001, '0.01%']
        ];
        for (let test of tests) {
            assert.equal(pct(test[0]), test[1]);
        }
    });
});
const failingCandidates = [
    (m, y) => m % 2 ? 31 : 30,
    (m, y) => 31,
    (m, y) => m === 2 ? 28 : 31,
    // @ts-ignore
    (m, y) => (m + (m > 7)) % 2 ? 31 : 30,
    // @ts-ignore
    (m, y) => (m + (m > 7)) % 2 ? 31 : m == 2 ? 28 : 30,
    // @ts-ignore
    (m, y) => (m + (m > 7)) % 2 ? 31 : m != 2 ? 30 : 28 + (y % 4 == 0 ? 1 : 0),
    // @ts-ignore
    (m, y) => (m + (m > 7)) % 2 ? 31 : m != 2 ? 30 : 28 + (y % 4 == 0 && y % 100 != 0 ? 1 : 0),
    (m, y) => [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
];
const successfulCandidates = [
    // @ts-ignore
    (m, y) => (m + (m > 7)) % 2 ? 31 : m != 2 ? 30 : 28 + (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0) ? 1 : 0),
    // @ts-ignore
    (m, y) => m == 2 ? 28 + (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0) ? 1 : 0) : 30 + (m + (m > 7)) % 2,
    (m, y) => m != 2 ? 31 - (m + 9) % 12 % 5 % 2 : 28 + (y % 4 == 0 && (y % 100 != 0 || y % 400 == 0) ? 1 : 0),
    // Written with help of GitHub Co-Pilot! 42 characters!
    (m, y) => m == 2 ? y & 3 || !(y % 25) && y & 15 ? 28 : 29 : 30 + (m + m / 8 & 1)
];
suite('DoM', () => {
    test('evaluateDomFunction - failing', () => {
        for (let dom of failingCandidates) {
            let result = evaluateDomFunction(dom, dom.toString().replace(/^\(m, y\) => /, ''));
            assert.notEqual(result.accuracy, 1.0, `${result}`);
            console.log(`${pct(result.accuracy)} - ${result.fnText}: Eff: ${pct(result.efficiency)}/char, ${result.chars} chars`);
        }
    });
    test('evaluateDomFunction - succeeding', () => {
        for (let dom of successfulCandidates) {
            let result = evaluateDomFunction(dom, dom.toString().replace(/^\(m, y\) => /, ''));
            assert.equal(result.accuracy, 1, `${result.accuracy} should be 100%`);
            console.log(`${pct(result.accuracy)} - ${result.fnText}: Eff: ${pct(result.efficiency)}/char, ${result.chars} chars`);
        }
    });
});
const HOST = 'http://localhost:8080';
suite('Headless browser tests', () => {
    let browser;
    let page;
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        browser = yield puppeteer.launch();
        page = yield browser.newPage();
        page.setViewport({
            width: 1080,
            height: 1080
        });
        yield page.goto(`${HOST}/days-in-a-month`);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield browser.close();
    }));
    // test('screenshot', async () => {
    //   await page.screenshot({ path: 'images/day-in-a-month.png', fullPage: true });
    // });
    test('no initial error shown', () => __awaiter(void 0, void 0, void 0, function* () {
        const isHidden = yield page.$eval('#error', (elem) => {
            return window.getComputedStyle(elem).visibility === 'hidden';
        });
        assert.isTrue(isHidden);
    }));
    test('error shown on bad expression', () => __awaiter(void 0, void 0, void 0, function* () {
        yield page.focus('#ucode');
        yield page.keyboard.type('xxx');
        // await page.screenshot({ path: 'images/day-in-a-month.png', fullPage: true });
        const isVisible = yield page.$eval('#error', (elem) => {
            return window.getComputedStyle(elem).visibility === 'visible';
        });
        assert.isTrue(isVisible);
    }));
}).timeout(10000);
//# sourceMappingURL=test-days-in-a-month.js.map