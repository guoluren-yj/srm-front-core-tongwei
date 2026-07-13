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

const ItemTable = function ItemTable() {
  const { customizeTable, itemTableDs } = useContext(Store);
  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
    {
      name: 'itemLov',
      width: 150,
    },
    {
      name: 'itemName',
      width: 150,
    },
    {
      name: 'categoryId',
      width: 300,
    },
    {
      name: 'uomId',
      width: 150,
    },
    {
      name: 'quantity',
      width: 150,
    },
    {
      name: 'modelSpecs',
      width: 150,
    },
  ];

  return customizeTable(
    {
      code: 'SIEC.MOULD_PLATFORM.DETAIL.LIST',
      dataSet: itemTableDs,
    },
    <Table
      dataSet={itemTableDs}
      selectionMode="none"
      columns={columns}
      style={{ maxHeight: '435px' }}
    />
  );
};

export default ItemTable;
