import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

// 待发布-新建
// 维护页面 - 保存、删除、提交
export const  technicalDocumentsApi = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeDZVuxxhCyc5UMK4IbqKu9o`, {
    method: 'POST',
    body: params,
  });
};