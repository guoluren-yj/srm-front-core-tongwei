import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const organizationId = getCurrentOrganizationId();

const prefix = 'scux.dhqflyInventoryManage';

// 库存领用待提交列表
const tableData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'receiveNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receiveNumber`).d('领用单号'),
    },
    {
      name: 'receiveTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receiveTypeMeaning`).d('类型'),
    },
    {
      name: 'outDepotName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.outDepotName`).d('出仓'),
    },
    {
      name: 'inDepotName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inDepotName`).d('入仓'),
    },
    {
      name: 'departmentName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.departmentName`).d('核算部门'),
    },
    {
      name: 'outOrganizationName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.outOrganizationName`).d('出仓部门'),
    },
    {
      name: 'inOrganizationName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inOrganizationName`).d('入仓部门'),
    },
    {
      name: 'receiveStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receiveStatusMeaning`).d('状态'),
    },
    {
      name: 'manager',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.manager`).d('经办人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.creationDate`).d('创建日期'),
    },
    {
      name: 'finishDate',
      type: 'date',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.finishDate`).d('完成日期'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.remark`).d('备注'),
    },
  ],
  queryFields: [
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.itemCode`).d('物料编码'),
    },
    {
      name: 'outDepotName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.outDepotName`).d('出仓'),
    },
    {
      name: 'departmentName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.departmentName`).d('核算部门'),
    },
    {
      name: 'receiveStartDate',
      type: 'date',
      label: intl.get(`${prefix}.model.eastDelliveryConfirm.receiveStartDate`).d('领用日期从'),
      max: 'receiveEndDate',
      transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
    },
    {
      name: 'receiveEndDate',
      type: 'date',
      label: intl.get(`${prefix}.model.eastDelliveryConfirm.receiveEndDate`).d('领用日期至'),
      min: 'receiveStartDate',
      transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
    },
    {
      name: 'receiveNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receiveNumber`).d('单号'),
    },
    {
      name: 'inDepotName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inDepotName`).d('入仓'),
    },
  ],
  transport: {
    read: (values) => {
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

const formData = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'receiveNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receiveNumber`).d('领用单号'),
      disabled: true,
    },
    {
      name: 'companyLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.companyName`).d('公司'),
      lovCode: 'SCUX.DHQFLY_INVENTORY_COMPANY',
      lovPara: { tenantId: organizationId },
      ignore: 'always',
      textField: 'companyName',
      required: true,
    },
    {
      name: 'companyId',
      bind: 'companyLov.companyId',
    },
    {
      name: 'companyName',
      bind: 'companyLov.companyName',
    },
    {
      name: 'companyCode',
      bind: 'companyLov.companyCode',
    },
    {
      name: 'departmentLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.departmentName`).d('核算部门'),
      lovCode: 'SUCX.DHQFLY_INVENTORY_UNIT',
      textField: 'unitName',
      ignore: 'always',
      dynamicProps: {
        lovPara: ({ record }) => {
          const companyId = record.get('companyId');
          return { tenantId: organizationId, companyId };
        },
        disabled: ({ record }) => {
          return !record.get('companyId');
        },
      },
    },
    {
      name: 'departmentId',
      bind: 'departmentLov.unitId',
    },
    {
      name: 'departmentName',
      bind: 'departmentLov.unitName',
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.creationDate`).d('创始日期'),
      disabled: true,
    },
    {
      name: 'finishDate',
      type: 'date',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.finishDate`).d('完成日期'),
      disabled: true,
    },
    {
      name: 'manager',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.manager`).d('经办人'),
      disabled: true,
    },
    {
      name: 'receiveType',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receiveType`).d('类型'),
      lookupCode: 'SCUX.DHQFLY.INVENTORY_RECEIVE_TYPE',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          return record.get('receiveNumber');
        },
      },
    },
    {
      name: 'receiveStatus',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receiveStatus`).d('状态'),
      lookupCode: 'SCUX.DHQFLY.INVENTORY_RECEIVE_STATUS',
      disabled: true,
    },
    {
      name: 'outDepotLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.outDepotName`).d('出仓'),
      lovCode: 'SCUX.YANGO.INVENTORY',
      ignore: 'always',
      textField: 'inventoryName',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          // const type = record.get('receiveType');
          // return type !== 'RECEIVE_OUTBOUND' || !record.get('companyId');
          return !record.get('companyId');
        },
        lovPara: ({ record }) => {
          const companyId = record.get('companyId');
          return {
            tenantId: organizationId,
            organizationCode: 'fly',
            companyId,
          };
        },
      },
    },
    {
      name: 'outDepotId',
      bind: 'outDepotLov.inventoryId',
    },
    {
      name: 'outDepotName',
      bind: 'outDepotLov.inventoryName',
    },
    {
      name: 'organizationCode',
      bind: 'outDepotLov.organizationCode',
    },
    {
      name: 'outDepotUnitLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.outOrganizationName`).d('出仓部门'),
      lovCode: 'SCUX.DHQFLY.INV_ORGANIZATION',
      textField: 'organizationName',
      ignore: 'always',
      required: true,
      disabled: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          const inDepotLov = record.get('inDepotLov');
          return { organizationId: inDepotLov?.organizationId};
        },
      },
    },
    {
      name: 'outDepotUnitId',
      bind: 'outDepotUnitLov.organizationId',
    },
    {
      name: 'outOrganizationName',
      bind: 'outDepotUnitLov.organizationName',
    },
    {
      name: 'inDepotLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inDepotName`).d('入仓'),
      lovCode: 'SCUX.YANGO.INVENTORY',
      ignore: 'always',
      textField: 'inventoryName',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          // const type = record.get('receiveType');
          // return type !== 'DEPOT_DISPATCH' || !record.get('companyId');
          return !record.get('companyId');
        },
        lovPara: ({ record }) => {
          const companyId = record.get('companyId');
          return {
            tenantId: organizationId,
            organizationCode: 'fly',
            companyId,
          };
        },
      },
    },
    {
      name: 'inDepotId',
      bind: 'inDepotLov.inventoryId',
    },
    {
      name: 'inDepotName',
      bind: 'inDepotLov.inventoryName',
    },
    {
      name: 'inDepotUnitLov',
      type: 'object',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inOrganizationName`).d('入仓部门'),
      lovCode: 'SCUX.DHQFLY.INV_ORGANIZATION',
      ignore: 'always',
      required: true,
      disabled: true,
      textField: 'organizationName',
      dynamicProps: {
        lovPara: ({ record }) => {
          const inDepotLov = record.get('inDepotLov');
          return { organizationId: inDepotLov?.organizationId};
        },
      },
    },
    {
      name: 'inDepotUnitId',
      bind: 'inDepotUnitLov.organizationId',
    },
    {
      name: 'inOrganizationName',
      bind: 'inDepotUnitLov.organizationName',
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.remark`).d('备注'),
    },
  ],
  events: {
    update: ({record, name, value}) => {
      if(name === 'outDepotLov') {
        if(value) {
          record.set('outDepotUnitLov', {
            organizationId: value.organizationId,
            organizationName: value.organizationName,
          });
        } else {
          record.set('outDepotUnitLov', {
            organizationId: null,
            organizationName: null,
          });
        }
      }
      if(name === 'inDepotLov') {
        if(value) {
          record.set('inDepotUnitLov', {
            organizationId: value.organizationId,
            organizationName: value.organizationName,
          });
        } else {
          record.set('inDepotUnitLov', {
            organizationId: null,
            organizationName: null,
          });
        }
      }
    },
  },
  transport: {
    read: (values) => {
      const {
        data: { inventoryReceiveHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers/detail/${inventoryReceiveHeaderId}`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

// 物料行数据
const itemData = () => ({
  autoQuery: false,
  forceValidate: true,
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.lineNum`).d('序号'),
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
    // {
    //   name: 'quantity',
    //   type: 'string',
    //   label: intl.get(`${prefix}.model.dhqflyInventoryManage.quantity`).d('数量'),
    // },
    // {
    //   name: 'receivedQuantity',
    //   type: 'string',
    //   label: intl.get(`${prefix}.model.dhqflyInventoryManage.receivedQuantity`).d('已领数量'),
    // },
    // {
    //   name: 'receivableQuantity',
    //   type: 'string',
    //   label: intl.get(`${prefix}.model.dhqflyInventoryManage.receivableQuantity`).d('可领数量'),
    // },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitName`).d('单位'),
    },
    {
      name: 'bookInventory',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.bookInventory`).d('账面库存'),
    },
    {
      name: 'availableInventory',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.availableInventory`).d('可用库存'),
    },
    {
      name: 'occupiedInventory',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.occupiedInventory`).d('占用库存'),
    },
    {
      name: 'receivingQuantity',
      type: 'number',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receivingQuantity`).d('领用数量'),
      required: true,
      validator: (value, _, record) => {
        const available = record.get('availableInventory');
        if (value <= available && value > 0) {
          return true;
        } else {
          return intl.get(`${prefix}.message.validateError`).d('不可大于可用库存且必须大于0');
        }
      },
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.categoryName`).d('品类'),
    },
    {
      name: 'specifications',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.specifications`).d('规格'),
    },
    {
      name: 'brandName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.brandName`).d('品牌'),
    },
    {
      name: 'originName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.originName`).d('产地'),
    },
    {
      name: 'productionDate',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.productionDate`).d('生产日期'),
    },
    {
      name: 'shelfLife',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.shelfLife`).d('保质期'),
    },
  ],
  transport: {
    read: (values) => {
      const {
        data: { inventoryReceiveHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-item-lines/list/${inventoryReceiveHeaderId}`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

// 出库行数据
const gooutData = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.lineNum`).d('序号'),
    },
    {
      name: 'trxNumber',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.trxNumber`).d('单号'),
    },
    {
      name: 'trxLineNum',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.trxLineNum`).d('行号'),
    },
    {
      name: 'inboundDate',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inboundDate`).d('入库日期'),
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
      name: 'quantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.quantity`).d('数量'),
    },
    {
      name: 'receivedQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receivedQuantity`).d('已领数量'),
    },
    {
      name: 'receivableQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receivableQuantity`).d('可领数量'),
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
      name: 'unitName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitName`).d('单位'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.categoryName`).d('品类'),
    },
    {
      name: 'specifications',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.specifications`).d('规格'),
    },
    {
      name: 'brandName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.brandName`).d('品牌'),
    },
    {
      name: 'originName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.originName`).d('产地'),
    },
    {
      name: 'productionDate',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.productionDate`).d('生产日期'),
    },
    {
      name: 'shelfLife',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.shelfLife`).d('保质期'),
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
    {
      name: 'inboundQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.inboundQuantity`).d('出库数量'),
    },
  ],
  transport: {
    read: (values) => {
      const {
        data: { inventoryReceiveHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-out-lines/list/${inventoryReceiveHeaderId}`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

// 物料弹窗
const itemModal = () => ({
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
      name: 'quantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.quantity`).d('数量'),
    },
    {
      name: 'receivedQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receivedQuantity`).d('已领数量'),
    },
    {
      name: 'receivableQuantity',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.receivableQuantity`).d('可领数量'),
    },
    {
      name: 'unitPrice',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitPrice`).d('单价'),
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.unitName`).d('单位'),
    },
    {
      name: 'categoryName',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.categoryName`).d('品类'),
    },
    {
      name: 'specifications',
      type: 'string',
      label: intl.get(`${prefix}.model.dhqflyInventoryManage.specifications`).d('规格'),
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
  ],
  transport: {
    read: (values) => {
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-querys/queryInventory`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

const operation = () => ({
  autoQuery: false,
  selection: false,
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
    read: (values) => {
      const {
        data: { inventoryReceiveHeaderId },
      } = values;
      return {
        url: `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-actions/list/${inventoryReceiveHeaderId}`,
        method: 'GET',
        body: values.data,
      };
    },
  },
});

export { tableData, formData, itemData, gooutData, itemModal, operation };
