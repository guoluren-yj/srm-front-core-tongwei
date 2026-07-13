import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
  
const organizationId = getCurrentOrganizationId();

export function createInspectionFromContracts(body: any) {
 return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDiayAdKLgpRzNjZTSiakVDp5HguLkKy1zWUTgA1TynDfSud`, {
    method: 'POST',
    body,
    query: {
      type: 'create'
    }
  });
}

export function saveInspection(body: any) {
 return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDiayAdKLgpRzNjZTSiakVDp5HguLkKy1zWUTgA1TynDfSud`, {
    method: 'PUT',
    body,
    query: {
      type: 'save'
    }
  });
}

export function submitInspection(body: any) {
 return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDiayAdKLgpRzNjZTSiakVDp5HguLkKy1zWUTgA1TynDfSud`, {
    method: 'POST',
    body,
    query: {
      type: 'submit'
    }
  });
}

export function cancelInspection(body: any) {
 return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDiayAdKLgpRzNjZTSiakVDp5HguLkKy1zWUTgA1TynDfSud`, {
    method: 'POST',
    body,
    query: {
      type: 'cancel'
    }
  });
}

export function saveInspectionDetail(body: any) {
 return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDiayAdKLgpRzNjZTSiakVDp5HguLkKy1zWUTgA1TynDfSud`, {
    method: 'PUT',
    body,
    query: {
      type: 'saveDetail'
    }
  });
}