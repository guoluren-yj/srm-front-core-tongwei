import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

// 强制保存非通用变量维护数据：临时放开必填校验，将当前录入（含未填必填的行）直接提交后端，
// 保存能否成功以后端返回为准；提交完成后立即恢复必填，保证【提交/发布】的校验逻辑不受影响。
// 注意：勿修改全局 feedback 配置，仅此处按需放开必填字段。
export const forceSubmitNonGeneralVariables = async (nonGeneralVariablesDs) => {
  if (!nonGeneralVariablesDs) return false;
  const variableIdField = nonGeneralVariablesDs.getField('variableId');
  const variableValueField = nonGeneralVariablesDs.getField('variableValue');
  const originRequired = {
    variableId: variableIdField?.get('required'),
    variableValue: variableValueField?.get('required'),
  };
  variableIdField?.set('required', false);
  variableValueField?.set('required', false);
  try {
    return await nonGeneralVariablesDs.submit();
  } finally {
    if (variableIdField && originRequired.variableId !== undefined) {
      variableIdField.set('required', originRequired.variableId);
    }
    if (variableValueField && originRequired.variableValue !== undefined) {
      variableValueField.set('required', originRequired.variableValue);
    }
  }
};

// 非通用变量维护
export const nonGeneralVariablesDataSet = ({ editorFlag } = {}) => {
  return {
    autoQuery: false,
    forceValidate: true,
    dataToJSON: 'all',
    selection: editorFlag ? 'multiple' : false,
    paging: false,
    // 本地静默提交成功提示，覆盖全局 feedback 的“操作成功”弹框
    feedback: {
      submitSuccess: () => {},
    },
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
