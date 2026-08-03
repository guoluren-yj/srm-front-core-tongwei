import React from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import querystring from 'querystring';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { fetchOpenBargain } from '@/services/inquiryHallService';
import { getSourceUrlConfig } from '../../BidEvaluationManagement/api';

import { prefix } from '../store/ds';

const OpenBidList = (props) => {
  const { openBidListDs, history, rfxHeaderId, bargainOfflineFlag, sourceType } = props;

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
        quotationHeaderId,
        sourceStatus: 'checkPrice',
      }),
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
        name: 'businessBattle',
        renderer: ({ record }) => {
          return record.get('priceBid') === '已开启' ? (
            <Button funcType="link" onClick={() => handleJumpToBusinessBattle(record)}>
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
