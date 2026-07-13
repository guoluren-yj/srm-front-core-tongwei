import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_MDM, SRM_SIEC } from '_utils/config';

const SRM_IAM = '/iam';
const organizationId = getCurrentOrganizationId();

/*
模具主数据明细
*/
export async function mouldMasterDataDetail(mouldId, customizeUnitCode) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould/${mouldId}`, {
    method: 'GET',
    query: {
      queryScene: 'maReference',
      customizeUnitCode:
        customizeUnitCode ||
        'SIEC.MOULD_DATA.DETAIL.HEADER,SIEC.MOULD_DATA.DETAIL.LIST,SIEC.MOULD_DATA.DETAIL.EXPAND_LIST',
    },
  });
}
/*
模具主数据新增
*/
export async function mouldMasterDataCreate(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SIEC}/v1/${organizationId}/mould`, {
    method: 'POST',
    params: { customizeUnitCode },
    body: params,
  });
}
/*
模具主数据修改
*/
export async function mouldMasterDataModify(params) {
  const { customizeUnitCode } = params;
  return request(`${SRM_SIEC}/v1/${organizationId}/mould`, {
    method: 'PUT',
    params: { customizeUnitCode },
    // body: JSON.stringify(params),
    body: params,
  });
}
/*
模具主数据删除
*/
export async function mouldMasterDataDelete(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould`, {
    method: 'DELETE',
    body: params,
  });
}
/*
模具主数据生效
*/
export async function mouldMasterDataEffective(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould/effective`, {
    method: 'PUT',
    body: params,
  });
}

/*
模具主数据变更
*/
export async function mouldMasterDataChange(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould/change`, {
    method: 'PUT',
    body: params,
    query: {
      customizeUnitCode:
        'SIEC.MOULD_DATA.DETAIL.HEADER,SIEC.MOULD_DATA.DETAIL.LIST,SIEC.MOULD_DATA.DETAIL.EXPAND_LIST',
    },
  });
}

/*
模具主数据自定义按钮接口
*/
export async function customMasterData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould/do-operate`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchCategory(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/${itemId}`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 查询状态机配置表信息和初始状态对应的操作
 * @param {Object} params
 */
export async function queryInitialStateCorrespondingOperation(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(
    `${SRM_SIEC}/v1/${organizationId}/status-interaction/queryInitialStateCorrespondingOperation`,
    {
      method: 'GET',
      query: otherQuery,
    }
  );
}

/**
 * 获取界面展示的相关信息
 * @param {Object} params
 */
export async function queryPageInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(`${SRM_SIEC}/v1/${organizationId}/status-interaction/queryPageInfo`, {
    method: 'GET',
    query: otherQuery,
  });
}

// 查询按钮权限信息
export async function fetchPermissions(permissionList) {
  return request(`${SRM_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: permissionList,
  });
}

// 查询按钮权限信息
export async function batchEffective(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould/batch-effective`, {
    method: 'PUT',
    body: params,
  });
}

// 模具审批通过
export async function approveMould(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould/change/approve`, {
    method: 'POST',
    body: params,
  });
}

// 模具审批拒绝
export async function rejecteMould(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould/change/rejected`, {
    method: 'POST',
    body: params,
  });
}

// 模具撤销变更
export async function revokeMould(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould/change/revoke`, {
    method: 'POST',
    body: params,
  });
}
