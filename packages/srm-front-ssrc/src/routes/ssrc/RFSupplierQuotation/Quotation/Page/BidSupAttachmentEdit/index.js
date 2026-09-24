import React, { useMemo, useImperativeHandle, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { Table, Button, Attachment, Modal, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import request from 'utils/request';
import { yesOrNoRender } from 'utils/renderer';

import { generateAttTemplate, cuxSaveBidAttachment } from '@/services/inquiryHallService';
import OnlyOfficeEditorOnline from '@/routes/ssrc/scux/components/OnlyOfficeEditorOnline';

import { attachmentDS } from './storeDS';
import { getElectronicSignAction } from './utils';

const BidManagementAttachment = (props) => {
  const {
    parentRef = useRef(),
    quotationHeaderCurrentId = '',
    rfxHeaderId,
    getRfxQuotationHeaderCurDTO,
    quotationHeaderId,
  } = props;

  const bidAttachTableDs = useDataSet(() => attachmentDS(), []);
  const [saving, setSaving] = useState(false);

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

  // 电签(sign) / 作废(cancel)，针对某一附件行
  const handleElectronicSign = (record, action) => {
    if (!rfxHeaderId) return;
    // 电签前校验：附件为空不允许发起电签
    if (action === 'sign' && !record.get('attachmentUuid')) {
      notification.error({
        message: intl
          .get('scux.bidAttachment.view.message.attachmentRequiredForSign')
          .d('附件为空，请先上传附件后再进行电签！'),
      });
      return;
    }
    const attachmentLine = { ...record.toData(), sourceId: quotationHeaderCurrentId };
    const rfxQuotationHeaderCurDTO = getRfxQuotationHeaderCurDTO
      ? getRfxQuotationHeaderCurDTO()
      : {};
    bidAttachTableDs.status = 'loading';
    return request(
      `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/zq9ZH4ydPicb5gbosbJqV5QFnVjzj2lspfSk11n6zVh8`,
      {
        method: 'POST',
        body: {
          rfxQuotationHeaderCurDTO,
          attachmentLine,
          action, // sign 电签 / cancel 作废
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

  // 生成附件（参考：new-bid-hall/bid-update 招标文件及附件的附件模板 生成附件）
  const handleGenerateAttachment = (record) => {
    const { fileManageId, attachmentUuid, attachmentLineId } =
      record.get(['fileManageId', 'attachmentUuid', 'editableFlag', 'attachmentLineId']) || {};

    if (!rfxHeaderId || !fileManageId) return;

    const params = {
      fileManageId: Number(fileManageId),
      sourceCategory: 'RFX',
      sourceId: rfxHeaderId,
      attachmentUuid,
      attachmentLineId,
      // ...(editableFlag === 1 ? {} : { attachmentUuid }), // editableFlag为1 表示寻源模板上的附件要求【限制文件不可修改】= 1
    };

    return generateAttTemplate(params).then((res) => {
      if (!getResponse(res)) {
        return;
      }
      notification.success();
      // 生成附件是后端写库，会连带刷新行上的 attachmentUuid / attachmentLineId / objectVersionNumber 等；
      // 只在前端 record 上 set 的话，后面保存或提交带上去的还是旧数据，会被乐观锁判成「数据已过时」
      handleQuery();
    });
  };

  // 是否电签（attributeVarchar1）为「是」
  const isElectronicSign = (record) => !!record.get('fileManageId');

  // table columns
  const columns = [
    {
      name: 'attributeVarchar19',
      // cuxSupplierCreateFlag 为 1（供应商新建/上传的行）才允许编辑文件名称
      editor: (record) => String(record.get('cuxSupplierCreateFlag')) === '1',
    },
    {
      name: 'attachmentType',
      editor: true,
    },
    {
      name: 'templateAttachment',
      renderer: ({ record }) => {
        // 是否电签为「否」时，附件模板列以 - 展示
        if (!isElectronicSign(record)) {
          return '-';
        }
        if (record.get('fileManageId')) {
          // 来自于寻源模板的招标文件管理中的，可生成附件
          return (
            <Button
              funcType="link"
              wait={1200}
              disabled={!rfxHeaderId || rfxHeaderId === 'null'}
              onClick={() => handleGenerateAttachment(record)}
            >
              {intl
                .get('ssrc.inquiryHall.model.fileTemplateAttachment.generateAttachment')
                .d('生成附件')}
            </Button>
          );
        }
        // if (record.get('tempAttachmentUuid')) {
        //   // 来自于寻源模板的上传本地附件
        //   return (
        //     <Attachment
        //       record={record}
        //       name="tempAttachmentUuid"
        //       viewMode="popup"
        //       bucketName={PRIVATE_BUCKET}
        //       bucketDirectory="ssrc-template-requirement"
        //       labelLayout="float"
        //       readOnly
        //       funcType="link"
        //     >
        //       {intl.get('hzero.common.upload.view').d('查看附件')}
        //     </Attachment>
        //   );
        // }
        return '-';
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
          beforeUpload={beforeUpload}
        />
      ),
    },
    {
      header: intl.get('scux.bidAttachment.model.inquiryHall.attachmentEditor').d('文件编辑'),
      renderer: ({ record }) => {
        // 是否电签为「否」时，文件编辑列以 - 展示
        if (!isElectronicSign(record)) {
          return '-';
        }
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
        .d('操作'),
      renderer: ({ record }) => {
        const action = getElectronicSignAction(record);
        // 作废：是否电签「是」且电签状态「成功」
        if (action === 'cancel') {
          return (
            <Button
              funcType="link"
              wait={1200}
              onClick={() =>
                Modal.confirm({
                  title: intl.get('hzero.common.message.confirm.title').d('提示'),
                  children: intl
                    .get('scux.bidAttachment.view.message.confirmVoidAttachment')
                    .d('确认作废该附件？'),
                  onOk: () => handleElectronicSign(record, 'invalid'),
                })
              }
            >
              {intl.get('scux.bidAttachment.model.fileTemplateAttachment.twnf.void').d('作废')}
            </Button>
          );
        }
        // 电签：是否电签「是」，且电签状态不是「成功」「已发出待签署」「待填写」
        if (action === 'sign') {
          return (
            <Button
              funcType="link"
              wait={1200}
              onClick={() => handleElectronicSign(record, 'sign')}
            >
              {intl.get('scux.bidAttachment.model.fileTemplateAttachment.twnf.sign').d('电签')}
            </Button>
          );
        }
        return null;
      },
    },
    {
      name: 'attributeLongtext1',
      editor: (record) => (
        <Attachment
          record={record}
          name="attributeLongtext1"
          viewMode="popup"
          funcType="link"
        />
      ),
    },
    {
      name: 'requiredFlag',
      renderer: ({ value }) => (value ? yesOrNoRender(Number(value)) : value),
    },
    // { name: 'remark' },
    {
      name: 'attributeVarchar5',
    },
    {
      name: 'attributeLongtext16',
    },
    {
      name: 'attributeLongtext17',
      // cuxSupplierCreateFlag 为 1（供应商新建/上传的行）才允许编辑文件名称
      editor: (record) => String(record.get('cuxSupplierCreateFlag')) === '1',
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
    bidAttachTableDs.create({cuxSupplierCreateFlag: "1"}, 0);
  };

  // 判断新增行是否为空行（用户没填任何内容的不提交）
  const hasAttachLineContent = (record) =>
    Boolean(
      record?.get('attachmentUuid') ||
        record?.get('attachmentType') ||
        record?.get('fileManageId') ||
        record?.get('attributeVarchar19') ||
        record?.get('attributeLongtext1') ||
        record?.get('remark')
    );

  // 保存附件：仅提交变更行，成功后刷新当前附件列表
  const handleSaveAttachment = async () => {
    if (!rfxHeaderId) return;
    const [created = [], updated = []] = bidAttachTableDs?.dirtyRecords || [];
    const changedRecords = [
      ...created.filter((record) => record?.dirty && hasAttachLineContent(record)),
      ...updated,
    ];
    if (!changedRecords.length) {
      notification.info({
        message: intl
          .get('scux.bidAttachment.view.message.twnf.noSaveChange')
          .d('当前没有需要保存的附件变更！'),
      });
      return;
    }
    const attachmentLineList = changedRecords.map((record) => record.toJSONData());
    setSaving(true);
    try {
      const res = await cuxSaveBidAttachment({ rfxHeaderId, quotationHeaderCurrentId: quotationHeaderId, attachmentLineList });
      if (getResponse(res)) {
        notification.success();
        handleQuery();
      }
    } finally {
      setSaving(false);
    }
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
      <Button
        icon="save"
        name="save"
        color="primary"
        funcType="flat"
        loading={saving}
        disabled={!rfxHeaderId || rfxHeaderId === 'null'}
        onClick={handleSaveAttachment}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
    ],
    [batchDisabledFlag, saving, rfxHeaderId]
  );

  return (
    <Table
      dataSet={bidAttachTableDs}
      columns={columns}
      buttons={tableButtons}
      style={{ maxHeight: 450 }}
      customizable
      customizedCode="SSRC.SUPPLIER_QUOTATION_NEW.BID_ATTACHMENT_EDIT"
    />
  );
};

export default formatterCollections({
  code: ['scux.bidAttachment', 'ssrc.inquiryHall', 'ssrc.common'],
})(observer(BidManagementAttachment));
