import React, { useEffect, useMemo } from "react";
import { useDataSet, Table, Button } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import querystring from 'querystring';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer, useObserver } from 'mobx-react-lite';
import { isNil } from 'lodash';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import { headerDataSet, supplierListDataSet } from '../store/storeDS';
import { queryPreWinningBid } from '../api';
import EvaluationDetailModal from '../../BidEvaluationManagement/SummaryDetail/components/EvaluationDetailModal';

const SupplierListDetail = (props) => {

  const { rfxHeaderId } = props;

  const headerDs = useDataSet(() => headerDataSet({ rfxHeaderId }), [rfxHeaderId]);
  const supplierListDs = useDataSet(() => supplierListDataSet({ rfxHeaderId }), [rfxHeaderId]);

  const { scoreWay } = useObserver(() => headerDs?.current?.get(['scoreWay']) || {});

  useEffect(() => {
    initData();
  }, [rfxHeaderId]);

  const initData = async () => {
    const res = await queryPreWinningBid({ rfxHeaderId });
    if (getResponse(res)) {
      const { rfxHeader = {}, supplierList = [] } = res;
      headerDs.loadData([rfxHeader]);
      supplierListDs.loadData(supplierList);
      supplierListDs.setState('headerDs', headerDs)
    };
  };

  /**
   * 标段描述行跳转到报价详情
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  const directorQuotationDetail = (record) => {
    const { quotationHeaderId = null } = record.get(['quotationHeaderId']) || {};

    const searchObj = {
      rfxHeaderId,
      noBackFlag: 1, // openTab 不需要返回
      pageType: 'SUPPLIER_DETAIL_QUERY',
      switchUrl: 2, // 采购方跳转标识
    };

    const path = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
    openTab({
      key: path,
      path: path,
      title: 'hzero.common.tab.title.cux.twnf.tenderDetail',
      action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
      search: querystring.stringify(searchObj),
      closable: true,
    }, undefined);
  };


  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'supplierCompanyName',
        width: 150,
      },
      {
        name: 'bidDetail',
        width: 120,
        renderer: ({ record }) => (
          <Button
            funcType={FuncType.link}
            wait={1200}
            onClick={() => directorQuotationDetail(record)}
          >
            {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
          </Button>
        ),
      },
      {
        name: 'invalidFlag',
        hidden: !scoreWay,
        width: 100,
        renderer: ({ value }) => isNil(value) ? null : yesOrNoRender(value),
      },
      {
        name: 'invalidReason',
        hidden: !scoreWay,
        width: 120,
      },
      {
        name: 'rank',
        hidden: !['10', '30'].includes(scoreWay),
        width: 130,
      },
      {
        name: 'businessReviewSum',
        hidden: scoreWay !== '30',
        width: 130,
      },
      {
        name: 'allScoreSum',
        hidden: !['10', '20', '40'].includes(scoreWay),
        renderer: ({ record, value }) => scoreWay === '10' && !isNil(value) ? <EvaluationDetailModal record={record} btnName={value} /> : value,
      },
      {
        name: 'sectionName',
        width: 120,
      },
      {
        name: 'sectionBidQtnTotalAmount',
        width: 130,
      },
      {
        name: 'sectionQtnTotalAmount',
        width: 130,
      },
      {
        name: 'bidQtnTotalAmount',
        width: 130,
      },
      {
        name: 'qtnTotalAmount',
        width: 130,
      },
      {
        name: 'techSum',
        hidden: !scoreWay,
        width: 120,
      },
      {
        name: 'businessSum',
        hidden: !scoreWay,
        width: 120,
      },
      {
        name: 'priceSum',
        hidden: !scoreWay,
        width: 120,
      },
      {
        name: 'allScoreSumTech',
        hidden: scoreWay !== '30',
        width: 120,
        renderer: ({ record }) => !isNil(record?.get('allScoreSum')) ? <EvaluationDetailModal record={record} btnName={record?.get('allScoreSum')} /> : null,
      },
      {
        name: 'attributeVarchar2',
        width: 100,
        renderer: ({ value }) => value ? yesOrNoRender(Number(value)) : null,
      },
      {
        name: 'attributeLongtext2',
        minWidth: 150,
      },
    ];
  }, [scoreWay]);

  return (
    <Table
      dataSet={supplierListDs}
      columns={columns}
      border={false}
      customizedCode='SCUX_TONGWEI_PRE_WINNING_BID_SUPPLIER_LIST'
    />
  );
};

export default formatterCollections({
  code: ['scux.preWinningBid', 'ssrc.common', 'ssrc.inquiryHall'],
})(observer(SupplierListDetail));