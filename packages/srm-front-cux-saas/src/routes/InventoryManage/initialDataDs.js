import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const prefix = 'scux.dhqflyInventoryManage';

// 阳光城库存查询
const tableData = () => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料描述'),
    },
    {
      name: 'inventoryUnitName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryUnitName`).d('库存单位'),
    },
    {
      name: 'bookInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.bookInventory`).d('账面库存'),
    },
    {
      name: 'occupiedInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.occupiedInventory`).d('占用库存'),
    },
    {
      name: 'availableInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.availableInventory`).d('可用库存'),
    },
    {
      name: 'specifications',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.specifications`).d('规格'),
    },
    {
      name: 'model',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.model`).d('型号'),
    },
    {
      name: 'unitPrice',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitPrice`).d('单价'),
    },
    {
      name: 'inventoryTime',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryTime`).d('库龄'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.organizationName`).d('库存组织'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryName`).d('仓库'),
    },
  ],
  queryFields: [
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料描述'),
    },
    {
      name: 'organizationLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.organizationName`).d('库存组织'),
      lovCode: 'SSLM.INV_ORGANIZATION',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
    },
    {
      name: 'organizationCode',
      bind: 'organizationLov.organizationCode',
    },
    {
      name: 'inventoryLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryName`).d('仓库'),
      lovCode: 'SCUX.YANGO.INVENTORY',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            organizationCode: record.get('organizationCode'),
          };
        },
        disabled: ({ record }) => {
          return !record.get('organizationCode');
        },
      },
    },
    {
      name: 'inventoryCode',
      bind: 'inventoryLov.inventoryCode',
    },
    {
      name: 'inventoryName',
      bind: 'inventoryLov.inventoryName',
    },
  ],
  transport: {
    read: (values) => {
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-querys/list`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

const detailData = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'changeTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeType`).d('库存变动类型'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料描述'),
    },
    {
      name: 'inventoryUnitName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryUnitName`).d('库存单位'),
    },
    {
      name: 'specifications',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.specifications`).d('规格'),
    },
    {
      name: 'model',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.model`).d('型号'),
    },
    {
      name: 'beforeChangeQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.beforeChangeQuantity`).d('变动前数量'),
    },
    {
      name: 'afterChangeQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.afterChangeQuantity`).d('变动后数量'),
    },
    {
      name: 'changeQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeQuantity`).d('变动数量'),
    },
    {
      name: 'unitPrice',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitPrice`).d('单价'),
    },
    {
      name: 'amount',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.amount`).d('金额'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.organizationName`).d('库存组织'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryName`).d('仓库'),
    },
    {
      name: 'changeTime',
      type: 'date',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeTime`).d('库存变动时间'),
    },
    {
      name: 'changeInfoCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeInfoCode`).d('库存变动单据号'),
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.netPrice`).d('不含税单价'),
    },
    {
      name: 'netAmount',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.netAmount`).d('不含税金额'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.taxIncludedAmount`).d('含税金额'),
    },
    {
      name: 'taxRate',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.taxRate`).d('税率'),
    },
    {
      name: 'taxRateAmount',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.taxRateAmount`).d('税额'),
    },
  ],
  queryFields: [
    {
      name: 'changeType',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeType`).d('库存变动类型'),
      lookupCode: 'SCUX.YANGO.INVENTORY_CHANGE_TYPE',
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料描述'),
    },
    {
      name: 'organizationLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.organizationName`).d('库存组织'),
      lovCode: 'SSLM.INV_ORGANIZATION',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
    },
    {
      name: 'organizationCode',
      bind: 'organizationLov.organizationCode',
    },
    {
      name: 'inventoryLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryName`).d('仓库'),
      lovCode: 'SCUX.YANGO.INVENTORY',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            organizationCode: record.get('organizationCode'),
          };
        },
        disabled: ({ record }) => {
          return !record.get('organizationCode');
        },
      },
    },
    {
      name: 'inventoryCode',
      bind: 'inventoryLov.inventoryCode',
    },
    {
      name: 'inventoryName',
      bind: 'inventoryLov.inventoryName',
    },
    {
      name: 'fromDate',
      type: 'date',
      label: intl.get(`${prefix}.model.eastDelliveryConfirm.fromDate`).d('库存变动时间从'),
      max: 'toDate',
      transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'toDate',
      type: 'date',
      label: intl.get(`${prefix}.model.eastDelliveryConfirm.toDate`).d('库存变动时间至'),
      min: 'fromDate',
      transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
    },
    {
      name: 'changeInfoCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeInfoCode`).d('库存变动单据号'),
    },
    {
      name: 'documentCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.documentCode`).d('来源单据号'),
    },
  ],
  transport: {
    read: (values) => {
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-change-infos/list`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

export { tableData, detailData };
