/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
// import intl from 'utils/intl';
// import { observer } from 'mobx-react-lite';
import { Store } from '../Store/store';

const LinkTable = function LinkTable() {
  const { customizeTable, linkTableDs, linkUnitCode } = useContext(Store);
  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
  ];
  return customizeTable(
    {
      code: linkUnitCode,
      dataSet: linkTableDs,
    },
    <Table
      style={{ maxHeight: '450px' }}
      dataSet={linkTableDs}
      selectionMode="none"
      columns={columns}
    />
  );
};

export default LinkTable;
