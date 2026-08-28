/**
 * 分配申请弹框
 * - 查询：GET  /marmot/v1/{organizationId}/marmot-api/jnGiaAPr0vns7KB9wic7ODC8E5pQHXoyqIkmzWnibncFm4?rfxLineItemId=xxx
 * - 保存：POST 同 URL，只修改分配金额(assignAmount)，其他字段使用接口原返回
 */
import React, { useEffect, useMemo, useImperativeHandle, forwardRef } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import request from 'utils/request';

const ALLOCATE_URL = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/jnGiaAPr0vns7KB9wic7ODC8E5pQHXoyqIkmzWnibncFm4`;

const AllocateRequestModal = forwardRef(({ rfxLineItemId }, ref) => {
  const allocateDs = useMemo(
    () =>
      new DataSet({
        selection: false,
        autoQuery: false,
        pagination: false,
        primaryKey: 'id',
        fields: [
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
            name: 'itemName',
            label: intl.get('ssrc.inquiryHall.model.inquiryHall.itemName').d('物料描述'),
          },
          {
            name: 'assignAmount',
            label: intl
              .get('ssrc.inquiryHall.model.inquiryHall.assignAmount')
              .d('分配金额'),
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
            url: `${ALLOCATE_URL}?rfxLineItemId=${rfxLineItemId}`,
            method: 'GET',
          }),
        },
      }),
    [rfxLineItemId]
  );

  useEffect(() => {
    allocateDs.query();
    return () => allocateDs.destroy();
  }, [allocateDs]);

  // 保存：只修改分配金额，其他字段使用接口原返回；返回 false 则弹框不关闭
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
    { name: 'companyName', width: 180 },
    { name: 'displayPrNum', width: 140 },
    { name: 'itemName', width: 140 },
    { name: 'assignAmount', editor: true, width: 130 },
    { name: 'estimatedAmount', width: 130 },
  ];

  return <Table dataSet={allocateDs} columns={columns} style={{ maxHeight: 450 }} />;
});

export default observer(AllocateRequestModal);
