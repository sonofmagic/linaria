import { parse } from '@babel/core';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

import dynamic from '../../options/dynamic-import-noop';

describe('dynamic-import-noop', () => {
  it('case 0', () => {
    const result = parse(`import('aaa')`, {
      filename: __filename,
    });
    // const s = dynamic({ types });
    traverse(result, {
      Import(path) {
        const noop = t.arrowFunctionExpression([], t.identifier('undefined'));

        path.parentPath.replaceWith(
          t.objectExpression([
            t.objectProperty(t.identifier('then'), noop),
            t.objectProperty(t.identifier('catch'), noop),
          ])
        );
      },
    });

    result && expect(generate(result).code).toMatchSnapshot();
  });
});
