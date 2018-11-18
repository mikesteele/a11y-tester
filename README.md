# a11y-tester

Wrapper for using `react-a11y` (https://github.com/reactjs/react-a11y) with Enzyme.

Tests a component tree for any a11y violations.

## Installation

```
yarn add a11y-tester
```

## Usage

```
// Assumes Enzyme is already set up
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new Adapter() });

// Set up tester
const a11yTester = require('a11y-tester').default;
const tester = new a11yTester();

tester
  .test(<App/>)
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

* Testing whether a component subtree has a11y violations with `test()` works with resolve/reject.

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
