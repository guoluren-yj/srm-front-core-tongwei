/**
 * docTransferService.js - 单据转交 service
 * @date: 2020-08-13
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 根据租户 ID 查询 转交历史记录
 * @param {Object} params - 查询参数
 */
export async function queryTransferRecord(params) {
  const { userId, ...rest } = params;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/doc-deliver-records/${userId}`, {
    method: 'GET',
    query: rest,
  });
}

export async function transferDoc(data) {
  const { deliverType, ...reset } = data;
  return request(`${SRM_PLATFORM}/v1/${organizationId}/doc-deliver-records/deliver-to`, {
    method: 'POST',
    body: reset,
    query: {
      deliverType,
    },
  });
}
