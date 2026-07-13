import React, { useMemo, useEffect } from 'react';
import { Button, DataSet, Table } from 'choerodon-ui/pro';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { math } from 'choerodon-ui/dataset';

import { tableDataSet, intlPrompt, saveDetailApi, fetchDataApi } from './initialDs';

const PrSplitModal = props => {
  const { modal, pageData } = props;
  const { record: outerRecord, dataSet: outerDataSet } = pageData;
  const tableDs = useMemo(() => new DataSet(tableDataSet()), []);

  useEffect(() => {
    initData();
    updateModal();
  }, [tableDs]);

  const initData = async () => {
    const data = await fetchDataApi({ prLineId: outerRecord.get('prLineId') })
    if (getResponse(data)) {
      tableDs.loadData([{ ...outerRecord.toData(), ...data }])
    } else {
      modal.close();
    }
  };

  const updateModal = () => {
    if (modal) {
      modal.update({
        footer: (okBtn, cancelBtn) => [okBtn, cancelBtn],
        onOk: handleSave,
      });
    }
  };

  // 保存 / 提交
  const handleSave = async () => {
    const flag = await tableDs.validate();
    if (!flag) {
      return false;
    }
    const formData = tableDs.toData();
    const response = await saveDetailApi(formData);
    if (getResponse(response)) {
      notification.success({});
      outerDataSet.clearCachedSelected();
      outerDataSet.unSelectAll();
      outerDataSet.query();
    } else {
      return false;
    }
  };

  const handleSplit = record => {
    const { maxLineNum, maxAmount, lineNum, prLineId, displayLineNum, maxSrmLineNum } = record.get(['maxLineNum', 'maxAmount', 'lineNum', 'prLineId', 'displayLineNum', 'maxSrmLineNum']);
    const allLineAmount = tableDs.reduce((pre, cur) => +math.plus(pre, !cur.get('prLineId') ? cur.get('taxIncludedLineAmount') || 0 : 0), 0);
    const remainAmount = math.toFixed(math.minus(maxAmount, allLineAmount), 2);
    const amountFlag = math.lte(remainAmount, 0);
    if (!!amountFlag) {
      notification.warning({ message: '已无可拆金额，不能再进行拆分' })
      return false;
    }
    const lastRecord = tableDs.records[tableDs.length - 1];
    const attributeLongtext16 = !lastRecord.get('prLineId') ? `${lineNum}-${+lastRecord.get('attributeLongtext16').split('-')?.[1] + 1}` : `${lineNum}-${+maxLineNum + 1}`;
    const srmLineNum = !lastRecord.get('prLineId') ? +lastRecord.get('lineNum') + 1 : +maxSrmLineNum + 1;
    const data = {
      ...record.toJSONData(),
      maxAmount: null,
      objectVersionNumber: null,
      prLineId: null,
      attributeVarchar9: 1,
      attributeLongtext16,
      attributeLongtext17: prLineId,
      attributeVarchar4: displayLineNum,
      lineNum: srmLineNum,
      displayLineNum: srmLineNum,
    };
    tableDs.create(data, tableDs.length);
  };

  const handleDelete = record => {
    tableDs.delete([record]);
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'operation',
          renderer: ({ record }) => {
            return (
              <>
                {!!record.get('prLineId') && (
                  <Button funcType={FuncType.link} onClick={() => handleSplit(record)}>
                    {intl.get(`${intlPrompt}.view.split`).d('拆分')}
                  </Button>
                )}
                {!record.get('prLineId') && (
                  <Button funcType={FuncType.link} onClick={() => handleDelete(record)}>
                    {intl.get(`${intlPrompt}.view.delete`).d('删除')}
                  </Button>
                )}
              </>
            );
          },
        },
        { name: 'attributeLongtext16', renderer: ({ record, value }) => <span>{!record.get('prLineId') ? value : record.get('lineNum')}</span> },
        { name: 'attributeVarchar9' },
        // { name: 'prLineStatusCodeMeaning' },
        { name: 'itemCodeLov', editor: (record) => !record.get('prLineId') },
        { name: 'itemName' },
        { name: 'categoryLov', editor: (record) => !record.get('prLineId') },
        { name: 'uomNameLov', editor: (record) => !record.get('prLineId') },
        { name: 'attributeVarchar17Lov', editor: (record) => !record.get('prLineId') },
        { name: 'quantity', editor: (record) => !record.get('prLineId') },
        { name: 'taxIncludedUnitPrice', editor: (record) => !record.get('prLineId') },
        { name: 'taxIncludedLineAmount' },
        // { name: 'localCurrencyTaxUnit' },
        // { name: 'localCurrencyTaxSum' },
        // { name: 'localCurrencyNoTaxUnit' },
        // { name: 'localCurrencyNoTaxSum' },
        { name: 'taxRateLov', editor: (record) => !record.get('prLineId') },
        // { name: 'attributeVarchar4' },
        { name: 'maxAmount' },
        { name: 'attributeVarchar20' },
        { name: 'attributeVarchar19' },
        { name: 'attributeVarchar13' },
        { name: 'attributeVarchar14' },
        { name: 'attributeVarchar18' },
        { name: 'attributeVarchar28' },
        { name: 'itemModel', editor: (record) => !record.get('prLineId') },
        { name: 'itemSpecs', editor: (record) => !record.get('prLineId') },
        { name: 'attributeVarchar15' },
        { name: 'attributeVarchar16' },
        // { name: 'attributeVarchar30' },
        // { name: 'neededDate' },
        // { name: 'prRequestedName' },
        // { name: 'purchaseAgentName' },
        // { name: 'executorName' },
        { name: 'receiveAddress' },
        { name: 'receiveContactName' },
        { name: 'receiveTelNum' },
        // { name: 'invOrganizationName' },
        { name: 'currencyCode' },
        // { name: 'attributeVarchar35' },
        // { name: 'attributeVarchar36' },
        // { name: 'attributeVarchar21' },
        // { name: 'attributeVarchar5' },
        // { name: 'unitPriceBatch' },
        // { name: 'projectNum' },
        // { name: 'projectName' },
      ].filter(Boolean) as ColumnProps[],
    [tableDs]
  );

  return (
    <>
      <Table dataSet={tableDs} columns={columns} customizedCode="customized" />
    </>
  );
};

export default React.memo(
  formatterCollections({ code: [intlPrompt, 'hzero.common'] })(PrSplitModal)
);
