import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

// 采购方\供应商附件
const attachmentDS = ({ customizeUnitCode = '' } = {}) => ({
  autoQuery: false,
  dataToJSON: 'dirty',
  primaryKey: 'attachmentLineId',
  selection: false,
  fields: [
    {
      name: 'attachmentTypeMeaning',
      label: intl.get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachType`).d('附件类型'),
    },
    {
      name: 'tempAttachmentUuid',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachmentTemplate`)
        .d('模板附件'),
      readOnly: true,
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
    },
    {
      name: 'remark',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.describeTemplate`)
        .d('模板描述'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.attachment`).d('附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
      ...(ChunkUploadProps || {}),
      max: 1,
      help: intl
        .get('scux.bidAttachment.view.tips.uploadTipOne')
        .d('仅支持上传.docx 文件格式，且仅支持上传一份文档；'),
    },
    {
      name: 'sourceNode',
    },
    {
      name: 'attributeLongtext1',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.electronicSignatureAttachment')
        .d('电签附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
      ...(ChunkUploadProps || {}),
      readOnly: true,
    },
  ].filter(Boolean),
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { sourceId } = {} } = dataSet;
      if (!sourceId || sourceId === 'null') return;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/list`,
        method: 'POST',
        params: {
          customizeUnitCode,
        },
        data: {
          sourceCategory: 'RFX',
          sourceId,
          attributeLongtext11: 'PUR',
          attributeVarchar1: 1,
        },
      };
    },
  },
});

export { attachmentDS };
