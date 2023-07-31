import { css } from '@linaria/core';
import { modularScale, hiDPI } from 'polished';

const header = css`
  text-transform: uppercase;
  color: red;
  font-size: ${modularScale(2)};

  ${hiDPI(1.5)} {
    font-size: ${modularScale(2.5)};
  }
`;
