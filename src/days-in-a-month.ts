export {
  DomFunction, correctDom, evaluateDomFunction, canonicalYears, pct,
  initializePage
};

let canonicalYears = [1900, 2000, 2001, 2004, 2100];

type YearData = {
  year: number,
  values: {
    days: number,
    correct: boolean
  }[]
};

type DomFunction = (m: number, y: number) => number;

const correctDom: DomFunction = (m, y) => {
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let result = daysPerMonth[m - 1];

  if (m === 2) {
    if (y % 4 === 0) {
      if (y % 400 === 0 || y % 100 !== 0) {
        result = 29;
      }
    }
  }

  return result;
}

function evaluateDomFunction(dom: DomFunction, fnText: string) {
  let tests = 0;
  let failures = 0;

  for (let yr = 1600; yr < 2100; yr++) {
    for (let m = 1; m <= 12; m++) {
      if (dom(m, yr) !== correctDom(m, yr)) {
        failures++;
      }
      tests++;
    }
  }

  let fnMin = fnText.toString().replace(/\s+/g, '');
  let succ = (tests - failures);
  let accuracy = succ / tests;
  let chars = fnMin.length;
  let efficiency = accuracy / chars;

  let examples = [];
  for (let yr of canonicalYears) {
    let data: YearData = {
      year: yr,
      values: []
    };

    for (let m = 1; m <= 12; m++) {
      let d = dom(m, yr);
      if (typeof d !== 'number') {
        d = NaN;
      }
      data.values.push({ days: d, correct: d === correctDom(m, yr) });
    }
    examples.push(data);
  }

  return { fnText, chars, accuracy, efficiency, examples };
}

function pct(n: number): string {
  return (n * 100).toFixed(2) + '%';
}

function initializePage() {
  const page = bindElements('sample', 'ucode', 'chars', 'accuracy',
    'efficiency', 'error', 'canonical-years', 'boast');

  page.sample.textContent = correctDom.toString();

  runUserTest(page);

  page.ucode.addEventListener('input', (e) => {
    runUserTest(page);
  });
}

type ElementBindings = { [key: string]: HTMLElement };

function bindElements(...eltNames: string[]): ElementBindings {
  let results: { [key: string]: HTMLElement } = {};
  for (let eltName of eltNames) {
    results[eltName] = document.getElementById(eltName)!;
  }
  return results;
}

function runUserTest(page: ElementBindings) {
  let code = (page.ucode as HTMLTextAreaElement).value;
  let fn: DomFunction;

  try {
    fn = userCode(code);
  } catch (e) {
    showUserError(page, `Error parsing user function: ${e}`);
    return;
  }

  // Clear error state.
  showUserError(page, '');

  let results;
  try {
    results = evaluateDomFunction(fn, code);
  } catch (e) {
    showUserError(page, `Error evaluating user function: ${e}`);
    return;
  }

  page.chars.textContent = results.chars.toString();
  page.accuracy.textContent = pct(results.accuracy);
  page.accuracy.style['color'] = (results.accuracy < 1 ? 'red' : 'darkgreen');
  page.efficiency.textContent = pct(results.efficiency);

  page['canonical-years'].innerHTML = formatYearHeaderHTML() +
    results.examples.map(formatYearHTML).join('\n');

  console.log(results);
}

function formatYearHeaderHTML() {
  let result = '<div class="year">';
  result += ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(
      (s) => `<div${s !== '' ? ' class="heading"' : ''}>${s}</div>`).join('');
  result += '</div>';
  return result;
}

function formatYearHTML(yearData: YearData) {
  let result = `<div class="year"><div>${yearData.year}</div>`;
  result += yearData.values.map((d) =>
    `<div class="${d.correct ? 'right' : 'wrong'}">${d.days}</div>`).join('');
  result += '</div>';
  return result;
}

function userCode(expr: string): DomFunction {
  return Function('m', 'y', '"use strict";return (' + expr + ')') as DomFunction;
}

function showUserError(page: ElementBindings, s: string) {
  if (s === "") {
    page.error.style['display'] = 'none';
    page.boast.style['display'] = 'block';
    return;
  }
  page.error.textContent = s;
  page.error.style['display'] = 'block';

  page['canonical-years'].innerHTML = '';
  page.boast.style['display'] = 'none';
}
