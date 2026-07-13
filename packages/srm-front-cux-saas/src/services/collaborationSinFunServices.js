import request from 'utils/request';
import { SRM_CUSTOMIZATION } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export async function saveData(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/save`, {
    method: 'POST',
    body: params,
  });
}

export async function submitData(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/submit`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteData(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/delete`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * initialMethod -
 * @param {Object} params - 入参
 */
export async function initialMethod() {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/queryStatusConfig`, {
    method: 'GET',
  });
}

/**
 * fetchHeaderBtn - 状态机新建界面头按钮查询
 * @param {Object} params - 入参
 */
export async function fetchHeaderBtn(statusConfigId) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/stateMachine/${statusConfigId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * headerBtnAffairHandle - 头部按钮事务处理
 * @param {Object} params - 参数
 */
export async function headerBtnAffairHandle(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/do-operation`, {
    method: 'POST',
    body: params,
  });
}

/**
 * saveLine - 行保存
 * @param {Object} params - 参数
 */
export async function saveLine(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-lines/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * saveLine - 行保存
 * @param {Object} params - 参数
 */
export async function deleteLine(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-lines/delete `, {
    method: 'DELETE',
    body: params,
  });
}
