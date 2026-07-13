/*
 * OrganizationInfo - 订单明细页-附件信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React from 'react';
import intl from 'utils/intl';
import { Attachment, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { PRIVATE_BUCKET } from '_utils/config';
// import styles from './index.less';

const AttachmentInfo = props => {
  const { ready, formDs, customizeForm, code } = props;
  const field = formDs?.getField('attachmentUuid');

  const disabled = field?.get('disabled');

  if (!code) {
    return (
      <div>
        <Form columns={2} labelLayout="float" dataSet={formDs} useWidthPercent>
          <Attachment
            readOnly={ready}
            labelLayout="float"
            help={
              <span className="attachment-title">
                {intl.get('siec.mould.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                .zip .doc .docx .pdf .jpg...
              </span>
            }
            name="attachmentUuid"
            bucketName={PRIVATE_BUCKET}
          />
        </Form>
      </div>
    );
  } else {
    return (
      <div>
        {customizeForm(
          {
            code,
            dataSet: formDs,
          },
          <Form columns={2} labelLayout="float" dataSet={formDs} useWidthPercent>
            <Attachment
              readOnly={disabled}
              labelLayout="float"
              help={
                <span className="attachment-title">
                  {intl.get('siec.mould.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                  .zip .doc .docx .pdf .jpg...
                </span>
              }
              name="attachmentUuid"
              bucketName={PRIVATE_BUCKET}
            />
          </Form>
        )}
      </div>
    );
  }
};

export default observer(AttachmentInfo);
