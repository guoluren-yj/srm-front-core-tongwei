import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC } from '_utils/config';
import { isEmpty } from 'lodash';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from './util';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'siec.mould.model.common';

const maListDs = ({ isSupplier }) => ({
  pageSize: 20,
  autoQuery: false,
  dataToJSON: 'selected',
  primaryKey: 'mouldReqId',
  cacheModified: true,
  cacheSelection: true,
  fields: [
    {
      name: 'mouldReqStatus',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
      lookupCode: 'SIEC_MOULD_REQ_STATUS',
    },
    {
      label: intl.get(`${commonPrompt}.mouldReqNum`).d('模具申请单编码'),
      name: 'mouldReqNum',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operate',
    },
    {
      label: intl.get(`${commonPrompt}.mouldNum`).d('模具编码'),
      name: 'mouldNum',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.mouldName`).d('模具名称'),
      name: 'mouldName',
      type: 'string',
    },
    {
      dynamicProps: {
        label: () =>
          isSupplier
            ? intl.get(`${commonPrompt}.custom`).d('客户')
            : intl.get(`${commonPrompt}.company`).d('公司'),
      },
      name: 'companyId',
    },
    {
      dynamicProps: {
        label: () =>
          isSupplier
            ? intl.get('entity.company.tag').d('公司')
            : intl.get(`${commonPrompt}.supplier`).d('外放供应商'),
      },
      name: 'supplier',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.sourcePlatform`).d('模具来源'),
      name: 'sourcePlatform',
      type: 'string',
    },
    {
      name: 'workFlowApproveProcess',
      label: intl.get('hzero.common.button.approve.process').d('审批进度'),
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      name: 'createdBy',
      type: 'string',
    },
    {
      name: 'mouldQuality',
      type: 'number',
      label: intl.get(`${commonPrompt}.mouldQuality`).d('模具数量'),
    },
    {
      label: intl.get(`${commonPrompt}.shareQuality`).d('分摊模数'),
      name: 'shareQuality',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.userCamp`).d('是否供应商创建'),
      name: 'userCamp',
    },
    {
      label: intl.get(`${commonPrompt}.mouldOwner`).d('模具归属权'),
      name: 'mouldOwner',
      type: 'string',
    },
    {
      name: 'mouldReqVersion',
      type: 'number',
      disabled: true,
      label: intl.get(`${commonPrompt}.objectVersionNumber`).d('版本'),
    },
    {
      name: 'uomId',
      type: 'object',
      label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
    },
    {
      label: intl.get(`${commonPrompt}.modelSpecs`).d('规格型号'),
      name: 'modelSpecs',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.machineTonnage`).d('机台吨位'),
      name: 'machineTonnage',
      type: 'string',
    },

    {
      label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
      name: 'mouldPrincipalId',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.cavityQuality`).d('模腔数量'),
      name: 'cavityQuality',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.mouldLife`).d('模具寿命（次）'),
      name: 'mouldLife',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.moldingCycle`).d('成型周期'),
      name: 'moldingCycle',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.lastUpdatedBy`).d('最后更新人'),
      name: 'lastUpdatedBy',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.lastUpdateDate`).d('最后更新时间'),
      name: 'lastUpdateDate',
      type: 'data',
    },
    {
      label: intl.get(`${commonPrompt}.approvalMethod`).d('审批方式'),
      name: 'approvalMethod',
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-reqs`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: isSupplier
            ? 'SIEC.MOULD_REQ_SUPPLIER.SEARCH,SIEC.MOULD_REQ_SUPPLIER.LIST'
            : 'SIEC.MOULD_REQ.LIST,SIEC.MOULD_REQ.SEARCHAR',
        },
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
      const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
        const value = cur.get('workflowBusinessKey');
        if (value) {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 查询审批记录数据
        const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
          workFlowBussinessKeys
        );
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        console.log(approvaFlags, operationFlags);
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
  },
});

const maVisionDs = ({ mouldReqId, mouldId }) => ({
  pageSize: 20,
  autoQuery: true,
  selection: false,
  primaryKey: 'mouldId',
  cacheModified: true,
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`${commonPrompt}.mouldReqNum`).d('模具申请单编码'),
      name: 'mouldReqNum',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      name: 'createdBy',
      type: 'string',
    },

    {
      label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      name: 'creationDate',
      type: 'date',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-reqs/mould-req-history`,
        method: 'GET',
        data: { ...data, mouldReqId, mouldId },
      };
    },
  },
});

const maHistoryDs = mouldReqId => ({
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
        lookupCode: 'SIEC.REQ.MODLE.ACTION.STATUS',
        lovPara: { mouldReqId },
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
        url: `${SRM_SIEC}/v1/${organizationId}/mould-reqs/mould-req-action/${mouldReqId}`,
        method: 'GET',
      };
    },
  },
});

const approveHistroyDs = mouldReqId => ({
  dataToJSON: 'all',
  autoQuery: false,
  selection: false,
  autoCreate: false,
  fields: [],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-reqs/workflow-history/${mouldReqId}`,
        method: 'GET',
      };
    },
  },
});

const mouldReqCreate = () => ({
  dataToJSON: 'dirty',
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      label: intl.get(`${commonPrompt}.mouldReqType`).d('单据类型'),
      name: 'mouldReqType',
      type: 'string',
      required: true,
      lookupCode: 'SIEC.MOULD_REQ_TYPE',
    },
    {
      label: intl.get(`${commonPrompt}.mouldItem`).d('模具'),
      name: 'mould',
      type: 'object',
      dynamicProps: {
        disabled: ({ record }) => record.get('mouldReqType') !== 'CHANGE',
        required: ({ record }) => record.get('mouldReqType') === 'CHANGE',
      },
      lovCode: 'SIEC.MOULD_REQ_CHANGEABLE',
    },
  ],
  events: {
    update: ({ name, value, record }) => {
      if (name === 'mouldReqType') {
        if (value && value === 'NEW') {
          record.set({
            mould: null,
          });
        }
      }
    },
  },
});

export { maListDs, maVisionDs, maHistoryDs, approveHistroyDs, mouldReqCreate };
