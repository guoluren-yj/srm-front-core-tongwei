import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const maHistoryDs = maHeaderId => ({
  dataToJSON: 'all',
  autoQuery: false,
  selection: false,
  autoCreate: false,
  queryFields: [
    {
      name: 'processType',
      display: true,
      noCache: true,
      type: 'string',
      lookupCode: 'SIEC.MODLE.ACTION.RECORD',
      lovPara: { maHeaderId },
      label: intl.get('hzero.common.components.operationAudit.operatedCode').d('操作节点'),
    },
    {
      name: 'processedDateRange',
      type: 'dateTime',
      range: true,
      display: true,
      label: intl.get('hzero.common.components.operationAudit.operatedTime').d('操作时间'),
    },
    {
      name: 'createdBy',
      type: 'object',
      lovPara: { tenantId: organizationId },
      display: true,
      lovCode: 'HIAM.TENANT.USER',
      valueField: 'id',
      textField: 'realName',
      label: intl.get('hzero.common.components.operationAudit.operationBy').d('操作人'),
    },
    {
      name: 'processRemark',
      type: 'string',
      range: true,
      display: true,
      label: intl.get('hzero.common.view.description').d('描述'),
    },
  ],
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

const approveHistroyDs = maHeaderId => ({
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
