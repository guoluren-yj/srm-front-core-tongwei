import request from 'utils/request';
import { SRM_CUSTOMIZATION } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 保存
export async function headerSave(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/save`, {
    method: 'POST',
    body: params,
  });
}

// 提交
export async function headerSubmit(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/submit`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 头删除
export async function headerDelete(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/delete`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

// 行删除
export async function lineDelete(params) {
  return request(`${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-lines/delete`, {
    method: 'DELETE',
    body: params,
  });
}

// 选择物料保存
export async function itemSave(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/confirm`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 审批通过
export async function approve(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/approval`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 审批拒绝
export async function reject(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/reject`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 查询数量
export async function fetchNumber() {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/count`,
    {
      method: 'GET',
    }
  );
}

/* ------------------------------- 库存领用 ------------------------------- */
// 库存领用新建
export async function toReceiveAdd(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers/create`,
    {
      method: 'GET',
      body: params,
    }
  );
}

// 库存领用保存
export async function toReceiveSave(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers/save`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 库存领用物料行新增
export async function toItemAdd(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-item-lines/save/${params.inventoryReceiveHeaderId}`,
    {
      method: 'POST',
      body: params.list,
    }
  );
}

// 库存领用提交
export async function toReceiveSubmit(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers/submit`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 库存领用删除
export async function toReceiveDelete(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers/delete/${params.inventoryReceiveHeaderId}`,
    {
      method: 'DELETE',
    }
  );
}

// 库存领用行删除
export async function toLineDelete(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-item-lines/delete`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

// 库存领用打印
export async function toLinePrint(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers/print`,
    {
      method: 'POST',
      responseType: 'blob',
      body: params,
    },
  );
}
// 审批记录
export async function toReceiveApprovalRecord(params) {
  return request(
    `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers/workflow/history/approval`,
    {
      method: 'GET',
      query: params,
    }
  );
}
