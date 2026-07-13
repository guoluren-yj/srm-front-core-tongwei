import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';

import withTokenAxios from '@/utils/withTokenAxios';


const { API_HOST } = getEnvConfig() as any;

// 待处理-新建、维护页面 - 保存、删除、提交
export const tenderListBillCommonApi = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LJvnz2nRYLRibzuh6zfysqFg5HOxibkrmRribc2Ob2qG6Rb`, {
    method: 'POST',
    body: params,
  });
};

// 列表导出
export const tenderListExportApi = (params) => {
  return withTokenAxios({
    url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LPljlhHuxsNnSg89OibbWcHg`,
    method: 'POST',
    baseURL: `${API_HOST}`,
    data: params,
  })
}
