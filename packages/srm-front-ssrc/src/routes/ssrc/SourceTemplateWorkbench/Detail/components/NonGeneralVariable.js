import React, { useContext, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Table } from 'choerodon-ui/pro';

import Store from '../store/index';

// 非通用变量（明细只读展示，无编辑/保存/删除）
const NonGeneralVariable = () => {
  const {
    commonDs: { nonGeneralVariableDs },
  } = useContext(Store);

  const columns = useMemo(
    () => [
      { name: 'sequence', width: 100 },
      { name: 'variableCode' },
      { name: 'variableName' },
    ],
    []
  );

  return (
    <Table
      dataSet={nonGeneralVariableDs}
      columns={columns}
      // 固定最大高度，超出部分表格内部滚动；底部留白避免贴边
      style={{ height: 420, marginBottom: 48 }}
    />
  );
};

export default observer(NonGeneralVariable);
