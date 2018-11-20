# a11y-tester

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
    // There was a component with a11y violations. :-(
  });
```

## Example

```javascript
const { test } = require('a11y-tester');

const App = (props) => (
  <div>
    <img src='image.png'/>
    <div onMouseOver={() => {}}/>
  </div>
);

test(<App/>)
  .then(() => {})
  .catch(violations => {
  /**
    [{
      "selector": "App > div > img",
      "failedRules": [
        [{
          "msg": "The img does not have an `alt` prop, screen-readers will not know what it is",
          "url": "https://dev.w3.org/html5/alt-techniques"
        }]
      ]
    }, {
      "selector": "App > div > div",
      "failedRules": [
        [{
          "msg": "onMouseOver must be accompanied by onFocus for accessibility.",
          "url": "http://webaim.org/techniques/javascript/eventhandlers#onmouseover"
        }]
      ]
    }]
  **/
  });
```

## Why this library?

* `react-a11y` patches React, this library doesn't.
* Tests the same a11y rules as `react-a11y`.
* Created to be used in tests, unlike `react-a11y`.

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
