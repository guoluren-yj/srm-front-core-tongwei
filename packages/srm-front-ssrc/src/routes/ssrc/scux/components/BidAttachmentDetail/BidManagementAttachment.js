import React, { useImperativeHandle, useRef, useMemo, memo, useState, useEffect } from 'react';
import { Table, Attachment, useDataSet } from 'choerodon-ui/pro';
import { isEmpty, isEqual } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject } from 'utils/utils';

import { attachmentDS } from './storeDS';

/**
 * attachType 采购方PUR、供应商SUP
 * actionFrom RELEASE-询价单维护、明细; OTHER-【除了询价单维护、明细之外的其他地方的比如供应商投标、定标页面显示的列和调用的接口都不一样】
 * queryParams 需要传给接口的参数
 * signedAttachmentMode 仅供【供应商报价-招标文件】引用时开启：将「电签附件」列名改为「签章附件」，
 *   且某行存在签章附件时，其「附件」列以 - 展示，否则才展示原始附件。其他引用处保持原逻辑
 */
const BidManagementAttachment = (props) => {
  const {
    parentRef = useRef(),
    customizeTable,
    attachType = 'PUR',
    actionFrom = 'OTHER',
    queryParams = {},
    signedAttachmentMode = false,
  } = props;

  const [sourceQueryParams, setSourceQueryParams] = useState({});

  const bidAttachTableDs = useDataSet(() => attachmentDS({ actionFrom }), [actionFrom]);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(parentRef, () => ({
    bidAttachTableDs,
  }));

  const refreshList = () => {
    const newParams = filterNullValueObject(queryParams);
    if (!isEmpty(newParams)) {
      Object.keys(newParams).forEach((key) => {
        bidAttachTableDs.setQueryParameter(key, newParams[key]);
      });
      setSourceQueryParams(queryParams);
      bidAttachTableDs.query();
    }
  };

  // 优化多次查询的问题
  useEffect(() => {
    if (!isEmpty(filterNullValueObject(queryParams)) && !isEqual(sourceQueryParams, queryParams)) {
      refreshList();
    }
  }, [sourceQueryParams, queryParams, refreshList]);

  // table columns
  const columns = useMemo(
    () =>
      actionFrom === 'RELEASE'
        ? [
          {
            name: 'attributeVarchar19',
          },
          {
            name: 'attachmentTypeMeaning',
          },
          {
            name: 'tempAttachmentUuid',
            renderer: ({ record }) => {
              const tempAttachmentUuid = record.get('tempAttachmentUuid');
              if (!tempAttachmentUuid) return null;
              return (
                <Attachment
                  record={record}
                  name="tempAttachmentUuid"
                  viewMode="popup"
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-template-requirement"
                  labelLayout="float"
                  readOnly
                  previewTarget
                  funcType="link"
                >
                  {intl.get('hzero.common.upload.view').d('查看附件')}
                </Attachment>
              );
            },
          },
          {
            name: 'attributeVarchar1',
            renderer: ({ value }) => (value ? yesOrNoRender(Number(value)) : value),
          },
          { name: 'remark' },
          {
            name: 'attributeLongtext10',
          },
          { name: 'attachmentUuid' },
        ]
        : [
          {
            name: 'attributeVarchar19',
            renderer: ({ value, record }) => {
              const hideFlag = record.get('hideFlag');
              if (hideFlag === '1' && value) {
                return value.replace(/./g, '*');
              }
              return value;
            },
          },
          {
            name: 'attachmentTypeMeaning',
          },
          // signedAttachmentMode（仅供应商报价-招标文件）下：行内存在签章附件 attributeLongtext1 时，
          // 「附件」列以 - 展示；否则展示原始附件。其他引用场景不设 renderer，走字段默认附件渲染
          {
            name: 'attachmentUuid',
            renderer: signedAttachmentMode
              ? ({ record }) => {
                if (record.get('attributeLongtext1')) {
                  return '-';
                }
                if (!record.get('attachmentUuid')) {
                  return null;
                }
                return (
                  <Attachment
                    record={record}
                    name="attachmentUuid"
                    viewMode="popup"
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-template-requirement"
                    labelLayout="float"
                    readOnly
                    previewTarget
                    funcType="link"
                  >
                    {intl.get('hzero.common.upload.view').d('查看附件')}
                  </Attachment>
                );
              }
              : undefined,
          },
          {
            name: 'attributeLongtext1',
            header: signedAttachmentMode
              ? intl.get('scux.bidAttachment.model.fileTemplateAttachment.twnf.sealAttachment').d('签章附件')
              : undefined,
          },
          { name: 'remark' },
          // {
          //   name: 'attributeVarchar1',
          //   renderer: ({ value }) => (value ? yesOrNoRender(Number(value)) : value),
          // },
        ],
    [actionFrom, signedAttachmentMode]
  );

  return attachType === 'PUR' && customizeTable ? (
    customizeTable(
      {
        code: `SSRC.INQUIRY_BID_DETAIL.ATTACHMENT_REQUIREMENT_TABLE`,
        dataSet: bidAttachTableDs,
      },
      <Table dataSet={bidAttachTableDs} columns={columns} style={{ maxHeight: 450 }} />
    )
  ) : (
    <Table dataSet={bidAttachTableDs} columns={columns} style={{ maxHeight: 450 }} />
  );
};

export default formatterCollections({
  code: ['scux.bidAttachment', 'ssrc.inquiryHall', 'ssrc.common'],
})(memo(BidManagementAttachment));
