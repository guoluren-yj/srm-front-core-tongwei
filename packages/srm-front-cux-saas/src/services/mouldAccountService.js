import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';

const SRM_IAM = '/iam';
const organizationId = getCurrentOrganizationId();

/*
模具工作台,保存接口
*/
export async function saveData(params) {
  const { maHeaderId, customizeUnitCode, ...other } = params;
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account`, {
    method: maHeaderId ? 'PUT' : 'POST',
    query: {
      customizeUnitCode,
    },
    body: {
      maHeaderId,
      ...other,
    },
  });
}

/*
模具工作台,删除接口
*/
export async function deleteData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account`, {
    method: 'DELETE',
    body: params,
  });
}

/*
模具工作台,审批通过接口
*/
export async function approveData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account/approve/approval`, {
    method: 'POST',
    body: params,
    query: { approvedRemark: params.approvedRemark },
  });
}

/*
模具工作台,审批拒绝接口

*/
export async function rejectData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account/approve/reject`, {
    method: 'POST',
    body: params,
    query: { approvedRemark: params.approvedRemark },
  });
}

/*
模具工作台,退回接口
*/
export async function resetData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account/batch-send-back`, {
    method: 'POST',
    body: [params],
  });
}

/*
模具工作台,确认接口
*/
export async function sureData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account/batch-conform`, {
    method: 'POST',
    body: [params],
  });
}

/*
模具工作台,确认接口
*/
export async function changeApply(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account-change/apply`, {
    method: 'POST',
    body: params,
  });
}

/*
模具工作台,下发接口
*/
export async function publishData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account/release`, {
    method: 'POST',
    query: {
      customizeUnitCode:
        'SIEC.MOULD_PLATFORM.DETAIL.LIST,SIEC.MOULD_PLATFORM.DETAIL.HEADER,SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
    },
    body: params,
  });
}

/*
模具工作台,下发接口
*/
export async function customAccountData(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account/do-operate`, {
    method: 'PUT',
    query: {
      customizeUnitCode:
        'SIEC.MOULD_PLATFORM.DETAIL.LIST,SIEC.MOULD_PLATFORM.DETAIL.HEADER,SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
    },
    body: params,
  });
}

/*
模具工作台,批量下发接口
*/
export async function publishAll(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account/batch-release`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询状态机配置表信息和初始状态对应的操作
 * @param {Object} params
 */
export async function queryInitialStateCorrespondingOperation(params) {
  return request(
    `${SRM_SIEC}/v1/${organizationId}/status-interaction/queryInitialStateCorrespondingOperation`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 获取界面展示的相关信息
 * @param {Object} params
 */
export async function queryPageInfo(params) {
  return request(`${SRM_SIEC}/v1/${organizationId}/status-interaction/queryPageInfo`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取异动信息
 * @param {Object} params
 */
export async function getChangeInfo(maHeaderId) {
  return request(`${SRM_SIEC}/v1/${organizationId}/mould-account-change/detail/${maHeaderId}`, {
    method: 'GET',
    data: {
      customizeUnitCode:
        'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.HEADER,SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE',
    },
  });
}

// 查询按钮权限信息
export async function fetchPermissions(permissionList) {
  return request(`${SRM_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: permissionList,
  });
}

/**
 * 查询是否能撤销
 */
export async function fetchRevokeWorkflow(body) {
  return request(
    `${HZERO_HWFP ||
      '/hw'}/v1/${getCurrentOrganizationId()}/runtime/prc/operation-flag?revokeFlag=1`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 撤销工作流审批
 */
export async function revokeWorkflow(params) {
  const { businessKey } = params;
  return request(
    `${HZERO_HWFP}/v1/${getCurrentOrganizationId()}/runtime/prc/revoke-by-key/${businessKey}`,
    {
      method: 'GET',
    }
  );
}
