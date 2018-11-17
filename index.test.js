// Babel needs to transform react-a11y rule modules
require('@babel/register')({
  ignore: []
});

const React = require('react');
const mount = require('enzyme').mount;
const expect = require('chai').expect;
const sinon = require('sinon');
const a11yTester = require('./index');
const enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

const tester = new a11yTester();
const rules = require('./node_modules/react-a11y/src/rules').default;

enzyme.configure({ adapter: new Adapter() });

describe('react-a11y-enzyme', () => {
  describe('getAllNodesInSubtree', () => {
    it('should test all nodes in subtree', () => {
      const allNodes = tester.getAllNodesInSubtree(
        <div>
          <div>Title</div>
          <div>
            <img src='image.jpg'/>
          </div>
        </div>
      );
      expect(allNodes.length).to.equal(4);
    });
  });
  describe('test', () => {
    it('should call runTests on all nodes in subtree', done => {
      const spy = sinon.spy(tester, 'runTests');
      tester.test(
        <div>
          <table>
            <tbody>
              <tr>
                <td/>
              </tr>
            </tbody>
          </table>
        </div>
      ).then(result => {
        expect(spy.callCount).to.equal(5);
        spy.restore();
        done();
      }).catch(err => {});
    });
  });
  describe('runTests', () => {
    it('should call runRule for every rule', done => {
      const spy = sinon.spy(tester, 'runRule');
      const node = mount(<div/>);
      tester.runTests(node)
        .then(result => {
          const numberOfRules = Object.keys(rules).length;
          expect(spy.callCount).to.equal(numberOfRules);
          spy.restore();
          done();
        }).catch(err => {});

    });
  });
  describe('runRule', () => {
    describe('Mutliple rules', () => {
      it('should test each rule, if rule has multiple', done => {
        const node = mount(<div/>);
        const testRule = [
          {
            test() {
              return true;
            }
          },
          {
            test() {
              return true;
            }
          }
        ]
        tester.runRule(node, testRule)
          .then(result => {
            done();
          }).catch(err => {});
      });
      it('should reject if one rule of mutliple fails', done => {
        const node = mount(<div/>);
        const testRule = [
          {
            test() {
              return true;
            }
          },
          {
            test() {
              return false;
            }
          }
        ]
        tester.runRule(node, testRule)
          .then(result => {})
          .catch(err => {
            done();
          });
      });
      it('should run test if node matches tagName', done => {
        const node = mount(<img src='image.jpg'/>);
        const testRule = [
          {
            tagName: 'img',
            test: () => {
              return false;
            }
          },
          {
            test: () => {
              return true;
            }
          }
        ]
        tester.runRule(node, testRule)
          .then(result => {})
          .catch(err => {
            // Should fail, because the first test was run.
            done();
          });
      });
      it('should not run test if node doesn\'t match tagName', done => {
        const node = mount(<img src='image.jpg'/>);
        const testRule = [
          {
            tagName: 'div',
            test: () => {
              return false;
            }
          },
          {
            test: () => {
              return true;
            }
          }
        ]
        tester.runRule(node, testRule)
          .then(result => {
            // Should pass, because the first test wasn't run.
            done();
          })
          .catch(err => {});
      });
      it('should run test if there\'s only one test - pass', done => {
        const node = mount(<img src='image.jpg'/>);
        const testRule = [
          {
            test: () => {
              return true;
            }
          }
        ]
        tester.runRule(node, testRule)
          .then(result => {
            done();
          })
          .catch(err => {});
      });
      it('should run test if there\'s only one test - fail', done => {
        const node = mount(<img src='image.jpg'/>);
        const testRule = [
          {
            test: () => {
              return false;
            }
          }
        ]
        tester.runRule(node, testRule)
          .then(result => {})
          .catch(err => {
            done();
          });
      });
    });
    describe('Single rules', () => {
      it('should test rule', done => {
        const node = mount(<img src='image.jpg'/>);
        const testRule = {
          test: () => {
            return true;
          }
        };
        tester.runRule(node, testRule)
          .then(result => {
            done();
          })
          .catch(err => {});
      });
      it('should reject if test fails', done => {
        const node = mount(<img src='image.jpg'/>);
        const testRule = {
          test: () => {
            return false;
          }
        };
        tester.runRule(node, testRule)
          .then(result => {})
          .catch(err => {
            done();
          });
      });
      it('should test if tagName matches node', done => {
        const node = mount(<img src='image.jpg'/>);
        const testRule = {
          tagName: 'img',
          test: () => {
            return false;
          }
        };
        tester.runRule(node, testRule)
          .then(result => {})
          .catch(err => {
            done();
          });
      });
      it('should pass if test tagName doesn\'t match node', done => {
        const node = mount(<img src='image.jpg'/>);
        const testRule = {
          tagName: 'div',
          test: () => {
            return false;
          }
        };
        tester.runRule(node, testRule)
          .then(result => {
            done();
          })
          .catch(err => {});
      });
    });
  });
  describe('react-a11y examples', () => {
    describe('run all react-a11y examples', () => {
      const allRules = Object.keys(rules);
      allRules.forEach(file => {
        it(`${file} should pass`, done => {
          const test = require(`./node_modules/react-a11y/src/rules/${file}`);
          const rule = test.default;
          const { pass, fail } = test;
          const node = mount(pass[0].render(React));
          tester.runRule(node, rule)
            .then(result => {
              done();
            })
            .catch(err => {});
        });
        it(`${file} should fail`, done => {
          const test = require(`./node_modules/react-a11y/src/rules/${file}`);
          const rule = test.default;
          const { pass, fail } = test;
          const node = mount(fail[0].render(React));
          tester.runRule(node, rule)
            .then(result => {})
            .catch(err => {
              done();
            });
        });
      });
    });
  });
});
