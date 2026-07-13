import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

// 招标准备明细查询
export const fetchPreparationPageData = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/esmommPlBR19bn65AF2vPFflWHvKxuFu96Y9FnAWYcYTiahDph05Jw6ZvrFaHxk0u`, {
    method: 'GET',
    query: params,
  });
};