import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
  
const organizationId = getCurrentOrganizationId();

export function createSupplierEvaluation(body: any) {
 return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwS1bzxDCNOEAicftu4qN43uYEFxl5aklcAcgqDg5lczWR`, {
    method: 'POST',
    body: {
      ...body,
      operationType: 'CREATE',
    },
  });
}

export function supplierEvaluationPostApi(body: any, operationType) {
 return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwS1bzxDCNOEAicftu4qN43uYEFxl5aklcAcgqDg5lczWR`, {
    method: 'POST',
    body: {
      ...body,
      operationType,
    },
  });
}

export function supplierEvaluationDetailPostApi(body: any, operationType) {
 return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwdjcCccJP6YlZCeMybA9ic252Kibx1ViaAFOf6K3WULtfmx`, {
    method: 'POST',
    body: {
      ...body,
      operationType,
    },
  });
}

// 风险扫描
export function supplierRiskScanApi(body: any) {
 return request(`/ssrc/v1/${organizationId}/monitor/riskScan-validate`, {
    method: 'POST',
    body,
  });
}

export function linkRiskScanApi(params: any) {
  const domainUrl = `${window.location.protocol}//${window.location.hostname}`;
  const { ...other } = params;
  return request(`/ssrc/${organizationId}/monitor/riskScan/integrate`, {
    method: 'GET',
    query: { domainUrl, ...other },
    responseType: 'text',
  });
}