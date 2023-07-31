import fs from 'fs';
import path from 'path';

import { transformAsync } from '@babel/core';

import linaria from '../index';

describe('default', () => {
  it('default', async () => {
    const code = fs.readFileSync(
      path.resolve(__dirname, './fixtures', '0.default.jsx'),
      'utf8'
    );
    const res = await transformAsync(code, {
      filename: __filename,
      presets: ['@babel/preset-env', '@babel/preset-react', linaria],
    });
    expect(res?.code).toMatchSnapshot();
  });
});
