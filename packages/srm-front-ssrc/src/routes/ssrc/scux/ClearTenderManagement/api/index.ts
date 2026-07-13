import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

// 采购方 - 删除、保存或者提交
export const saveOrSubmitPageData = (params) => {
  const { query, ...others } = params;
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/7dWljYbh2Q31dA6XOhvoq9mddZZPkbfPpwapibVjmViaA`, {
    method: 'POST',
    query,
    body: others,
  });
};

// 引用单据创建
export const addReferenceData = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/sMOTHRm9wFLyqKibIacUNwwhxJz64242uSX2iaL59ib1KE`, {
    method: 'POST',
    body: params,
  });
};

// 供应商 - 退回、确认
export const supReturnOrConfirm = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/RNSM1ViakicjXcJ14ib3HeMicd5VQO3C0xysjviar2ibjLjTSHUVeu9ZK7DEhOWFMI4Gf7`, {
    method: 'POST',
    body: params,
  });
};