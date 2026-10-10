/**
 * 需求信息 - 表格 DS
 * 复制自 ssrc/scux/TenderListWorkBench/Detail/store/storeDS.ts 的 bidPlanContentDS，
 * 本页自己维护一份（接口与字段编码保持一致，列字段按本页需求信息卡片调整）
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from '_utils/config';

const DemandInfoDS = ({ sourceProjectId }) => {
  return {
    primaryKey: 'projectLineItemId',
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'prNum',
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.itemLineDetail.prNum`)
          .d('采购申请单号'),
      },
      {
        name: 'projectLineItemNum',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
      },
      {
        name: 'ouName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
      },
      {
        name: 'itemCode',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemDescs`).d('物料描述'),
      },
      {
        name: 'itemCategoryName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
      },
      {
        name: 'specifications',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.specifications`).d('规格'),
      },
      {
        name: 'secondaryQuantity',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        type: 'number',
      },
      {
        name: 'secondaryUomName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
      },
      {
        name: 'estimatedPrice',
        label: intl.get(`ssrc.projectSetupApprovalWf.model.approvalWf.estimatedPrice`).d('预估单价'),
        type: 'number',
      },
      {
        name: 'estimatedAmount',
        label: intl
          .get(`ssrc.projectSetupApprovalWf.model.approvalWf.estimatedAmount`)
          .d('预估行金额'),
        type: 'number',
      },
      {
        name: 'requestUserName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prRequestedName`).d('申请人姓名'),
      },
      {
        name: 'attributeVarchar13Meaning',
        label: intl
          .get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationCompany')
          .d('申请公司'),
      },
      {
        name: 'attributeVarchar14Meaning',
        label: intl
          .get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationDepartment')
          .d('申请部门'),
      },
      {
        name: 'attributeDatetime10',
        label: intl
          .get('scux.bidPlanDetail.model.twnf.bidPlanContent.applicationTime')
          .d('申请时间'),
        type: 'date',
      },
      {
        name: 'attributeVarchar16',
        label: intl
          .get('scux.bidPlanDetail.model.twnf.bidPlanContent.projectApprovalProcess')
          .d('项目立项流程'),
      },
      {
        name: 'attributeVarchar17',
        label: intl.get('scux.bidPlanDetail.model.twnf.bidPlanContent.projectName').d('项目名称'),
      },
      // 采购申请单号超链接跳转所需（不出现在表格列上）
      {
        name: 'prHeaderId',
      },
      {
        name: 'prSourcePlatform',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/source-projects/${sourceProjectId}/items`,
          method: 'GET',
          params: {
            ...params,
            attributeVarchar10: 0,
          },
        };
      },
    },
  };
};

export default DemandInfoDS;
