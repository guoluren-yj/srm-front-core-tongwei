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

const ItemTable = function ItemTable() {
  const { customizeTable, itemTableDs, itemUnitCode } = useContext(Store);
  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
    {
      name: 'itemId',
      width: 150,
      editor: true,
    },
    {
      name: 'itemName',
      width: 150,
      editor: true,
    },
    {
      name: 'categoryId',
      width: 300,
      editor: true,
    },
    {
      name: 'uomId',
      width: 150,
      editor: true,
    },
    // {
    //   name: 'quantity',
    //   width: 150,
    //   editor: true,
    // },
    // {
    //   name: 'modelSpecs',
    //   width: 150,
    //   editor: true,
    // },
  ];

  const deleteLine = () => {
    const { selected } = itemTableDs;
    const unSelectedLines = [];
    itemTableDs.delete(selected, false);
    const selectRecordId = selected.map(ele => ele.id);
    itemTableDs.forEach(record => {
      if (!selectRecordId.includes(record.id)) {
        unSelectedLines.push(record);
      }
    });
    itemTableDs.loadData(unSelectedLines);
  };

  return customizeTable(
    {
      code: itemUnitCode,
      dataSet: itemTableDs,
    },
    <Table
      dataSet={itemTableDs}
      style={{ maxHeight: '450px' }}
      buttons={['add', ['delete', { icon: 'delete_sweep', onClick: () => deleteLine('expand') }]]}
      columns={columns}
    />
  );
};

export default ItemTable;
