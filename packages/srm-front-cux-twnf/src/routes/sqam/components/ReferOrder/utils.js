import React from 'react';
import { Tag } from 'choerodon-ui';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import request from 'utils/request';
import { SRM_SPCM } from '_utils/config';
import intl from 'hzero-front/lib/utils/intl';
import {
  isEmpty,
  isNumber,
  isNaN,
} from 'lodash';

// 状态组件
export const renderStatus = (code, meaning, colorFlag) => {
  let list = [];
  switch (colorFlag) {
    case 'change':
      // 变更类型
      list = [
        {
          // 黄色
          status: ['UN_UPDATE'],
          color: 'gray',
        },
        {
          // 橙色
          status: ['UPDATE'],
          color: 'orange',
        },
        {
          // 红色
          status: ['DELETE'],
          color: 'red',
        },
        {
          // 绿色
          status: ['CREATE'],
          color: 'green',
        },
      ];
      break;
    case 'rc':
      // 收货状态
      list = [
        {
          // 橙色
          status: ['10_NEW'],
          color: 'orange',
        },
        {
          // 绿色
          status: ['20_SUBMITTED', '35_PUBLISH', '40_FINISHED'],
          color: 'green',
        },
      ];
      break;
    default:
      // 订单-状态
      list = [
        {
          // 黄色
          status: [
            'PENDING',
            'DELIVERY_DATE_REVIEW',
            'CLOSEING',
            'CANCELING',
            'CANCELLED_PARTIAL',
            'CLOSETOBECOMFIRMED',
            'CANCELTOBECOMFIRMED',
          ],
          color: 'yellow',
        },
        {
          // 绿色
          status: [
            'APPROVED',
            'PUBLISHED',
            'CONFIRMED',
            'PART_FEED_BACK',
            'SUBMITTED',
            'SUBMITTED_WFL',
          ],
          color: 'green',
        },
        {
          // 红色
          status: ['REJECTED', 'DELIVERY_DATE_REJECT'],
          color: 'red',
        },
        {
          // 灰色
          status: ['CLOSED', 'CANCELED', 'PUBLISH_CANCEL'],
          color: 'gray',
        },
      ];
  }
  const colorConfig = list.find((i) => i.status.includes(code));
  return (
    <Tag color={colorConfig?.color} style={{ border: 'none' }}>
      {meaning}
    </Tag>
  );
};

// 公用获取双单位配置
export const queryCommonDoubleUomConfig = async (params) => {
  const result = await queryDoubleUomConfig(params);
  if (getResponse(result)) {
    return Number(result);
  }
  return 0;
};

export async function queryDoubleUomConfig(params) {
  return request(`${SRM_SPCM}/v1/${getCurrentOrganizationId()}/secondary/getcnf`, {
    method: 'GET',
    query: params,
  });
}

export function countDecimals(val) {
  const strArray = `${val}`.split('.') || [];
  return !isNaN(+val) || (isNumber(val) && Math.floor(val) !== val)
    ? isEmpty((strArray[1] || '').match(/[^0]/g))
      ? 2
      : `${val}`.split('.')[1].length || 0
    : 0;
}

export function getDynamicLabel(config = 0, field) {
  switch (field) {
    case 'quantity':
      return !config
        ? intl.get(`spcm.common.model.common.quantity`).d('数量')
        : intl.get(`spcm.common.model.common.base.quantity`).d('基本数量');
    case 'taxIncludedUnitPrice':
      return !config
        ? intl.get(`spcm.common.model.common.inculdeTaxUnitPrice`).d('原币单价(含税)')
        : intl.get(`spcm.common.model.common.base.inculdeTaxUnitPrice`).d('基本原币单价(含税)');
    case 'unitPrice':
      return !config
        ? intl.get(`spcm.common.model.common.unitPrice`).d('原币单价(不含税)')
        : intl.get(`spcm.common.model.common.base.unitPrice`).d('基本原币单价(不含税)');
    case 'ladderFrom':
      return !config
        ? intl.get('spcm.common.model.common.quantityFrom').d('数量从(>=)')
        : intl.get('spcm.common.model.common.base.quantityFrom').d('基本数量从(>=)');
    case 'ladderTo':
      return !config
        ? intl.get('spcm.common.model.common.quantityTo').d('数量至(<=)')
        : intl.get('spcm.common.model.common.base.quantityTo').d('基本数量至(<=)');
    case 'validLadderPrice':
      return !config
        ? intl.get('spcm.common.model.new.price').d('单价(含税)')
        : intl.get('spcm.common.model.new.base.price').d('基本单价(含税)');
    case 'validNetLadderPrice':
      return !config
        ? intl.get('spcm.common.model.ladderNetPrice').d('单价(不含税)')
        : intl.get('spcm.common.model.base.ladderNetPrice').d('基本单价(不含税)');
    default:
      return !config
        ? intl.get(`spcm.common.model.common.unit`).d('单位')
        : intl.get(`spcm.common.model.common.base.unit`).d('基本单位');
  }
}

export const fetchCreateReferOrderApi = (params) => {
  return request(`/marmot/v1/${getCurrentOrganizationId()}/marmot-api/0ZNib8Xd0z8kIicxFJIzBobNs92uQWUmgI9QicEic0QRTqs`, {
    method: 'POST',
    body: params,
  });
};