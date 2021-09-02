# code-challenges
This repository contains code relating to coding challenges
exercises we began in August 2021.

## Challenge Sandboxes

One project is the creation of a "coding sandbox" - a fun way
to visualize your solution to the problem.  The sandbox enables
writing code on [CodePen](http://codepen.io) with an interactive
problem simulation displayed in the results window.

The currently implemented Sandboxes are:

- [Maze Challenge](https://reskillamericans.github.io/code-challenges/maze-challenge)
- [Sorting Challenge](https://reskillamericans.github.io/code-challenges/sorting-challenge)

## Setup and Installation

If you want to contribute to this repository, you can edit the files
on your local machine to experiment and test:

```
$ github clone https://github.com/reskillamericans/code-challenges.git
$ cd code-challenges
$ npm install
```

This repository uses TypeScript for the challenge "runner" and visualization
code.

To compile the TypeScript files:

```
$ npx tsc
```

Unit tests are run using [Node.js](https://nodejs.org/en/) using [Mocha](https://mochajs.org/) with the [Chai](https://www.chaijs.com/) assertion framework.

```
$ npm test
```

## Directory Structure

- **root directory** - HTML landing pages for https://reskillamericans.github.io/.code-challenges.
- **src** - TypeScript source files for sandbox and visualization code.
- **tests** - Test code to be run via ```npm test``` command.
- **scripts** - Some code is generated by the TypeScript compiler and copied here.  Hand-written JavaScript code samples are also here.
- **styles** - CSS styles for use by github.io AND CodePen pages.

## Continuous Integration

This repository is using [Github Continuous Integration](https://docs.github.com/es/actions/guides/building-and-testing-nodejs).  Every time new code
is pushed to the repository, or for each new pull request, Github will
check out the code, install the npm dependencies, and run the tests.  The
results can be viewed on the repository [Actions/Workflow](https://github.com/reskillamericans/code-challenges/actions/workflows/node-ci.yml) page.
