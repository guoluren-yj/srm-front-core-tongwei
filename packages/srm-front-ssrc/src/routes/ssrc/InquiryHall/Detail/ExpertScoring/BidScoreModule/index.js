import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useDataSet } from 'choerodon-ui/pro';
import { isNil } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';

import maintainStyles from '@/routes/ssrc/InquiryHallNew/Update/index.less';

import EvaluationExpert from './EvaluationExpert';
import SupplierList from './SupplierList';
import { confirmAndSummaryPageData } from './api';
import { evaluationExpertDataSet } from '../store/storeDS';
import { supplierListDataSet } from './storeDS';

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
        const { bidOpenList, expertList, supplierList } = res;
        // 通威二开 - 供应商行缺价格标状态，从开标列表按供应商名称对照补上，
        // 用于控制「报价总金额 / 投标详情」展示，与评标管理-评标明细页一致
        const priceBidMap = {};
        const priceBidFlagMap = {};
        (bidOpenList || []).forEach((item) => {
          priceBidMap[item.supplierName] = item.priceBid;
          priceBidFlagMap[item.supplierName] = item.priceBidFlag;
        });
        const enrichedSupplierList = (supplierList || []).map((raw) => {
          const item = { ...raw };
          item.priceBid = priceBidMap[item.supplierCompanyName];
          if (isNil(item.priceBidFlag)) {
            item.priceBidFlag = priceBidFlagMap[item.supplierCompanyName];
          }
          return item;
        });
        evaluationExpertDs.loadData(expertList || []);
        evaluationSupplierDs.loadData(enrichedSupplierList);
      }
    });
  };

  return (
    <>
      <Content>
        <h3 className={maintainStyles['rfx-card-item-title']}>
          {intl.get(`${prefix}.view.card.title.evaluationExpert`).d('评标进度')}
        </h3>
        <SupplierList
          evaluationSupplierDs={evaluationSupplierDs}
          rfxHeaderId={rfxHeaderId}
          prefix={prefix}
          onRefresh={fetchBidScoreModule}
        />
      </Content>
      <Content>
        <h3 className={maintainStyles['rfx-card-item-title']}>
          {intl.get(`${prefix}.view.card.title.evaluationExpert`).d('评标专家')}
        </h3>
        <EvaluationExpert evaluationExpertDs={evaluationExpertDs} />
      </Content>
    </>
  );
};

export default formatterCollections({
  code: ['scux.bidEvaluationManagement', 'ssrc.inquiryHall', 'srm.common'],
})(observer(BidScoreModule));
