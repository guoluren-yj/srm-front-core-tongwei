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
import { Store } from '../store';

const LinkTable = function LinkTable() {
  const { customizeTable, linkTableDs } = useContext(Store);
  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
  ];

  return customizeTable(
    {
      code: 'SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
      dataSet: linkTableDs,
    },
    <Table
      style={{ maxHeight: '435px' }}
      dataSet={linkTableDs}
      selectionMode="none"
      columns={columns}
    />
  );
};

export default LinkTable;
