import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

// 保存或者提交
export const saveOrSubmitPageData = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/Whp5I6ibYR3RISvVWASBLy80iaI0yOoZ8Pgn6ia8gBnomtxm3jwjibu19Xtt7TcWxichz`, {
    method: 'POST',
    body: params,
  });
};