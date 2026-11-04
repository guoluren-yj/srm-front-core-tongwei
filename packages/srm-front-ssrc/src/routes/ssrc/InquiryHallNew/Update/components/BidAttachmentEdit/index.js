import React, { useImperativeHandle, useRef, memo } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import { useObserver } from 'mobx-react-lite';

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

  // 通威二开 - 来源为项目时展示「招标文件及附件」，否则展示「附件」
  const sourceFrom = useObserver(() => rfxInfoDS?.current?.get('sourceFrom'));
  const purAttachTitle =
    sourceFrom === 'PROJECT'
      ? intl.get('scux.bidAttachment.view.title.purAttach').d('招标文件及附件')
      : intl.get('ssrc.common.model.common.attachment').d('附件');

  return (
    <>
      <div>
        <SecLevelTitle title={purAttachTitle} />
        <BidManagementAttachment {...props} bidAttachTableDs={purAttachmentDs} attachType="PUR" />
      </div>
      <div>
        <SecLevelTitle
          title={intl.get('scux.bidAttachment.view.title.supAttach').d('投标文件模板')}
        />
        <BidManagementAttachment {...props} bidAttachTableDs={supAttachmentDs} attachType="SUP" />
      </div>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidAttachment', 'ssrc.inquiryHall', 'ssrc.common'],
})(memo(BidAttachment));
