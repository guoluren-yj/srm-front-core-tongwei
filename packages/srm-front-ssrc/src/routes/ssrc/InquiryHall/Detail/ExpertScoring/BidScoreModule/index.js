import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useDataSet } from 'choerodon-ui/pro';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';

import maintainStyles from '@/routes/ssrc/InquiryHallNew/Update/index.less';

import EvaluationExpert from './EvaluationExpert';
import SupplierList from './SupplierList';
import { confirmAndSummaryPageData } from './api';
import { evaluationExpertDataSet, supplierListDataSet } from '../store/storeDS';

const prefix = 'scux.bidEvaluationManagement';

const BidScoreModule = (props) => {
  const { rfxHeaderId } = props;

  const evaluationExpertDs = useDataSet(() => evaluationExpertDataSet(), []);
  const evaluationSupplierDs = useDataSet(() => supplierListDataSet(), []);

  useEffect(() => {
    if (rfxHeaderId) {
      fetchBidScoreModule();
    }
  }, [rfxHeaderId, fetchBidScoreModule]);

  // 查询招标二开内容
  const fetchBidScoreModule = async () => {
    await confirmAndSummaryPageData({
      postType: 'BASIC',
      rfxHeaderId,
    }).then((res) => {
      if (getResponse(res)) {
        const { expertList, supplierList } = res;
        evaluationExpertDs.loadData(expertList || []);
        evaluationSupplierDs.loadData(supplierList || []);
      }
    });
  };

  return (
    <>
      <Content>
        <h3 className={maintainStyles['rfx-card-item-title']}>
          {intl.get(`${prefix}.view.card.title.evaluationExpert`).d('评标专家')}
        </h3>
        <EvaluationExpert evaluationExpertDs={evaluationExpertDs} />
      </Content>
      <Content>
        <h3 className={maintainStyles['rfx-card-item-title']}>
          {intl.get(`${prefix}.view.card.title.evaluationExpert`).d('供应商列表')}
        </h3>
        <SupplierList evaluationSupplierDs={evaluationSupplierDs} prefix={prefix} />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidEvaluationManagement', 'ssrc.inquiryHall', 'srm.common'],
})(observer(BidScoreModule));
