/*
 * @Descripttion:
 * @version: 0.0.1
 * @Author: lilingfeng <lingfeng.li@going-link.com>
 * @Date: 2021-08-06 10:39:07
 * @LastEditors: lilingfeng
 * @LastEditTime: 2021-08-26 10:44:04
 */
import request from 'utils/request';
import { SRM_PLATFORM, SRM_SIEC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function getConfigParams(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/detail`, {
    method: 'GET',
    query: params,
  });
}

export async function getConfigValues(params) {
  const { statusDetailId } = params;
  return request(
    `${SRM_SIEC}/v1/${organizationId}/status-rules/queryRulesOfModule/${statusDetailId}`,
    {
      method: 'GET',
    }
  );
}

export async function judgeStateInProcess(params) {
  const { statusDetailId } = params;
  return request(
    `${SRM_SIEC}/v1/${organizationId}/status-rules/judgeStateInProcess/${statusDetailId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 引用默认策略
 * */
export async function getReferenceConfig(statusConfigId) {
  return request(
    `${SRM_SIEC}/v1/${organizationId}/status-universal-operation/copyPlatFormConfigure?statusConfigId=${statusConfigId}`,
    {
      method: 'POST',
    }
  );
}
