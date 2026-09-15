import React, { useContext, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Table, Modal } from 'choerodon-ui/pro';
import { isEmpty, noop } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { deleteNonGeneralVariable } from '@/services/sourceTemplateWorkbechService';

import Store from '../store/index';

const NonGeneralVariable = (props) => {
  const { templateId = '', initQuery = noop, setPageLoading = noop } = props;
  const {
    commonDs: { nonGeneralVariableDs },
  } = useContext(Store);

  // 新建（无 templateId）：仅展示默认列表；编辑（有 templateId）：可增删改存
  const editorFlag = !!(templateId && templateId !== 'null');

  useEffect(() => {
    nonGeneralVariableDs?.setQueryParameter('templateId', templateId);
    // 新建：GET 获取默认非通用变量列表；编辑：数据由 initQuery 用 detail 的 variableList 直接 loadData
    if (!editorFlag) {
      nonGeneralVariableDs?.query();
    }
  }, [templateId]);

  // table columns
  const columns = useMemo(
    () => [
      { name: 'sequence', width: 100 },
      { name: 'variableId', editor: editorFlag },
      { name: 'variableName' },
    ],
    [editorFlag]
  );

  // 保存：POST ?templateId=xxx，成功后重新查询以刷新服务端主键
  const handleSave = async () => {
    try {
      const saveRes = await nonGeneralVariableDs.submit();
      if (!saveRes || saveRes === false || saveRes.failed) {
        return;
      }
      notification.success();
      initQuery().finally(() => setPageLoading(false));
    } catch (error) {
      return false;
    }
  };

  // 删除：新增行本地移除，线上行逐条 DELETE ?templateVariableId=xxx
  const handleDelete = () => {
    const selectedRecords = nonGeneralVariableDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('templateVariableId')) || [];

    // 删除新增（未落库）数据
    nonGeneralVariableDs.remove(addRecords);

    if (isEmpty(oldRecords)) {
      return;
    }

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
      onOk: async () => {
        setPageLoading(true);
        try {
          // 批量删除：templateVariableId 逗号拼接
          const templateVariableId = oldRecords
            .map((r) => r.get('templateVariableId'))
            .join(',');
          await deleteNonGeneralVariable({ templateVariableId });
          notification.success();
        } catch (error) {
          // 删除失败：刷新以与服务端同步，避免数据不一致
        }
        initQuery().finally(() => setPageLoading(false));
      },
    });
  };

  // table buttons
  const buttons = useMemo(() => {
    if (!editorFlag) return [];
    return [
      'add',
      ['delete', { onClick: handleDelete }],
      ['save', { onClick: handleSave }],
    ];
  }, [editorFlag, handleDelete, handleSave]);

  return (
    <Table
      dataSet={nonGeneralVariableDs}
      columns={columns}
      buttons={buttons}
      // 固定最大高度，超出部分表格内部滚动；底部留白避免贴边
      style={{ height: 420, marginBottom: 48 }}
    />
  );
};

export default observer(NonGeneralVariable);
