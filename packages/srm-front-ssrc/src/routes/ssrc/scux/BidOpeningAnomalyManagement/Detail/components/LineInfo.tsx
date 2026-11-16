import React, { useMemo } from "react";
import { Table } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';

import { useStore } from '../store/StoreProvider';

const LineInfo: React.FC<any> = () => {

  const {
    commonDs: { lineInfoDs } = {},
    history,
  } = useStore();

  if (!lineInfoDs) {
    return null;
  };

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

  const columns: ColumnProps[] = useMemo(() => [
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
      name: 'itemName',
    },
    {
      name: 'prUserName',
    },
    {
      name: 'attributeVarchar14',
    },
    {
      name: 'attributeVarchar13',
    },
    {
      name: 'techUsers',
    },
    {
      name: 'budgetAmount',
    },
    {
      name: 'prDisplayLineNum',
    },
  ], []);
  return (
    <Table
      dataSet={lineInfoDs}
      columns={columns}
    />
  );
};

export default LineInfo;