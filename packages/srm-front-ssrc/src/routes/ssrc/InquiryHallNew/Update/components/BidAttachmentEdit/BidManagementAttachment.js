import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import { isEmpty, noop } from 'lodash';
import { Table, Lov, Button, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { queryFileList } from 'services/api';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchAttTemplateDataByAttType, generateAttTemplate } from '@/services/inquiryHallService';
import OnlyOfficeEditorOnline from '@/routes/ssrc/scux/components/OnlyOfficeEditorOnline';
import { getCommonDisabledFlag } from './storeDS';
import style from './index.less';

const BidManagementAttachment = (props) => {
  const { rfxInfoDS, attachType, bidAttachTableDs, customizeTable = noop } = props;

  const { rfxHeaderId } = rfxInfoDS?.current?.get(['rfxHeaderId']) || {};

  // change attachment type
  const handleChangeAttachmentType = (value, record) => {
    const { uniqueKey, sourceNode, sourceNodeMeaning } = value || {};
    const templateId = rfxInfoDS?.current?.get('templateId') || {};
    record.set({ sourceNode, sourceNodeMeaning });
    if (!templateId || !uniqueKey) return;
    fetchAttTemplateDataByAttType({
      sourceCategory: 'RFX',
      templateId,
      attachmentType: uniqueKey,
    }).then((res) => {
      if (getResponse(res)) {
        const { attachmentType, ...others } = res || {}; // attachmentType 默认更新
        record.set(others);
      }
    });
  };

  // 生成附件
  const handleGenerateAttachment = (record) => {
    const { fileManageId, attachmentUuid, editableFlag } =
      record.get(['fileManageId', 'attachmentUuid', 'editableFlag']) || {};
    const sourceId = bidAttachTableDs.getQueryParameter('sourceId');

    if (!sourceId || sourceId === 'null' || !fileManageId) return;

    return generateAttTemplate({
      sourceId,
      fileManageId,
      sourceCategory: 'RFX',
      attachmentUuid: editableFlag === 1 ? undefined : attachmentUuid, // 注意：editableFlag为1 表示寻源模板上的附件要求【限制文件不可修改】= 1
    }).then((res) => {
      if (getResponse(res)) {
        notification.success();
        if (!record.get('attachmentUuid')) {
          record.set('attachmentUuid', res.attachmentUuid);
        } else {
          record.set('attachmentUuid', null);
          record.set('attachmentUuid', res.attachmentUuid);
          queryFileList({
            organizationId: getCurrentOrganizationId(),
            bucketName: PRIVATE_BUCKET,
            bucketDirectory: 'ssrc-template-requirement',
            attachmentUUID: res.attachmentUuid,
          }).then((fileList) => {
            if (getResponse(fileList)) {
              record.getField('attachmentUuid').setAttachmentCount(fileList?.length || 0);
            }
          });
        }
      }
    });
  };

  // 附件上传前限制
  const beforeUpload = ({ record, attachment }) => {
    if (String(record.get('attributeVarchar1')) !== '1') {
      return true;
    }
    // attributeVarchar1 电签为是，则附件处只能允许上传1个且为word文件
    if (attachment && attachment.ext && ['doc', 'docx'].includes(attachment.ext.toLowerCase())) {
      return true;
    }
    notification.error({
      message: intl.get('scux.bidAttachment.view.message.supportDoc').d('仅支持上传.docx格式文件'),
    });
    return false;
  };

  // table columns
  const columns = [
    {
      name: 'attachmentType',
      editor: (record) => {
        return (
          <Lov
            record={record}
            name="attachmentType"
            onChange={(value) => handleChangeAttachmentType(value, record)}
          />
        );
      },
    },
    {
      name: 'templateAttachment',
      renderer: ({ record }) => {
        const sourceId = bidAttachTableDs.getQueryParameter('sourceId');
        if (record.get('fileManageId')) {
          // 来自于寻源模板的招标文件管理中的
          return (
            <Button
              funcType="link"
              wait={1200}
              disabled={
                !sourceId || sourceId === 'null' || getCommonDisabledFlag({ record, attachType })
              }
              onClick={() => handleGenerateAttachment(record)}
            >
              {intl
                .get('ssrc.inquiryHall.model.fileTemplateAttachment.generateAttachment')
                .d('生成附件')}
            </Button>
          );
        } else if (record.get('tempAttachmentUuid')) {
          // 来自于寻源模板的上传本地附件
          return (
            <Attachment
              record={record}
              name="tempAttachmentUuid"
              viewMode="popup"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-template-requirement"
              labelLayout="float"
              readOnly
              funcType="link"
            >
              {intl.get('hzero.common.upload.view').d('查看附件')}
            </Attachment>
          );
        }
        return null;
      },
    },
    { name: 'remark' },
    {
      header: intl.get('scux.bidAttachment.model.inquiryHall.attachmentEditor').d('文件编辑'),
      renderer: ({ record }) => {
        return getCommonDisabledFlag({ record, attachType }) ? (
          <Button funcType="link" disabled>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Button>
        ) : (
          <OnlyOfficeEditorOnline
            headerId={rfxHeaderId}
            attachmentLineId={record.get('attachmentLineId')}
            title={intl.get('hzero.common.button.edit').d('编辑')}
          />
        );
      },
    },
    {
      name: 'attachmentUuid',
      editor: (record) => (
        <Attachment
          record={record}
          name="attachmentUuid"
          viewMode="popup"
          funcType="link"
          beforeUpload={(attachment) => beforeUpload({ record, attachment })}
        />
      ),
    },
  ];

  // batch delete
  const handleBatchDeleteAttachment = () => {
    const selectedRecords = bidAttachTableDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('attachmentLineId')) || [];

    // 删除新增数据
    if (!isEmpty(addRecords)) {
      bidAttachTableDs.remove(addRecords);
    }

    if (!isEmpty(oldRecords)) {
      // 删除线上数据
      bidAttachTableDs.delete(oldRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
    }
  };

  // 新增
  const handleAdd = () => {
    bidAttachTableDs.create(
      {
        attributeLongtext11: attachType,
      },
      0
    );
  };

  // 批量删除按钮、复制禁用逻辑
  const batchDisabledFlag = useMemo(() => {
    return (
      !bidAttachTableDs ||
      !bidAttachTableDs.selected?.length ||
      (!bidAttachTableDs.length && !bidAttachTableDs.cachedRecords?.length) ||
      bidAttachTableDs?.status === 'loading'
    );
  }, [
    bidAttachTableDs?.selected,
    bidAttachTableDs.length,
    bidAttachTableDs.cachedRecords?.length,
    bidAttachTableDs?.status,
  ]);

  const tableButtons = useMemo(
    () => [
      <Button icon="add" name="add" funcType="flat" onClick={handleAdd}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        icon="delete"
        name="delete"
        funcType="flat"
        wait={500}
        onClick={handleBatchDeleteAttachment}
        disabled={batchDisabledFlag}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </Button>,
    ],
    [batchDisabledFlag]
  );

  return attachType === 'PUR' ? (
    customizeTable(
      {
        code: `SSRC.BID_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_TABLE`,
        buttonCode: 'SSRC.BID_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_BUTTONS',
        dataSet: bidAttachTableDs,
      },
      <Table
        dataSet={bidAttachTableDs}
        columns={columns}
        buttons={tableButtons}
        style={{ maxHeight: 450 }}
        className={style['bid-attachment-table']}
      />
    )
  ) : (
    <Table
      dataSet={bidAttachTableDs}
      columns={columns}
      buttons={tableButtons}
      style={{ maxHeight: 450 }}
    />
  );
};

export default formatterCollections({
  code: ['scux.bidAttachment', 'ssrc.inquiryHall', 'ssrc.common'],
})(observer(BidManagementAttachment));
