import React from 'react';
import { Expose } from 'utils/remote';
import intl from 'utils/intl';
import QueryField from '../components/QueryField';

export default new Expose({
  process: {
    SMPC_SKU_WORKBENCH_SUP_PROCESS_SEARCHBAR_LEFT: (_, otherProps) => {
      const { tableDs, remoteThis } = otherProps || {};
      return {
        render: () => (
          <QueryField
            name="skuName"
            dataSet={tableDs}
            onRef={(ref) => {
              remoteThis.queryRef = ref;
            }}
            placeholder={intl.get('smpc.product.twnf.queryMsg.skuName').d('请输入商品名称查询')}
          />
        ),
      };
    },
  },
});
