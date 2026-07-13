import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

// 保存或者提交
export const saveOrSubmitPageData = (params) => {
  const { query, ...others } = params;
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/OsvaptiagX4D9d74DKiaia8HfEq7ibibKl3THl1rrT7ByDvE`, {
    method: 'POST',
    query,
    body: others,
  });
};

// 中止提交
export const stopSubmitPageData = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/OsvaptiagX4D9d74DKiaia8Hbz89HoG7zjLj2a0xlASNfsTiahDph05Jw6ZvrFaHxk0u`, {
    method: 'POST',
    body: params,
  });
};

// 变更保存、变更提交、撤销变更
export const changeSaveOrSubmitPageData = (params) => {
  const { query, ...others } = params;
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/OsvaptiagX4D9d74DKiaia8HcwQs4rMb68njyD39cvkhDA`, {
    method: 'POST',
    query,
    body: others,
  });
};