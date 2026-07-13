import React, { useMemo } from 'react';
import { Tabs, Card, Spin } from 'choerodon-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import StoreProvider, { useStore } from './store/StoreProvider';
import {
  PageHeader,
  PageSteps,
  BaseInfo,
  BidPlanNode,
  BidPlanContent,
} from './components';
import Style from './index.less';

const { TabPane } = Tabs;

const PageContent: React.FC<any> = () => {
  return (
    <>
      <Card
        title={intl.get('scux.bidPlanDetail.view.card.title.baseInfo').d('基础信息')}
        id="cuxBasicInfo"
        bordered={false}
      >
        <BaseInfo />
      </Card>
      <Tabs className='scux-bid-plan-detail-tabs'>
        <TabPane tab={intl.get('scux.bidPlanDetail.view.tab.bidPlanNode').d('招标节点')} key="bidPlanNode">
          <BidPlanNode />
        </TabPane>
        <TabPane tab={intl.get('scux.bidPlanDetail.view.tab.bidPlanContent').d('招标内容')} key="bidPlanContent">
          <BidPlanContent />
        </TabPane>
      </Tabs>
    </>
  );
};

const Page: React.FC<any> = () => {
  const {
    bidPageDetailFlag,
    pageLoading,
  } = useStore();

  // 编辑或者发布准备之前的只读页面需要显示
  const showDomNodeFlag = useMemo(() => !bidPageDetailFlag, [bidPageDetailFlag]);

  return (
    <div className={`${Style['scux-bid-plan-detail-wrapper']} ${showDomNodeFlag ? '' : Style['scux-bid-plan-detail-wrapper-no-header']}`}>
      <Spin spinning={pageLoading}>
        {showDomNodeFlag && <PageHeader />}
        <div className={Style['scux-bid-plan-detail-content-wrapper']}>
          <div className={Style['scux-bid-plan-detail-content']}>
            {showDomNodeFlag ? (
              <>
                <PageSteps />
                <PageContent />
              </>
            ) : (
              <PageContent />
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
};

const Index: React.FC<any> = (props = {}) => {
  return (
    <StoreProvider {...props}>
      <Page />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
    'scux.bidPlanDetail',
    'sscux.ssrc',
  ],
})(Index);