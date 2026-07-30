import React, { useMemo } from 'react';
import { Tabs, Card, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import StoreProvider, { useStore } from './store/StoreProvider';
import {
  PageHeader,
  PageSteps,
  BaseInfo,
  TenderListSection,
  BidPlanContent,
} from './components';
import CommonLevel from '../../components/SecLevelTitle/CommonLevel';
import Style from './index.less';

const { TabPane } = Tabs;

const PageContent: React.FC<any> = () => {
  const {
    sourceProjectId,
  } = useStore();

  return (
    <>
      <Card
        title={<CommonLevel title={intl.get(`scux.tenderDetail.view.card.title.basicInfo`).d('基础信息')} />}
        id="cuxBasicInfo"
        bordered={false}
      >
        <BaseInfo />
      </Card>
      <Card
        title={null}
        id="cuxTenderList"
        bordered={false}
      >
        <Tabs className='scux-technical-documents-content-detail-tabs'>
          <TabPane tab={intl.get('scux.tenderDetail.view.tab.tenderList').d('招标清单')} key="tenderList">
            <TenderListSection />
          </TabPane>
          {!!sourceProjectId && (
            <TabPane tab={intl.get('scux.bidPlanDetail.view.tab.bidPlanContent').d('招标内容')} key="bidPlanContent">
              <BidPlanContent />
            </TabPane>
          )}
        </Tabs>
      </Card>
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
    <div className={`${Style['scux-technical-documents-detail-wrapper']} ${showDomNodeFlag ? '' : 'scux-technical-documents-detail-wrapper-no-header'}`}>
      <Spin spinning={pageLoading}>
        {showDomNodeFlag && (<PageHeader />)}
        <div className={Style['scux-technical-documents-detail-content-wrapper']}>
          <div className={Style['scux-technical-documents-content']}>
            {showDomNodeFlag ? (
              <>
                <PageSteps />
                <PageContent />
              </>
            ): (
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
    'scux.bidPlanWorkBench',
    'scux.tenderDetail',
  ],
})(observer(Index));
