import {assert} from 'chai';

import puppeteer, { Browser, Page } from 'puppeteer';

import { DomFunction, correctDom, evaluateDomFunction, pct,
  canonicalYears  } from './days-in-a-month.js'

suite('pct', () => {
    test('assorted percentages', () => {
        const tests: [number, string][] = [
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

const failingCandidates: DomFunction[] = [
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
    (m, y) => [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m-1]
  ];

  const successfulCandidates: DomFunction[] = [
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
      let result = evaluateDomFunction(dom, dom.toString().replace(/^\(m, y\) => /,''));

      assert.notEqual(result.accuracy, 1.0, `${result}`);
      console.log(`${pct(result.accuracy)} - ${result.fnText}: Eff: ${pct(result.efficiency)}/char, ${result.chars} chars`);
    }
  });

  test('evaluateDomFunction - succeeding', () => {
    for (let dom of successfulCandidates) {
      let result = evaluateDomFunction(dom, dom.toString().replace(/^\(m, y\) => /,''));

      assert.equal(result.accuracy, 1, `${result.accuracy} should be 100%`);
      console.log(`${pct(result.accuracy)} - ${result.fnText}: Eff: ${pct(result.efficiency)}/char, ${result.chars} chars`);
    }
  });
});

const HOST = 'http://localhost:8080';

suite('Headless browser tests', () => {
  let browser: Browser;
  let page:  Page;

  setup(async () => {
    browser = await puppeteer.launch();
    page = await browser.newPage();
    page.setViewport({
      width: 1080,
      height: 1080
    });
    await page.goto(`${HOST}/days-in-a-month`);
  });

  teardown(async () => {
    await browser.close();
  });

  // test('screenshot', async () => {
  //   await page.screenshot({ path: 'images/day-in-a-month.png', fullPage: true });
  // });

  test('no initial error shown', async () => {
    const isHidden = await page.$eval('#error', (elem) => {
      return window.getComputedStyle(elem).visibility === 'hidden';
  });
    assert.isTrue(isHidden);
  });

  test('error shown on bad expression', async () => {
    await page.focus('#ucode');
    await page.keyboard.type('xxx');
    // await page.screenshot({ path: 'images/day-in-a-month.png', fullPage: true });
    const isVisible = await page.$eval('#error', (elem) => {
      return window.getComputedStyle(elem).visibility === 'visible';
    });
    assert.isTrue(isVisible);
  });
}).timeout(10000);