import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from '_utils/config';

const prefix = 'scux.moldFileManagement';
const organizationId = getCurrentOrganizationId();

const tableData = () => ({
  autoQuery: true,
  selection: false,
  parentField: 'parentConfigId',
  idField: 'statusConfigId',
  paging: 'server',
  pageSize: 10,
  fields: [
    {
      name: 'statusConfigId',
    },
    { name: 'parentConfigId', type: 'number', parentFieldName: 'statusConfigId' },
    {
      name: 'moduleDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleDesc`).d('名称'),
      type: 'string',
    },
    {
      name: 'moduleCode',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleCode`).d('编码'),
      type: 'string',
    },
    {
      name: 'sortNum',
      label: intl.get(`${prefix}.model.manager.sortNum`).d('排序号'),
      type: 'number',
    },
    {
      name: 'typeCodeMeaning',
      label: intl.get(`${prefix}.model.moldFileManagement.typeCode`).d('类型'),
      type: 'string',
    },
    {
      name: 'enabledFlag',
      label: intl.get(`${prefix}.model.manager.enabledFlag`).d('状态'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'tenantName',
      label: intl.get(`${prefix}.model.moldFileManagement.tenant`).d('所属租户'),
    },
  ],

  queryFields: [
    {
      name: 'moduleCode',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleCode`).d('编码'),
      type: 'string',
    },
    {
      name: 'moduleDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleDesc`).d('名称'),
    },
    {
      name: 'tenantLOV',
      label: intl.get(`${prefix}.model.moldFileManagement.tenant`).d('租户'),
      type: 'object',
      ignore: 'always',
      lovCode: 'HPFM.TENANT',
    },
    {
      name: 'tenantId',
      bind: 'tenantLOV.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantLOV.tenantName',
    },
  ],

  transport: {
    read: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/module-status-configs/queryStatusConfigTreeList`,
        method: 'GET',
      };
    },
  },
});

const drawerData = () => ({
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'moduleDesc',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleDesc`).d('名称'),
      type: 'intl',
      required: true,
    },
    {
      name: 'moduleCode',
      label: intl.get(`${prefix}.model.moldFileManagement.moduleCode`).d('编码'),
      type: 'string',
      required: true,
    },
    {
      name: 'sortNum',
      label: intl.get(`${prefix}.model.manager.sortNum`).d('排序号'),
      type: 'number',
    },
    // {
    //   name: 'statusMachineDesc',
    //   label: intl.get(`${prefix}.model.moldFileManagement.statusMachineDesc`).d('描述'),
    //   type: 'string',
    //   required: true,
    // },
    {
      name: 'typeCode',
      label: intl.get(`${prefix}.model.moldFileManagement.typeCode`).d('类型'),
      type: 'string',
      required: true,
      lookupCode: 'SIEC.MODULE_STATUS_TYPE',
    },
    {
      name: 'organizationLOV',
      label: intl.get(`${prefix}.model.moldFileManagement.tenant`).d('所属租户'),
      type: 'object',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('typeCode') !== 'CATALOGUE';
        },
      },
      required: true,
      lovCode: 'HPFM.TENANT',
    },
    {
      name: 'organizationId',
      bind: 'organizationLOV.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'organizationLOV.tenantName',
    },
    {
      name: 'enabledFlag',
      label: intl.get(`${prefix}.model.manager.enabledFlag`).d('状态'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'categoryParentLov',
      label: intl.get(`${prefix}.model.moldFileManagement.categoryParent`).d('上级单据流程'),
      type: 'object',
      lovCode: 'SIEC.STATE_SUPER_MODULE',
      ignore: 'always',
      textField: 'moduleDesc',
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const {
            queryParameter: { statusConfigId },
          } = dataSet;
          return {
            tenantId: organizationId,
            statusConfigId,
          };
        },
      },
    },
    {
      name: 'classificationDesc',
      bind: 'categoryParentLov.moduleDesc',
    },
    {
      name: 'parentConfigId',
      bind: 'categoryParentLov.statusConfigId',
    },
  ],
  transport: {
    read: (value) => {
      const {
        data: { statusConfigId },
      } = value;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/module-status-configs/queryStatusMachineDetail/${statusConfigId}`,
        method: 'GET',
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'organizationLOV' && record.status === 'update') {
        let modulePrefix = ''; // 原服务前缀
        let tenantSuffix = ''; // 新服务租户
        const originCode = record.getPristineValue('moduleCode');
        const orgId = record.getPristineValue('organizationId');
        if (!value) {
          record.set('moduleCode', originCode);
          return;
        }
        if (orgId === 0) {
          modulePrefix =
            originCode.lastIndexOf('_') === originCode.indexOf('_')
              ? originCode
              : originCode.slice(0, originCode.lastIndexOf('_'));
        } else {
          modulePrefix = originCode.slice(0, originCode.lastIndexOf('_'));
        }
        const { tenantNum = '' } = value;
        if (tenantNum && tenantNum.includes('SRM-')) {
          tenantSuffix = `_${tenantNum.split('-')[1]}` || '';
        } else if (tenantNum !== 'SRM') {
          tenantSuffix = `_${tenantNum}`;
        } else if (tenantNum === 'SRM') {
          record.set('moduleCode', originCode);
          return;
        } else {
          tenantSuffix = '';
        }
        record.set('moduleCode', modulePrefix + tenantSuffix);
      } else if (name === 'organizationLOV' && value && record.status === 'add') {
        let tenantSuffix = '';
        let moduleCode = record.get('moduleCode');
        const { tenantNum = '' } = value;
        if (tenantNum && tenantNum.includes('SRM-')) {
          tenantSuffix = `_${tenantNum.split('-')[1]}` || '';
        } else if (tenantNum !== 'SRM') {
          tenantSuffix = `_${tenantNum}`;
        } else {
          tenantSuffix = '';
        }
        record.set('moduleCode', moduleCode + tenantSuffix);
        moduleCode = '';
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
      type: 'intl',
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

  transport: {
    read: (values) => {
      const { pageOrganizationId, ...other } = values.data;
      return {
        url: `${SRM_SIEC}/v1/${pageOrganizationId}/status-relation-pages/queryStatusRelationPageList`,
        method: 'GET',
        data: { ...other },
      };
    },
  },
});

const postActionTableData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'postActionId',
    },
    {
      name: 'statusConfigId',
    },
    {
      name: 'functionPath',
      label: intl.get(`${prefix}.model.functionPath`).d('方法全路径'),
      type: 'string',
    },
    {
      name: 'functionName',
      label: intl.get(`${prefix}.model.functionPath`).d('方法名称'),
      type: 'intl',
    },
    {
      name: 'enabledFlag',
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

  transport: {
    read: (values) => {
      const { pageOrganizationId, statusConfigId, ...other } = values.data;
      return {
        url: `${SRM_SIEC}/v1/${pageOrganizationId}/status-post-actions/${statusConfigId}`,
        method: 'GET',
        data: { ...other },
      };
    },
  },
});

export { tableData, drawerData, pageTableData, postActionTableData };
