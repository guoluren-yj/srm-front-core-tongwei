import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const prefix = 'scux.dhqflyInventoryManage';

// 库存管理整单各状态列表
const tableData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.status`).d('状态'),
    },
    {
      name: 'inventoryTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryType`).d('类型'),
    },
    {
      name: 'documentCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.documentCode`).d('单据编号'),
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
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.remark`).d('备注说明'),
    },
  ],
  queryFields: [
    {
      name: 'inventoryType',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryType`).d('类型'),
      lookupCode: 'SCUX.YANGO.INVENTORY_TYPE',
    },
    {
      name: 'documentCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.documentCode`).d('单据编号'),
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
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.remark`).d('备注说明'),
    },
  ],
  transport: {
    read: values => {
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/manage-all-list`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

// 阳光城库存管理整单-待项目审批列表
const detailData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.status`).d('状态'),
    },
    {
      name: 'inventoryTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryType`).d('类型'),
    },
    {
      name: 'documentCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.documentCode`).d('单据编号'),
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
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.remark`).d('备注说明'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.creationDate`).d('创建日期'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料名称'),
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
      name: 'unitPrice',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitPrice`).d('单价'),
    },
    {
      name: 'changeBeforeQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeBeforeQuantity`).d('变更前数量'),
    },
    {
      name: 'changeAfterQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeAfterQuantity`).d('变更后数量'),
    },
    {
      name: 'changeQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeQuantity`).d('变更数量'),
    },
    {
      name: 'changeAmount',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.changeAmount`).d('变更金额'),
    },
  ],
  queryFields: [
    {
      name: 'inventoryType',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryType`).d('类型'),
      lookupCode: 'SCUX.YANGO.INVENTORY_TYPE',
    },
    {
      name: 'documentCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.documentCode`).d('单据编号'),
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
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.remark`).d('备注说明'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料名称'),
    },
    {
      name: 'fromDate',
      type: 'date',
      label: intl.get(`${prefix}.model.eastDelliveryConfirm.fromDate`).d('创建日期从'),
      max: 'toDate',
      transformRequest: value => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'toDate',
      type: 'date',
      label: intl.get(`${prefix}.model.eastDelliveryConfirm.toDate`).d('创建日期至'),
      min: 'fromDate',
      transformRequest: value => value && moment(value).format(DATETIME_MAX),
    },
  ],
  transport: {
    read: values => {
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/manage-detail-list`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

const formData = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'organizationLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.organizationName`).d('库存组织'),
      lovCode: 'SSLM.INV_ORGANIZATION',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
      textField: 'organizationName',
      required: true,
    },
    {
      name: 'organizationCode',
      bind: 'organizationLov.organizationCode',
    },
    {
      name: 'organizationName',
      bind: 'organizationLov.organizationName',
    },
    {
      name: 'inventoryLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryName`).d('仓库'),
      lovCode: 'SCUX.YANGO.INVENTORY',
      ignore: 'always',
      textField: 'inventoryName',
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
        required: ({ record }) => {
          return record.get('organizationCode');
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
      name: 'statusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.status`).d('状态'),
    },
    {
      name: 'documentCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.documentCodes`).d('盘点单号'),
    },
    {
      name: 'createName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.createName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.creationDate`).d('创建日期'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.remarks`).d('盘点说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.attachmentUuid`).d('附件'),
    },
  ],
  transport: {
    read: values => {
      const {
        data: { inventoryManageHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/${inventoryManageHeaderId}`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

const lineData = status => ({
  autoQuery: false,
  fields: [
    {
      name: 'orderNum',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.orderNum`).d('序号'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料名称'),
    },
    status !== 'CF' && {
      name: 'specifications',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.specifications`).d('规格'),
    },
    status !== 'CF' && {
      name: 'model',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.model`).d('型号'),
    },
    status !== 'CF' && {
      name: 'inventoryUnitName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryUnitName`).d('库存单位'),
    },
    {
      name: 'unitPrice',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitPrice`).d('单价'),
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
    status === 'PD' && {
      name: 'checkInventory',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.checkInventory`).d('盘点库存'),
      required: true,
    },
    status === 'PD' && {
      name: 'inventorySurplus',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventorySurplus`).d('盘盈'),
    },
    status === 'PD' && {
      name: 'inventoryLoss',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryLoss`).d('盘亏'),
    },
    status === 'BF' && {
      name: 'scrapInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.scrapInventory`).d('报废库存数量'),
      required: true,
    },
    status === 'BF' && {
      name: 'scrapAfterInventory',
      type: 'string',
      label: intl
        .get(`${prefix}.model.dhqflyInventoryManage.scrapAfterInventory`)
        .d('报废后可用库存'),
    },
    status === 'CF' && {
      name: 'bookInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.bookInventorys`).d('原库存数量'),
    },
    status === 'CF' && {
      name: 'inventoryUnitName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryUnitNames`).d('原库存单位'),
    },
    status === 'CF' && {
      name: 'splitQuantity',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.splitQuantity`).d('拆分数量'),
      required: true,
    },
    status === 'CF' && {
      name: 'splitUnit',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.splitUnit`).d('拆分单位'),
      required: true,
    },
    status === 'CF' && {
      name: 'splitScale',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.splitScale`).d('拆分比例'),
      required: true,
    },
    status === 'CF' && {
      name: 'splitInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.splitInventory`).d('拆分库存'),
    },
  ],
  transport: {
    read: values => {
      const {
        data: { inventoryManageHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-lines/list/${inventoryManageHeaderId}`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

const itemData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料名称'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCategoryName`).d('物料分类'),
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
      name: 'inventoryUnitName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inventoryUnitName`).d('库存单位'),
    },
    {
      name: 'unitPrice',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitPrice`).d('单价'),
    },
    {
      name: 'bookInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.bookInventory`).d('账面库存'),
    },
    {
      name: 'availableInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.availableInventory`).d('可用库存'),
    },
    {
      name: 'occupiedInventory',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.occupiedInventory`).d('占用库存'),
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
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemName`).d('物料名称'),
    },
    {
      name: 'categoryId',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCategoryName`).d('物料分类'),
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      lovPara: { tenantId: organizationId },
      transformRequest: val => val && val.categoryId,
    },
  ],

  transport: {
    read: value => {
      const {
        data: { organizationCode = '' },
      } = value;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-querys/queryInventory`,
        method: 'GET',
        data: { ...value.data, organizationCode },
      };
    },
  },
});

const operation = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'processUserName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.processUserName`).d('操作人'),
    },
    {
      name: 'processDate',
      type: 'date',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.processDate`).d('操作时间'),
    },
    {
      name: 'processStatus',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.processStatus`).d('动作'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.processRemark`).d('备注'),
    },
  ],

  transport: {
    read: values => {
      const {
        data: { inventoryManageHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-actions/list/${inventoryManageHeaderId}`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

const toReject = () => ({
  fields: [
    {
      name: 'rejectReason',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.rejectReason`).d('拒绝原因'),
      required: true,
    },
  ],
});

export { tableData, detailData, formData, lineData, itemData, operation, toReject };
