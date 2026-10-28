/**
 * 招标核价 - 清单内容（供应商清单）表格列定义
 * 核价页（可编辑）与核价详情页（只读）共用，避免两处字段顺序、宽度不一致
 */
import React from 'react';
import { Button, CheckBox, TextField } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import { isSuggested } from '../store/suggestSupplierDS';

/**
 * 跳转投标详情
 */
export const openBidDetailTab = (item, rfxHeaderId) => {
  const { quotationHeaderId } = item || {};
  if (!quotationHeaderId) {
    return;
  }
  const path = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
  const searchObj = {
    rfxHeaderId,
    noBackFlag: 1,
    pageType: 'SUPPLIER_DETAIL_QUERY',
    switchUrl: 2,
  };
  openTab({
    key: path,
    path,
    title: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
    action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
    search: querystring.stringify(searchObj),
    closable: true,
  });
};

/**
 * @param {object} options
 * @param {DataSet} options.dataSet 表格数据源（用于渲染序号）
 * @param {boolean} [options.readOnly] 只读（详情页），不渲染任何编辑器
 * @param {function} [options.onOpenAllocate] 点击「分配申请」
 * @param {function} [options.onOpenBidDetail] 点击「投标详情」
 */
export default function getSuggestSupplierListColumns({
  dataSet,
  readOnly = false,
  onOpenAllocate,
  onOpenBidDetail,
}) {
  return [
    {
      name: 'index',
      width: 60,
      align: 'center',
      renderer: ({ record }) => (record ? dataSet.indexOf(record) + 1 : ''),
    },
    // 选用
    readOnly
      ? {
          name: 'suggestedFlag',
          width: 70,
          renderer: ({ record }) => <CheckBox defaultChecked={isSuggested(record)} disabled />,
        }
      : {
          name: 'suggestedFlag',
          width: 70,
          editor: () => <CheckBox />,
        },
    // 分配申请：点击查看分配申请明细
    {
      name: 'allottedQuantity',
      width: 110,
      renderer: ({ record }) =>
        onOpenAllocate ? (
          <a
            onClick={(e) => {
              e.stopPropagation();
              onOpenAllocate(record);
            }}
          >
            {intl.get('ssrc.inquiryHall.model.inquiryHall.allocateRequest').d('分配申请')}
          </a>
        ) : null,
    },
    {
      name: 'attributeLongtext8',
      width: 150,
    },
    {
      name: 'supplierCompanyName',
      width: 200,
    },
    // 投标详情
    {
      name: 'bidDetail',
      width: 100,
      renderer: ({ record }) => (
        <Button funcType={FuncType.link} onClick={() => onOpenBidDetail && onOpenBidDetail(record)}>
          {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
        </Button>
      ),
    },
    {
      name: 'awardAmount',
      width: 130,
    },
    {
      name: 'quotationAmount',
      width: 130,
    },
    {
      name: 'finalAmount',
      width: 130,
    },
    {
      name: 'attributeLongtext22',
      width: 150,
    },
    {
      // 选用理由：仅勾选「选用」后才可编辑
      name: 'suggestedRemark',
      width: 200,
      ...(readOnly ? null : { editor: (record) => (isSuggested(record) ? <TextField /> : false) }),
    },
  ];
}
