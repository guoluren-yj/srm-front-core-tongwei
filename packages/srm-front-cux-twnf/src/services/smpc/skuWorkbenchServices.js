import request from 'utils/request';
import { SRM_MARMOT, SRM_SMPC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export async function confirmItemAndShelfApi(data) {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/T3bn5bXhq71h70kUoS7F8MTA4Why1cm6kvST1jnWdQ0`, {
    method: 'POST',
    body: data,
  });
}

// 查询组织
export async function fetchUnits() {
  const url = `/sagm/v1/${getCurrentOrganizationId()}/pur-units/edit-tree`;
  return request(url, {
    method: 'GET',
  });
}

// 批量编辑EC信息
export async function batchEditECInfo(params) {
  const url = `${SRM_SMPC}/v1/${getCurrentOrganizationId()}/skus/batch-ecsku-update`;
  return request(url, {
    method: 'POST',
    body: params,
  });
}