import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';

const organizationId = getCurrentOrganizationId();

const maHistoryDs = (maHeaderId) => ({
  dataToJSON: 'all',
  autoQuery: false,
  selection: false,
  autoCreate: false,
  fields: [],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-account-action/${maHeaderId}`,
        method: 'GET',
      };
    },
  },
});

const approveHistroyDs = (maHeaderId) => ({
  dataToJSON: 'all',
  autoQuery: false,
  selection: false,
  autoCreate: false,
  fields: [],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-account-action/workflow-history/${maHeaderId}`,
        method: 'GET',
      };
    },
  },
});

export { maHistoryDs, approveHistroyDs };
