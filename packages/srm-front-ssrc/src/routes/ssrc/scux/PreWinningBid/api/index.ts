import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

// 查询拟中标页面数据
export async function queryPreWinningBid(params: any) {
  return request(
    `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/H0wIsAC24ecUq1bjSL7jJr1S29X5LNuIDHy7fIBQTgI`,
    {
      method: 'GET',
      query: params,
    }
  );
}

// 操作拟中标数据【保存、提交】
export async function operatePreWinningBid(params: any) {
  return request(
    `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/H0wIsAC24ecUq1bjSL7jJkemriaDLrVYMLosSQNWEQgQ`,
    {
      method: 'POST',
      body: params,
    }
  );
}
