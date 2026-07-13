import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import { Expose } from 'utils/remote';
import intl from 'utils/intl';

export default new Expose({
  render: {
    SSRC_CHECK_PRICE_RENDER_ITEM_HEADER_MIDDLE: (props) => {
      const { children, renderProps } = props || {};
      const { item, bidFlag } = renderProps || {};

      if (!bidFlag && item && !isNil(item.cuxItemSourceType) && item.cuxItemSourceType !== '') {
        const text = `${intl.get('sscux.ssrc.view.checkPrice.itemLineList.twnf.cuxSouceType').d('寻源方式')}：${item.cuxItemSourceType}`;
        return (
          <>
            {children}
            <Tooltip title={text}>
              <span
                style={{
                  margin: '0 4px',
                  maxWidth: '120px',
                  minWidth: '100px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis'
                }}
              >
                {text}
              </span>
            </Tooltip>
          </>
        );
      };
      return children;
    },
  },
});
