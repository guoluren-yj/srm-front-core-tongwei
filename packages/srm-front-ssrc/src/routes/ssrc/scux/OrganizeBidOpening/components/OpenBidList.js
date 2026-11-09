import React from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import querystring from 'querystring';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { openTab } from 'utils/menuTab';

import { fetchOpenBargain } from '@/services/inquiryHallService';
import { getSourceUrlConfig } from '../../BidEvaluationManagement/api';

import { prefix } from '../store/ds';

const OpenBidList = (props) => {
  const { openBidListDs, history, rfxHeaderId, bargainOfflineFlag, sourceType, docType } = props;

  // 跳转到商务谈判
  const handleJumpToBusinessBattle = async (record) => {
    const quotationHeaderId = record.get('quotationHeaderId');
    if (!quotationHeaderId || !rfxHeaderId) return;
    const res = await getSourceUrlConfig({ sourceHeaderId: rfxHeaderId });
    if (getResponse(res) && res.bargainStatus === 'INITIATE') {
      await fetchOpenBargain({
        organizationId: getCurrentOrganizationId(),
        rfxHeaderId,
        bargainMethod: bargainOfflineFlag === 0 ? 'ONLINE' : sourceType,
      });
    }
    history.push({
      pathname: `/ssrc/new-bid-hall/new-rfx-bargain/${rfxHeaderId}`,
      search: querystring.stringify({
        sourceStatus: 'checkPrice',
        // 从开标组织页进入议价，返回时回到开标组织页
        sourcePage: 'organizeBidOpening',
        organizeBidType: docType,
        quotationHeaderId,
      }),
    });
  };

  // 跳转投标详情（与核价页/开标列表保持一致）
  const handleJumpToBidDetail = (record) => {
    const quotationHeaderId = record.get('quotationHeaderId');
    if (!quotationHeaderId || !rfxHeaderId) return;
    const path = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
    openTab({
      key: path,
      path,
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
      action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
      search: querystring.stringify({
        rfxHeaderId,
        noBackFlag: 1, // openTab 不需要返回
        pageType: 'SUPPLIER_DETAIL_QUERY',
        switchUrl: 2, // 采购方跳转标识
      }),
      closable: true,
    });
  };

  const getColumns = () => {
    return [
      {
        width: 80,
        name: 'lineNum',
      },
      { name: 'supplierName' },
      { name: 'contactPerson' },
      { name: 'phone' },
      { name: 'email' },
      { name: 'openTenderOrder' },
      { name: 'techBid' },
      { name: 'techOpenTime' },
      { name: 'businessBid' },
      { name: 'businessOpenTime' },
      { name: 'priceBid' },
      { name: 'priceOpenTime' },
      {
        // 与「商务谈判」一致：价格标已开启才展示「投标详情」入口
        name: 'bidDetail',
        renderer: ({ record }) => {
          return record.get('priceBid') === '已开启' ? (
            <Button funcType="link" wait={1200} onClick={() => handleJumpToBidDetail(record)}>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
            </Button>
          ) : null;
        },
      },
      {
        name: 'businessBattle',
        renderer: ({ record }) => {
          return record.get('priceBid') === '已开启' ? (
            <Button
              funcType="link"
              disabled={String(record.get('cuxNegotiationFlag')) !== '1'}
              onClick={() => handleJumpToBusinessBattle(record)}
            >
              {intl.get(`${prefix}.model.twnf.businessBattle`).d('商务谈判')}
            </Button>
          ) : null;
        },
      },
    ];
  };
  return <Table bordered dataSet={openBidListDs} columns={getColumns()} />;
};

export default OpenBidList;
