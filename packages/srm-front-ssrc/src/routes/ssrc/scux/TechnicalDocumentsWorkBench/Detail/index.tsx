import React, { useMemo } from 'react';
import { Tabs, Card, Spin } from 'choerodon-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import StoreProvider, { useStore } from './store/StoreProvider';
import {
  PageHeader,
  PageSteps,
  BaseInfo,
  BidPlanBaseInfo,
  TechnicalFile,
  BidPlanContent,
} from './components';
import Style from './index.less';

const { TabPane } = Tabs;

const PageContent: React.FC<any> = () => {
  const {
    editorFlag
  } = useStore();

  return (
    <>
      <Card
        title={null}
        id="cuxTechnicalBasicInfo2"
        bordered={false}
      >
        <BidPlanBaseInfo />
      </Card>
      <Card
        title="基础信息"
        id="cuxTechnicalBasicInfo1"
        bordered={false}
      >
        <BaseInfo />
      </Card>
      <Card
        title={editorFlag ? null : intl.get('scux.technicalDocumentsDetail.view.tab.technicalFile').d('技术文件（含图纸）')}
        id="cuxTechnicalBasicInfo3"
        bordered={false}
      >
        {editorFlag ? (
          <Tabs className='scux-technical-documents-content-detail-tabs'>
            <TabPane tab={intl.get('scux.technicalDocumentsDetail.view.tab.technicalFile').d('技术文件（含图纸）')} key="technicalFile">
              <TechnicalFile />
            </TabPane>
            <TabPane tab={intl.get('scux.bidPlanDetail.view.tab.bidPlanContent').d('招标内容')} key="bidPlanContent">
              <BidPlanContent />
            </TabPane>
          </Tabs>
        ) : (
          <TechnicalFile />
        )}
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
    <div className={Style['scux-technical-documents-detail-wrapper']}>
      <Spin spinning={pageLoading}>
        <PageHeader />
        <div className={Style['scux-technical-documents-detail-content-wrapper']}>
          <div className={Style['scux-technical-documents-content']}>
            {showDomNodeFlag && <PageSteps />}
            <PageContent />
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
    'scux.technicalDocumentsDetail',
  ],
})(Index);
