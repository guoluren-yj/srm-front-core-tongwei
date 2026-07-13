import React, { useContext, useMemo } from 'react';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { Attachment, Form } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';

import { Store } from '../Store/store';

const AttachmentInfo = function AttachmentInfo() {
  const { headerDs, customizeForm, attachUnit } = useContext(Store);

  const HelpMsg = useMemo(() => (
    <span className="attachment-title">
      {intl.get('siec.mould.view.attachment.supportExtensions').d('支持扩展名')}: .rar .zip .doc
      .docx .pdf .jpg...
    </span>
  ));

  const form = customizeForm(
    {
      code: attachUnit,
      dataSet: headerDs,
    },
    <Form dataSet={headerDs} columns={2} useColon={false} useWidthPercent labelLayout="float">
      <Attachment
        readOnly
        labelLayout="float"
        help={HelpMsg}
        name="attachmentUuid"
        bucketName={PRIVATE_BUCKET}
      />
      <Divider dashed type="vertical" />
    </Form>
  );

  return form;
};

export default AttachmentInfo;
