import request from 'utils/request';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { SRM_PLATFORM } from '_utils/config';

// 查询配置表逻辑
export async function fetchConfigSheet(params) {
  const { configCode } = params;
  const organizationId = getCurrentOrganizationId();
  const data = {
    tenantNum: getCurrentTenant().tenantNum,
  };
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${configCode}/list-from-site`,
    {
      method: 'POST',
      body: data,
    }
  );
}
