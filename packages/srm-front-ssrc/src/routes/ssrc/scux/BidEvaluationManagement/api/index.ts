import request from 'hzero-front/lib/utils/request';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

// 评标汇总 - 确认及汇总
export const confirmAndSummaryPageData = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqZGBIFRNiao7IKQZcxsb2icq4Nzn3XxSda7ia2HDVSWeMJY`, {
    method: 'POST',
    body: params,
  });
};

// 技术评标 - 保存、提交
export const techEvaluationSaveAndSubmit = (params) => {
  return request(`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqazM8c6xPOqW8bjRhTr4LGw`, {
    method: 'POST',
    body: params,
  });
};