import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';

// 列表页面-表格ds-查询条件
function getQueryFields() {
  return [
    {
      name: 'postageType',
      label: intl.get('scux.feeRuleManagement.model.twnf.additionalTypeMeaning').d('费用类型'),
      lookupCode: 'TWNF_SCFYLX',
    },
    {
      name: 'postageStatus',
      label: intl.get('scux.feeRuleManagement.model.twnf.status').d('状态'),
      lookupCode: 'HPFM.ENABLED_FLAG',
    },
    {
      name: 'pricingMethod',
      label: intl.get('scux.feeRuleManagement.model.twnf.pricingType').d('计价方式'),
      lookupCode: 'TWNF_JJFS',
    },
    {
      name: 'creationDate',
      label: intl.get('scux.feeRuleManagement.model.twnf.createdTime').d('创建时间'),
      type: 'dateTime',
      visible: false,
      sortFlag: true,
    },
  ];
}

// 列表页面-表格ds
export const listTableDataSet = () => {
  return {
    primaryKey: 'ruleId',
    autoQuery: false,
    selection: false,
    pageSize: 50,
    fields: [
      {
        name: 'postageStatus',
        label: intl.get('scux.feeRuleManagement.model.twnf.status').d('状态'),
        transformResponse: (value) => (value ? Number(value) : 0),
      },
      {
        name: 'postageName',
        label: intl.get('scux.feeRuleManagement.model.twnf.postageName').d('附加费名称'),
      },
      {
        name: 'postageType',
        label: intl.get('scux.feeRuleManagement.model.twnf.additionalTypeMeaning').d('费用类型'),
        lookupCode: 'TWNF_SCFYLX',
      },
      {
        name: 'pricingMethod',
        label: intl.get('scux.feeRuleManagement.model.twnf.pricingMethod').d('计价方式'),
        lookupCode: 'TWNF_JJFS',
      },
      {
        name: 'createdBy',
        label: intl.get('scux.feeRuleManagement.model.twnf.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('scux.feeRuleManagement.model.twnf.createdTime').d('创建时间'),
        type: 'dateTime',
      },
    ],
    queryFields: getQueryFields().map((i) => ({ ...i, display: true })),
    transport: {
      read: ({ params, data }) => {
        return {
          url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/NtMcqwUHp4vjNP16jhZUgeiaqy5EhGqe1cpCibg53t2qM`,
          method: 'GET',
          data: {
            ...(params || {}),
            ...(data || {}),
          },
        };
      },
    },
  };
};

// 明细页面-新建费用-表单信息-ds
export const basicInfoDataSet = () => ({
  autoQuery: false,
  forceValidate: true,
  fields: [
    {
      name: 'postageName',
      label: intl.get('scux.feeRuleManagement.model.twnf.postageName').d('费用名称'),
      required: true,
    },
    {
      name: 'postageType',
      label: intl.get('scux.feeRuleManagement.model.twnf.postageType').d('费用类型'),
      lookupCode: 'TWNF_SCFYLX',
      required: true,
    },
    {
      name: 'pricingMethod',
      label: intl.get('scux.feeRuleManagement.model.twnf.pricingMethod').d('计价方式'),
      lookupCode: 'TWNF_JJFS',
      required: true,
    },
    {
      name: 'taxInclusivePrice',
      label: intl.get('scux.feeRuleManagement.model.twnf.feeIncludeTaxUnitPrice').d('费用含税单价'),
      type: 'number',
      min: 0,
      dynamicProps: {
        required({ record }) {
          return record.get('pricingMethod') === 'J01';
        },
      },
    },
    {
      name: 'postageStatus',
      label: intl.get('scux.feeRuleManagement.model.twnf.enable').d('启用'),
      type: 'boolean',
      trueValue: '1',
      falseValue: '0',
      defaultValue: '1',
    },
  ],
});

// 明细页面-数量阶梯费用-明细行-ds
export const detailTableLineDataSet = () => ({
  autoQuery: false,
  primaryKey: 'lineId',
  forceValidate: true,
  paging: false,
  fields: [
    {
      name: 'quantityStart',
      label: intl.get('scux.feeRuleManagement.model.twnf.quantityStart').d('数量起（大于或等于）'),
      precision: 0,
      required: true,
      type: 'number',
      dynamicProps: {
        max: ({ record }) => {
          const quantityEnd = record.get('quantityEnd');
          if (record && quantityEnd && quantityEnd > 0) {
            return quantityEnd - 1;
          }
        },
      },
    },
    {
      name: 'quantityEnd',
      label: intl.get('scux.feeRuleManagement.model.twnf.quantityEnd').d('数量止（小于）'),
      precision: 0,
      type: 'number',
      dynamicProps: {
        min: ({ record }) => {
          const quantityStart = record.get('quantityStart');
          if (record && (quantityStart || quantityStart === 0)) {
            return quantityStart + 1;
          }
        },
        required({ dataSet, record }) {
          const lastRecord = dataSet.records[dataSet.records.length - 1];
          const { lineId, temporaryId } = record?.get(['lineId', 'temporaryId']) || {};
          const { lineId: lastLineId, temporaryId: lastTemporaryId } =
            lastRecord?.get(['lineId', 'temporaryId']) || {};
          if (
            (lineId && lineId !== lastLineId) ||
            (temporaryId && temporaryId !== lastTemporaryId)
          ) {
            return true;
          }
          return false; // 最后一行数量止不必输
        },
      },
    },
    {
      name: 'taxInclusivePrice',
      label: intl.get('scux.feeRuleManagement.model.twnf.feeIncludeTaxPrice').d('费用含税单价'),
      type: 'number',
      min: 0,
      precision: 2,
      required: true,
    },
  ],
  transport: {
    destroy: ({ data }) => {
      return {
        url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/NtMcqwUHp4vjNP16jhZUgeiaqy5EhGqe1cpCibg53t2qM`,
        method: 'POST',
        data: {
          operateType: 'deleteLines',
          lineIds: (data || []).map((item) => item.lineId),
        },
      };
    },
  },
});
