import React, { useMemo, useEffect } from 'react';
import { Button, DataSet, Table, Modal } from 'choerodon-ui/pro';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { math } from 'choerodon-ui/dataset';

import { tableDataSet, intlPrompt, saveDetailApi, fetchDataApi, deleteSplitApi } from './initialDs';

const EditableStatus = ['UNASSIGNED', 'ASSIGNED']; // 待分配、已分配

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
    const res = getResponse(data);
    if (res) {
      const { splitPrLineList = [], ...rest } = res || {};
      // 首行为勾选的主行，splitPrLineList 为历史拆分行
      tableDs.loadData([
        { ...outerRecord.toData(), ...rest, isMainLine: true },
        ...(splitPrLineList || []),
      ])
    } else {
      modal.close();
    }
  };

  // 主行：只读，仅提供「拆分」操作
  const isMainLine = record => !!record.get('isMainLine');

  // 拆分行：待分配/已分配允许编辑和删除；新增未保存行始终可操作
  const canOperate = record => {
    if (isMainLine(record)) return false;
    const status = record.get('executionStatusCode');
    if (status) return EditableStatus.includes(status);
    return !record.get('prLineId');
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
      // 表格内已有红字提示，这里再汇总弹一条，避免用户漏看
      const errorMessages = tableDs
        .getValidationErrors()
        .flatMap(({ errors: fieldErrors }) =>
          fieldErrors.flatMap(({ errors }) => errors.map(error => error.validationMessage))
        )
        .filter(Boolean);
      const message = Array.from(new Set(errorMessages)).join('；');
      notification.error({
        message: message || intl.get(`${intlPrompt}.message.validateFailed`).d('数据校验未通过，请检查后重试'),
      });
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
      // 新增拆分行含税金额默认 = 主行含税金额 - 所有拆分行含税金额（即剩余可拆金额），
      // 覆盖 toJSONData 从主行带出的原值；后续修改数量/单价时仍会按 数量 × 单价 重算
      taxIncludedLineAmount: Number(remainAmount),
    };
    tableDs.create(data, tableDs.length);
  };

  const handleDelete = record => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: intl.get(`${intlPrompt}.message.deleteConfirm`).d('确认删除该行？'),
      onOk: async () => {
        // 新增未保存的拆分行，直接本地移除
        if (!record.get('prLineId')) {
          tableDs.remove([record], true);
          return;
        }
        const response = await deleteSplitApi({ ...(record.toJSONData() || {}) });
        if (getResponse(response)) {
          notification.success({});
          // 删除成功后物理移除该行，不重新查询，避免重置未保存的修改
          tableDs.remove([record], true);
        }
      },
    });
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'operation',
          renderer: ({ record }) => {
            return (
              <>
                {isMainLine(record) && EditableStatus.includes(record.get('executionStatusCode')) && (
                  <Button funcType={FuncType.link} onClick={() => handleSplit(record)}>
                    {intl.get(`${intlPrompt}.view.split`).d('拆分')}
                  </Button>
                )}
                {canOperate(record) && (
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
        { name: 'executionStatusMeaning'},
        // { name: 'prLineStatusCodeMeaning' },
        { name: 'itemCodeLov', editor: (record) => canOperate(record) },
        { name: 'itemName' },
        { name: 'categoryLov', editor: (record) => canOperate(record) },
        { name: 'uomNameLov', editor: (record) => canOperate(record) },
        { name: 'attributeVarchar17Lov', editor: (record) => canOperate(record) },
        { name: 'quantity', editor: (record) => canOperate(record) },
        { name: 'taxIncludedUnitPrice', editor: (record) => canOperate(record) },
        { name: 'taxIncludedLineAmount' },
        // { name: 'localCurrencyTaxUnit' },
        // { name: 'localCurrencyTaxSum' },
        // { name: 'localCurrencyNoTaxUnit' },
        // { name: 'localCurrencyNoTaxSum' },
        { name: 'taxRateLov', editor: (record) => canOperate(record) },
        // { name: 'attributeVarchar4' },
        { name: 'maxAmount' },
        { name: 'attributeVarchar20' },
        { name: 'attributeVarchar19' },
        { name: 'attributeVarchar13' },
        { name: 'attributeVarchar14' },
        { name: 'attributeVarchar18' },
        { name: 'attributeVarchar28' },
        { name: 'itemModel', editor: (record) => canOperate(record) },
        { name: 'itemSpecs', editor: (record) => canOperate(record) },
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
