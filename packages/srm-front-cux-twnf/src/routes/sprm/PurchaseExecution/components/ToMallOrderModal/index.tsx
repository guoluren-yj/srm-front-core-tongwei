import React, { useMemo, useCallback, useEffect } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { tableDataSet, intlPrompt, saveDetailApi } from './initialDs';

const ToMallOrderModal = (props) => {
  const { modal, pageData } = props;
  const { selected, dataSet: outerDataSet } = pageData;
  const tableDs = useMemo(() => new DataSet(tableDataSet()), []);

  useEffect(() => {
    initData();
    updateModal();
  }, [tableDs]);

  const initData = () => {
    const outData = selected.map(r => r.toData());
    const newData = outData.map(d => ({
      ...d,
      skuId: d.productId,
      skuCode: d.productNum,
      skuName: d.productName,
      originalQuantity: d.quantity,
      purOrganizationId: d.purchaseOrgId,
      sourcePrLineId: d.prLineId,
      sourcePrNum: `${d.prNum}-${d.displayLineNum}`,
    }))
    tableDs.loadData(newData);
  };

  const updateModal = () => {
    if(modal) {
      modal.update({
        footer: (okBtn, cancelBtn) => [okBtn, cancelBtn],
        onOk: handleSave,
      });
    }
  };

  // 保存 / 提交
  const handleSave =
    async () => {
      const flag = await tableDs.validate();
      if (!flag) {
        return false;
      }
      const formData = tableDs.toJSONData();
      saveDetailApi(formData)
        .then(response => {
          if (getResponse(response)) {
            notification.success({});
            outerDataSet.clearCachedSelected();
            outerDataSet.unSelectAll();
            outerDataSet.query();
          }
        });
    }

  const columns = useMemo(
    () => [
      { name: 'skuCode' },
      { name: 'skuName' },
      { name: 'quantity', editor: true },
      { name: 'neededDate' },
      { name: 'unitPrice' },
      { name: 'taxCode' },
      { name: 'uomName' },
      { name: 'currencyCode' },
      { name: 'unitLov', editor: (record) => record.get('prSourcePlatform') === 'ERP' },
      { name: 'addressLov', editor: (record) => record.get('prSourcePlatform') === 'ERP' },
      { name: 'receiveContactName' },
      { name: 'receiveTelNum' },
      { name: 'receiveAddress' },
      { name: 'attributeLongtext8Meaning' },
      {
        name: 'attributeDecimal20',
        editor: true, // 目录化
      },
      { name: 'attributeLongtext7Meaning' },
      {
        name: 'attributeDecimal21',
        editor: true, // 目录化
      },
    ].filter(Boolean),
    [tableDs]
  );

  return (
    <>
      <Table dataSet={tableDs} columns={columns} customizedCode="customized" />
    </>
  );
};

export default React.memo(
  formatterCollections({ code: [intlPrompt, 'hzero.common'] })(ToMallOrderModal)
);
