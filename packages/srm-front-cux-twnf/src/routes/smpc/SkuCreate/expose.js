import React from 'react';
import { Expose } from 'utils/remote';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';
import uuidv4 from 'uuid/v4';
import qs from 'querystring';

const BatchBtn = observer(props => {
  const { dataSet, children, disabled, dynamicDisbale = e => e, ...others } = props;
  const _disabled = disabled || dynamicDisbale(dataSet.selected);
  return (
    <Button funcType="flat" color="primary" disabled={_disabled} {...others}>
      {children}
    </Button>
  );
});

const handleCopy = tableDs => async () => {
  // 复制
  const agreementLineId = tableDs.selected?.[0]?.get('agreementLineId');
  const newData = {
    ...(tableDs.selected?.[0]?.toData() || {}),
    skuPriceStatus: 'NEW',
    skuPriceStatusMeaning: null,
    updateFlag: 1,
    _uuid: uuidv4(),
    agreementLineId: null,
    attributeVarchar11: agreementLineId,
    skuId: null,
    lineNum: null,
  };
  tableDs.create(newData, 0);
};

export default new Expose({
  process: {
    PRICE_INFO_BTNS: (btns, otherProps) => {
      const { tableDs } = otherProps || {};
      // 处理勾选
      tableDs.forEach(r => {
        if (r.get('skuPriceStatus') === 'VALID') {
          r.selectable = true;
        }
      });
      // 所属组织引用价格的也可编辑
      tableDs.getField('skuSalesUnits').set('dynamicProps', { readOnly: () => false });

      const copyBtn = (
        <BatchBtn
          dataSet={tableDs}
          dynamicDisbale={data => {
            return data.length !== 1;
          }}
          onClick={handleCopy(tableDs)}
        >
          复制
        </BatchBtn>
      );
      return btns?.[1] ? [btns[1], copyBtn] : [];
    },
  },
  events: {
    cuxSkuInfoInitEvent: eventProps => {
      const { remoteThis } = eventProps;
      const {
        handleQuickEdit,
        props: { tableDs, location },
      } = remoteThis || {};
      const { skuId, showQuickEditFlag } = qs.parse(location?.search?.substr(1)) || {};
      if (
        +showQuickEditFlag === 1 &&
        skuId &&
        tableDs
      ) {
        tableDs.forEach(record => {
          if (record.get('skuId') === skuId) {
            handleQuickEdit({ name: 'priceInfo', record, isEdit: true });
          }
        })
      }
    },
  },
});
