const mount = require('enzyme').mount;
const rules = {}; // TODO

class a11yTester {
  constructor() {
    this.runTests = this.runTests.bind(this);
  }

  runRule(node, rule) {
    return new Promise((resolve, reject) => {
      if (rule.map) {
        const results = rule.map(r => {
          if (!r.tagName) {
            return r.test(node.instance().tagName.toLowerCase(), node.props(), node.children, {options: []})
          } else if  (r.tagName.toUpperCase() === node.instance().tagName){
            return r.test(node.instance().tagName.toLowerCase(), node.props(), node.children, {options: []})
          } {
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

  runTests(node) {
    return new Promise((resolve, reject) => {
      const promises = Object.keys(rules).map(rule => {
        return this.runRule(node, rules[rule])
      })
      Promise.all(promises).then(resolve).catch(reject);
    });
  }

  test(jsx) {
    return new Promise((resolve, reject) => {
      const allNodes = this.getAllNodesInSubtree(jsx);
      const runTestsOnAllNodes = allNodes.map(this.runTests);
      Promise.all(runTestsOnAllNodes).then(resolve).catch(reject);
    });
  }

  getAllNodesInSubtree(jsx) {
    const wrapper = mount(jsx);
    const allNodes = wrapper.find(':not([___A11Y_TESTER___])'); // wrapper.find(*) isn't supported
    return allNodes;
  }
}

module.exports = a11yTester;
