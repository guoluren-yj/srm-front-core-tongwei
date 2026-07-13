import { FieldIgnore, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

// 入围单位 - 多语言前缀
export const supplierEvaluationPrefix = 'scux.supplierEvaluation';

// 招标准备明细 - 招标清单-头
export const tenderHeaderDS = (): DataSetProps => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'catalogStatus',
        label: intl.get('scux.bidPlanWorkBench.model.twnf.tenderListSourceProjectStatus').d('招标清单状态'),
        type: FieldType.string,
        lookupCode: 'SCUX_TWNF_NOMINATION_STATUS',
      },
      {
        name: 'catelogNum',
        label: intl.get(`scux.tenderListWorkbench.model.twnf.tenderListNum`).d('招标清单编号'),
      },
    ],
  };
};

// 招标准备明细 - 招标清单
export const tenderListSectionDS = (): DataSetProps => {
  return {
    primaryKey: 'bidCatalogSectionId',
    autoQuery: false,
    selection: false,
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
    ],
  };
};

// 招标准备明细 - 技术文件-头
export const technicalFileHeaderDS = (): DataSetProps => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'techFileStatus',
        label: intl.get('scux.technicalDocumentsWorkBench.model.twnf.techFilSourceProjectStatus').d('技术文件状态'),
        lookupCode: 'SCUX_TWNF_TECHNICAL_DOCUMENTATION',
      },
      {
        name: 'techFileNum',
        label: intl.get('scux.technicalDocumentsWorkBench.model.twnf.techFileNum').d('技术文件编号'),
      },
    ],
  };
};

// 招标准备明细 - 技术文件（含图纸）
export const technicalFileDS = (): DataSetProps => {
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

// 招标准备明细 - 入围单位-头
export const supplierEvaluationHeaderDS = (): DataSetProps => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'nominationNum',
        label: intl.get('scux.supplierEvaluation.model.twnf.supplierEvaluation.nominationNum').d('入围单位编号'),
      },
      {
        name: 'nominationStatus',
        label: intl.get('scux.supplierEvaluation.model.twnf.supplierEvaluation.nominationStatus').d('入围单位状态'),
        lookupCode: 'SCUX_TWNF_NOMINATION_STATUS',
      },
    ],
  };
};
// 招标准备明细 - 入围单位
export const supplierListDS = (): DataSetProps => ({
  selection: false,
  autoQuery: false,
  paging: false,
  primaryKey: 'nominationSupLineId',
  fields: [
    { name: 'seqNum', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.seqNum`).d('序号') },
    { name: 'isSelected', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.isSelected`).d('是否入围') },
    { name: 'supplierCompanyNum', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.supplierCode`).d('供应商编码') },
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.supplierCompanyName`).d('供应商名称') },
    { name: 'stageDescription', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.stageDescription`).d('生命周期') },
    { name: 'contactPersonLov', type: FieldType.object, lovCode: 'HIAM.TENANT.USER', label: intl.get(`${supplierEvaluationPrefix}.field.contactPerson`).d('联系人'), required: true, ignore: FieldIgnore.always, },
    { name: 'contactName', type: FieldType.string, bind: "contactPersonLov.realName" },
    { name: 'contactMobilephone', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.contactMobilephone`).d('联系人电话'), required: true },
    { name: 'contactMail', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.contactEmail`).d('电子邮件') },
    { name: 'technologyReviewResult', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.technologyReviewResult`).d('技术评审状态'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', },
    { name: 'businessReviewResult', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.businessReviewResult`).d('商务评审状态'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', },
    { name: 'financeReviewResult', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.financeReviewResult`).d('财务评审状态'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', },
    { name: 'summaryReviewResult', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.summaryReviewResult`).d('评审总状态'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', },
    { name: 'remark', type: FieldType.string, label: intl.get(`${supplierEvaluationPrefix}.field.remark`).d('备注') },
  ],
});