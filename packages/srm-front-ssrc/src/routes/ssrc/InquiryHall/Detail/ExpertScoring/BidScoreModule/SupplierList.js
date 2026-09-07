import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import { numberSeparatorRender } from '@/utils/renderer';

import EvaluationDetailModal from './EvaluationDetailModal';
import TeamScoreDetail from './TeamScoreDetail';

// 通威二开 - 供应商列表（评标进度），列与点击逻辑同评标管理-评标明细页保持一致
const SupplierList = (props) => {
  const { evaluationSupplierDs, rfxHeaderId, prefix } = props;

  /**
   * 价格标是否已开启（priceBidFlag = 1）
   */
  const isPriceBidOpened = (record) => Number(record?.get('priceBidFlag')) === 1;

  /**
   * 标段描述行跳转到报价详情
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
    openTab(
      {
        key: path,
        path,
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
        action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
        search: querystring.stringify(searchObj),
        closable: true,
      },
      undefined
    );
  };

  const columns = useMemo(
    () => [
      {
        name: 'sequence',
        width: 80,
      },
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'qtnTotalAmount',
        width: 140,
        renderer: ({ record, value }) =>
          isPriceBidOpened(record) ? numberSeparatorRender(value) : '-',
      },
      {
        name: 'bidDetail',
        header: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
        renderer: ({ record }) =>
          isPriceBidOpened(record) ? (
            <Button
              funcType={FuncType.link}
              wait={1200}
              onClick={() => directorQuotationDetail(record)}
            >
              {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
            </Button>
          ) : (
            '-'
          ),
      },
      {
        name: 'evaluationDetail',
        header: intl.get(`${prefix}.model.twnf.summary.evaluationDetail`).d('评标明细'),
        renderer: ({ record }) => <EvaluationDetailModal record={record} />,
      },
      {
        name: 'techExpertRatio',
        renderer: ({ record, value }) => (
          <TeamScoreDetail
            record={record}
            rfxHeaderId={rfxHeaderId}
            prefix={prefix}
            scoreTeam="TECHNOLOGY"
            teamName="技术组"
            value={value}
          />
        ),
      },
      {
        name: 'businessExpertRatio',
        renderer: ({ record, value }) => (
          <TeamScoreDetail
            record={record}
            rfxHeaderId={rfxHeaderId}
            prefix={prefix}
            scoreTeam="BUSINESS"
            teamName="商务组"
            value={value}
          />
        ),
      },
      {
        name: 'priceExpertRatio',
        renderer: ({ record, value }) => (
          <TeamScoreDetail
            record={record}
            rfxHeaderId={rfxHeaderId}
            prefix={prefix}
            scoreTeam="PRICE"
            teamName="价格组"
            value={value}
          />
        ),
      },
    ],
    [rfxHeaderId, prefix]
  );

  return evaluationSupplierDs ? <Table dataSet={evaluationSupplierDs} columns={columns} /> : null;
};

export default SupplierList;
