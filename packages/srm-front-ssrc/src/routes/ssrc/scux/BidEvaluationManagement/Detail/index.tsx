import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Spin } from 'choerodon-ui';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { BaseInfo, SupplierInfo, ScoreInfo, PageHeader } from './components';
import StoreProvider, { useStore } from './store/StoreProvider';
import CommonLevel from '../../components/SecLevelTitle/CommonLevel';

import Style from './index.less';

const Page: React.FC<any> = (props) => {
  const { pageLoading, pageType = '', prefix } = useStore();

  const pageContentDto = useMemo(() => {
    switch (pageType) {
      case 'tech':
      case 'price':
        return [
          <Card
            title={null}
            id="cuxBasicInfo"
            bordered={false}
          >
            <BaseInfo />
          </Card>,
          <Card
            title={null}
            id="cuxSupplierInfo"
            bordered={false}
          >
            <SupplierInfo />
          </Card>,
          <Card
            title={<CommonLevel title={intl.get(`${prefix}.view.card.title.scoreInfo`).d('评分信息')} />}
            id="cuxScoreInfo"
            bordered={false}
          >
            <ScoreInfo />
          </Card>,
        ];
      case 'view':
        return [
          <Card
            title={<CommonLevel title={intl.get(`${prefix}.view.card.title.scoreInfo`).d('评分信息')} />}
            id="cuxScoreInfo"
            bordered={false}
          >
            <ScoreInfo />
          </Card>,
        ];
      default:
        return [];
    };
  }, [
    pageType,
  ]);

  return pageType ? (
    <div className={Style['scux-detail-wrapper']}>
      <Spin spinning={pageLoading}>
        <PageHeader />
        <div className={Style['scux-detail-content-wrapper']}>
          <div className={Style['scux-detail-content']}>
            {pageContentDto || null}
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

