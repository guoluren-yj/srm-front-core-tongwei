import React, { useMemo } from "react";
import { Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { useObserver } from 'mobx-react-lite';

import { useStore } from '../store/StoreProvider';

const LineInfo: React.FC<any> = () => {

  const {
    commonDs: { baseInfoDs, lineInfoDs } = {},
    history,
  } = useStore();

  if (!lineInfoDs) {
    return null;
  };

  const benchmarkPriceType = useObserver(() => baseInfoDs?.current?.get('benchmarkPriceType'));

  // 跳转PR详情
  const handleJumpPrDetail = (record) => {
    const {
      prHeaderId,
      isErp,
    } = record.get(['prHeaderId', 'isErp']);
    const pathUrl = isErp
          ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
          : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
    history.push({
      pathname: pathUrl,
    });
  };

  // 跳转立项详情
  const handleJumpProjectDetail = (record) => {
    const sourceProjectId = record.get('sourceProjectId');
    history.push({
      pathname: `/ssrc/new-project-setup/detail/${sourceProjectId}`
    });
  };

  const columns: ColumnProps[] = useMemo(() => [
    {
      name: 'lineItemNum',
    },
    {
      name: 'prNum',
      width: 160,
      renderer: ({ value, record }) => {
        if (value) {
          return (<a target="_blank" onClick={() => handleJumpPrDetail(record)}>{value}</a>)
        };
        return value;
      },
    },
    {
      name: 'projectNum',
      width: 160,
      renderer: ({ value, record }) => {
        if (value) {
          return (<a target="_blank" onClick={() => handleJumpProjectDetail(record)}>{value}</a>)
        };
        return value;
      },
    },
    {
      name: 'prUserBy',
    },
    {
      name: 'prUserName',
    },
    {
      name: 'techLeaderName',
    },
    {
      name: 'purCompanyName',
    },
    {
      name: 'prUnitName',
    },
    {
      name: 'lineAmount',
    },
    {
      name: 'estimatedAmount',
      hidden: !benchmarkPriceType || benchmarkPriceType === 'NET_PRICE',
    },
    {
      name: 'netEstimatedAmount',
      hidden: !benchmarkPriceType || benchmarkPriceType === 'TAX_INCLUDED_PRICE',
    },
    {
      name: 'budgetAmount',
    },
    {
      name: 'itemName',
    },
  ], [benchmarkPriceType]);
  return (
    <Table
      dataSet={lineInfoDs}
      columns={columns}
    />
  );
};

export default LineInfo;