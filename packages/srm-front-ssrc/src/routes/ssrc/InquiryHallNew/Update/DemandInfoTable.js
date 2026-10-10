/**
 * 需求信息 - 表格
 * 复制自 ssrc/scux/TenderListWorkBench/Detail/components/BidPlanContent.tsx，
 * 本页自己维护一份，不直接复用（列字段按本页需求信息卡片调整）
 */
import React, { useEffect, useMemo } from 'react';
import { Table, Button, useDataSet } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';

import DemandInfoDS from './DemandInfoDS';

const DemandInfoTable = (props) => {
  const { bidFlag, sourceProjectId, configSheet = {}, dispatch } = props;

  const dataSet = useDataSet(() => DemandInfoDS({ sourceProjectId }), [sourceProjectId]);

  useEffect(() => {
    if (bidFlag && sourceProjectId) {
      dataSet.query();
    }
  }, [bidFlag, sourceProjectId, dataSet]);

  // 采购申请行跳转
  const linkToPrNumDetail = (record) => {
    const { sprmOldUiConfig = false } = configSheet;
    const prHeaderId = record.get('prHeaderId');
    const prSourcePlatform = record.get('prSourcePlatform');
    const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
    // 记录标识，从采购申请明细返回时回到寻源维护页
    window.ssrcDirectionToPurchasePlatformSymbol = 'inquiryHallNewUpdate';
    const pathUrl = sprmOldUiConfig
      ? isErp
        ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
        : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`
      : isErp
        ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
        : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;

    dispatch(
      routerRedux.push({
        pathname: pathUrl,
      })
    );
  };

  const columns = useMemo(
    () => [
      {
        name: 'prNum',
        width: 140,
        renderer: ({ value, record }) => (
          <Button funcType="link" onClick={() => linkToPrNumDetail(record)}>
            {value}
          </Button>
        ),
      },
      {
        name: 'projectLineItemNum',
        width: 90,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 200,
      },
      {
        name: 'itemCategoryName',
        width: 120,
      },
      {
        name: 'specifications',
        width: 150,
      },
      {
        name: 'secondaryQuantity',
        width: 110,
      },
      {
        name: 'secondaryUomName',
        width: 90,
      },
      {
        name: 'estimatedPrice',
        width: 120,
      },
      {
        name: 'estimatedAmount',
        width: 130,
      },
      {
        name: 'requestUserName',
        width: 120,
      },
      {
        name: 'attributeVarchar13Meaning',
        width: 150,
      },
      {
        name: 'attributeVarchar14Meaning',
        width: 120,
      },
      {
        name: 'attributeDatetime10',
        width: 150,
      },
      {
        name: 'attributeVarchar16',
        width: 140,
      },
      {
        name: 'attributeVarchar17',
        width: 150,
      },
    ],
    [configSheet]
  );

  // 仅招标单展示；没有关联立项（sourceProjectId 为空）时也不展示
  if (!bidFlag || !sourceProjectId) {
    return null;
  }

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      style={{ maxHeight: 400 }}
      customizedCode="SSRC.BID_HALL.NEW_EDIT.DEMAND_INFO_TABLE"
      customizable
    />
  );
};

// connect 只为了拿 dispatch（跳采购申请明细）
export default connect()(DemandInfoTable);
