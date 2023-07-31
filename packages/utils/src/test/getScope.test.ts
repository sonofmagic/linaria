import { traverse, parse } from '@babel/core';

import { getScope } from '../getScope';

describe('getScope', () => {
  it('case 0', () => {
    const result = parse(
      `
      let a = 0
      {
        let b = 1
        function c(){
          console.log(a)
        }
      }
    `,
      {
        filename: __filename,
      }
    );
    traverse(result, {
      Identifier: {
        enter(p) {
          const s = getScope(p);
          console.log(s);
        },
      },
      FunctionDeclaration: {
        enter(p) {
          const s = getScope(p);
          console.log(s);
        },
      },
    });
  });
});
