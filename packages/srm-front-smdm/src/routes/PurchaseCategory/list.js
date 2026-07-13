/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-06-03 15:24:41
 * @LastEditors: yanglin
 * @LastEditTime: 2024-01-24 16:38:15
 */
import React, { PureComponent } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import Table from '@/components/VirtualTable';
import ListDS from './listDS';

@WithCustomize({
  unitCode: ['SMDM.PURCHASE_CATEGORY_LIST.GRID'],
})
export default class ListTable extends PureComponent {
  ListDS = new DataSet({
    ...ListDS(),
  });

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      customizeVTable,
      loading,
      data,
      columns,
      expandedRowKeys = [],
      onExpandChange,
      sortType,
      sortColumn,
      rowSelection,
      onSortColumn,
    } = this.props;
    return customizeVTable(
      {
        code: 'SMDM.PURCHASE_CATEGORY_LIST.GRID',
        dataSet: this.ListDS,
      },
      <Table
        isTree
        bordered
        rowKey="categoryId"
        loading={loading}
        data={data}
        columns={columns}
        height={600}
        sortType={sortType}
        sortColumn={sortColumn}
        onSortColumn={onSortColumn}
        expandedRowKeys={expandedRowKeys}
        pagination={false}
        rowSelection={rowSelection}
        onExpandChange={onExpandChange}
      />
    );
  }
}
