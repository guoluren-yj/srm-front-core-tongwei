import React from 'react';
import intl from 'utils/intl';

import Style from './index.less';

const CommonLevel = (props) => {
  const { title = intl.get('hzero.common.button.title').d('标题'), ...otherProps } = props || {};
  return (
    <div className={Style['ssrc-top-level-container']} {...otherProps}>
      <div className={Style['ssrc-top-level-content']}>
        <span className={Style['ssrc-top-level-title']}>{title}</span>
      </div>
    </div>
  );
};

export default CommonLevel;