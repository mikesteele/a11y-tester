const mount = require('enzyme').mount;
const rules = require('./node_modules/react-a11y/src/rules').default;

const runRule = (node, rule) => {
  return new Promise((resolve, _) => {
    if (!node.instance()) {
      resolve({
        passed: true
      });
    }
    if (rule.map) {
      const results = rule.map(r => {
        if (!r.tagName || r.tagName === node.name()) {
          return r.test(node.name(), node.props(), node.children, {options: []})
        } else {
          return true
        }
      });
      if (results.some(x => x === false)) {
        const failedRules = results.map((x, index) => {
          if (x === false) {
            return {
              msg: rule[index]['msg'],
              url: rule[index]['url']
            };
          }
        }).filter(Boolean);
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
    if (rule.test) {
      let result;
      if (!rule.tagName) {
        result = rule.test(node.name(), node.props(), node.children, {options: []})
      } else if  (rule.tagName === node.name()){
        result = rule.test(node.name(), node.props(), node.children, {options: []})
      } else {
        result = true
      }
      if (result) {
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
    } else {
      resolve({
        passed: true
      });
    }
  });
}

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

const getSelectorForNode = (node) => {
  const parents = node.parents();
  const parentsTagNames = parents.map(node => node.name());
  parentsTagNames.unshift(node.name());
  return parentsTagNames.reverse().join(' > ');
}

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
