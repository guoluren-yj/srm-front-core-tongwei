import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

// 采购方\供应商附件
const attachmentDS = ({ actionFrom = '' }) => ({
  autoQuery: false,
  dataToJSON: 'all',
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
      readOnly: true,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
    },
    {
      name: 'attributeVarchar19',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.attachmentName')
        .d('附件名称'),
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
    {
      name: 'attributeLongtext10',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.remarkBidPlan')
        .d('备注-招标计划'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter = {} } = dataSet;
      if (actionFrom === 'RELEASE') {
        const { customizeUnitCode, ...others } = queryParameter || {};
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/list`,
          method: 'POST',
          params: { customizeUnitCode },
          data: others,
        };
      }
      return {
        url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/RNSM1ViakicjXcJ14ib3HeMicZhibl8nc4fVhwrYxlhFibOAo`,
        method: 'POST',
        data: {
          action: 'QUERY',
          ...(queryParameter || {}),
        },
      };
    },
  },
});

export { attachmentDS };
