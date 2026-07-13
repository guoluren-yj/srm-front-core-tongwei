import React from 'react';
import { DataSet, Button, Table } from 'choerodon-ui/pro';

import c7nModal from '@/utils/c7nModal';
import intl from 'utils/intl';

export default function openCompareModal(value) {
  const { productCompareAssignList = [] } = value;
  const fields = [
    { name: 'productName', label: intl.get('smodr.orderDetail.model.skuName').d('商品名称') },
    { name: 'productCode', label: intl.get('smodr.orderDetail.model.skuCode').d('商品编码') },
    { name: 'showSupplierName', label: intl.get('smodr.orderDetail.model.supplierCompanyName').d('供应商') },
    {
      name: 'type',
      label: intl.get('smodr.orderDetail.model.sourceType').d('来源类型'),
      renderer: ({ value: val }) => (
        <span>
          {val === 2
            ? intl.get('smodr.orderDetail.model.termOfSale').d('同款推荐')
            : intl.get('smodr.orderDetail.model.editMode').d('手工添加')}
        </span>
      ),
    },
    { name: 'price', label: intl.get('smodr.orderDetail.model.price').d('单价'), type: 'number' },
  ];
  const tableDs = new DataSet({
    selection: false,
    paging: false,
    fields,
  });
  tableDs.loadData(productCompareAssignList);
  const modal = c7nModal({
    title: intl.get('smodr.orderDetail.model.competitive').d('比价单'),
    children: (
      <>
        <Table
          dataSet={tableDs}
          columns={fields}
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          customizedCode='APPLY_WORKBENCH.COMPARE_ORDER'
        />
      </>
    ),
    style: { width: 742 },
    footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.orderDetail.model.close').d('关闭')}</Button>,
  });
  return modal;
}