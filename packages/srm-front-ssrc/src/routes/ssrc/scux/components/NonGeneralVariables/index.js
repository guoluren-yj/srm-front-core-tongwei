import React, { useMemo, useImperativeHandle, useRef, useEffect } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { nonGeneralVariablesDataSet } from './storeDs';

const Index = (props) => {
  const { editorFlag = false, parentRef = useRef(), rfxHeaderId } = props;

  const nonGeneralVariablesDs = useDataSet(() => nonGeneralVariablesDataSet({ editorFlag }), [
    editorFlag,
  ]);

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
  const handleBatchDeleteTableData = () => {
    const selectedRecords = nonGeneralVariablesDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('variableId')) || [];

    // 删除新增数据
    if (!isEmpty(addRecords)) {
      nonGeneralVariablesDs.remove(addRecords);
    }

    if (!isEmpty(oldRecords)) {
      // 删除线上数据
      nonGeneralVariablesDs.delete(oldRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };

  // save data
  const handleSaveTableData = () => {
    nonGeneralVariablesDs.submit().then(() => {
      nonGeneralVariablesDs.query();
    });
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
    <Table dataSet={nonGeneralVariablesDs} columns={columns} buttons={editorFlag ? buttons : []} />
  );
};

export default formatterCollections({
  code: ['scux.nonGeneralVariables'],
})(Index);
