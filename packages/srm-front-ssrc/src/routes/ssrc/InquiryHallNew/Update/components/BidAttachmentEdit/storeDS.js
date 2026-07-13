import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { PRIVATE_BUCKET, SRM_SSRC } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

// 有两个附件类型是前置写入的---附件表格都不可编辑(行不可编辑、删除)
export const getCommonDisabledFlag = ({ record, attachType }) =>
  attachType === 'PUR' &&
  [
    'SSRC.BID_HALL.NEW_EDIT.RFQ_ATTACHMENT_FORM|ssrc_rfx_header|attributeLongtext39',
    'SSRC.BID_HALL.NEW_EDIT.RFQ_ATTACHMENT_FORM|ssrc_rfx_header|attributeLongtext40',
  ].includes(record.get('attachmentType')?.uniqueKey);

// 采购方\供应商附件
const attachmentDS = ({
  isNewRfx,
  rfxInfoDS,
  customizeUnitCode = '',
  attributeLongtext11 = '',
} = {}) => ({
  autoQuery: false,
  dataToJSON: 'all',
  primaryKey: 'attachmentLineId',
  fields: [
    {
      name: 'attachmentType',
      label: intl.get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachType`).d('附件类型'),
      type: 'object',
      lovCode: 'SSRC.ATTACHMENT_TYPE',
      textField: 'fieldName',
      valueField: 'uniqueKey',
      required: true,
      optionsProps: {
        paging: false,
      },
      transformRequest: (value = {}) => {
        return value?.uniqueKey;
      },
      transformResponse: (value, record) =>
        value ? { uniqueKey: value, fieldName: record?.attachmentTypeMeaning } : null,
      dynamicProps: {
        disabled: ({ record }) => {
          if (record.get('attachmentFrom') === 'TEMPLATE') {
            // 从寻源模板中带出的
            return true;
          }
        },
        lovPara: () => {
          const sourceCategory = rfxInfoDS?.current?.get('secondarySourceCategory');

          return {
            sourceCategory,
            node: 'RELEASE',
          };
        },
      },
      lovQueryAxiosConfig: (code, _, { data, params }) => {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/template-attachment-lines/type`,
          method: 'POST',
          data: {
            code,
            ...data,
            ...params,
          },
        };
      },
    },
    {
      // 虚拟字段
      name: 'templateAttachment',
      label: intl
        .get(`ssrc.inquiryHall.model.fileTemplateAttachment.attachmentTemplate`)
        .d('模板附件'),
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
      dynamicProps: {
        readOnly: ({ record }) => Number(record.get('editableFlag')) === 1,
        max: ({ record }) => {
          // attributeVarchar1 电签为是，只能上传一份文档
          if (record && String(record.get('attributeVarchar1')) === '1') {
            return 1;
          } else {
            return null;
          }
        },
        help: ({ record }) => {
          // attributeVarchar1 电签为是，只能上传一份文档
          if (record && String(record.get('attributeVarchar1')) === '1') {
            return intl
              .get('scux.bidAttachment.view.tips.uploadTipOne')
              .d('仅支持上传.docx 文件格式，且仅支持上传一份文档；');
          } else {
            return null;
          }
        },
      },
    },
    {
      name: 'sourceNode',
      defaultValue: 'RELEASE',
    },
  ],
  record: {
    dynamicProps: {
      disabled: (record) => getCommonDisabledFlag({ record, attachType: attributeLongtext11 }),
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (!dataSet) {
        return;
      }
      dataSet.forEach((record = {}) => {
        const requiredFlag = record.get('requiredFlag');
        if (Number(requiredFlag) === 1) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
  transport: {
    read: ({ dataSet, params }) => {
      const { queryParameter: { sourceId, templateId } = {} } = dataSet;
      if (isNewRfx && templateId && templateId !== 'null') {
        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/init`,
          method: 'POST',
          params: {
            ...(params || {}),
            sourceCategory: 'RFX',
            templateId,
            customizeUnitCode,
            attributeLongtext11,
          },
          transformResponse: (res) => {
            const result = JSON.parse(res);
            if (result && !result.failed && result.length > 0) {
              const initData = result.filter((i) => i.attributeLongtext11 === attributeLongtext11);
              return initData;
            }
            return result;
          },
        };
      }
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
          attributeLongtext11,
        },
      };
    },
    destroy: ({ data, dataSet }) => {
      const { queryParameter: { sourceId } = {} } = dataSet;
      if (!sourceId || sourceId === 'null') return;
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/attachment-lines/delete`,
        method: 'POST',
        data: {
          sourceId,
          sourceCategory: 'RFX',
          attributeLongtext11,
          attachmentLineIds: data.map((i) => i.attachmentLineId),
        },
      };
    },
  },
});

export { attachmentDS };
