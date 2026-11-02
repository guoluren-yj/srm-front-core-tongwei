import React, { useMemo, useImperativeHandle, useRef, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { nonGeneralVariablesDataSet, forceSubmitNonGeneralVariables } from './storeDs';

const Index = (props) => {
  // queryAction：查询入参 action，由引用方按需传入（不传则查询不带该入参）
  const { editorFlag = false, parentRef = useRef(), rfxHeaderId, queryAction } = props;

  const nonGeneralVariablesDs = useDataSet(
    () => nonGeneralVariablesDataSet({ editorFlag, queryAction }),
    [editorFlag, queryAction]
  );

  // 暴露子组件的api给父组件使用
  useImperativeHandle(parentRef, () => ({
    nonGeneralVariablesDs,
  }));

  useEffect(() => {
    if (rfxHeaderId) {
      nonGeneralVariablesDs.setQueryParameter('rfxHeaderId', rfxHeaderId);
      nonGeneralVariablesDs.query();
    }
  }, [rfxHeaderId]);

  const columns = useMemo(() => {
    return [
      {
        name: 'sequence',
        width: 80,
      },
      {
        name: 'variableId',
        width: 120,
        editor: editorFlag,
      },
      {
        name: 'variableName',
        width: 160,
      },
      {
        name: 'variableValue',
        editor: editorFlag,
      },
    ];
  }, [editorFlag]);

  // batch delete
  // 批量删除成功后刷新表格，保证展示数据与服务端一致；
  // 但若其他行还有未保存的新增/修改，不能整表刷新，否则会把用户已录入的值重置
  const handleBatchDeleteTableData = async () => {
    const selectedRecords = nonGeneralVariablesDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.status !== 'add' && r.get('variableId')) || [];

    // 删除前先记录：除被选中行外是否还有未保存的数据（新增行或改过值的行）
    const hasOtherUnsavedChanges = (nonGeneralVariablesDs?.records || []).some(
      (record) =>
        !selectedRecords.includes(record) && (record.status === 'add' || record.dirty)
    );

    // 删除新增（未落库）数据
    if (!isEmpty(addRecords)) {
      nonGeneralVariablesDs.remove(addRecords);
    }

    if (isEmpty(oldRecords)) {
      return;
    }

    try {
      const deleteRes = await nonGeneralVariablesDs.delete(oldRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
      // 取消删除时 delete 无返回值（未发生任何删除），不刷新
      if (deleteRes === undefined || deleteRes === false) {
        return;
      }
      // 被删行本地已移除；存在其他未保存修改时跳过整表刷新，保留用户已录入的值
      if (!hasOtherUnsavedChanges) {
        nonGeneralVariablesDs.query();
      }
    } catch (error) {
      // 删除请求异常时本地行已移除，仅在没有其他未保存修改时刷新以与服务端同步
      if (!hasOtherUnsavedChanges) {
        nonGeneralVariablesDs.query();
      }
    }
  };

  // save data
  // 表格单独【保存】与头部大保存一致：不做必填校验，临时放开必填把当前录入强制提交后端，成功与否以后端返回为准；
  // 成功才刷新，避免把未保存的新增行冲掉（后端已同步去掉必填校验）
  const handleSaveTableData = async () => {
    try {
      const saveRes = await forceSubmitNonGeneralVariables(nonGeneralVariablesDs);
      if (!saveRes || saveRes === false || saveRes.failed) {
        return;
      }
      nonGeneralVariablesDs.query();
    } catch (error) {
      return false;
    }
  };

  const buttons = useMemo(() => {
    return [
      'add',
      [
        'delete',
        {
          wait: 1200,
          onClick: handleBatchDeleteTableData,
        },
      ],
      [
        'save',
        {
          wait: 1200,
          onClick: handleSaveTableData,
        },
      ],
    ];
  }, [handleBatchDeleteTableData, handleSaveTableData]);

  return (
    <Table
      dataSet={nonGeneralVariablesDs}
      columns={columns}
      buttons={editorFlag ? buttons : []}
      // 固定高度约展示10条数据，超出部分表格内部滚动
      style={{ height: 420 }}
    />
  );
};

export default formatterCollections({
  code: ['scux.nonGeneralVariables'],
})(Index);
