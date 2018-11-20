const mount = require('enzyme').mount;
const rules = require('./node_modules/react-a11y/src/rules').default;

/**
 * testRule(node, rule)
 *
 * Tests a react-a11y rule against a node.
 * Returns test result.
 */
const testRule = (node, rule) => {
  // Test if the rule is for any node, or for this type of node in particular
  if (!rule.tagName || rule.tagName === node.name()) {
    return rule.test(
      node.name(),
      node.props(),
      node.children,
      {
        options: []
      }
    );
  } else {
    return true; // Test isn't for this type of node, skip
  }
};

/**
 * runMultipleRules(node, rules, resolve)
 *
 * Runs a react-a11y rule set against a node.
 * Returns a Promise of a test result.
 */
const runMultipleRules = (node, rules, resolve) => {
  const results = rules.map(rule => testRule(node, rule));
  if (results.includes(false)) {
    // Some rule failed.
    const failedRules = results.map((result, index) => {
      if (result === false) {
        return {
          msg: rules[index]['msg'],
          url: rules[index]['url']
        };
      }
    }).filter(Boolean);
    // Get failed rules, filtering out passing ones.
    resolve({
      passed: false,
      failedRules: failedRules
    });
  } else {
    resolve({
      passed: true
    });
  }
}

/**
 * runSingleRule(node, rule, resolve)
 *
 * Runs a react-a11y rule against a node.
 * Returns a Promise of a test result.
 */
const runSingleRule = (node, rule, resolve) => {
  const passed = testRule(node, rule);
  if (passed) {
    resolve({
      passed: true
    });
  } else {
    resolve({
      passed: false,
      failedRules: [{
        msg: rule.msg,
        url: rule.url
      }]
    });
  }
};

/**
 * runRule(node, rule)
 *
 * Runs a react-a11y rule or rules against a node.
 * Returns a Promise of a test result.
 */
const runRule = (node, rule) => {
  return new Promise(resolve => {
    if (!node.instance()) {
      // If the Node is a React component, we can't test it.
      resolve({
        passed: true
      });
    }
    if (rule.map) {
      // Some rules in react-a11y are arrays, so we'll need to iterate & test each.
      runMultipleRules(node, rule, resolve);
    }
    if (rule.test) {
      runSingleRule(node, rule, resolve);
    }
  });
}

/**
 * runTests(node)
 *
 * Tests all react-a11y rules on a node.
 * Returns a Promise of test results.
 * If passed === false, value will be added to rejected value of test().
 */
const runTests = (node) => {
  return new Promise((resolve, reject) => {
    const promises = Object.keys(rules).map(rule => {
      return runRule(node, rules[rule])
    });
    Promise.all(promises)
      .then(results => {
        const failedResults = results.filter(result => !result.passed);
        if (failedResults.length) {
          const failedRules = failedResults.map(result => result.failedRules);
          resolve({
            passed: false,
            selector: getSelectorForNode(node),
            failedRules: failedRules
          });
        } else {
          resolve({
            passed: true
          });
        }
      });
  });
}

/**
 * test(jsx)
 *
 * Returns a Promise of a11y test results.
 * If resolves, all tests passed.
 * If failed, rejected value takes form of:
 *
 [{
   "selector": "div > img",
   "failedRules": [
     [{
      "msg": "The img does not have an `alt` prop, screen-readers will not know what it is",
      "url": "https://dev.w3.org/html5/alt-techniques"
     }]
   ]
 }]
 */
const test = (jsx) => {
  return new Promise((resolve, reject) => {
    const allNodes = getAllNodesInSubtree(jsx);
    const runTestsOnAllNodes = allNodes.map(runTests);
    Promise.all(runTestsOnAllNodes)
      .then(results => {
        const failedResults = results.filter(result => !result.passed);
        if (failedResults.length) {
          failedResults.forEach(result => delete result.passed);
          reject(failedResults);
        } else {
          resolve();
        }
      });
  });
}

/**
 * getSelectorForNode(node)
 *
 * Returns selector for node (eg. 'div > img').
 */
const getSelectorForNode = (node) => {
  const parents = node.parents();
  const parentsTagNames = parents.map(node => node.name());
  // node.parents() are in bottom-up order, so we add to the front & reverse
  parentsTagNames.unshift(node.name());
  return parentsTagNames.reverse().join(' > ');
}

/**
 * getAllNodesInSubtree(jsx)
 *
 * Returns wrapper of all nodes in subtree.
 */
const getAllNodesInSubtree = (jsx) => {
  const wrapper = mount(jsx);
  const allNodes = wrapper.find(':not([___A11Y_TESTER___])'); // wrapper.find(*) isn't supported
  return allNodes;
}

module.exports = {
  runRule,
  runTests,
  test,
  getAllNodesInSubtree,
  getSelectorForNode
}
