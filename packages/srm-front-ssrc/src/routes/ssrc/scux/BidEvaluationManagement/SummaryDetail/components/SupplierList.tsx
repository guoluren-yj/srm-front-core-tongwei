import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import { useStore } from '../store/StoreProvider';
import EvaluationDetailModal from './EvaluationDetailModal';

const SupplierList: React.FC = () => {
  const {
    commonDs: {
      evaluationSupplierDs,
    } = {},
    rfxHeaderId,
    prefix,
  } = useStore();

  /**
   * 标段描述行跳转到报价详情
   *
   * @param {*} [record={}]
   * @memberof ConfirmCandidate
   */
  const directorQuotationDetail = (record) => {
    const { quotationHeaderId = null } = record.get(['quotationHeaderId']) || {};

    const searchObj = {
      rfxHeaderId,
      noBackFlag: 1, // openTab 不需要返回
      pageType: 'SUPPLIER_DETAIL_QUERY',
      switchUrl: 2, // 采购方跳转标识
    };

    const path = `/ssrc/bid-supplier-reply/query/${quotationHeaderId}`;
    openTab({
      key: path,
      path: path,
      title: 'hzero.common.tab.title.cux.twnf.tenderDetail',
      action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
      search: querystring.stringify(searchObj),
      closable: true,
    }, undefined);
  };

  const columns: ColumnProps[] = useMemo(() => [
    {
      name: 'sequence',
      width: 80,
    },
    {
      name: 'supplierCompanyNum',
      width: 120,
    },
    {
      name: 'supplierCompanyName',
      width: 180,
    },
    {
      name: 'qtnTotalAmount',
      width: 100,
    },
    {
      name: 'bidDetail',
      header: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
      renderer: ({ record }) => (
        <Button
          funcType={FuncType.link}
          wait={1200}
          onClick={() => directorQuotationDetail(record)}
        >
          {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
        </Button>
      ),
    },
    {
      name: 'evaluationDetail',
      header: intl.get(`${prefix}.model.twnf.summary.evaluationDetail`).d('评标明细'),
      renderer: ({ record }) => (<EvaluationDetailModal record={record} />),
    },
    {
      name: 'techSum',
    },
    {
      name: 'businessSum',
    },
    {
      name: 'priceSum',
    }
  ], []);


  return evaluationSupplierDs ? (
    <Table
      dataSet={evaluationSupplierDs}
      columns={columns}
    />
  ) : null;
};

export default SupplierList;
