import request from 'utils/request';
import { SRM_SIEC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function confirmData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/module-status-configs/save`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDelete(params) {
  return request(
    `${SRM_SIEC}/v1/${organizationId}/module-status-configs/deleteStatusMachine/${params}`,
    {
      method: 'DELETE',
    }
  );
}

export async function confirmDefineData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-details/saveStatusDetail`, {
    method: 'POST',
    body: params,
  });
}

export async function confirmAuthorityData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-details/saveStatusAuthority`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteLine(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-details/batchDeleteStatusDetail`, {
    method: 'DELETE',
    body: params,
  });
}

export async function tablePageDataSave(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-relation-pages/batchSaveRelationPage`, {
    method: 'POST',
    body: params,
  });
}

export async function tablePageDataQuery(params) {
  const { pageOrganizationId, ...data } = params;
  return request(
    `${SRM_SIEC}/v1/${pageOrganizationId}/status-relation-pages/queryStatusRelationPageList`,
    {
      method: 'GET',
      query: data,
    }
  );
}

export async function tablePageDataDelete(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-relation-pages/batchDeleteRelationPage`, {
    method: 'DELETE',
    body: params,
  });
}

export async function tablePostActionDataSave(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-post-actions`, {
    method: 'POST',
    body: params,
  });
}

export async function tablePostActionDataQuery(params) {
  const { pageOrganizationId, statusConfigId, ...data } = params;
  return request(`${SRM_SIEC}/v1/${pageOrganizationId}/status-post-actions/${statusConfigId}`, {
    method: 'GET',
    query: data,
  });
}

export async function tablePostActionDataDelete(params) {
  if (params.length === 0) return;
  const { tenantId = '' } = params[0];
  return request(`${SRM_SIEC}/v1/${tenantId}/status-post-actions`, {
    method: 'DELETE',
    body: params,
  });
}

export async function tableButtonDataSave(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-operations/batchSaveStatusOperation`, {
    method: 'POST',
    body: params,
  });
}

export async function tableButtonDataDelete(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-operations/batchDeleteStatusOperation`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 策略配置保存
 * @param {*} params
 */
export async function tableStrategyDataSave(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-rules/batchSaveStatusRules`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 策略配置删除
 * @param {*} params
 */
export async function tableStrategyDataDelete(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-rules/batchDeleteStatusRules`, {
    method: 'DELETE',
    body: params.filter((n) => n.ruleId),
  });
}

/**
 * 策略配置删除
 * @param {*} params
 */
export async function tableStrategyDataExport(id) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-details/export?statusConfigId=${id}`, {
    method: 'GET',
  });
}
