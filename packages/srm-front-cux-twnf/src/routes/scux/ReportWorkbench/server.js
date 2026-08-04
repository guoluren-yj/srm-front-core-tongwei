import request from 'utils/request';

import { getCurrentOrganizationId } from 'utils/utils';

import {fetchTabsApi, fetchFieldListApi} from './constant';

const organizationId = getCurrentOrganizationId();

export async function fetchTabs(query) {
  return request(
    `/marmot/v1/${organizationId}/marmot-api/${fetchTabsApi}`,
    {
      method: 'GET',
      query,
    }
  );
}

export async function fetchFieldList(query) {
  return request(
    `/marmot/v1/${organizationId}/marmot-api/${fetchFieldListApi}`,
    {
      method: 'GET',
      query,
    }
  );
}
