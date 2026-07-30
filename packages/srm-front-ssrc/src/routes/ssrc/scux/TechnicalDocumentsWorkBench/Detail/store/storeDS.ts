import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSRC } from "srm-front-boot/lib/utils/config";
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

// 技术文件 - 头ds
const baseInfoDS = ({ techFileId }): DataSetProps => {
  return {
    autoQuery: false,
    forceValidate: true,
    fields: [
      {
        name: 'companyName',
        label: intl.get('scux.technicalDocumentsDetail.model.twnf.companyName').d('公司'),
      },
      {
        name: 'sourceProjectName',
        label: intl.get('scux.bidPlanDetail.model.twnf.sourceProjectName').d('招标名称'),
      },
      {
        name: 'attributeVarchar18',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.biddingProcess').d('招标流程'),
      },
      {
        name: 'manager',
        label: intl.get('scux.technicalDocumentsDetail.model.twnf.biddingPrincipal').d('招标负责人'),
      },
      {
        name: 'techFileNum',
        label: intl.get('scux.technicalDocumentsDetail.model.twnf.techFileNum').d('技术文件编码'),
        disabled: true,
      },
      {
        name: 'confirmedByName',
        label: intl.get('scux.technicalDocumentsDetail.model.twnf.confirmedByName').d('确认人'),
        disabled: true,
      },
      {
        name: 'confirmedDate',
        label: intl.get('scux.technicalDocumentsDetail.model.twnf.confirmedDate').d('最后确认日期'),
        type: FieldType.date,
        disabled: true,
      },
      {
        name: 'techFileStatus',
        label: intl.get('scux.technicalDocumentsDetail.model.twnf.techFileStatus').d('状态'),
        disabled: true,
        type: FieldType.string,
        lookupCode: 'SCUX_TWNF_TECHNICAL_DOCUMENTATION'
      },
      {
        name: 'remark',
        label: intl.get('scux.technicalDocumentsDetail.model.twnf.remark').d('备注'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeDZVuxxhCyc5UMK4IbqKu9o`,
          method: 'POST',
          data: {
            postType: 'GET',
            techFileId,
          },
        };
      },
    },
  };
};

// 技术文件 - 技术文件（含图纸）
const technicalFileDS = (): DataSetProps => {
  return {
    primaryKey: 'techFileDetailId',
    autoQuery: false,
    selection: false,
    paging: false,
    forceValidate: true,
    fields: [
      {
        name: 'fileName',
        label: intl.get(`scux.technicalDocumentsDetail.model.twnf.technicalFile.fileName`).d('文件名称'),
        required: true,
      },
      {
        name: 'fileType',
        label: intl.get(`scux.technicalDocumentsDetail.model.twnf.technicalFile.fileType`).d('文件类型'),
        required: true,
        type: FieldType.string,
        lookupCode: 'DOCMENT_TYPE',
      },
      {
        name: 'attachmentUuid',
        label: intl.get(`scux.technicalDocumentsDetail.model.twnf.technicalFile.fileName`).d('附件上传'),
        required: true,
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-rfxheader',
      },
      {
        name: 'submittedByName',
        label: intl.get(`scux.technicalDocumentsDetail.model.twnf.technicalFile.submittedBy`).d('提交人'),
      },
      {
        name: 'submittedDate',
        label: intl.get(`scux.technicalDocumentsDetail.model.twnf.technicalFile.submittedDate`).d('提交时间'),
      },
      {
        name: 'remark',
        label: intl.get(`scux.technicalDocumentsDetail.model.twnf.technicalFile.remark`).d('备注'),
      },
    ],
    transport: {
      destroy: ({ data }) => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/v8iakAicH6oqZZdRutibdBmeDZVuxxhCyc5UMK4IbqKu9o`,
          method: 'POST',
          data: {
            postType: 'DELETE_LINE',
            techFileDetailIds: data.map(r => r.techFileDetailId),
          },
        };
      },
    }
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

export {
  baseInfoDS,
  technicalFileDS,
  bidPlanContentDS,
};