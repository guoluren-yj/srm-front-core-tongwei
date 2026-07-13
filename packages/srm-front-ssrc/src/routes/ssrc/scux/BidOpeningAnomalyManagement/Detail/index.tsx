import React from 'react';
import { Card, Spin } from 'choerodon-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import StoreProvider, { useStore } from './store/StoreProvider';
import {
  PageHeader,
  BaseInfo,
  LineInfo,
} from './components';
import CommonLevel from '../../components/SecLevelTitle/CommonLevel';

import Style from './index.less';

const Page: React.FC<any> = () => {
  const {
    pageLoading,
  } = useStore();

  return (
    <div className={Style['scux-clear-tender-detail-wrapper']}>
      <Spin spinning={pageLoading}>
        <PageHeader />
        <div className={Style['scux-clear-tender-detail-content-wrapper']}>
          <div className={Style['scux-clear-tender-detail-content']}>
            <Card
              title={<CommonLevel title={intl.get('scux.bidOpeningAnomalyManagement.view.card.title.baseInfo').d('基础信息')} />}
              id="cuxBasicInfo"
              bordered={false}
            >
              <BaseInfo />
            </Card>
            <Card
              title={<CommonLevel title={intl.get('scux.bidOpeningAnomalyManagement.view.card.title.projectInfo').d('立项信息')} />}
              id="cuxBidPlanNode"
              bordered={false}
            >
              <LineInfo />
            </Card>
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
    'scux.bidOpeningAnomalyManagement',
    'sscux.ssrc',
  ],
})(Index);