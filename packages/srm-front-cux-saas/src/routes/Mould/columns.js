import React from 'react';
import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import classnames from 'classnames';
import History from '@/routes/Mould/OperationHistory';

/**
 * 打开操作记录
 * @param {String} maHeaderId
 */
const openOperatorRecord = record => {
  Modal.open({
    key: Modal.key(),
    destroyOnClose: true,
    drawer: true,
    style: { width: '800px' },
    title: intl.get(`hzero.common.button.operated`).d('操作记录'),
    closable: true,
    children: <History mouldId={record.get('mouldId')} />,
    footer: null,
  });
};

const getColumns = openDetailModal => {
  return [
    {
      name: 'mouldStatus',
      width: 90,
      renderer: ({ value, record }) => {
        let tagColor = 'c7n-tag-yellow';

        if (['NEW', 'DEFAULT', 'CHANGE_APPROVING'].includes(value)) {
          // 橘色
          tagColor = 'c7n-tag-yellow';
        } else if (value === 'CHANGE_REJECTED' || value.includes('REJECT')) {
          // 红色
          tagColor = 'c7n-tag-red';
        } else if (['EFFECTIVE'].includes(value) || value.includes('APPROVED')) {
          // 绿色
          tagColor = 'c7n-tag-green';
        } else {
          tagColor = 'c7n-tag-yellow';
        }
        return (
          <Tag className={classnames(tagColor)} style={{ border: 0 }}>
            {record.get('mouldStatusMeaning')}
          </Tag>
        );
      },
    },
    {
      name: 'mouldNum',
      width: 150,
      renderer: ({ value, record }) => {
        return <a onClick={() => openDetailModal(record)}>{value}</a>;
      },
    },
    {
      name: 'mouldName',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 120,
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'supplierName',
      width: 150,
      renderer: ({ record }) => record?.get('supplierCompanyName') || record?.get('supplierName'),
    },
    {
      name: 'mouldPrincipalName',
      width: 150,
    },
    {
      name: 'mouldType',
      width: 90,
    },
    {
      name: 'createdByName',
      width: 90,
    },
    {
      name: 'sourcePlatform',
      width: 90,
    },
    {
      name: 'cavityQuality',
      width: 90,
    },
    {
      name: 'shareQuality',
      width: 90,
    },
    {
      name: 'mouldOwner',
      width: 150,
    },
    {
      name: 'uomName',
      width: 90,
    },
    {
      name: 'modelSpecs',
      width: 100,
    },
    {
      name: 'mouldLife',
      width: 90,
    },
    {
      name: 'mouldValue',
      width: 90,
    },
    {
      name: 'machineTonnage',
      width: 90,
    },
    {
      name: 'moldingCycle',
      width: 90,
    },
    {
      name: 'objectVersionNumber',
      width: 90,
    },
    {
      name: 'remark',
      width: 150,
    },
    {
      name: 'operatorRecord',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => openOperatorRecord(record)}>
          {intl.get(`hzero.common.button.operated`).d('操作记录')}
        </a>
      ),
    },
  ];
};

const getLineColumns = openDetailModal => {
  return [
    {
      name: 'mouldStatus',
      width: 150,
      renderer: ({ value, record }) => {
        let tagColor = 'c7n-tag-yellow';
        if (['NEW', 'DEFAULT', 'CHANGE_APPROVING'].includes(value)) {
          // 橘色
          tagColor = 'c7n-tag-yellow';
        } else if (value === 'CHANGE_REJECTED' || value.includes('REJECT')) {
          // 红色
          tagColor = 'c7n-tag-red';
        } else if (['EFFECTIVE'].includes(value) || value.includes('APPROVED')) {
          // 绿色
          tagColor = 'c7n-tag-green';
        } else {
          tagColor = 'c7n-tag-yellow';
        }
        return (
          <Tag className={classnames(tagColor)} style={{ border: 0 }}>
            {record.get('mouldStatusMeaning')}
          </Tag>
        );
      },
    },
    {
      name: 'lineNum',
      width: 220,
      renderer: ({ value, record }) => {
        return (
          <a onClick={() => openDetailModal(record)}>{`${record.get('mouldNum')}-${value}`}</a>
        );
      },
    },
    {
      name: 'mouldName',
      width: 200,
    },
    {
      name: 'creationDate',
      width: 120,
    },
    {
      name: 'companyName',
      width: 150,
    },
    {
      name: 'supplierName',
      width: 150,
      renderer: ({ record }) => record?.get('supplierCompanyName') || record?.get('supplierName'),
    },
    {
      name: 'mouldPrincipalName',
      width: 150,
    },
    {
      name: 'mouldType',
      width: 90,
    },
    {
      name: 'createdByName',
      width: 90,
    },
    {
      name: 'sourcePlatform',
      width: 90,
    },
    {
      name: 'itemCode',
      width: 200,
    },
    {
      name: 'itemName',
      width: 220,
    },
    {
      name: 'categoryName',
      width: 220,
    },
    {
      name: 'uomName',
      width: 200,
    },
    {
      name: 'remark',
      width: 150,
    },
    {
      name: 'operatorRecord',
      width: 100,
      renderer: ({ record }) => (
        <a onClick={() => openOperatorRecord(record)}>
          {intl.get(`hzero.common.button.operated`).d('操作记录')}
        </a>
      ),
    },
  ];
};

export { getColumns, getLineColumns };
