import React, { useMemo, useState } from 'react';
import { Table, Button, Modal } from 'choerodon-ui/pro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import querystring from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import { numberSeparatorRender } from '@/utils/renderer';

import EvaluationDetailModal from './EvaluationDetailModal';
import TeamScoreDetail from './TeamScoreDetail';
import { stopBidEvaluation } from './api';

// 通威二开 - 供应商列表（评标进度），列与点击逻辑同评标管理-评标明细页保持一致
const SupplierList = (props) => {
  const { evaluationSupplierDs, rfxHeaderId, prefix, onRefresh } = props;
  const [stopLoading, setStopLoading] = useState(false);

  /**
   * 中止评标（整单中止）：先调用校验接口获取供应商及专家信息弹框提示，确认后再调用中止接口，
   * 成功后刷新当前评标进度（不返回列表），逻辑同评标管理-评标汇总页
   */
  const handleStopEvaluation = async () => {
    setStopLoading(true);
    try {
      const validateResponse = getResponse(
        await stopBidEvaluation({
          rfxHeaderId,
          validateFlag: 1,
        })
      );
      // 校验失败时 getResponse 返回 falsy 且已提示错误，直接返回
      if (!validateResponse) {
        return;
      }
      const supplierAndExpertNames =
        validateResponse?.supplierAndExpertNames ||
        validateResponse?.data?.supplierAndExpertNames ||
        '';
      // 供应商/专家分组之间以 "/" 分隔，逐行展示
      const nameLines = String(supplierAndExpertNames)
        .split('/')
        .map((item) => item.trim())
        .filter(Boolean);
      const children = nameLines.length > 0 ? (
        <div>
          <div>
            {intl
              .get('scux.bidEvaluationManagement.view.message.stopEvaluationConfirm')
              .d('中止后，以下供应商及专家的评标将无法继续操作，请确认是否中止？')}
          </div>
          <div style={{ marginTop: 8, lineHeight: '22px', whiteSpace: 'pre-line' }}>
            {nameLines.join('\n')}
          </div>
        </div>
      ) : (
        intl
          .get('scux.bidEvaluationManagement.view.message.stopEvaluationDefault')
          .d('中止后，无法继续操作，请确认是否中止本次评标？')
      );
      // 弹框确认后再调用中止接口（不带 validateFlag），点取消则不发请求
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
          if (onRefresh) {
            onRefresh();
          }
        }
      }
    } finally {
      setStopLoading(false);
    }
  };

  const tableButtons = rfxHeaderId
    ? [
      <Button
        key="stopEvaluation"
        funcType={FuncType.flat}
        onClick={handleStopEvaluation}
        loading={stopLoading}
      >
        {intl.get('scux.bidEvaluationManagement.view.message.stopEvaluation').d('中止评标')}
      </Button>,
    ]
    : [];

  /**
   * 价格标是否已开启（priceBidFlag = 1）
   */
  const isPriceBidOpened = (record) => Number(record?.get('priceBidFlag')) === 1;

  /**
   * 标段描述行跳转到报价详情
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
    openTab(
      {
        key: path,
        path,
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
        action: intl.get('ssrc.inquiryHall.model.inquiryHall.bidDetail').d('投标详情'),
        search: querystring.stringify(searchObj),
        closable: true,
      },
      undefined
    );
  };

  const columns = useMemo(
    () => [
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
        renderer: ({ record, value }) =>
          isPriceBidOpened(record) ? numberSeparatorRender(value) : '-',
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
        renderer: ({ record }) => <EvaluationDetailModal record={record} />,
      },
      {
        name: 'techExpertRatio',
        renderer: ({ record, value }) => (
          <TeamScoreDetail
            record={record}
            rfxHeaderId={rfxHeaderId}
            prefix={prefix}
            scoreTeam="TECHNOLOGY"
            teamName="技术组"
            value={value}
          />
        ),
      },
      {
        name: 'businessExpertRatio',
        renderer: ({ record, value }) => (
          <TeamScoreDetail
            record={record}
            rfxHeaderId={rfxHeaderId}
            prefix={prefix}
            scoreTeam="BUSINESS"
            teamName="商务组"
            value={value}
          />
        ),
      },
      {
        name: 'priceExpertRatio',
        renderer: ({ record, value }) => (
          <TeamScoreDetail
            record={record}
            rfxHeaderId={rfxHeaderId}
            prefix={prefix}
            scoreTeam="PRICE"
            teamName="价格组"
            value={value}
          />
        ),
      },
    ],
    [rfxHeaderId, prefix]
  );

  return evaluationSupplierDs ? (
    <Table dataSet={evaluationSupplierDs} columns={columns} buttons={tableButtons} />
  ) : null;
};

export default SupplierList;
