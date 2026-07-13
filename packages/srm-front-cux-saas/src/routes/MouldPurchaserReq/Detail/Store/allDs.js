import { fetchCategory } from '@/services/mouldMasterData';
import intl from 'utils/intl';
import { SRM_SIEC, PRIVATE_BUCKET } from '_utils/config';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';

import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '../../util';

function c7nAmountFormatterOptions(getPrecision) {
  return props => {
    const precision = getPrecision(props);
    const options = {
      maximumFractionDigits: precision || 20,
    };
    if (precision) {
      options.minimumFractionDigits = precision;
    }
    return { options };
  };
}

const organizationId = getCurrentOrganizationId();

const commonPrompt = 'siec.mould.model.common';

const maDetailDs = ({ mouldReqId, linkTableDs, itemTableDs, customizeUnitCode, isSupplier }) => ({
  paging: false,
  autoCreate: false,
  dataToJSON: 'all',
  primaryKey: 'mouldReqId',
  autoQuery: false,
  forceValidate: true,
  fields: [
    {
      label: intl.get(`${commonPrompt}.mouldReqNum`).d('模具申请单编码'),
      name: 'mouldReqNum',
      type: 'string',
      disabled: true,
    },
    {
      name: 'mouldReqStatus',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
      lookupCode: 'SIEC_MOULD_REQ_STATUS',
    },
    {
      name: 'mouldNum',
      disabled: true,
      pattern: /^[a-zA-Z0-9_-]*$/,
      label: intl.get(`${commonPrompt}.mouldNum`).d('模具编码'),
    },
    {
      name: 'mouldName',
      type: 'string',
      required: true,
      label: intl.get(`${commonPrompt}.mouldName`).d('模具名称'),
    },
    {
      name: 'supplierLov',
      type: 'object',
      ignore: 'always',
      textField: 'supplierCompanyName',
      lovPara: { tenantId: organizationId },
      lovCode: 'SPRM.SUPPLIER',
      required: isSupplier,
      dynamicProps: {
        label: () =>
          isSupplier
            ? intl.get('entity.company.tag').d('公司')
            : intl.get(`${commonPrompt}.supplier`).d('外放供应商'),
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            enabledFlag: 1,
            supplierTenantId: isSupplier ? getUserOrganizationId() : null,
            companyId: isSupplier
              ? null
              : record.get('companyId')?.companyId || record.get('companyId'),
          };
        },
      },
    },
    {
      name: 'supplierId',
      bind: 'supplierLov.supplierId',
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
    {
      name: 'creationDate',
      disabled: true,
      type: 'date',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
    },
    {
      name: 'companyId',
      type: 'object',
      textField: 'companyName',
      required: isSupplier,
      lovCode: isSupplier ? 'SIEC_SUPPLIER_PARTNER' : 'SPFM.USER_AUTH.COMPANY',
      dynamicProps: {
        label: () =>
          isSupplier
            ? intl.get(`${commonPrompt}.custom`).d('客户')
            : intl.get(`${commonPrompt}.company`).d('公司'),
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            enabledFlag: 1,
            supplierTenantId: isSupplier ? getUserOrganizationId() : null,
            supplierCompanyId: isSupplier ? record?.get('supplierCompanyId') : null,
          };
        },
      },
      transformResponse(value, data) {
        if (value) {
          return {
            companyId: value,
            companyName: data.companyName,
          };
        } else {
          return null;
        }
      },
      transformRequest: value => value?.companyId,
      lovPara: { tenantId: organizationId },
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companyId.companyName',
    },
    {
      label: intl.get(`${commonPrompt}.sourcePlatform`).d('模具来源'),
      name: 'sourcePlatformMeaning',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.sourcePlatform`).d('模具来源'),
      name: 'sourcePlatform',
      type: 'string',
    },
    {
      name: 'mouldPrincipalId',
      type: 'object',
      label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
      lovCode: 'SPUC.PURCHASE_AGENT',
      lovPara: { tenantId: organizationId },
      transformRequest: value => value?.purchaseAgentId || value?.mouldPrincipalId,
      transformResponse(value, data) {
        if (value) {
          return {
            purchaseAgentId: value,
            mouldPrincipalId: value,
            purchaseAgentName: data.mouldPrincipalName,
            mouldPrincipalName: data.mouldPrincipalName,
          };
        } else {
          return null;
        }
      },
    },
    {
      name: 'mouldPrincipalName',
      bind: 'mouldPrincipalId.purchaseAgentName',
    },
    {
      name: 'mouldType',
      type: 'string',
      lookupCode: 'SIEC.MOULD_TYPE',
      label: intl.get(`${commonPrompt}.mouldType`).d('模具类型'),
    },
    {
      name: 'mouldOwner',
      type: 'string',
      lookupCode: 'SIEC.MOULD_OWNER',
      label: intl.get(`${commonPrompt}.mouldOwner`).d('模具归属方'),
    },
    {
      name: 'createdBy',
      type: 'string',
      disabled: true,
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'cavityQuality',
      type: 'string',
      label: intl.get(`${commonPrompt}.cavityQuality`).d('模腔数量'),
    },
    {
      name: 'mouldQuality',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.mouldQuality`).d('模具数量'),
    },
    {
      name: 'shareQuality',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.shareQuality`).d('分摊模数'),
    },
    {
      name: 'uomId',
      type: 'object',
      label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
      lovCode: 'SMDM.DUAL_UOM',
      textField: 'uomName',
      required: true,
      valueField: 'uomId',
      transformRequest: value => value?.uomId,
      transformResponse(value, data) {
        if (value) {
          return {
            uomId: value,
            uomName: data.uomName,
          };
        } else {
          return null;
        }
      },
    },
    {
      name: 'uomName',
      bind: 'uomId.uomName',
    },
    {
      name: 'modelSpecs',
      type: 'string',
      label: intl.get(`${commonPrompt}.modelSpecs`).d('规格型号'),
    },
    {
      name: 'mouldLife',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.mouldLife`).d('模具寿命（次）'),
    },
    {
      name: 'mouldValue',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.mouldValue`).d('模具价值(万元)'),
    },
    {
      name: 'machineTonnage',
      type: 'string',
      label: intl.get(`${commonPrompt}.machineTonnage`).d('机台吨位'),
    },
    {
      name: 'moldingCycle',
      type: 'string',
      label: intl.get(`${commonPrompt}.moldingCycle`).d('成型周期'),
    },
    {
      name: 'userCamp',
      type: 'string',
      lookupCode: 'SIEC_MOULD_REQ_SUPPLIER_CREATE_FLAG',
      label: intl.get(`${commonPrompt}.userCampSupplierFlag`).d('是否供应商创建'),
    },
    {
      name: 'mouldReqVersion',
      type: 'string',
      disabled: true,
      label: intl.get(`${commonPrompt}.objectVersionNumber`).d('版本'),
    },
    {
      name: 'objectVersionNumber',
      type: 'string',
      label: intl.get(`${commonPrompt}.objectVersionNumber`).d('版本'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
    {
      label: intl.get('hzero.common.view.title.attachment').d('附件'),
      type: 'attachment',
      name: 'attachmentUuid',
      bucketName: PRIVATE_BUCKET,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-reqs/${mouldReqId}`,
        method: 'get',
        data: { customizeUnitCode },
      };
    },
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'companyId' && value) {
        record.set({ supplierLov: null });
      }
    },
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

  children: {
    mouldReqItemList: itemTableDs,
    mouldReqLineExpandList: linkTableDs,
  },
});

const tableLineDS = () => {
  return {
    paging: false,
    dataToJSON: 'all',
    autoQuery: false,
    primaryKey: 'maLineId',
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'itemId',
        type: 'object',
        ignore: 'always',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              companyId: dataSet.parent && dataSet.parent.current.get('companyId')?.companyId,
            };
          },
        },
        transformRequest: value => value?.itemId,
        transformResponse(value, data) {
          if (value) {
            return {
              itemId: value,
              itemCode: data.itemCode,
            };
          } else {
            return null;
          }
        },
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        required: true,
        maxLength: 360,
      },
      {
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        name: 'categoryId',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        optionsProps: {
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: record => record.get('isCheck') !== false,
            },
          },
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              itemId: record.get('itemId')?.itemId || record.get('itemId'),
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              categoryId: value,
              categoryName: data.categoryName,
            };
          } else {
            return null;
          }
        },
        transformRequest: value => value?.categoryId,
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      },
      {
        name: 'uomId',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM',
        type: 'object',
        textField: 'uomName',
        required: true,
        valueField: 'uomId',
        transformResponse(value, data) {
          if (value) {
            return {
              uomId: value,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomPrecision: data.uomPrecision,
              // uomCodeAndName: data.uomCodeAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: value => value?.uomId,
        dynamicProps: {},
      },
      {
        name: 'uomName',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        bind: 'uomId.uomName',
      },
      {
        name: 'quantity',
        type: 'number',
        min: 0,
        label: intl.get(`${commonPrompt}.quantity`).d('需求数量'),
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) => (record && record.get('decimalPlaces')) || undefined
          ),
        },
      },
      {
        name: 'modelSpecs',
        type: 'string',
        label: intl.get(`${commonPrompt}.modelSpecs`).d('规格型号'),
      },
    ],
    events: {
      update: ({ name, value, record }) => {
        if (name === 'itemId') {
          if (value) {
            const { itemCode, itemName, itemId, uomId, uomName } = value;
            record.set({
              tenantId: organizationId,
              itemCode,
              itemName,
              uomId: {
                uomId,
                uomName,
              },
            });
            if (itemId) {
              fetchCategory({ itemId, enabledFlag: 1, defaultFlag: 1 }).then(res => {
                if (res && res.length === 1) {
                  const [{ categoryId, categoryName }] = res;
                  record.set({
                    categoryId: {
                      categoryId,
                      categoryName,
                    },
                  });
                } else {
                  record.set({
                    categoryId: {
                      categoryId: '',
                      categoryName: '',
                    },
                  });
                }
              });
            }
          } else {
            record.set({
              tenantId: organizationId,
              itemId: null,
              itemName: null,
              uomId: null,
              categoryId: null,
            });
          }
        }
      },
    },
  };
};

const maExpandLine = () => {
  return {
    paging: false,
    dataToJSON: 'all',
    autoQuery: false,
    primaryKey: 'maExpandLineId',
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
      },
    ],
  };
};

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

export { maDetailDs, tableLineDS, maExpandLine, remarkDataDs };
