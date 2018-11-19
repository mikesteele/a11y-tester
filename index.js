const mount = require('enzyme').mount;
const rules = require('./node_modules/react-a11y/src/rules').default;

const runRule = (node, rule) => {
  return new Promise((resolve, reject) => {
    if (!node.instance()) {
      resolve();
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
        const failedTests = results.filter(x => x === false);
        reject(rule);
      } else {
        resolve();
      }
    }
    if (rule.test) {
      let result;
      if (!rule.tagName) {
        result = rule.test(node.instance().tagName.toLowerCase(), node.props(), node.children, {options: []})
      } else if  (rule.tagName.toUpperCase() === node.instance().tagName){
        result = rule.test(node.instance().tagName.toLowerCase(), node.props(), node.children, {options: []})
      } else {
        result = true
      }
      if (result) {
        resolve(result);
      } else {
        reject(rule);
      }
    } else {
      resolve();
    }
  });
}

const runTests = (node) => {
  return new Promise((resolve, reject) => {
    const promises = Object.keys(rules).map(rule => {
      return runRule(node, rules[rule])
    })
    Promise.all(promises).then(resolve).catch(reject);
  });
}

const test = (jsx) => {
  return new Promise((resolve, reject) => {
    const allNodes = getAllNodesInSubtree(jsx);
    const runTestsOnAllNodes = allNodes.map(runTests);
    Promise.all(runTestsOnAllNodes).then(resolve).catch(reject);
  });
}

const getSelectorForNode = (node) => {
  // TODO - Can I use node.name in other places?
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
