import request from 'utils/request';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

export async function fetchRuleResult(params) {
  return request(`${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check/task-result`, {
    method: 'GET',
    query: params,
  });
}
