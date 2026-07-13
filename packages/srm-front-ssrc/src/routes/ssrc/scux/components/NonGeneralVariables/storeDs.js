import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

// 非通用变量维护
export const nonGeneralVariablesDataSet = ({ editorFlag } = {}) => {
  return {
    autoQuery: false,
    forceValidate: true,
    dataToJSON: 'all',
    selection: editorFlag ? 'multiple' : false,
    paging: false,
    fields: [
      {
        name: 'sequence',
        type: 'string',
        label: intl
          .get('scux.nonGeneralVariables.model.nonGeneralVariables.twnf.sequence')
          .d('序号'),
      },
      {
        name: 'variableId',
        type: 'object',
        label: intl
          .get('scux.nonGeneralVariables.model.nonGeneralVariables.twnf.variableCode')
          .d('字段值'),
        lovCode: 'SCUX_TWNF_BID_NON_COMMON_VARIABLE',
        required: true,
        transformRequest: (value) => (value ? value.variableId : null),
        transformResponse: (value, data) => {
          return value ? data : null;
        },
      },
      {
        name: 'variableCode',
        bind: 'variableId.variableCode',
      },
      {
        name: 'variableName',
        type: 'string',
        label: intl
          .get('scux.nonGeneralVariables.model.nonGeneralVariables.twnf.variableName')
          .d('字段名称'),
        bind: 'variableId.variableName',
      },
      {
        name: 'variableValue',
        type: 'string',
        label: intl
          .get('scux.nonGeneralVariables.model.nonGeneralVariables.twnf.variableValue')
          .d('赋值'),
        required: true,
      },
    ],
    transport: {
      read: ({ dataSet }) => {
        const { queryParameter: { rfxHeaderId } = {} } = dataSet;
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/YmqoMCVomiaIrEZCkyzZfwUlAlyyx0micqhicEL3WqyaVK3Je2O4daOIPty0LLia2o3u`,
          method: 'GET',
          data: {
            rfxHeaderId,
          },
        };
      },
      destroy: ({ data, dataSet }) => {
        const { queryParameter: { rfxHeaderId } = {} } = dataSet;
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/YmqoMCVomiaIrEZCkyzZfwUlAlyyx0micqhicEL3WqyaVK3Je2O4daOIPty0LLia2o3u`,
          method: 'DELETE',
          data: {
            rfxHeaderId,
            variableIds: (data || []).map((item) => item.variableId),
          },
        };
      },
      submit: ({ data, dataSet }) => {
        const { queryParameter: { rfxHeaderId } = {} } = dataSet;
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/YmqoMCVomiaIrEZCkyzZfwUlAlyyx0micqhicEL3WqyaVK3Je2O4daOIPty0LLia2o3u`,
          method: 'POST',
          data: {
            rfxHeaderId,
            variableList: data,
          },
        };
      },
    },
  };
};
