import { fetchCategory, mouldMasterDataDetail } from '@/services/mouldMasterData';
import intl from 'utils/intl';
import moment from 'moment';
import { SRM_SIEC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '@/routes/MouldAccountNew/components/util';

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

const maDetailDs = ({
  maHeaderId,
  source = null,
  linkTableDs,
  itemTableDs,
  read,
  customizeUnitCode,
}) => ({
  paging: false,
  autoCreate: false,
  dataToJSON: 'all',
  primaryKey: 'maHeaderId',
  autoQuery: false,
  forceValidate: true,
  fields: [
    {
      name: 'mouldStatus',
      type: 'string',
      lookupCode: 'SIEC.MOULD_STATUS',
    },
    {
      name: 'maNum',
      type: 'string',
      disabled: !source,
      label: intl.get(`${commonPrompt}.maNum`).d('模具单号'),
    },
    {
      name: 'mouldLov',
      type: 'object',
      ignore: 'always',
      required: !source,
      lovPara: { tenantId: organizationId },
      label: intl.get(`${commonPrompt}.mouldNum`).d('模具编码'),
      lovCode: 'SIEC.MOULD',
    },
    {
      name: 'mouldNum',
      bind: 'mouldLov.mouldId',
    },
    {
      name: 'mouldNum',
      bind: 'mouldLov.mouldNum',
      label: intl.get(`${commonPrompt}.mouldNum`).d('模具编码'),
    },
    {
      name: 'mouldName',
      type: 'string',
      disabled: !source,
      required: !source,
      label: intl.get(`${commonPrompt}.mouldName`).d('模具名称'),
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`${commonPrompt}.attachmentUuid`).d('附件'),
      dynamicProps: {
        disabled: () => (read === true ? true : undefined),
      },
    },
    {
      name: 'supplierLov',
      type: 'object',
      ignore: 'always',
      required: !source,
      textField: 'supplierCompanyName',
      lovPara: { tenantId: organizationId },
      lovCode: 'SPRM.SUPPLIER',
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
    {
      name: 'effectiveTimeFrom',
      type: 'date',
      required: !source,
      min: moment('1970-01-01'),
      max: 'effectiveTimeTo',
      label: intl.get(`${commonPrompt}.effectiveTimeFrom`).d('模具有效日期从'),
    },
    {
      name: 'effectiveTimeTo',
      type: 'date',
      required: !source,
      label: intl.get(`${commonPrompt}.effectiveTimeTo`).d('模具有效日期至'),
      min: 'effectiveTimeFrom',
    },
    {
      name: 'usedValue',
      type: 'number',
      min: 0,
      // required: !source,
      label: intl.get(`${commonPrompt}.usedValue`).d('模具残值'),
      dynamicProps: {
        max: ({ record }) => {
          return Number(record.get('mouldValue'));
        },
      },
    },
    {
      name: 'remainValue',
      disabled: true,
      type: 'number',
      // min: 0,
      label: intl.get(`${commonPrompt}.remainValue`).d('模具剩余价值'),
    },
    {
      name: 'usedQuality',
      type: 'number',
      min: 0,
      // required: !source,
      label: intl.get(`${commonPrompt}.usedQuality`).d('模具总使用数量'),
      dynamicProps: {
        max: ({ record }) => {
          return Number(record.get('mouldQuality'));
        },
      },
    },
    {
      name: 'remainQuality',
      type: 'number',
      // min: 0,
      disabled: true,
      label: intl.get(`${commonPrompt}.remainQuality`).d('模具剩余数量'),
    },
    {
      name: 'creationDate',
      disabled: !source,
      type: 'date',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
    },
    {
      name: 'companyLov',
      type: 'object',
      ignore: 'always',
      required: !source,
      label: intl.get(`${commonPrompt}.company`).d('公司'),
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      textField: 'companyName',
      lovPara: { tenantId: organizationId },
      valueField: 'companyId',
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companyLov.companyName',
    },
    {
      name: 'mouldPrincipalLov',
      type: 'object',
      label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
      lovCode: 'SPUC.PURCHASE_AGENT',
      // disabled: !source,
      // dynamicProps: {
      //   disabled: ({ record }) => record.
      // },
      lovPara: { tenantId: organizationId },
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
    },
    {
      name: 'mouldPrincipalId',
      type: 'string',
      bind: 'mouldPrincipalLov.purchaseAgentId',
    },
    {
      name: 'mouldPrincipalName',
      type: 'string',
      bind: 'mouldPrincipalLov.purchaseAgentName',
    },
    {
      name: 'mouldType',
      type: 'string',
      disabled: !source,
      lookupCode: 'SIEC.MOULD_TYPE',
      label: intl.get(`${commonPrompt}.mouldType`).d('模具类型'),
    },
    {
      name: 'mouldOwner',
      type: 'string',
      disabled: !source,
      lookupCode: 'SIEC.MOULD_OWNER',
      label: intl.get(`${commonPrompt}.mouldOwner`).d('模具归属方'),
    },
    {
      name: 'createdByName',
      type: 'string',
      disabled: !source,
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'cavityQuality',
      type: 'string',
      disabled: !source,
      label: intl.get(`${commonPrompt}.cavityQuality`).d('模腔数量'),
    },
    {
      name: 'mouldQuality',
      disabled: !source,
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.mouldQuality`).d('模具数量'),
    },
    {
      name: 'shareQuality',
      type: 'number',
      min: 0,
      disabled: !source,
      label: intl.get(`${commonPrompt}.shareQuality`).d('分摊模数'),
    },
    {
      name: 'mouldOwner',
      type: 'string',
      disabled: !source,
      lookupCode: 'SIEC.MOULD_OWNER',
      label: intl.get(`${commonPrompt}.mouldOwner`).d('模具归属方'),
    },
    {
      name: 'uomLov',
      type: 'object',
      label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
      lovCode: 'SMDM.DUAL_UOM',
      textField: 'uomName',
      valueField: 'uomId',
      disabled: !source,
    },
    {
      name: 'uomName',
      bind: 'uomLov.uomName',
    },
    {
      name: 'uomId',
      bind: 'uomLov.uomId',
    },
    {
      name: 'modelSpecs',
      type: 'string',
      label: intl.get(`${commonPrompt}.modelSpecs`).d('规格型号'),
      disabled: !source,
    },
    {
      name: 'mouldLife',
      disabled: !source,
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.mouldLife`).d('模具寿命（次）'),
    },
    {
      name: 'mouldValue',
      disabled: !source,
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.mouldValue`).d('模具价值(万元)'),
    },
    {
      name: 'machineTonnage',
      type: 'string',
      disabled: !source,
      label: intl.get(`${commonPrompt}.machineTonnage`).d('机台吨位'),
    },
    {
      name: 'moldingCycle',
      type: 'string',
      disabled: !source,
      label: intl.get(`${commonPrompt}.moldingCycle`).d('成型周期'),
    },
    {
      name: 'objectVersionNumber',
      disabled: !source,
      type: 'string',
      label: intl.get(`${commonPrompt}.objectVersionNumber`).d('版本'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { newMaHeaderId } = data;
      const currentId = maHeaderId || newMaHeaderId;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-account/${currentId}`,
        method: 'get',
        data: { customizeUnitCode },
      };
    },
  },
  children: {
    maLineList: itemTableDs,
    mouldAccountLineExpandList: linkTableDs,
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'mouldLov' && value) {
        const { mouldId } = value;
        mouldMasterDataDetail(mouldId).then(res => {
          if (res && !res.failed) {
            const {
              _token,
              objectVersionNumber,
              mouldItemList,
              mouldLineExpandList,
              mouldStatus,
              creationDate,
              ...others
            } = res;
            record.set({
              ...others,
            });
            itemTableDs.loadData(mouldItemList);
            linkTableDs.loadData(mouldLineExpandList);
          }
        });
      }
    },
    load: async ({ dataSet }) => {
      const { current } = dataSet;
      if (current) {
        const workflowBusinessKey = dataSet.current.get('workflowBusinessKey');
        if (workflowBusinessKey) {
          // 获取审批按钮显示状态
          const approvaFlags = await queryBatchApprovaFlag([workflowBusinessKey]);
          // 获取撤销审批按钮状态
          const operationFlags = await getBatchOperationFlag([workflowBusinessKey]);
          dataSet.setState({ approvaFlags, operationFlags });
        }
      }
    },
  },
});

const tableLineDS = () => {
  return {
    paging: false,
    dataToJSON: 'all',
    autoQuery: false,
    // primaryKey: 'maLineId',
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'itemLov',
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
              companyId: dataSet.parent && dataSet.parent?.current?.get('companyId'),
            };
          },
        },
        // required: true,
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        bind: 'itemLov.itemCode',
      },
      {
        name: 'itemId',
        type: 'string',
        bind: 'itemLov.itemId',
        label: '物料id',
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
              itemId: record.get('itemId'),
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
        dynamicProps: {
          // disabled: ({ record }) => record.get('itemCode')?.itemCode,
        },
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
        if (name === 'itemLov') {
          if (value) {
            const { itemCode, itemName, itemId, uomId, uomName } = value;
            record.set({
              tenantId: organizationId,
              itemId,
              itemLov: { itemCode, itemName, itemId },
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
              itemId: '',
              itemLov: {},
              itemName: '',
              uomId: {},
              categoryId: {},
            });
          }
        }
      },
    },
  };
};

const maDetailModifyDs = ({ changeTableDs, maExpandLineDs, maHeaderId }) => ({
  paging: false,
  autoCreate: true,
  dataToJSON: 'all',
  autoQuery: false,
  fields: [
    {
      name: 'mouldStatus',
      type: 'string',
      lookupCode: 'SIEC.MOULD_STATUS',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get(`${commonPrompt}.attachmentUuid`).d('附件'),
    },
    {
      name: 'reason',
      type: 'string',
      required: true,
      label: intl.get(`siec.mould.common.modifyReason`).d('变更原因'),
    },
    {
      name: 'effectiveTimeFrom',
      type: 'date',
      min: moment('1970-01-01'),
      max: 'effectiveTimeTo',
      label: intl.get(`${commonPrompt}.effectiveTimeFrom`).d('模具有效日期从'),
    },
    {
      name: 'effectiveTimeTo',
      type: 'date',
      label: intl.get(`${commonPrompt}.effectiveTimeTo`).d('模具有效日期至'),
      min: 'effectiveTimeFrom',
    },
    {
      name: 'usedValue',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.usedValue`).d('模具残值'),
    },
    {
      name: 'remainValue',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.remainValue`).d('模具剩余价值'),
    },
    {
      name: 'usedQuality',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.usedQuality`).d('模具总使用数量'),
    },
    {
      name: 'remainQuality',
      type: 'number',
      min: 0,
      label: intl.get(`${commonPrompt}.remainQuality`).d('模具剩余数量'),
    },
    {
      name: 'mouldPrincipalLov',
      type: 'object',
      label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
      lovCode: 'SPUC.PURCHASE_AGENT',
      lovPara: { tenantId: organizationId },
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
    },
    {
      name: 'mouldPrincipalId',
      type: 'string',
      bind: 'mouldPrincipalLov.purchaseAgentId',
    },
    {
      name: 'mouldPrincipalName',
      type: 'string',
      bind: 'mouldPrincipalLov.purchaseAgentName',
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
      name: 'mouldOwner',
      type: 'string',
      lookupCode: 'SIEC.MOULD_OWNER',
      label: intl.get(`${commonPrompt}.mouldOwner`).d('模具归属方'),
    },
    {
      name: 'uomLov',
      type: 'object',
      label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
      lovCode: 'SMDM.DUAL_UOM',
      textField: 'uomName',
      valueField: 'uomId',
    },
    {
      name: 'uomName',
      bind: 'uomLov.uomName',
    },
    {
      name: 'uomId',
      bind: 'uomLov.uomId',
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
      name: 'objectVersionNumber',
      type: 'string',
      label: intl.get(`${commonPrompt}.objectVersionNumber`).d('版本'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`hzero.common.remark`).d('备注'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { newMaHeaderId } = data;
      const currentId = maHeaderId || newMaHeaderId;
      return {
        url: `${SRM_SIEC}/v1/${organizationId}/mould-account-change/detail/${currentId}`,
        method: 'get',
        data: {
          customizeUnitCode:
            'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.HEADER,SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE',
        },
        transformResponse: res => {
          const dealData = JSON.parse(res);
          const { maChangeModify, reason, changeType } = dealData;
          return changeType === 'MODIFY' ? { ...maChangeModify, reason } : dealData;
        },
      };
    },
  },
  children: {
    modifyLineList: changeTableDs,
    modifyLineExpandList: maExpandLineDs,
  },
});

const maExpandLine = () => {
  return {
    paging: false,
    dataToJSON: 'all',
    autoQuery: false,
    // primaryKey: 'maExpandLineId',
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
      },
    ],
  };
};

const reasonFormDs = ({ pageForm }) => {
  return {
    paging: false,
    dataToJSON: 'all',
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'reason',
        type: 'string',
        required: true,
      },
      {
        name: 'supplierFlag',
        type: 'string',
        required: pageForm === 'transfer',
        defaultValue: pageForm === 'transfer' ? '1' : '',
        lookupCode: 'SIEC.MOULD_TRANSFER',
        label: intl.get(`${commonPrompt}.supplierFlag`).d('转移信息'),
      },
      {
        name: 'supplierLov',
        type: 'object',
        ignore: 'always',
        textField: 'supplierCompanyName',
        lovPara: { tenantId: organizationId },
        lovCode: 'SPRM.SUPPLIER',
        dynamicProps: {
          required: ({ record }) => record.get('supplierFlag') === '1' && pageForm === 'transfer',
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
  };
};

export { maDetailDs, tableLineDS, maDetailModifyDs, maExpandLine, reasonFormDs };
