import React from 'react';
import { Modal, Table, DataSet } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { documentDetailDS } from './ds';

export const openDocumentDetailModal = (dipRequestNum: string) => {
  const tableDs = new DataSet(documentDetailDS(dipRequestNum));

  const columns = [
    { name: 'bidNum', width: 150 },
    { name: 'bidLineItemNum', width: 80 },
    { name: 'bidStatus', width: 100 },
    { name: 'amount', width: 120 },
    { name: 'creationDate', width: 150 },
    { name: 'createdByName', width: 120 },
  ];

  Modal.open({
    key: Modal.key(),
    title: intl.get('scux.purchaseMethodChange.view.documentDetail').d('单据详情列表'),
    style: { width: 800 },
    drawer: true,
    children: (
      <Table
        dataSet={tableDs}
        columns={columns}
        customizedCode="purchase-method-change-document-detail"
      />
    ),
    cancelButton: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    destroyOnClose: true,
  });
};
