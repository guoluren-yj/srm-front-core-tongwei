import React from 'react';
import { Card, Spin } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import {
  BaseInfo,
  PageHeader,
  EvaluationExpert,
  OpenBidList,
  SupplierList,
} from './components';
// 通威二开 - 评标汇总 update（编辑）用老版供应商列表（56176889，无「中止评标」/技术商务价格组弹框），其余沿用共享 SupplierList
import SupplierListOld from './components/SupplierListOld';
import StoreProvider, { useStore } from './store/StoreProvider';
import CommonLevel from '../../components/SecLevelTitle/CommonLevel';

import Style from './index.less';

const Page: React.FC<any> = () => {
  const { pageLoading, pageType = '', prefix } = useStore();

  // 通威二开 - 评标汇总编辑态（update）使用老版供应商列表（老版字段），其余场景使用新版共享列表
  const isUpdate = pageType === 'update';

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
              title={<CommonLevel title={intl.get(`${prefix}.view.card.title.evaluationExpert`).d('评标详情')} />}
              id="cuxSupplierList"
              bordered={false}
            >
              {isUpdate ? <SupplierListOld /> : <SupplierList showStopEvaluation />}
            </Card>
            <Card
              title={<CommonLevel title={intl.get(`${prefix}.view.card.title.evaluationExpert`).d('评标专家')} />}
              id="cuxEvaluationExpert"
              bordered={false}
            >
              <EvaluationExpert />
            </Card>
          </div>
        </div>
      </Spin>
    </div>
  ) : null;
};

const Index: React.FC<any> = (props) => {
  const { match = { params: {} } } = props;
  const { params = {} } = match;
  // 通威二开 - 仅评标汇总编辑态（update）走老版供应商字段（techSum/businessSum/priceSum），与页面 SupplierList 分支保持一致
  const supplierListLegacy = params.pageType === 'update';
  return (
    <StoreProvider {...props} supplierListLegacy={supplierListLegacy}>
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
