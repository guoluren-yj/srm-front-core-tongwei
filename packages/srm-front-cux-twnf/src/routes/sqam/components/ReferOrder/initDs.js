import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getDynamicLabel } from './utils';

const intlPrompt = 'scux.twnfReferOrder'; // 多语言前缀

const tableDS = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  primaryKey: 'poLineId',
  modifiedCheck: false,
  pageSize: 20,
//   queryFields: [
//     {
//       name: 'displayPoNum',
//       label: intl.get(`${intlPrompt}.query.displayPoNum`).d('采购订单编号'),
//       merge: true,
//       display: true,
//     },
//     {
//       name: 'itemCode',
//       label: intl.get(`${intlPrompt}.query.itemCode`).d('物料'),
//       type: 'object',
//       lovCode: 'SODR.PO_ITEM',
//       lovPara: { tenantId: getCurrentOrganizationId() },
//       display: true,
//     },
//     // {
//     //   name: 'supplierCompanyId',
//     //   label: intl.get(`${intlPrompt}.query.itemCode`).d('供应商'),
//     //   type: 'object',
//     //   lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
//     //   lovPara: { tenantId: getCurrentOrganizationId() },
//     //   display: true,
//     // },
//     {
//       name: 'allSupplierId',
//       label: intl.get(`${intlPrompt}.query.itemCode`).d('供应商'),
//       type: 'object',
//       lovCode: 'SSLM.SUPPLIER_CHOOSE',
//       lovPara: { tenantId: getCurrentOrganizationId() },
//       display: true,
//     },
//     {
//       name: 'displayLineLocationNum',
//       label: intl.get(`${intlPrompt}.query.displayLineLocationNum`).d('发运号'),
//     },
//     {
//       name: 'releasedDate',
//       type: 'dateTime',
//       label: intl.get(`${intlPrompt}.query.displayLineLocationNum`).d('发布时间'),
//       range: true,
//     },
//     {
//       name: 'allSupplierId',
//       label: intl.get(`${intlPrompt}.query.itemCode`).d('供应商'),
//       type: 'object',
//       lovCode: 'SSLM.SUPPLIER_CHOOSE',
//       lovPara: { tenantId: getCurrentOrganizationId() },
//     },
//   ],
  fields: [
    {
      label: intl.get(`hzero.common.status`).d('状态'),
      name: 'displayStatusMeaning',
    },
    {
      label: intl.get('ssta.purchaseSettle.common.poNums').d('采购订单编号-行号'),
      name: 'displayPoNum',
    },
    {
      label: intl.get(`entity.supplier.code`).d('供应商编码'),
      name: 'supplierCode',
    },
    {
      label: intl.get(`entity.supplier.name`).d('供应商名称'),
      name: 'supplierName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.releaseNum`).d('发放号'),
      name: 'releaseNum',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.lineNum`).d('行号'),
      name: 'displayLineNum',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.shipmentNum`).d('发运号'),
      name: 'displayLineLocationNum',
    },
    {
      label: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.sendOrder.categoryName`).d('物料分类'),
      name: 'categoryId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.oldItemCodeNum`).d('旧物料号'),
      name: 'oldItemCode',
    },
    {
      // label: intl.get(`sodr.sendOrder.model.common.quantity`).d('数量'),
      name: 'quantity',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      label: intl.get(`spcm.common.model.common.quantity`).d('数量'),
      name: 'secondaryQuantity',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.netReceivedQuantity`).d('净接收'),
      name: 'netReceivedQuantity',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.netDeliverQuantity`).d('净入库'),
      name: 'netDeliverQuantity',
    },
    {
      label: intl.get('sodr.common.model.common.notInStorage').d('未入库'),
      name: 'notDeliverQuantity',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.invoicedQuantity`).d('已开票'),
      name: 'invoicedQuantity',
    },
    {
      // label: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'unitPrice'),
      },
      name: 'unitPrice',
      align: 'right',
    },
    {
      // label: intl.get(`spcm.common.model.common.enteredTaxIncludedPrice2`).d('原币单价(含税)'),
      dynamicProps: {
        label: ({ dataSet }) =>
          getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'taxIncludedUnitPrice'),
      },
      name: 'enteredTaxIncludedPrice',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.unitPrice`).d('原币单价(不含税)'),
      name: 'secondaryUnitPrice',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.inculdeTaxUnitPrice`).d('原币单价(含税)'),
      name: 'taxIncludedSecondaryUnitPrice',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.common.lineAmount`).d('行金额(不含税)'),
      name: 'lineAmount',
      align: 'right',
    },
    {
      label: intl.get(`spcm.common.model.common.taxIncludedLineAmount2`).d('行金额(含税)'),
      name: 'taxIncludedLineAmount',
      align: 'right',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.unitPriceBatch`).d('每'),
      name: 'unitPriceBatch',
    },
    {
      // label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'uomId',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled')),
      },
    },
    {
      label: intl.get(`spcm.common.model.common.unit`).d('单位'),
      name: 'secondaryUomId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.taxCode`).d('税种'),
      name: 'taxCode',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.currencyCode`).d('币种'),
      name: 'currencyCode',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.needByDate`).d('需求日期'),
      name: 'needByDate',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.promisedDate`).d('承诺日期'),
      name: 'promiseDeliveryDate',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.specifications`).d('规格'),
      name: 'specifications',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.modelNum`).d('型号'),
      name: 'model',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.manufacturerName`).d('制造商'),
      name: 'manufacturerName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.brand`).d('品牌'),
      name: 'brand',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.erpStatus`).d('ERP状态'),
      name: 'erpStatus',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.frozenStatus`).d('是否冻结'),
      name: 'frozenFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.consignedFlag`).d('是否寄售'),
      name: 'consignedFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.projectCategory`).d('是否委外'),
      name: 'projectCategory',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.returnedFlag`).d('是否退回'),
      name: 'returnedFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.freeFlag`).d('是否免费'),
      name: 'freeFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.immedShippedFlag`).d('是否直发'),
      name: 'isImmedShippedFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.purchaserRemark`).d('采购方行备注'),
      name: 'remark',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.feedbackInfo`).d('反馈信息'),
      name: 'feedback',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.shipToThirdPartyName`).d('送达方'),
      name: 'shipToThirdPartyName',
    },
    {
      label: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('地点'),
      name: 'shipToThirdPartyAddress',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.contactPersonInfo`).d('联系人信息'),
      name: 'shipToThirdPartyContact',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.supplierSite`).d('供应商地点'),
      name: 'supplierSiteId',
    },
    {
      label: intl.get(`entity.company.tag`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`spcm.common.model.ouName`).d('业务实体'),
      name: 'ouId',
    },
    {
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      name: 'purchaseOrgId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.purchaseAgent`).d('采购员'),
      name: 'purchaseAgentId',
    },
    {
      label: intl.get(`entity.organization.class.receiving`).d('收货组织'),
      name: 'invOrganizationId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.inventoryName`).d('收货库房'),
      name: 'inventoryId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.locationName`).d('收货库位'),
      name: 'invLocationId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.billToLocationName`).d('收单方'),
      name: 'billToLocationId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.creationTime`).d('创建时间'),
      name: 'erpCreationDate',
    },
    {
      label: intl.get(`sodr.common.model.common.createdName`).d('创建人'),
      name: 'erpCreatedName',
    },
    {
      label: intl.get(`sodr.common.model.common.department`).d('部门'),
      name: 'departmentId',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.releaseTime`).d('发布时间'),
      name: 'releasedDate',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.confirmedDate`).d('确认日期'),
      name: 'confirmedDate',
    },
    {
      label: intl.get(`spcm.common.model.urgentFlag`).d('是否加急'),
      name: 'urgentFlag',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.urgentTime`).d('加急时间'),
      name: 'urgentDate',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.contractNum`).d('合同编号'),
      name: 'erpContractNum',
    },
    {
      label: intl.get(`spcm.common.model.common.purReqNumOrLine2`).d('采购申请单号-行号'),
      name: 'displayPrNum',
    },
    {
      label: intl.get('spcm.common.model.projectTaskName').d('项目任务名称'),
      name: 'projectTaskId',
    },
    // {
    //   label: intl.get(`sodr.sendOrder.model.common.purchaseReqLineNum`).d('采购申请行号'),
    //   name: 'displayPrLineNum',
    // },
    {
      label: intl.get(`sodr.sendOrder.model.common.productNum`).d('商品编码'),
      name: 'productNum',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.productName`).d('商品名称'),
      name: 'productName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.commodityDirectory`).d('商品目录'),
      name: 'catalogName',
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.sourceSystem`).d('来源系统'),
      name: 'poSourcePlatform',
    },
  ],
  queryParameter: {
  },
  transport: {
    read: () => {
      return {
        url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/0ZNib8Xd0z8kIicxFJIzBobJnoPcB8OhuDsqfiaEp9jI9I`,
        method: 'GET',
      };
    },
  },
});

export {
    intlPrompt,
    tableDS,
};