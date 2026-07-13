import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';

const prefix = 'scux.collaborationSinFun';
const organizationId = getCurrentOrganizationId();

const tableData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'attributeVarchar1',
      label: intl.get(`${prefix}.model.collaborationSinFun.attributeVarchar1`).d('单元编码'),
      type: 'string',
    },
  ],
  transport: {
    read: (values) => {
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/list`,
        method: 'GET',
        data: { ...values.data },
      };
    },
  },
});

const tableDetailsData = () => ({
  autoQuery: false,
  fields: [],
  transport: {
    read: (values) => {
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-lines/list`,
        method: 'GET',
        data: { ...values.data },
      };
    },
  },
});

const headerInfoData = () => ({
  autoQuery: false,
  autoCreate: true,
  transport: {
    read: (values) => {
      const {
        data: { customizeHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/${customizeHeaderId}`,
        method: 'GET',
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      // eslint-disable-next-line
      dataSet.current.status = 'update';
    },
  },
});

const tableLineData = () => ({
  autoQuery: false,
  transport: {
    read: (values) => {
      const {
        data: { customizeHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-lines/${customizeHeaderId}`,
        method: 'GET',
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        // eslint-disable-next-line
        record.status = 'update';
      });
    },
  },
});

const operationData = () => ({
  autoQuery: false,
  transport: {
    read: (values) => {
      const {
        data: { customizeHeaderId, codeType },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-attributes/list/${customizeHeaderId}`,
        method: 'GET',
        data: { customizeAttribute: codeType, customizeHeaderId },
      };
    },
  },
});

export { tableData, headerInfoData, tableLineData, operationData, tableDetailsData };
