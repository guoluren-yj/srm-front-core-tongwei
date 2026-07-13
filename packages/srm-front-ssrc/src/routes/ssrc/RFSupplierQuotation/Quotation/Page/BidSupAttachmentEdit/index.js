import React, { useMemo, useImperativeHandle, useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { Table, Button, Attachment, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';
import { yesOrNoRender } from 'utils/renderer';

import OnlyOfficeEditorOnline from '@/routes/ssrc/scux/components/OnlyOfficeEditorOnline';

import { attachmentDS } from './storeDS';

const BidManagementAttachment = (props) => {
  const { parentRef = useRef(), quotationHeaderCurrentId = '', rfxHeaderId } = props;

  const bidAttachTableDs = useDataSet(() => attachmentDS(), []);

  useEffect(() => {
    bidAttachTableDs.setQueryParameter('quotationHeaderCurrentId', quotationHeaderCurrentId);
  }, [quotationHeaderCurrentId]);

  // 暴露子组件的api给父组件使用
  useImperativeHandle(parentRef, () => ({
    bidAttachTableDs,
  }));

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

  const handleQuery = () => {
    bidAttachTableDs.query();
  };

  // 电签用印
  const handleElectronicSignature = (record) => {
    if (!rfxHeaderId) return;
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

  // table columns
  const columns = [
    {
      name: 'attributeVarchar19',
      editor: true,
    },
    {
      name: 'attachmentType',
      editor: true,
    },
    {
      name: 'attachmentUuid',
      editor: (record) => (
        <Attachment
          record={record}
          name="attachmentUuid"
          viewMode="popup"
          funcType="link"
          beforeUpload={beforeUpload}
        />
      ),
    },
    {
      header: intl.get('scux.bidAttachment.model.inquiryHall.attachmentEditor').d('文件编辑'),
      renderer: ({ record }) => {
        return (
          <OnlyOfficeEditorOnline
            headerId={rfxHeaderId}
            attachmentLineId={record.get('attachmentLineId')}
            title={intl.get('hzero.common.button.edit').d('编辑')}
          />
        );
      },
    },
    {
      name: 'attributeVarchar1',
      renderer: ({ value }) => (value ? yesOrNoRender(Number(value)) : value),
    },
    {
      name: 'cuxElectronicSignature',
      header: intl
        .get('scux.bidAttachment.model.fileTemplateAttachment.electronicSignature')
        .d('电签'),
      renderer: ({ record }) => {
        const attributeVarchar1 = record.get('attributeVarchar1');
        return Number(attributeVarchar1) === 1 ? (
          <Button funcType="link" wait={1200} onClick={() => handleElectronicSignature(record)}>
            {intl
              .get('scux.bidAttachment.model.fileTemplateAttachment.electronicSignatureSeal')
              .d('电签用印')}
          </Button>
        ) : null;
      },
    },
    {
      name: 'attributeLongtext1',
    },
    {
      name: 'requiredFlag',
      renderer: ({ value }) => (value ? yesOrNoRender(Number(value)) : value),
    },
    {
      name: 'templateAttachment',
      renderer: ({ record }) => {
        if (record.get('tempAttachmentUuid')) {
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
    bidAttachTableDs.create({}, 0);
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

  return (
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
