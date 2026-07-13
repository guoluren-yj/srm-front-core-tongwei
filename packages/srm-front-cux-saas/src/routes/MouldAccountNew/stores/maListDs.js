import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SIEC, PRIVATE_BUCKET } from '_utils/config';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '@/routes/MouldAccountNew/components/util';
import { isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'siec.mould.model.common';

const maListDs = ({ type = 'normal' }) => ({
  pageSize: 20,
  autoQuery: false,
  primaryKey: 'maHeaderId',
  cacheModified: true,
  cacheSelection: true,
  selection: type === 'normal' ? 'multiple' : false,
  fields: [
    {
      name: 'maStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
    },
    {
      name: 'workFlowApproveProcess',
      label: intl.get('hzero.common.button.approve.process').d('审批进度'),
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.maNum`).d('模具单号'),
      name: 'maNum',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'operate',
    },
    {
      label: intl.get('entity.company.tag').d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
      name: 'mouldPrincipalName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.supplierCompanyName`).d('外放供应商'),
      name: 'supplierCompanyName',
      type: 'string',
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
      label: intl.get(`${commonPrompt}.modelSpecs`).d('规格型号'),
      name: 'modelSpecs',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
      name: 'uomName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.shareQuality`).d('分摊模数'),
      name: 'shareQuality',
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
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.machineTonnage`).d('机台吨位'),
      name: 'machineTonnage',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.cavityQuality`).d('模腔数量'),
      name: 'cavityQuality',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.mouldType`).d('模具类型'),
      name: 'mouldTypeMeaning',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.mouldOwner`).d('模具归属权'),
      name: 'mouldOwnerMeaning',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.mouldValue`).d('模具价值（万元）'),
      name: 'mouldValue',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.effectiveTimeFrom`).d('模具有效时间从'),
      name: 'effectiveTimeFrom',
      type: 'date',
    },
    {
      label: intl.get(`${commonPrompt}.effectiveTimeTo`).d('模具有效时间至'),
      name: 'effectiveTimeTo',
      type: 'date',
    },
    {
      label: intl.get(`${commonPrompt}.usedValue`).d('模具残值'),
      name: 'usedValue',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.remainValue`).d('模具剩余价值'),
      name: 'remainValue',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.usedQuality`).d('模具总使用数量'),
      name: 'usedQuality',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.remainQuality`).d('模具剩余使用数量'),
      name: 'remainQuality',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      name: 'createdByName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.sourcePlatform`).d('模具来源'),
      name: 'sourcePlatformMeaning',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.attachment`).d('附件'),
      name: 'attachmentUuid',
      bucketName: PRIVATE_BUCKET,
      type: 'attachment',
      viewMode: 'popup',
    },
    {
      label: intl.get(`${commonPrompt}.operatorRecord`).d('操作记录'),
      name: 'operatorRecord',
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-account/list`,
        method: 'GET',
        data: {
          ...data,
          // statusConfigId: getStatusConfigId(),
          maType: type.toLocaleUpperCase(),
          customizeUnitCode:
            type.toLocaleUpperCase() === 'NORMAL'
              ? 'SIEC.MOULD_PLATFORM.LIST.ACCTOUNT_FILTER,SIEC.MOULD_PLATFORM.LIST.ACCOUNT_LIST'
              : 'SIEC.MOULD_PLATFORM.LIST.CHANGE_FILTER,SIEC.MOULD_PLATFORM.LIST.CHANGE_LIST',
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
        console.log(workFlowBussinessKeys);
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
  },
});

const maDetailList = () => ({
  pageSize: 20,
  autoQuery: false,
  primaryKey: 'maLineId',
  cacheModified: true,
  fields: [
    {
      name: 'maStatusMeaning',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.maNumAndLine`).d('模具台账编号-行号'),
      name: 'maNum',
      type: 'string',
    },
    {
      label: intl.get('entity.company.tag').d('公司'),
      name: 'companyId',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
    },

    {
      label: intl.get(`${commonPrompt}.supplierCompanyName`).d('外放供应商'),
      name: 'supplierCompanyName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
      name: 'mouldPrincipalId',
      lovCode: 'SPUC.PURCHASE_AGENT',
    },
    {
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      name: 'createdByName',
      type: 'string',
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
      name: 'itemCode',
      label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
    },
    {
      name: 'categoryId',
      label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
    },
    {
      name: 'uomId',
      label: intl.get(`${commonPrompt}.mouldUomId`).d('模具单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.quantity`).d('需求数量'),
    },
    {
      name: 'modelSpecs',
      label: intl.get(`${commonPrompt}.modelSpecs`).d('规格型号'),
    },
  ],
  transport: {
    read: values => {
      const {
        data: { ...otherData },
        params = {},
      } = values;
      const newParams = {
        ...params,
        ...otherData,
      };
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-account/line-list`,
        method: 'GET',
        data: {
          ...newParams,
          customizeUnitCode:
            'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_LINE, SIEC.MOULD_PLATFORM.LIST.ACCOUNT_FILTER_LINE',
        },
      };
    },
  },
});

const remarkDataDs = type => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'approvedRemark',
        label: intl.get('siec.mould.model.common.approveRemark').d('审批意见'),
        type: 'string',
        required: type === 'reject',
      },
    ],
  };
};

const maChangeDs = ({ type, maHeaderId }) => ({
  autoCreate: true,
  dataToJSON: 'all',
  autoQuery: false,
  fields: [
    {
      name: 'changeId',
    },
    {
      name: 'supplierFlag',
      type: 'string',
      required: type === 'transfer',
      defaultValue: type === 'transfer' ? '1' : '',
      lookupCode: 'SIEC.MOULD_TRANSFER',
      label: intl.get(`${commonPrompt}.supplierFlag`).d('转移信息'),
    },
    {
      name: 'reason',
      required: true,
      label:
        type === 'maintain'
          ? intl.get(`${commonPrompt}.maintainReason`).d('维修原因')
          : type === 'scrap'
          ? intl.get(`${commonPrompt}.scrapReason`).d('报废原因')
          : intl.get(`${commonPrompt}.transferReason`).d('转移原因'),
    },
    {
      name: 'supplierLov',
      type: 'object',
      ignore: 'always',
      required: type === 'transfer',
      textField: 'supplierCompanyName',
      lovPara: { tenantId: organizationId },
      lovCode: 'SPRM.SUPPLIER',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            externalFlag: record.get('supplierFlag') === '1' ? 1 : 0,
            tenantId: organizationId,
          };
        },
      },
      label: intl.get(`${commonPrompt}.supplier`).d('外放供应商'),
    },
    {
      name: 'supplierTenantId',
      bind: 'supplierLov.supplierTenantId',
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyNum',
      bind: 'supplierLov.supplierCompanyNum',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierLov.supplierCompanyName',
    },
  ],
  transport: {
    read: values => {
      if (values.data.maHeaderId !== undefined || maHeaderId) {
        const id = values.data.maHeaderId || maHeaderId;
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/mould-account-change/detail/${id}`,
          method: 'GET',
          data: {
            customizeUnitCode:
              'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.HEADER,SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE',
          },
          transformResponse: res => {
            const dealData = JSON.parse(res);
            const { maChangeModify, reason, ...others } = dealData;
            return { ...others, ...maChangeModify, reason };
          },
        };
      }
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
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
  },
});

export { maListDs, maChangeDs, remarkDataDs, maDetailList };
