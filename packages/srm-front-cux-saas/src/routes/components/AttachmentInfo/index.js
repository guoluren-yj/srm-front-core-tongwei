/*
 * AttachmentInfo - 订单明细页-附件信息
 * @date: 2021/05/13 11:47:39
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useCallback } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import C7NUpload from '_components/C7NUpload';

import { BUCKET_NAME, BUCKET_DIRECTORY } from '@/routes/components/utils/constant';
import { saveAttachmentUUID } from '@/services/orderWorkspaceService';
import styles from './index.less';

const AttachmentInfo = (props) => {
  const { ds, poHeaderId, viewOnly, ...others } = props;

  // 内部附件
  const afterOpenInsideModal = useCallback((uuid) => {
    if (!ds.current.get('purchaserInnerAttachmentUuid') && !viewOnly) {
      saveAttachmentUUID({
        poHeaderId,
        uuidType: 3,
        uuid,
      }).then((res) => {
        if (getResponse(res)) {
          ds.current.init({ objectVersionNumber: res });
        }
      });
    }
  }, []);

  // 外部附件
  const afterOpenExternalModal = useCallback((uuid) => {
    if (!ds.current.get('attachmentUuid') && !viewOnly) {
      saveAttachmentUUID({
        poHeaderId,
        uuidType: 1,
        uuid,
      }).then((res) => {
        if (getResponse(res)) {
          ds.current.init({ objectVersionNumber: res });
        }
      });
    }
  }, []);

  return (
    <div className={styles['order-workspace-attachment']}>
      <div className={styles['order-workspace-attachment-content']}>
        <h3>{intl.get('sodr.workspace.view.attachment.insideAttachment').d('内部附件')}:</h3>
        <C7NUpload
          viewOnly={viewOnly}
          icon="attach_file"
          record={ds.current}
          bucketName={BUCKET_NAME}
          bucketDirectory={BUCKET_DIRECTORY}
          name="purchaserInnerAttachmentUuid"
          afterOpenUploadModal={afterOpenInsideModal}
          {...others}
        />
        <h3 className={styles['attachment-title']}>
          {intl.get('sodr.workspace.view.attachment.supportExtensions').d('支持扩展名')}: .rar .zip
          .doc .docx .pdf .jpg...
        </h3>
      </div>
      <div className={styles['order-workspace-attachment-content']}>
        <h3>{intl.get('sodr.workspace.view.attachment.externalAttachment').d('外部附件')}:</h3>
        <C7NUpload
          viewOnly={viewOnly}
          icon="attach_file"
          record={ds.current}
          bucketName={BUCKET_NAME}
          bucketDirectory={BUCKET_DIRECTORY}
          name="attachmentUuid"
          afterOpenUploadModal={afterOpenExternalModal}
          {...others}
        />
        <h3 className={styles['attachment-title']}>
          {intl.get('sodr.workspace.view.attachment.supportExtensions').d('支持扩展名')}: .rar .zip
          .doc .docx .pdf .jpg...
        </h3>
      </div>
    </div>
  );
};

export default AttachmentInfo;
