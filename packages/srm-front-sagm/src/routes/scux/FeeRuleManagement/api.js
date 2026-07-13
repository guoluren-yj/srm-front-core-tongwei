import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';

// 明细页面查询
export const queryData = (params) => {
  return request(
    `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/NtMcqwUHp4vjNP16jhZUgeiaqy5EhGqe1cpCibg53t2qM`,
    {
      method: 'GET',
      query: params,
    }
  );
};

// 明细页面 - 头保存\删除\启用\禁用\复制
export const headerOperateData = (params) => {
  const { query = {}, ...others } = params;
  return request(
    `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/NtMcqwUHp4vjNP16jhZUgeiaqy5EhGqe1cpCibg53t2qM`,
    {
      method: 'POST',
      query,
      body: others,
    }
  );
};
