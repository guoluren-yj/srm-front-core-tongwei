import React from 'react';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import { Content } from 'components/Page';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { Header as PreWinningBidHeader, SupplierList, BaseInfo } from './components';
import StoreProvider, { useStore } from './store/StoreProvider';
import Style from './index.less';


const PreWinningBidContent: React.FC<any> = observer(() => {
  const { pageLoading } = useStore();

  return (
    <div className={Style['scux-pre-winning-bid']}>
      <Spin spinning={pageLoading}>
        <PreWinningBidHeader />
        <Content>
          <BaseInfo />
          <SupplierList />
        </Content>
      </Spin>
    </div>
  );
});

const PreWinningBid: React.FC<any> = (props) => {
  return (
    <StoreProvider {...props}>
      <PreWinningBidContent />
    </StoreProvider>
  );
};

export default WithCustomizeC7N({
  unitCode: [
    'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_COLUMNS',
    'SSRC.NEW_BID_HALL_CHECK_PRICE.ATTACHMENT_TABLE_BUTTON_GROUP',
  ],
})(formatterCollections({
  code: ['scux.preWinningBid', 'ssrc.common', 'ssrc.inquiryHall'],
})(PreWinningBid));
