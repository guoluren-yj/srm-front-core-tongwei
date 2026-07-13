import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';

const organizationId = getCurrentOrganizationId();

const mouldHistoryDs = (mouldId) => ({
  dataToJSON: 'all',
  autoQuery: false,
  selection: false,
  autoCreate: false,
  fields: [],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould/action/${mouldId}`,
        method: 'GET',
      };
    },
  },
});

export { mouldHistoryDs };
