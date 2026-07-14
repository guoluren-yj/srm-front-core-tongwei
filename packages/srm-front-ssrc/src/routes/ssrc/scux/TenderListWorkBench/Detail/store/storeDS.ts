import { FieldType, FieldIgnore } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from "srm-front-boot/lib/utils/config";
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
const organizationId = getCurrentOrganizationId();

// 技术文件 - 头ds
const baseInfoDS = ({ bidCatalogId }): DataSetProps => {
  return {
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        name: 'companyName',
        label: intl.get('scux.tenderListWorkbench.model.twnf.companyName').d('申请公司'),
      },
      {
        name: 'sourceProjectName',
        label: intl.get('scux.tenderListWorkbench.model.twnf.sourceProjectName').d('招标标题'),
      },
      {
        name: 'templateName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingProcess').d('招标流程'),
      },
      {
        name: 'sourceProjectNum',
        label: intl.get('scux.tenderListWorkbench.model.twnf.sourceProjectNum').d('招标编号'),
      },
      {
        name: 'bidDirectorName',
        label: intl.get('scux.tenderDetail.model.twnf.biddingPrincipal').d('招标负责人'),
      },
      {
        name: 'catelogNum',
        label: intl.get(`scux.tenderListWorkbench.model.twnf.detail.tenderListNum`).d('招标清单编码'),
      },
      {
        name: 'createdByName',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.createdByName').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('scux.technicalDocumentsWorkBench.model.twnf.creationDate').d('创建日期'),
      },
      {
        name: 'catalogStatusMeaning',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.sourceProjectStatus').d('状态'),
      },
      {
        name: 'remark',
        label: intl.get('scux.tenderDetail.model.twnf.remark').d('备注'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LMuS2jN0vaD10XhDTcdxVA8TiahDph05Jw6ZvrFaHxk0u`,
          method: 'GET',
          data: {
            queryType: 'HEADER',
            bidCatalogId,
          },
        };
      },
    },
  };
};

// 招标清单 - 招标清单表格
const tenderListSectionDS = ({ bidCatalogId, baseInfoDs }): DataSetProps => {
  return {
    primaryKey: 'bidCatalogSectionId',
    autoQuery: false,
    selection: DataSetSelection.multiple,
    paging: false,
    forceValidate: true,
    fields: [
      {
        name: 'sectionNum',
        label: intl.get(`scux.tenderDetail.model.twnf.tenderDetail.sectionNum`).d('序号'),
      },
      {
        name: 'sectionName',
        label: intl.get(`scux.tenderDetail.model.twnf.tenderDetail.sectionName`).d('标段名称'),
        required: true,
      },
      {
        name: 'itemName',
        label: intl.get(`scux.tenderDetail.model.twnf.tenderDetail.itemName`).d('项目名称'),
      },
      {
        name: 'remark',
        label: intl.get(`scux.tenderDetail.model.twnf.tenderDetail.remark`).d('备注'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LMuS2jN0vaD10XhDTcdxVA8TiahDph05Jw6ZvrFaHxk0u`,
          method: 'GET',
          data: {
            queryType: 'SECTION',
            bidCatalogId,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LJvnz2nRYLRibzuh6zfysqFg5HOxibkrmRribc2Ob2qG6Rb`,
          method: 'POST',
          data: {
            operationType: 'DELETE_SECTION',
            bidCatalogSectionIds: data.map(r => r.bidCatalogSectionId),
            catalogHeader: baseInfoDs?.current?.toData(),
          },
        };
      },
    },
  };
};

// 招标计划 - 招标内容
const bidPlanContentDS = ({ sourceProjectId }): DataSetProps => {
  return {
    primaryKey: 'projectLineItemId',
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'attributeVarchar11',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.FBCProcessNumber').d('FBC流程编号'),
      },
      {
        name: 'attributeVarchar12',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.theme').d('主题'),
      },
      {
        name: 'requestUserName',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.requestUserName').d('申请人姓名'),
      },
      {
        name: 'attributeVarchar13Meaning',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationCompany').d('申请公司'),
      },
      {
        name: 'attributeVarchar14Meaning',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationDepartment').d('申请部门'),
      },
      {
        name: 'attributeDatetime10',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationTime').d('申请时间'),
        type: FieldType.date,
      },
      {
        name: 'attributeVarchar15',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.purchaseDemandType').d('采购需求类型'),
      },
      {
        name: 'prNum',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.purchaseApplyNum').d('采购申请单号'),
      },
      {
        name: 'prDisplayLineNum',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.purchaseApplyLineNum').d('采购申请行号'),
      },
      {
        name: 'attributeVarchar16',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.projectApprovalProcess').d('项目立项流程'),
      },
      {
        name: 'attributeVarchar17',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.projectName').d('项目名称'),
      },
      {
        name: 'attributeVarchar18Meaning',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.totalCharge').d('总负责人'),
      },
      {
        name: 'attributeDate10',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.approachTime').d('进场时间'),
      },
      {
        name: 'attributeDate11',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.useTime').d('投入使用时间'),
      },
      {
        name: 'attributeDecimal10',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.projectTotal').d('项目概算总额（元）'),
      },
      {
        name: 'attributeVarchar19',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.currency').d('币种'),
      },
      {
        name: 'attributeVarchar20',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.itemNum').d('分项编号'),
      },
      {
        name: 'attributeDecimal11',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.totalPrice').d('采购明细金额（元）'),
      },
      {
        name: 'attributeLongtext1',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.itemAttachment').d('概算清单附件'),
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
      },
    ],
    transport: {
      read: ({}) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/items`,
          method: 'GET',
        };
      },
    },
  };
};

// 明细维护 - 明细维护表格
const detailMaintenanceDS = ({ baseInfoDs }): DataSetProps => {
  return {
    primaryKey: 'bidCatalogLineId',
    autoQuery: false,
    paging: false,
    forceValidate: true,
    selection: DataSetSelection.multiple,
    fields: [
      {
        name: 'lineNum',
        label: intl.get('scux.tenderDetail.model.twnf.tenderDetail.lineNum').d('行号'),
      },
      {
        name: 'itemName',
        label: intl.get('scux.tenderDetail.model.twnf.tenderDetail.name').d('招标项目描述'),
        required: true,
      },
      {
        label: intl.get('small.common.model.itemCategory').d('物料分类'),
        name: 'itemCategoryLov',
        type: FieldType.object,
        ignore: FieldIgnore.always,
        textField: 'categoryName',
        valueField: 'categoryCode',
        // lovCode: 'SMDM.ITEM_CATEGORY_BY_ITEM_ID',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        dynamicProps: {
          lovPara: () => ({
            tenantId: organizationId,
            businessObjectCode: 'SRM_C_SRM_AGREEMENT',
            enabledFlag: 1,
            hzeroUIFlag: 0,
          }),
        },
        optionsProps: {
          // 根据业务规则 - 品类值集选择范围， 判断数据是否能选中
          record: {
            dynamicProps: {
              // 预定义不能启用禁用（头上按钮）
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
      },
      {
        name: 'itemCategoryId',
        type: FieldType.string,
        bind: 'itemCategoryLov.categoryId',
      },
      {
        name: 'itemCategoryCode',
        type: FieldType.string,
        bind: 'itemCategoryLov.categoryCode',
      },
      {
        name: 'itemCategoryName',
        type: FieldType.string,
        bind: 'itemCategoryLov.categoryName',
      },
      {
        name: 'uomId',
        label: intl.get('scux.tenderDetail.model.twnf.tenderDetail.unit').d('单位'),
        required: true,
        type: FieldType.object,
        lovCode: 'SSRC.UOM',
        textField: 'uomName',
        transformRequest: (value) => value?.uomId,
        transformResponse: (value, data) => {
          return value ? { uomId: value, uomName: data.uomName } : null;
        },
      },
      {
        name: 'uomName',
        bind: 'uomId.uomName',
      },
      {
        name: 'quantity',
        label: intl.get('scux.tenderDetail.model.twnf.tenderDetail.quantity').d('数量'),
        required: true,
        type: FieldType.number,
      },
      // {
      //   name: 'taxId',
      //   label: intl.get('scux.tenderDetail.model.twnf.tenderDetail.taxRate').d('税率'),
      //   required: true,
      //   type: FieldType.object,
      //   lovCode: 'SMDM.TAX',
      //   transformRequest: (value) => value?.taxId,
      //   transformResponse: (value, data) => {
      //     return value ? { taxId: value, taxRate: data.taxRate } : null;
      //   },
      // },
      // {
      //   name: 'taxRate',
      //   bind: 'taxId.taxRate',
      // },
      {
        name: 'remark',
        label: intl.get('scux.tenderDetail.model.twnf.tenderDetail.remark').d('备注'),
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationTemplate`).d('报价模板'),
        name: 'quotationTemplateIdLov',
        type: FieldType.object,
        ignore: FieldIgnore.always,
        lovCode: 'SSRC.QUOTATION_TEMPLATE',
        textField: 'templateName',
        valueField: 'quotationTemplateId',
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
            };
          },
        },
      },
      {
        name: 'quotationTemplateId',
        type: FieldType.string,
        bind: 'quotationTemplateIdLov.templateId',
      },
      {
        name: 'templateName',
        type: FieldType.string,
        bind: 'quotationTemplateIdLov.templateName',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LMuS2jN0vaD10XhDTcdxVA8TiahDph05Jw6ZvrFaHxk0u`,
          method: 'GET',
          data: {
            queryType: 'LINE',
            ...(data || {}),
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/ajqkRsFQfIvKnAJaX676LJvnz2nRYLRibzuh6zfysqFg5HOxibkrmRribc2Ob2qG6Rb`,
          method: 'POST',
          data: {
            operationType: 'DELETE_LINE',
            bidCatalogLineIds: data.map(r => r.bidCatalogLineId),
            catalogHeader: baseInfoDs?.current?.toData(),
          },
        };
      },
    },
  };
};

// 报价模板lov
const quotationLovDS = (): DataSetProps => ({
  autoCreate: true,
  fields: [
    {
      name: 'templateLov',
      type: FieldType.object,
      lovCode: 'SSRC.QUOTATION_TEMPLATE',
    },
    {
      name: 'quotationTemplateId',
      bind: 'templateLov.templateId',
    },
  ],
});

export {
  baseInfoDS,
  tenderListSectionDS,
  bidPlanContentDS,
  detailMaintenanceDS,
  quotationLovDS,
};
