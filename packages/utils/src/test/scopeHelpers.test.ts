import { traverse, parse } from '@babel/core';
import generate from '@babel/generator';

import {
  applyAction,
  dereference,
  findActionForNode,
  mutate,
  reference,
  referenceAll,
  removeWithRelated,
} from '../scopeHelpers';

function LALALA(a: unknown): a is string {
  return typeof a === 'string';
}

const a: unknown = '1';

if (LALALA(a)) {
  console.log(a);
}

const removeWithRelatedTestCase = `
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.__linariaPreval = void 0;
var _polished = require("polished");
const _exp = /*#__PURE__*/() => (0, _polished.modularScale)(2);
const _exp2 = /*#__PURE__*/() => (0, _polished.hiDPI)(1.5);
const _exp3 = /*#__PURE__*/() => (0, _polished.modularScale)(2.5);
const header = "hnscg4s";
const __linariaPreval = {
  _exp: _exp,
  _exp2: _exp2,
  _exp3: _exp3
};
exports.__linariaPreval = __linariaPreval;

`;
describe('scopeHelpers', () => {
  // 无法理解
  it('removeWithRelated case 0', () => {
    const ast = parse(removeWithRelatedTestCase, {
      filename: __filename,
    });
    traverse(ast, {
      Identifier: {
        enter(p) {
          if (p.node.name === '__linariaPreval') {
            removeWithRelated([p]);
          }
        },
      },
    });
    expect(generate(ast!).code).toMatchSnapshot();
  });

  it('removeWithRelated case 1', () => {
    const ast = parse(removeWithRelatedTestCase, {
      filename: __filename,
    });
    let count = 0;
    traverse(ast, {
      Identifier: {
        enter(p) {
          if (p.node.name === '__linariaPreval') {
            count += 1;
            count === 3 && removeWithRelated([p]);
          }
        },
      },
    });
    expect(generate(ast!).code).toMatchSnapshot();
  });

  // 似乎不会向上寻找
  it('removeWithRelated case 2', () => {
    const ast = parse(removeWithRelatedTestCase, {
      filename: __filename,
    });
    let count = 0;
    traverse(ast, {
      Identifier: {
        enter(p) {
          if (p.node.name === '__linariaPreval') {
            count += 1;
            count === 1 && removeWithRelated([p]);
          }
        },
      },
    });
    expect(generate(ast!).code).toMatchSnapshot();
  });
  // 这个 case 找到了下方的引用去除了，从而避免了报错
  it('removeWithRelated case 3', () => {
    const ast = parse(removeWithRelatedTestCase, {
      filename: __filename,
    });
    let count = 0;
    traverse(ast, {
      Identifier: {
        enter(p) {
          if (p.node.name === '__linariaPreval') {
            count += 1;
            count === 2 && removeWithRelated([p]);
          }
        },
      },
    });
    expect(generate(ast!).code).toMatchSnapshot();
  });
});
