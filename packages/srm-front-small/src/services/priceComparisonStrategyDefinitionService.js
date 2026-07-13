import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId(); // 租户ID
const SRM_SMAL = '/smal';

// 列表页查询接口;
export async function fetchPriceComparisonStrategy() {
  const url = `${SRM_SMAL}/v1/${tenantId}/compare-rule-headers`;
  return request(url, {
    method: 'GET',
  });
}

// 详情页查询接口
export async function fetchPriceComparisonStrategyDetail(compareRuleHeaderId) {
  const url = `${SRM_SMAL}/v1/${tenantId}/compare-rule-headers/detail/${compareRuleHeaderId}`;
  return request(url, {
    method: 'GET',
  });
}

// 解锁
export async function unlockStrategy(compareRuleHeaderId) {
  const url = `${SRM_SMAL}/v1/${tenantId}/compare-rule-headers/unlock/${compareRuleHeaderId}`;
  return request(url, {
    method: 'POST',
  });
}

// 发布
export async function publishStrategy(params) {
  const url = `${SRM_SMAL}/v1/${tenantId}/compare-rule-headers/publish`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}


// 保存
export async function saveStrategy(params) {
  const url = `${SRM_SMAL}/v1/${tenantId}/compare-rule-headers/save`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}

export async function fetchStrategyEnableApi(compareRuleHeaderId) {
  const url = `${SRM_SMAL}/v1/${tenantId}/compare-rule-headers/enabled/${compareRuleHeaderId}`;
  return request(url, {
    method: 'POST',
  });
}

// 查询列表
export async function fetchHistoryListApi() {
  const url = `${SRM_SMAL}/v1/${tenantId}/compare-rule-headers`;
  return request(url, {
    method: 'GET',
  });
}