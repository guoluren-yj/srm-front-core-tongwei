import React, { useImperativeHandle, useRef, memo } from 'react';
import { useDataSet } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import SecLevelTitle from '@/routes/ssrc/scux/components/SecLevelTitle';

import BidManagementAttachment from './BidManagementAttachment';
import { attachmentDS } from './storeDS';

const BidAttachment = (props) => {
  const { bidFileTemplateAttachmentRef = useRef(), isNewRfx = false, rfxInfoDS } = props;

  const purAttachmentDs = useDataSet(
    () =>
      attachmentDS({
        isNewRfx,
        rfxInfoDS,
        customizeUnitCode: `SSRC.BID_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_TABLE`,
        attributeLongtext11: 'PUR',
      }),
    [isNewRfx]
  );

  const supAttachmentDs = useDataSet(
    () =>
      attachmentDS({
        isNewRfx,
        rfxInfoDS,
        customizeUnitCode: `SSRC.BID_HALL.NEW_EDIT.ATTACHMENT_REQUIREMENT_TABLE`,
        attributeLongtext11: 'SUP',
      }),
    [isNewRfx]
  );

  // 暴露子组件的api给父组件使用
  useImperativeHandle(bidFileTemplateAttachmentRef, () => ({
    purAttachmentDs,
    supAttachmentDs,
  }));

  return (
    <>
      <div>
        <SecLevelTitle
          title={intl.get('scux.bidAttachment.view.title.purAttach').d('采购方附件')}
        />
        <BidManagementAttachment {...props} bidAttachTableDs={purAttachmentDs} attachType="PUR" />
      </div>
      <div>
        <SecLevelTitle
          title={intl.get('scux.bidAttachment.view.title.supAttach').d('供应商附件')}
        />
        <BidManagementAttachment {...props} bidAttachTableDs={supAttachmentDs} attachType="SUP" />
      </div>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidAttachment', 'ssrc.inquiryHall', 'ssrc.common'],
})(memo(BidAttachment));
