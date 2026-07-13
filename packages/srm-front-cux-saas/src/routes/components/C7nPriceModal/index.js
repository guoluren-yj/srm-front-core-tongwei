/*
 * C7nPriceModal - 工作台参考价格弹窗
 * @date: 2021/05/26 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useMemo } from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { priceTable, ladderPrice } from './store/c7nPriceModalDs';

const tenantId = getCurrentOrganizationId();

const C7nPriceModal = (props) => {
  const {
    params = {},
    disabled,
    onOk = (e) => e,
    readOnly = true, // 目前只在引用单据创建采购申请只读
  } = props;
  const priceTableDs = useMemo(
    () =>
      new DataSet({
        ...priceTable(),
        transport: {
          read: () => {
            return readOnly
              ? {
                  url: `${SRM_SPUC}/v1/${tenantId}/po-header/reference-price`,
                  method: 'GET',
                  params,
                }
              : {
                  url: `${SRM_SPUC}/v1/${tenantId}/po-header/new-reference-price`,
                  method: 'PUT',
                  data: params,
                };
          },
        },
      }),
    []
  );
  const ladderPriceDs = useMemo(() => new DataSet(ladderPrice()));
  const ladderPriceColumns = useMemo(() => [
    {
      name: 'ladderLineNum',
    },
    {
      name: 'numberRange',
      renderer: ({ record }) => `[${record.get('ladderFrom')},${record.get('ladderTo')}]`,
    },
    {
      name: 'ladderPrice',
    },
    {
      name: 'ladderPriceRemark',
    },
  ]);
  const columns = useMemo(() => {
    const defaultColumns = [
      {
        name: 'taxPrice',
        width: 120,
      },
      {
        name: 'unitPrice',
        width: 120,
      },
      {
        name: 'uomCodeName',
        width: 120,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'taxCode',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 80,
      },
      {
        name: 'ladderPrice',
        width: 120,
        renderer: ({ record }) =>
          record.get('ladderInquiryFlag') === 1 && (
            <Popover
              arrowPointAtCenter
              onVisibleChange={(visible) => onVisibleChange(visible, record)}
              content={
                <Table
                  style={{ width: 500 }}
                  dataSet={ladderPriceDs}
                  columns={ladderPriceColumns}
                />
              }
            >
              <a>{intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格')}</a>
            </Popover>
          ),
      },
      {
        name: 'priceSource',
        width: 120,
        renderer: ({ record }) => record.get('priceSourceMeaning'),
      },
      {
        name: 'orderNum',
        width: 150,
      },
    ];
    const requestColumns = [
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 210,
      },
    ];
    if (readOnly) {
      defaultColumns.unshift(...requestColumns);
    }
    return defaultColumns;
  }, []);

  const onVisibleChange = (visible, record) => {
    if (visible) {
      ladderPriceDs.loadData(record.get('ladderPriceLibList') || []);
    }
  };

  const handleModal = () => {
    const modalProps = Object.assign(
      {
        style: { width: 800 },
        title: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
        children: (
          <Table
            dataSet={priceTableDs}
            columns={columns}
            selectionMode={readOnly ? 'none' : 'rowbox'}
          />
        ),
      },
      readOnly ? { footer: null, closable: true } : { onOk: () => onOk(priceTableDs) }
    );
    Modal.open(modalProps);
    priceTableDs.query();
  };

  return (
    <a disabled={disabled} onClick={handleModal}>
      {intl.get('sodr.workspace.model.common.referPrice').d('参考价格')}
    </a>
  );
};

export default C7nPriceModal;
