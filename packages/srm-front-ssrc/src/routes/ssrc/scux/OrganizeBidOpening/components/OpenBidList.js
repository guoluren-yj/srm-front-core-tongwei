import React from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import querystring from 'querystring';

import intl from 'utils/intl';

import { prefix } from '../store/ds';

const OpenBidList = (props) => {
  const { openBidListDs, history, rfxHeaderId } = props;

  // 跳转到商务谈判
  const handleJumpToBusinessBattle = (record) => {
    const { quotationHeaderId } = record.get('quotationHeaderId');
    if (!quotationHeaderId || !rfxHeaderId) return;
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
            <Button funcType="link" onClick={() => handleJumpToBusinessBattle}>
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
