import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

import { isAttachmentRequired } from './utils';

// 采购方\供应商附件
const attachmentDS = () => ({
  autoQuery: false,
  dataToJSON: 'all',
  primaryKey: 'attachmentLineId',
  fields: [
    {
      name: 'attachmentType',
      label: intl.get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachType`).d('附件类型'),
      type: 'string',
      lookupCode: 'SCUX_SUP_FILE_TYPE',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => {
          if (record.get('attachmentFrom') === 'TEMPLATE' || record.get('attachmentFromId')) {
            // 从寻源模板中带出的
            return true;
          }
        },
      },
    },
    {
      // 虚拟字段
      name: 'templateAttachment',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.templateAttachment`)
        .d('附件模板'),
    },
    // {
    //   name: 'remark',
    //   label: intl
    //     .get(`ssrc.inquiryHall.model.fileTemplateAttachment.describeTemplate`)
    //     .d('模板描述'),
    // },
    {
      name: 'attachmentUuid',
      label: intl.get(`ssrc.common.model.common.attachment`).d('附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
      ...(ChunkUploadProps || {}),
      dynamicProps: {
        // 通威二开：模板行（fileManageId 有值）可编辑；非模板行（fileManageId 为空）只读
        readOnly: ({ record }) => !record.get('fileManageId'),
        // 通威二开：只读查看（非模板行）时不限制附件数量。
        // C7N Attachment 的 isDisabled() 在 count >= max 时返回 true，
        // 会把只读状态下「查看附件」按钮（以及整个单元格）渲染成禁用灰色，导致有附件也点不了
        max: ({ record }) => (record.get('fileManageId') ? undefined : Number.MAX_SAFE_INTEGER),
      },
      max: 1,
      help: intl
        .get('scux.bidAttachment.view.tips.uploadTipOne')
        .d('仅支持上传.docx 文件格式，且仅支持上传一份文档；'),
    },
    {
      name: 'sourceNode',
      defaultValue: 'RELEASE',
    },
    {
      name: 'attributeVarchar19',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.attachmentName')
        .d('文件名称'),
    },
    {
      name: 'attributeVarchar1',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.isSignature')
        .d('是否电签'),
    },
    {
      name: 'attributeLongtext1',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.electronicSignatureAttachment')
        .d('签章附件'),
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
      ...(ChunkUploadProps || {}),
      dynamicProps: {
        // 是否电签为「是」：由电签流程生成，只读
        readOnly: ({ record }) => Number(record.get('attributeVarchar1')) === 1,
        // 【附件是否必输】为「是」时必填，与提交校验同一套判断
        required: ({ record }) => isAttachmentRequired(record),
      },
    },
    {
      name: 'requiredFlag',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.isRequired')
        .d('附件是否必输'),
    },
    {
      name: 'attributeVarchar5',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.electronicSignatureStatus')
        .d('电签状态'),
      lookupCode: 'SCUX.TWNF_EC_STATUS',
    },
    // {
    //   name: 'attributeLongtext16',
    //   label: intl
    //     .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.voidAttachment')
    //     .d('作废附件'),
    //   type: 'attachment',
    //   bucketName: PRIVATE_BUCKET,
    //   bucketDirectory: 'ssrc-template-requirement',
    //   ...(ChunkUploadProps || {}),
    //   dynamicProps: {
    //     readOnly: true,
    //   },
    // },
    {
      name: 'attributeLongtext17',
      label: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.twnf.attachmentRemark')
        .d('备注'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      if (!dataSet) {
        return;
      }
      dataSet.forEach((record = {}) => {
        const { requiredFlag, attachmentFromId } =
          record.get(['requiredFlag', 'attachmentFromId']) || {};
        if (Number(requiredFlag) === 1 || attachmentFromId) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { quotationHeaderCurrentId } = {} } = dataSet;
      return {
        url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/RNSM1ViakicjXcJ14ib3HeMicZhibl8nc4fVhwrYxlhFibOAo`,
        method: 'POST',
        data: {
          action: 'QUERY',
          quotationHeaderCurrentId,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { quotationHeaderCurrentId } = {} } = dataSet;
      return {
        url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/RNSM1ViakicjXcJ14ib3HeMicZhibl8nc4fVhwrYxlhFibOAo`,
        method: 'POST',
        data: {
          action: 'DELETE',
          quotationHeaderCurrentId,
          attachmentLines: data,
        },
      };
    },
  },
});

export { attachmentDS };
