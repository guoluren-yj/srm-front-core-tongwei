import React, { useMemo } from "react";
import { Table } from "choerodon-ui/pro";
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';

import { useStore } from '../store/StoreProvider';

const OpenBidList: React.FC = () => {

  const {
    commonDs: {
      bidOpeningListDs,
    } = {},
    history,
  } = useStore();

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'lineNum',
      },
      {
        name: 'supplierName',
      },
      {
        name: 'contactPerson',
      },
      {
        name: 'phone',
      },
      {
        name: 'email',
      },
      {
        name: 'openTenderOrder',
      },
      {
        name: 'techBid',
      },
      {
        name: 'techOpenTime',
      },
      {
        name: 'businessBid',
      },
      {
        name: 'businessOpenTime',
      },
      {
        name: 'priceBid',
      },
      {
        name: 'priceOpenTime',
      },
      {
        name: 'businessBattle',
        // TODO: 商务谈判待完善
        // renderer: ({ record }) => (
        //   record.get('priceBid') === '已开启' && <a onClick={() => {
        //       history.push({
        //           pathname: `/ssrc/new-bid-hall/new-rfx-bargain/${record.get('rfxHeaderId')}?sourceStatus=checkPrice&current=&quotationHeaderId=${record.get('rfxHeaderId')}`,
        //       });
        //   }}
        //   > 商务谈判
        //   </a>
      // ),
      },
    ];
  }, []);

  return bidOpeningListDs ? (
    <Table
      dataSet={bidOpeningListDs}
      columns={columns}
    />
  ) : null;
};

export default OpenBidList;