import React, { useMemo } from 'react';
import { Popover } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import BidManagementAttachment from './BidManagementAttachment';

const PopoverIndex = (props) => {
  const { attachType } = props;

  const title = useMemo(() => {
    if (title) return title;
    if (attachType === 'PUR') {
      return intl
        .get('scux.bidAttachment.view.message.twnf.bidPurManagementAttachment')
        .d('采购方附件');
    }
    return intl
      .get('scux.bidAttachment.view.message.twnf.bidSupManagementAttachment')
      .d('供应商附件');
  }, []);

  const content = () => {
    return (
      <div style={{ maxWidth: '400px' }}>
        <BidManagementAttachment {...props} />
      </div>
    );
  };

  return (
    <Popover content={content} title={title}>
      <Button funcType="link" icon="attach_file">
        {intl.get(`ssrc.inquiryHall.view.button.file`).d('附件')}
      </Button>
    </Popover>
  );
};

export default formatterCollections({
  code: ['ssrc.inquiryHall', 'scux.bidAttachment'],
})(PopoverIndex);
