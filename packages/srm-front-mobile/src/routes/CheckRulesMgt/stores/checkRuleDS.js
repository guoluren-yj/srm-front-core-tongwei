import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMBL } from '_utils/config';

/**
 * 流程单据表单
 * @returns
 */
const ProcessDocDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/document-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/add-document`,
        data: data[0] || {},
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/update-document`,
        data: data[0] || {},
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.processDocCode`).d('流程单据编码'),
      name: 'documentCode',
      type: 'string',
      required: true,
      pattern: /^[A-Z._]+$/,
      format: 'uppercase',
    },
    {
      label: intl.get(`smbl.checkRules.model.processDocName`).d('流程单据名称'),
      name: 'documentName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.processDocDesc`).d('流程单据描述'),
      name: 'documentDesc',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.processDocBindObj`).d('绑定业务对象'),
      name: 'businessObjectId',
      type: 'string',
      lookupCode: 'SMBL.BUSINESS_LIST',
      // required: true,
    },
    // {
    //   label: intl.get(`smbl.checkRules.model.processDocBindObj`).d('绑定业务对象'),
    //   name: 'processDocBindObj',
    //   type: 'object',
    //   lovCode: 'HMDE.BUSINESS_OBJECT',
    //   ignore: 'always',
    //   noCache: true,
    //   required: true,
    // },
    // {
    //   name: 'businessObjectId',
    //   bind: 'processDocBindObj.businessObjectId',
    // },
    {
      name: 'tenantId',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 流程分类表单
 * @returns
 */
const ProcessCategoryDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/category-detail`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/add-category`,
        data: data[0] || {},
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow/update-category`,
        data: data[0] || {},
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.processCategoryCode`).d('流程分类编码'),
      name: 'categoryCode',
      type: 'string',
      required: true,
      pattern: /^[A-Z._]+$/,
      format: 'uppercase',
    },
    {
      label: intl.get(`smbl.checkRules.model.processCategoryName`).d('流程分类名称'),
      name: 'categoryName',
      type: 'intl',
      required: true,
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 流程变量
 * @returns
 */
const ProcessParamsDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => ({
      url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/delete`,
      data,
      method: 'POST',
    }),
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.fieldName`).d('字段名称'),
      name: 'fieldName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.objectName`).d('所属对象'),
      name: 'businessObjectId',
      type: 'string',
      lookupCode: 'SMBL.BUSINESS_LIST',
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
      name: 'fieldCode',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldSource`).d('字段来源'),
      name: 'fieldType',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_FIELD_SOURCE',
    },
    {
      label: intl.get(`smbl.checkRules.model.source`).d('来源'),
      name: 'tenantId',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 流程变量表单
 * @returns
 */
const ProcessParamsFormDS = () => ({
  transport: {
    // read: ({ data, params }) => {
    //   return {
    //     url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/risk-define/supplier-list`,
    //     params: {
    //       ...data,
    //       ...params,
    //     },
    //     method: 'GET',
    //   };
    // },
    create: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/add`,
        data: data[0] || {},
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/update`,
        data: data[0] || {},
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.fieldSource`).d('字段来源'),
      name: 'fieldType',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_FIELD_SOURCE',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldName`).d('字段名称'),
      name: 'fieldName',
      type: 'intl',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.objectName`).d('所属对象'),
      name: 'businessObjectId',
      type: 'string',
      lookupCode: 'SMBL.BUSINESS_LIST',
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('fieldType') !== 'CUSTOM';
        },
      },
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
      name: 'fieldCode',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('fieldType') === 'CUSTOM';
        },
      },
    },
    {
      label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
      name: 'fieldCodeSelect',
      type: 'string',
      dynamicProps: {
        required: ({ record }) => {
          return record?.get('fieldType') !== 'CUSTOM';
        },
      },
    },
    // {
    //   label: intl.get(`smbl.checkRules.model.fieldCode`).d('字段编码'),
    //   name: 'fieldCodeSelect',
    //   type: 'string',
    //   textField: 'fieldName',
    //   valueField: 'filedCode',
    //   group: 'groupName',
    //   dynamicProps: {
    //     required: ({ record }) => {
    //       return record?.get('fieldType') !== 'CUSTOM';
    //     },
    //   },
    //   lookupCode: '',
    //   // lookupAxiosConfig: ({ record }) => {
    //   //   const businessObjectId = record?.get('businessObjectId');

    //   //   if (!businessObjectId) return {};

    //   //   return {
    //   //     url: `/smbl/v1/${getCurrentOrganizationId()}/ai-check-flow-fields/bo-fields?businessObjectId=${businessObjectId}`,
    //   //     method: 'GET',
    //   //     transformResponse: [
    //   //       data => {
    //   //         try {
    //   //           // 处理数据
    //   //           const fields = [];
    //   //           const list = JSON.parse(data);
    //   //           if (list.length) {
    //   //             list.forEach(item => {
    //   //               // 为每个字段添加分组信息
    //   //               const processedFields = (item?.fields ?? []).map(field => {
    //   //                 return {
    //   //                   ...field,
    //   //                   groupName: item.businessObjectName || item.businessObjectCode, // 添加分组名称
    //   //                 };
    //   //               });
    //   //               fields.push(...processedFields);
    //   //             });
    //   //           }
    //   //           return fields;
    //   //         } catch (error) {
    //   //           return [];
    //   //         }
    //   //       },
    //   //     ],
    //   //   };
    //   // },
    // },
    {
      label: intl.get(`smbl.checkRules.model.fieldValueSet`).d('字段值集'),
      name: 'fieldValueSetObj',
      type: 'object',
      lovCode: 'SPFM.LOV.LOV_DETAIL.ORG',
      noCache: true,
      ignore: 'always',
    },
    {
      name: 'lovCode',
      bind: 'fieldValueSetObj.lovCode',
    },
    {
      name: 'lovType',
      bind: 'fieldValueSetObj.lovTypeCode',
    },
    {
      name: 'fieldPrefix',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 规则列表
 * @returns
 */
const RulesListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'ruleId',
  selection: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.status`).d('状态'),
      name: 'enableFlag',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleCode`).d('规则编码'),
      name: 'ruleCode',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
      name: 'ruleName',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleIntensity`).d('规则强度'),
      name: 'ruleControlStrategy',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_STRATEGY',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleTarget`).d('规则目标'),
      name: 'ruleTarget',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_TARGET',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleScope`).d('规则适用范围'),
      name: 'ruleScope',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleDetail`).d('规则详情'),
      name: 'ruleDetail',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleDetail`).d('规则详情'),
      name: 'ruleDetailStr',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
      name: 'ruleName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 规则表单
 * @returns
 */
const RuleFormDS = () => ({
  transport: {
    // read: ({ data, params }) => {
    //   return {
    //     url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/risk-define/supplier-list`,
    //     params: {
    //       ...data,
    //       ...params,
    //     },
    //     method: 'GET',
    //   };
    // },
    create: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/add-rule`,
        data: data[0] || {},
        method: 'POST',
      };
    },
    update: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${getCurrentOrganizationId()}/ai-check-flow-category-rules/update-rule`,
        data: data[0] || {},
        method: 'POST',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'categoryId',
  fields: [
    {
      label: intl.get(`smbl.checkRules.model.status`).d('状态'),
      name: 'enableFlag',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleCode`).d('规则编码'),
      name: 'ruleCode',
      type: 'string',
      required: true,
      pattern: /^[A-Z._]+$/,
      format: 'uppercase',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
      name: 'ruleName',
      type: 'string',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleIntensity`).d('规则强度'),
      name: 'ruleControlStrategy',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_STRATEGY',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleTarget`).d('规则目标'),
      name: 'ruleTarget',
      type: 'string',
      lookupCode: 'SMBL.CHECK_RULES_TARGET',
      required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleScope`).d('规则适用范围'),
      name: 'ruleScope',
      type: 'string',
      // required: true,
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleDetail`).d('规则详情'),
      name: 'ruleDetail',
      type: 'string',
    },
    {
      label: intl.get(`smbl.checkRules.model.ruleDetail`).d('规则详情'),
      name: 'ruleDetailStr',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`smbl.checkRules.model.ruleName`).d('规则名称'),
      name: 'ruleName',
      type: 'string',
    },
  ],
  events: {},
});

export {
  ProcessDocDS,
  ProcessCategoryDS,
  ProcessParamsDS,
  ProcessParamsFormDS,
  RulesListDS,
  RuleFormDS,
};
