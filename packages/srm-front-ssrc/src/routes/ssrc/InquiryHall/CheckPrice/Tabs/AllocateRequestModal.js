/**
 * 分配申请弹框
 * - 查询：GET  /marmot/v1/{organizationId}/marmot-api/jnGiaAPr0vns7KB9wic7ODC8E5pQHXoyqIkmzWnibncFm4
 *   物料明细：?rfxLineItemId=xxx
 *   供应商清单：?rfxHeaderId=xxx&supplierCompanyId=xxx&attributeLongtext8=标段
 * - 保存：POST 同 URL，只修改分配金额(assignAmount)、是否勾选(isSelected)，其他字段使用接口原返回
 */
import React, { useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty, omitBy, isNil } from 'lodash';
import querystring from 'querystring';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import request from 'utils/request';

const ALLOCATE_URL = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/jnGiaAPr0vns7KB9wic7ODC8E5pQHXoyqIkmzWnibncFm4`;

const AllocateRequestModal = forwardRef((props, ref) => {
  // readOnly：详情页只查看，不允许修改分配金额
  const { rfxLineItemId, rfxHeaderId, supplierCompanyId, attributeLongtext8, readOnly = false } =
    props;
  const queryString = useMemo(
    () =>
      querystring.stringify(
        omitBy(
          { rfxLineItemId, rfxHeaderId, supplierCompanyId, attributeLongtext8 },
          (value) => isNil(value) || value === ''
        )
      ),
    [rfxLineItemId, rfxHeaderId, supplierCompanyId, attributeLongtext8]
  );
  const allocateDs = useMemo(
    () =>
      new DataSet({
        selection: false,
        autoQuery: false,
        pagination: false,
        primaryKey: 'id',
        fields: [
          {
            name: 'isSelected',
            type: 'boolean',
            // 接口要求传字符：勾选='1'，未勾选='0'
            trueValue: '1',
            falseValue: '0',
            defaultValue: '0',
            // 兼容接口返回数字/布尔值，统一转成字符
            transformResponse: (value) => {
              if (isNil(value) || value === '') {
                return value;
              }
              return value === 1 || value === true || value === '1' ? '1' : '0';
            },
            label: intl.get('ssrc.inquiryHall.model.inquiryHall.isSelected').d('是否勾选'),
          },
          {
            name: 'companyName',
            label: intl.get('ssrc.inquiryHall.model.inquiryHall.company').d('公司'),
          },
          {
            name: 'displayPrNum',
            label: intl
              .get('ssrc.inquiryHall.model.inquiryHall.applicationNum')
              .d('采购申请编号'),
          },
          {
            name: 'currencyCode',
            label: intl.get('ssrc.inquiryHall.model.inquiryHall.currencyCode').d('币种'),
          },
          {
            name: 'assignAmount',
            type: 'number',
            label: intl
              .get('ssrc.inquiryHall.model.inquiryHall.assignAmount')
              .d('分配金额'),
            min: 0,
            // dynamicProps: {
            //   // 最大不超过该行概算金额
            //   max: ({ record }) => {
            //     const estimatedAmount = Number(record?.get('estimatedAmount'));
            //     return Number.isNaN(estimatedAmount) ? undefined : estimatedAmount;
            //   },
            // },
          },
          {
            name: 'estimatedAmount',
            label: intl
              .get('ssrc.inquiryHall.model.inquiryHall.estimatedAmount')
              .d('概算金额'),
          },
        ],
        transport: {
          read: () => ({
            url: `${ALLOCATE_URL}?${queryString}`,
            method: 'GET',
          }),
        },
      }),
    [queryString]
  );

  useEffect(() => {
    allocateDs.query();
    return () => allocateDs.destroy();
  }, [allocateDs]);

  // 保存：只修改分配金额与是否勾选，其他字段使用接口原返回；返回 false 则弹框不关闭
  const handleSave = () => {
    const data = allocateDs.toData();
    if (isEmpty(data)) {
      notification.info({
        message: intl
          .get('ssrc.inquiryHall.view.message.noAllocateRequestData')
          .d('暂无分配申请数据'),
      });
      return false;
    }
    return request(ALLOCATE_URL, {
      method: 'POST',
      body: data,
    }).then((res) => {
      if (getResponse(res)) {
        notification.success({});
        allocateDs.query();
        return true;
      }
      return false;
    });
  };

  useImperativeHandle(ref, () => ({ handleSave }));

  const columns = [
    { name: 'isSelected', width: 90, editor: !readOnly },
    { name: 'companyName', width: 180 },
    { name: 'displayPrNum', width: 140 },
    { name: 'currencyCode', width: 90 },
    { name: 'assignAmount', editor: !readOnly, width: 130 },
    { name: 'estimatedAmount', width: 130 },
  ];

  return <Table dataSet={allocateDs} columns={columns} style={{ maxHeight: 450 }} />;
});

export default observer(AllocateRequestModal);
