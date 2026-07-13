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
      code: 'SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
      dataSet: linkTableDs,
    },
    <Table
      style={{ maxHeight: '435px' }}
      dataSet={linkTableDs}
      buttons={['add', ['delete', { onClick: () => deleteLine('expand'), icon: 'delete_sweep' }]]}
      columns={columns}
    />
  );
};

export default LinkTable;
