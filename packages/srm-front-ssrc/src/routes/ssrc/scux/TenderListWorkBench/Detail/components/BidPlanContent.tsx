import React, { useMemo, useEffect } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { useStore } from '../store/StoreProvider';

const BidPlanNode = () => {

  const {
    commonDs: { bidPlanContentDs } = {},
    history,
  } = useStore();

  if (!bidPlanContentDs) {
    return null;
  };

  useEffect(() => {
    bidPlanContentDs.query();
  }, []);

    // 采购申请行跳转
    const linkToPrNumDetail = (record) => {
      const { prSourcePlatform, prHeaderId } = record.get(['prSourcePlatform', 'prHeaderId']) || {};
      const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';

      const pathUrl = isErp
          ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
          : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;

      history.push({
        pathname: pathUrl,
      });
    };

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'attributeVarchar11',
        width: 120,
      },
      {
        name: 'attributeVarchar12',
        width: 120,
      },
      {
        name: 'requestUserName',
        width: 120,
      },
      {
        name: 'attributeVarchar13Meaning',
        width: 130,
      },
      {
        name: 'attributeVarchar14Meaning',
        width: 120,
      },
      {
        name: 'attributeDatetime10',
        width: 120,
      },
      {
        name: 'attributeVarchar15',
        width: 130,
      },
      {
        name: 'prNum',
        width: 140,
        renderer: ({ value, record }) => {
          return (
            <Button funcType={FuncType.link} onClick={() => linkToPrNumDetail(record)}>
              {value}
            </Button>
          );
        },
      },
      {
        name: 'prDisplayLineNum',
        width: 130,
      },
      {
        name: 'attributeVarchar16',
        width: 140,
      },
      {
        name: 'attributeVarchar17',
        width: 120,
      },
      {
        name: 'attributeVarchar18Meaning',
        width: 100,
      },
      {
        name: 'attributeDate10',
        width: 120,
      },
      {
        name: 'attributeDate11',
        width: 120,
      },
      {
        name: 'attributeDecimal10',
        width: 135,
      },
      {
        name: 'attributeVarchar19',
        width: 100,
      },
      {
        name: 'attributeVarchar20',
        width: 100,
      },
      {
        name: 'attributeDecimal11',
        width: 130,
      },
      {
        name: 'attributeLongtext1',
      },
    ];
  }, []);

  return (
    <Table
      dataSet={bidPlanContentDs}
      columns={columns}
      customizable
      customizedCode="SCUX_TWNF_BID_PLAN_DETAIL_BID_PLAN_CONTENT_LIST"
    />
  );
};

export default BidPlanNode;
