/*
 * @Description: 通威二开 - 新建战略采购单弹窗
 * 复用大厅【申请转招标】的申请列表弹窗（/share/application-post），
 * 表格个性化与【申请转招标】共用，查询条件单独使用新编码
 */
import React from 'react';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import PurchaseRequestContent from './Update/PurchaseRequestContent';

export const STRATEGIC_PURCHASE_CUSTOMIZE_UNIT_CODE = {
  // 表格个性化与【申请转招标】弹窗共用
  list: 'SSRC.BID_HALL.NEW_EDIT.PURCHASEREQUEST_TABLE',
  // 查询条件个性化单独区分
  filter: 'SSRC.BID_HALL.NEW_EDIT.SCUX.STRATEGIC_PURCHASE_ORDER.FILTER',
};

function StrategicPurchaseRequestContent(props) {
  return (
    <PurchaseRequestContent
      {...props}
      customizeUnitCode={STRATEGIC_PURCHASE_CUSTOMIZE_UNIT_CODE}
    />
  );
}

export default WithCustomizeC7N({
  unitCode: [
    STRATEGIC_PURCHASE_CUSTOMIZE_UNIT_CODE.list,
    STRATEGIC_PURCHASE_CUSTOMIZE_UNIT_CODE.filter,
  ],
})(StrategicPurchaseRequestContent);
