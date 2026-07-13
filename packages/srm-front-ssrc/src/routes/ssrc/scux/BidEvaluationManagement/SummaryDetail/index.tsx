import React from 'react';
import { Card, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { BaseInfo, PageHeader, EvaluationExpert, SupplierList, OpenBidList } from './components';
import StoreProvider, { useStore } from './store/StoreProvider';
import CommonLevel from '../../components/SecLevelTitle/CommonLevel';

import Style from './index.less';

const Page: React.FC<any> = (props) => {
  const { pageLoading, pageType = '', prefix } = useStore();

  return pageType ? (
    <div className={Style['scux-detail-wrapper']}>
      <Spin spinning={pageLoading}>
        <PageHeader />
        <div className={Style['scux-detail-content-wrapper']}>
          <div className={Style['scux-detail-content']}>
            <Card
              title={null}
              id="cuxBasicInfo"
              bordered={false}
            >
              <BaseInfo />
            </Card>
            {pageType === 'view' ? (
              <Card
                title={<CommonLevel title={intl.get(`${prefix}.view.card.title.bidOpeningList`).d('开标列表')} />}
                id="cuxBidOpeningList"
                bordered={false}
              >
                <OpenBidList />
              </Card>
            ) : null}
            <Card
              title={<CommonLevel title={intl.get(`${prefix}.view.card.title.evaluationExpert`).d('评标专家')} />}
              id="cuxEvaluationExpert"
              bordered={false}
            >
              <EvaluationExpert />
            </Card>
            <Card
              title={<CommonLevel title={intl.get(`${prefix}.view.card.title.evaluationExpert`).d('供应商列表')} />}
              id="cuxSupplierList"
              bordered={false}
            >
              <SupplierList />
            </Card>
          </div>
        </div>
      </Spin>
    </div>
  ) : null;
};

const Index: React.FC<any> = (props) => {
  return (
    <StoreProvider {...props}>
      <Page {...props} />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
    'scux.bidEvaluationManagement',
    'ssrc.inquiryHall',
    'srm.common',
  ],
})(observer(Index));
