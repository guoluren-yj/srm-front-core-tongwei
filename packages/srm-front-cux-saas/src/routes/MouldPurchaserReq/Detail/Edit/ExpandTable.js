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
import { Store } from '../Store/store';

const LinkTable = function LinkTable() {
  const { customizeTable, linkTableDs, linkUnitCode } = useContext(Store);
  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
  ];

  const deleteLine = () => {
    const { selected } = linkTableDs;
    const unSelectedLines = [];
    linkTableDs.delete(selected, false);
    const selectRecordId = selected.map(ele => ele.id);
    linkTableDs.forEach(record => {
      if (!selectRecordId.includes(record.id)) {
        unSelectedLines.push(record);
      }
    });
    linkTableDs.loadData(unSelectedLines);
  };

  return customizeTable(
    {
      code: linkUnitCode,
      dataSet: linkTableDs,
    },
    <Table
      style={{ maxHeight: '450px' }}
      dataSet={linkTableDs}
      buttons={['add', ['delete', { icon: 'delete_sweep', onClick: () => deleteLine('expand') }]]}
      columns={columns}
    />
  );
};

export default LinkTable;
