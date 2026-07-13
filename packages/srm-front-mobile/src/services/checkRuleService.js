import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 获取流程单据列表
 * @param {*} params
 * @returns
 */
export async function fetchOrderList(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除流程单据
 * @param {*} params
 * @returns
 */
export async function fetchDeleteProcessDoc(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/check-rules/${params.documentId}`, {
    method: 'DELETE',
  });
}

/**
 * 删除流程分类
 * @param {*} params
 * @returns
 */
export async function fetchDeleteCategory(params) {
  return request(
    `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/check-rules/category/${params.categoryId}`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 创建流程分类
 * @param {*} params
 * @returns
 */
export async function fetchCreateCategory(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/add-category`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新流程分类
 * @param {*} params
 * @returns
 */
export async function fetchUpdateCategory(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/update-category`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用
 * @param {*} params
 * @returns
 */
export async function fetchEnabled(params) {
  return request(
    `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/enable-rule`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 启用
 * @param {*} params
 * @returns
 */
export async function fetchDisabled(params) {
  return request(
    `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/disable-rule`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 获取字段列表
 * @param {*} params
 * @returns
 */
export async function fetchFieldsList(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/bo-fields`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 流程单据详情
 * @param {*} params
 * @returns
 */
export async function fetProcessDetail(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/document-detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 流程字段列表
 * @param {*} params
 * @returns
 */
export async function fetFieldsList(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/list?page=-1`, {
    method: 'GET',
    query: params,
  });
}
