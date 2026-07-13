import React, { useMemo, useImperativeHandle, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Table, useDataSet, Button, Attachment } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import request from 'utils/request';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { cuxSaveUseSeal } from '@/services/inquiryHallNewService';

import { attachmentDS } from './storeDS';

// 采购方文件用印
const BidManagementAttachment = (props) => {
  const { parentRef, rfxHeaderId, modal } = props;

  const bidAttachTableDs = useDataSet(
    () =>
      attachmentDS({
        customizeUnitCode: `SSRC.BID_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_TABLE`,
      }),
    [rfxHeaderId]
  );

  useEffect(() => {
    if (rfxHeaderId) {
      bidAttachTableDs.setQueryParameter('sourceId', rfxHeaderId);
      handleQuery();
    }
  }, [rfxHeaderId]);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(parentRef, () => ({
    bidAttachTableDs,
  }));

  // 查询
  const handleQuery = () => {
    bidAttachTableDs.query();
  };
  // 电签用印
  const handleElectronicSignature = (record) => {
    const { attachmentLineId, attachmentUuid } =
      record.get(['attachmentLineId', 'attachmentUuid']) || {};
    bidAttachTableDs.status = 'loading';
    return request(
      `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/Q6WFYBxQfY6sEPsYzqqxHBOKEOmHTknDpmibsVofGTS4`,
      {
        method: 'POST',
        body: {
          sourceId: rfxHeaderId,
          attachmentLineId,
          attachmentUuid,
        },
      }
    )
      .then((res) => {
        if (getResponse(res)) {
          notification.success({});
          handleQuery();
        } else {
          bidAttachTableDs.status = 'ready';
        }
      })
      .catch((err) => {
        bidAttachTableDs.status = 'ready';
        throw err;
      });
  };

  // 附件上传前限制
  const beforeUpload = (attachment) => {
    if (attachment && attachment.ext && ['doc', 'docx'].includes(attachment.ext.toLowerCase())) {
      return true;
    }
    notification.error({
      message: intl.get('scux.bidAttachment.view.message.supportDoc').d('仅支持上传.docx格式文件'),
    });
    return false;
  };

  // table columns
  const columns = useMemo(
    () => [
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
            >
              {intl.get('hzero.common.upload.view').d('查看附件')}
            </Attachment>
          );
        },
      },
      { name: 'remark' },
      {
        name: 'cuxElectronicSignature',
        header: intl
          .get('scux.bidAttachment.model.fileTemplateAttachment.electronicSignature')
          .d('电签'),
        renderer: ({ record }) => {
          const attributeVarchar1 = record.get('attributeVarchar1');
          const attributeLongtext1AttachmentCount =
            record.getField('attributeLongtext1')?.getAttachmentCount() || 0;
          return Number(attributeVarchar1) === 1 ? (
            <Button
              funcType="link"
              wait={1200}
              disabled={attributeLongtext1AttachmentCount > 0}
              onClick={() => handleElectronicSignature(record)}
            >
              {intl
                .get('scux.bidAttachment.model.fileTemplateAttachment.electronicSignatureSeal')
                .d('电签用印')}
            </Button>
          ) : null;
        },
      },
      {
        name: 'attachmentUuid',
        editor: (record) => (
          <Attachment record={record} name="attachmentUuid" beforeUpload={beforeUpload} />
        ),
      },
      {
        name: 'attributeLongtext1',
      },
    ],
    []
  );

  // 招标文件用印保存
  const handleCuxSaveElectronicSignature = () => {
    modal.update({
      okProps: {
        loading: true,
      },
    });
    return cuxSaveUseSeal({
      attachmentLines: bidAttachTableDs.toJSONData(),
    })
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          handleQuery();
        }
      })
      .finally(() => {
        modal.update({
          okProps: {
            loading: false,
          },
        });
      });
  };

  const buttons = useMemo(() => {
    return [
      <Button
        wait={1200}
        disabled={!rfxHeaderId || rfxHeaderId === 'null'}
        onClick={() => handleCuxSaveElectronicSignature()}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
    ];
  }, [handleCuxSaveElectronicSignature, rfxHeaderId]);

  return (
    <Table
      dataSet={bidAttachTableDs}
      buttons={buttons}
      columns={columns}
      style={{ maxHeight: 450 }}
    />
  );
};

export default formatterCollections({
  code: ['scux.bidAttachment', 'ssrc.inquiryHall', 'ssrc.common'],
})(observer(BidManagementAttachment));
