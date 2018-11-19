# a11y-tester

[![Build Status](https://travis-ci.com/mikesteele/a11y-tester.svg?branch=master)](https://travis-ci.com/mikesteele/a11y-tester) [![Coverage Status](https://coveralls.io/repos/github/mikesteele/a11y-tester/badge.svg?branch=master)](https://coveralls.io/github/mikesteele/a11y-tester?branch=master)

Wrapper for using `react-a11y` (https://github.com/reactjs/react-a11y) with Enzyme.

Tests a component tree for any a11y violations.



## Installation

```
yarn add --dev a11y-tester
```

or

```
npm install a11y-tester --save-dev
```

## Usage

```javascript
// Assumes Enzyme is already set up
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

const { test } = require('a11y-tester');

test(<App/>)
  .then(() => {
    // All tests passed! :-)
  })
  .catch(violations => {
    // Handle a11y violations :-(
  });
```

## Why this library?

* `react-a11y` patches React, this library doesn't.
* Tests the same a11y rules as `react-a11y`.
* Created to be used in tests, unlike `react-a11y`.

## What works

* Testing whether a component subtree has a11y violations with `test()`.

## What's still TODO?

* Still working on an API for `violations`.

## Run tests

```
yarn test
```

## Build

```
yarn build
```

## License

MIT
