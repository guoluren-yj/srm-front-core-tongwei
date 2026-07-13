import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from '_utils/config';

const prefix = 'scux.definitionStateMachine';
const organizationId = getCurrentOrganizationId();

const treeData = () => ({
  autoQuery: true,
  parentField: 'parentConfigId',
  idField: 'statusConfigId',
  selection: 'single',
  paging: 'server',
  pageSize: 100,
  fields: [
    {
      name: 'statusConfigId',
    },
    { name: 'parentConfigId', type: 'number', parentFieldName: 'statusConfigId' },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/module-status-configs/queryStatusConfigTreeListOrganization`,
        method: 'GET',
        // params: {
        //   size: 100,
        // },
      };
    },
  },
});

const headerData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'classificationDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.classificationDesc`).d('分类名称'),
      type: 'string',
    },
    {
      name: 'moduleDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleDesc`).d('单据类型'),
      type: 'string',
    },
    {
      name: 'statusMachineDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.statusMachineDesc`).d('状态机描述'),
      type: 'string',
    },
  ],
  transport: {
    read: (values) => {
      const {
        data: { statusConfigId },
      } = values;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/module-status-configs/queryStatusMachineDetailOrganization/${statusConfigId}`,
        method: 'GET',
      };
    },
  },
});

const tableData = (key) => ({
  autoQuery: false,
  fields: [
    {
      name: 'statusCode',
      label: intl.get(`${prefix}.model.moldFileManagement.statusCode`).d('状态编码'),
      type: 'string',
    },
    {
      name: 'statusDesc',
      label: intl.get(`${prefix}.model.manager.statusDesc`).d('状态名称'),
      type: 'string',
    },
    {
      name: 'sortNum',
      label: intl.get(`${prefix}.model.manager.sortNum`).d('排序号'),
      type: 'number',
    },
    {
      name: 'enabledFlag',
      label: intl.get(`${prefix}.model.manager.enabledFlag`).d('状态'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'statusStageCodeMeaning',
      label: intl.get(`${prefix}.model.moldFileManagement.statusStageCode`).d('状态阶段'),
      type: 'string',
    },
    {
      name: 'relationPageId',
      type: 'number',
    },
    {
      name: 'relationPageDesc',
      label: intl
        .get(`${prefix}.model.moldFileManagement.PurchaseRelationPageName`)
        .d('采购方关联页面'),
      type: 'string',
    },
    {
      name: 'supplierRelationPageDesc',
      label: intl
        .get(`${prefix}.model.moldFileManagement.supplierRelationPageDesc`)
        .d('供应商关联页面'),
      type: 'string',
    },
    {
      name: 'editableFlag',
      label: intl.get(`${prefix}.model.moldFileManagement.editableFlag`).d('页面效果'),
      type: 'string',
    },
    {
      name: 'moduleDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleDesc`).d('单据类型'),
      type: 'string',
    },
    {
      name: 'queryRoleNames',
      label: intl.get(`${prefix}.model.moldFileManagement.queryRoleNames`).d('查询角色'),
      type: 'string',
    },
    {
      name: 'authorityEnabledFlag',
      label: intl.get(`${prefix}.model.manager.enabledFlag`).d('状态'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],

  queryFields: [
    {
      name: 'statusCode',
      label: intl.get(`${prefix}.model.moldFileManagement.statusCode`).d('状态编码'),
      type: 'string',
    },
    {
      name: 'statusDesc',
      label: intl.get(`${prefix}.model.manager.statusDesc`).d('状态名称'),
      type: 'string',
    },
  ],

  transport: {
    read: (values) => {
      if (key === 'statusDefine') {
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/status-details/queryStatusDetailList`,
          method: 'GET',
          data: { ...values.data },
        };
      } else {
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/status-details/queryStatusAuthorityList`,
          method: 'GET',
          data: { ...values.data },
        };
      }
    },
  },
});

const pageTableData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'relationPageId',
    },
    {
      name: 'statusConfigId',
    },
    {
      name: 'relationPageDesc',
      label: intl.get(`${prefix}.model.relationPageDesc`).d('页面名称'),
      type: 'string',
    },
    {
      name: 'relationPageValue',
      label: intl.get(`${prefix}.model.relationPageValue`).d('页面路由'),
      type: 'string',
    },
    {
      name: 'enableFlag',
      label: intl.get(`${prefix}.model.enableFlag`).d('状态'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'operation',
      label: intl.get(`${prefix}.model.moldFileManagement.operation`).d('操作'),
    },
  ],

  queryFields: [
    {
      name: 'relationPageValue',
      label: intl.get(`${prefix}.model.relationPageValue`).d('页面路由'),
      type: 'string',
    },
    {
      name: 'relationPageDesc',
      label: intl.get(`${prefix}.model.relationPageDesc`).d('页面名称'),
      type: 'string',
    },
  ],

  transport: {
    read: (values) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/status-relation-pages/queryStatusRelationPageList`,
        method: 'GET',
        data: { ...values.data },
      };
    },
  },
});

const buttonTableData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'statusOperationId',
    },
    {
      name: 'statusConfigId',
    },
    {
      name: 'operationCode',
      label: intl.get(`${prefix}.model.moldFileManagement.operationCode`).d('操作编码'),
      type: 'string',
    },
    {
      name: 'operationDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.operationName`).d('操作名称'),
      type: 'intl',
    },
    {
      name: 'operationType',
      label: intl.get(`${prefix}.model.moldFileManagement.operationType`).d('操作类型'),
      type: 'string',
      // required: true,
      lookupCode: 'SIEC.STATUS_OPERATION_TYPE',
    },
    {
      name: 'enableFlag',
      label: intl.get(`${prefix}.model.enableFlag`).d('状态'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },

    {
      name: 'operation',
      label: intl.get(`${prefix}.model.moldFileManagement.operation`).d('操作'),
    },
  ],

  queryFields: [
    {
      name: 'operationCode',
      label: intl.get(`${prefix}.model.moldFileManagement.operationCode`).d('操作编码'),
      type: 'string',
    },
    {
      name: 'operationDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.operationName`).d('操作名称'),
      type: 'string',
    },
  ],

  transport: {
    read: (values) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/status-operations/queryStatusOperationList`,
        method: 'GET',
        data: { ...values.data },
      };
    },
  },
});

const getDrawerFields = (activeKey) => {
  const statusDefineFields = [
    {
      name: 'statusCode',
      label: intl.get(`${prefix}.model.moldFileManagement.statusCode`).d('状态编码'),
      type: 'string',
      required: true,
    },
    {
      name: 'statusDesc',
      label: intl.get(`${prefix}.model.manager.statusDesc`).d('状态名称'),
      type: 'intl',
      required: true,
    },
    {
      name: 'sortNum',
      label: intl.get(`${prefix}.model.manager.sortNum`).d('排序号'),
      type: 'number',
    },
    {
      name: 'statusStageCode',
      label: intl.get(`${prefix}.model.moldFileManagement.statusStageCode`).d('状态阶段'),
      type: 'string',
      required: true,
      lookupCode: 'SIEC.STATUS_PERIOD',
    },
    {
      name: 'enabledFlag',
      label: intl.get(`${prefix}.model.manager.enabledFlag`).d('状态'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
  ];

  const statePermissionConfigFields = [
    {
      name: 'statusConfigId',
      type: 'number',
    },
    {
      name: 'relationPageLOV',
      label: intl
        .get(`${prefix}.model.moldFileManagement.PurchaseRelationPageName`)
        .d('采购方关联页面'),
      type: 'object',
      required: true,
      lovCode: 'SIEC.STATE_PAGE_RELATION',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            statusConfigId: record.get('statusConfigId'),
          };
        },
      },
    },
    {
      name: 'relationPageId',
      bind: 'relationPageLOV.relationPageId',
    },
    {
      name: 'relationPageDesc',
      bind: 'relationPageLOV.relationPageDesc',
    },
    {
      name: 'supplierRelationPageLOV',
      label: intl
        .get(`${prefix}.model.moldFileManagement.supplierRelationPageDesc`)
        .d('供应商关联页面'),
      type: 'object',
      required: true,
      lovCode: 'SIEC.STATE_PAGE_RELATION',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            statusConfigId: record.get('statusConfigId'),
          };
        },
      },
    },
    {
      name: 'supplierRelationPageId',
      bind: 'supplierRelationPageLOV.relationPageId',
    },
    {
      name: 'supplierRelationPageDesc',
      bind: 'supplierRelationPageLOV.relationPageDesc',
    },
    {
      name: 'editableFlag',
      label: intl.get(`${prefix}.model.moldFileManagement.editableFlag`).d('页面效果'),
      type: 'string',
    },
    {
      name: 'moduleDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleDesc`).d('业务类别'),
      type: 'string',
    },
    {
      name: 'queryRoleLOV',
      label: intl.get(`${prefix}.model.moldFileManagement.queryRoleNames`).d('查询角色'),
      type: 'object',
      required: true,
      lovCode: 'SIEC.STATE_ROLE_LOV',
      multiple: true,
    },
    {
      name: 'queryRoleIds',
      bind: 'queryRoleLOV.id',
      multiple: ',',
    },
    {
      name: 'queryRoleNames',
      bind: 'queryRoleLOV.name',
      multiple: ',',
    },
    {
      name: 'authorityEnabledFlag',
      label: intl.get(`${prefix}.model.manager.enabledFlag`).d('状态'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
  ];
  return activeKey === 'statusDefine'
    ? statusDefineFields
    : statusDefineFields.concat(statePermissionConfigFields);
};

const stateMachineStrategyLeft = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'statusConfigId',
      type: 'number',
    },
    {
      name: 'statusCode',
      label: intl.get(`${prefix}.model.moldFileManagement.statusCode`).d('状态编码'),
    },
    {
      name: 'statusDesc',
      label: intl.get(`${prefix}.model.startStatusDesc`).d('开始状态'),
      type: 'string',
    },
  ],
  transport: {
    read: (values) => {
      const { statusConfigId = '' } = values.data;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/status-details/rule/queryStatusDetailList/${statusConfigId}`,
        method: 'GET',
      };
    },
  },
});

const stateMachineStrategyRight = (workFlowFlag) => ({
  autoQuery: false,
  dataToJSON: 'dirty',
  fields: [
    {
      name: 'statusConfigId',
      type: 'number',
    },
    workFlowFlag === 1
      ? {
          name: 'workflowOperationCode',
          label: intl.get(`${prefix}.model.moldFileManagement.operationName`).d('操作名称'),
          type: 'string',
          lookupCode: 'SIEC.STATE_WORKFLOW_APPROVE',
          required: true,
        }
      : {
          name: 'operationLov',
          label: intl.get(`${prefix}.model.moldFileManagement.operationName`).d('操作名称'),
          type: 'object',
          ignore: 'always',
          lovCode: 'SIEC.STATE_OPERATION',
          lovPara: { tenantId: organizationId },
          textField: 'operationDesc',
          required: true,
        },
    workFlowFlag === 0 && {
      name: 'operationCode',
      bind: 'operationLov.operationCode',
    },
    workFlowFlag === 0 && {
      name: 'operationDesc',
      bind: 'operationLov.operationDesc',
    },
    workFlowFlag === 0 && {
      name: 'statusOperationId',
      bind: 'operationLov.statusOperationId',
    },
    {
      name: 'condition',
      label: intl.get(`${prefix}.model.moldFileManagement.condition`).d('条件规则配置'),
      type: 'string',
    },
    {
      name: 'conditionExpression',
      label: intl.get(`${prefix}.model.moldFileManagement.conditionExpression`).d('条件规则'),
    },
    {
      name: 'statusCodeLOV',
      label: intl.get(`${prefix}.model.moldFileManagement.secondaryState`).d('次级状态'),
      type: 'object',
      lovCode: 'SIEC.STATE_DETAIL',
      textField: 'statusDesc',
      required: true,
    },
    {
      name: 'statusId',
      bind: 'statusCodeLOV.statusId',
    },
    {
      name: 'statusCode',
      bind: 'statusCodeLOV.statusCode',
    },
    {
      name: 'statusDesc',
      bind: 'statusCodeLOV.statusDesc',
    },
    // {
    //   name: 'executeType',
    //   label: intl.get(`${prefix}.model.moldFileManagement.executeType`).d('动作类型'),
    // },
    // {
    //   name: 'queryRoleLov',
    //   label: intl.get(`${prefix}.model.moldFileManagement.queryRoleIds`).d('查询权限'),
    //   type: 'object',
    //   lovCode: 'SIEC.STATE_ROLE_LOV',
    //   multiple: true,
    // },
    // {
    //   name: 'queryRoleIds',
    //   type: 'string',
    //   bind: 'queryRoleLov.id',
    //   multiple: ',',
    // },
    // {
    //   name: 'queryRoleNames',
    //   type: 'string',
    //   bind: 'queryRoleLov.name',
    //   multiple: ',',
    // },
    {
      name: 'operationRoleLov',
      label: intl.get(`${prefix}.model.moldFileManagement.operationRoleIds`).d('操作权限'),
      type: 'object',
      lovCode: 'SIEC.STATE_ROLE_LOV',
      required: true,
      multiple: true,
    },
    {
      name: 'operationRoleIds',
      bind: 'operationRoleLov.id',
      multiple: ',',
    },
    {
      name: 'operationRoleNames',
      bind: 'operationRoleLov.name',
      multiple: ',',
    },
    {
      name: 'postActionIdLov',
      label: intl.get(`${prefix}.model.moldFileManagement.postAction`).d('后置动作'),
      type: 'object',
      lovCode: 'SIEC.STATE_POST_ACTION',
      textField: 'functionName',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            statusConfigId: record.data.statusConfigId,
          };
        },
      },
      multiple: true,
      require: true,
    },
    {
      name: 'postAction',
      bind: 'postActionIdLov.postActionId',
      multiple: ',',
    },
    {
      name: 'functionNames',
      bind: 'postActionIdLov.functionName',
      multiple: ',',
    },
    {
      name: 'flowCode',
      label: intl.get(`${prefix}.model.moldFileManagement.flowCodes`).d('下一状态审批方式'),
      type: 'string',
      lookupCode: 'SIEC.STATE_FLOW_CODE',
    },
    {
      name: 'nodeDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.nodeDesc`).d('节点名称'),
      type: 'string',
    },
    {
      name: 'filterCreatorFlag',
      label: intl.get(`${prefix}.model.moldFileManagement.filterCreatorFlag`).d('屏蔽创建人标志'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  transport: {
    read: (values) => {
      const { statusDetailId = '' } = values.data;
      return workFlowFlag === 1
        ? {
            url: `${SRM_SIEC}/v1/${organizationId}/status-rules/queryWorkflowRule/${statusDetailId}`,
            method: 'GET',
            data: { ...values.data },
          }
        : {
            url: `${SRM_SIEC}/v1/${organizationId}/status-rules/queryStatusRulesList/${statusDetailId}`,
            method: 'GET',
            data: { ...values.data },
          };
    },
  },
  // events:{
  //   update: ({ dataSet, record, name, value, oldValue }) => {
  //     let test;
  //     if (name === 'operationRoleLov' && value) {
  //       const oldIds = oldValue.map(n=>n.id);
  //       const newValue = value.filter(n=>{
  //         return oldIds.indexOf(n.id) === -1;
  //       });
  //       record.set('operationRoleLov',newValue);
  //       debugger;
  //     }
  //   },
  // }
});

const drawerData = (activeKey) => ({
  selection: false,
  fields: getDrawerFields(activeKey),
  transport: {
    read: (value) => {
      const {
        data: { statusDetailId },
      } = value;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/status-details/${statusDetailId}`,
        method: 'GET',
      };
    },
  },
});

export {
  treeData,
  headerData,
  tableData,
  drawerData,
  pageTableData,
  buttonTableData,
  stateMachineStrategyLeft,
  stateMachineStrategyRight,
};
