import React, { memo, useMemo } from 'react';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import SecLevelTitle from '@/routes/ssrc/scux/components/SecLevelTitle';

import BidManagementAttachment from './BidManagementAttachment';

const BidAttachment = (props) => {
  const { header, customizeTable } = props;
  const { rfxHeaderId } = header || {};

  if (!rfxHeaderId) return null;

  const queryParams = useMemo(
    () => ({
      sourceId: rfxHeaderId,
      sourceCategory: 'RFX',
      customizeUnitCode: 'SSRC.INQUIRY_BID_DETAIL.ATTACHMENT_REQUIREMENT_TABLE',
    }),
    [rfxHeaderId]
  );

  return (
    <>
      <div>
        <SecLevelTitle
          title={intl.get('scux.bidAttachment.view.title.purAttach').d('招标文件及附件')}
        />
        <BidManagementAttachment
          queryParams={{ ...queryParams, attributeLongtext11: 'PUR' }}
          customizeTable={customizeTable}
          attachType="PUR"
          actionFrom="RELEASE"
        />
      </div>
      <div>
        <SecLevelTitle
          title={intl.get('scux.bidAttachment.view.title.supAttach').d('投标文件模板')}
        />
        <BidManagementAttachment
          queryParams={{ ...queryParams, attributeLongtext11: 'SUP' }}
          customizeTable={customizeTable}
          attachType="SUP"
          actionFrom="RELEASE"
        />
      </div>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidAttachment', 'ssrc.inquiryHall', 'ssrc.common'],
})(memo(BidAttachment));
