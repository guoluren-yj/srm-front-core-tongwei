import React, { useMemo, useState } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import { numberSeparatorRender } from '@/utils/renderer';

import { useStore } from '../store/StoreProvider';
import { stopBidEvaluation } from '../../api';
import EvaluationDetailModal from './EvaluationDetailModal';
import TeamScoreDetail from './TeamScoreDetail';

interface SupplierListProps {
  /** 是否展示「中止评标」按钮（仅评标管理-评标汇总页传入，供决策/报价详情等复用场景不展示） */
  showStopEvaluation?: boolean;
}

const SupplierList: React.FC<SupplierListProps> = ({ showStopEvaluation = false }) => {
  const {
    commonDs: {
      evaluationSupplierDs,
    } = {},
    rfxHeaderId,
    prefix,
    initData,
  } = useStore();
  const [stopLoading, setStopLoading] = useState(false);

  // 中止评标（整单中止）：先调用校验接口获取供应商及专家信息弹框提示，确认后再调用中止接口
  const handleStopEvaluation = async () => {
    setStopLoading(true);
    try {
      // 第一步：调用校验接口（validateFlag=1），返回 supplierAndExpertNames 用于弹框提示
      const validateResponse = getResponse(await stopBidEvaluation({
        rfxHeaderId,
        validateFlag: 1,
      }));
      // 校验失败时 getResponse 返回 falsy 且已提示错误，直接返回
      if (!validateResponse) {
        return;
      }
      const supplierAndExpertNames = validateResponse?.supplierAndExpertNames
        || validateResponse?.data?.supplierAndExpertNames
        || '';
      // 供应商/专家分组之间以 "/" 分隔，逐行展示
      const nameLines = String(supplierAndExpertNames)
        .split('/')
        .map((item) => item.trim())
        .filter(Boolean);
      const children = nameLines.length > 0
        ? (
          <div>
            <div>
              {intl.get('scux.bidEvaluationManagement.view.message.stopEvaluationConfirm').d('中止后，以下供应商及专家的评标将无法继续操作，请确认是否中止？')}
            </div>
            <div style={{ marginTop: 8, lineHeight: '22px', whiteSpace: 'pre-line' }}>
              {nameLines.join('\n')}
            </div>
          </div>
        )
        : intl.get('scux.bidEvaluationManagement.view.message.stopEvaluationDefault').d('中止后，无法继续操作，请确认是否中止本次评标？');
      // 第二步：弹框提示后，点确认才调用中止接口（不带 validateFlag），点取消则不发请求
      const modalRes = await Modal.confirm({
        title: intl.get('hzero.common.message.confirm').d('提示'),
        children,
      });
      if (modalRes === 'ok') {
        const res = await stopBidEvaluation({
          rfxHeaderId,
        });
        if (getResponse(res)) {
          notification.success({});
          // 中止成功后刷新当前详情（不返回列表）
          if (initData) {
            initData();
          }
        }
      }
    } finally {
      setStopLoading(false);
    }
  };

  // 表格工具栏按钮
  const tableButtons = useMemo(() => {
    if (!showStopEvaluation || !rfxHeaderId) {
      return [];
    }
    return [
      <Button
        funcType={FuncType.flat}
        onClick={handleStopEvaluation}
        loading={stopLoading}
        key="stopEvaluation"
      >
        {intl.get('scux.bidEvaluationManagement.view.message.stopEvaluation').d('中止评标')}
      </Button>,
    ];
  }, [showStopEvaluation, rfxHeaderId, stopLoading]);

  /**
   * 价格标是否已开启（priceBidFlag = 1）
   * @param {*} record
   * @returns {boolean}
   */
  const isPriceBidOpened = (record): boolean => Number(record?.get('priceBidFlag')) === 1;

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
      path,
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
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
      width: 140,
      renderer: ({ record, value }) => (isPriceBidOpened(record) ? numberSeparatorRender(value) : '-'),
    },
    {
      name: 'bidDetail',
      header: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
      renderer: ({ record }) =>
        isPriceBidOpened(record) ? (
          <Button
            funcType={FuncType.link}
            wait={1200}
            onClick={() => directorQuotationDetail(record)}
          >
            {intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情')}
          </Button>
        ) : (
          '-'
        ),
    },
    {
      name: 'evaluationDetail',
      header: intl.get(`${prefix}.model.twnf.summary.evaluationDetail`).d('评标明细'),
      renderer: ({ record }) => (<EvaluationDetailModal record={record} />),
    },
    {
      name: 'techExpertRatio',
      renderer: ({ record, value }) => (
        <TeamScoreDetail record={record} scoreTeam="TECHNOLOGY" teamName="技术组" value={value} />
      ),
    },
    {
      name: 'businessExpertRatio',
      renderer: ({ record, value }) => (
        <TeamScoreDetail record={record} scoreTeam="BUSINESS" teamName="商务组" value={value} />
      ),
    },
    {
      name: 'priceExpertRatio',
      renderer: ({ record, value }) => (
        <TeamScoreDetail record={record} scoreTeam="PRICE" teamName="价格组" value={value} />
      ),
    },
  ], []);


  return evaluationSupplierDs ? (
    <Table
      dataSet={evaluationSupplierDs}
      columns={columns}
      buttons={tableButtons}
    />
  ) : null;
};

export default SupplierList;
