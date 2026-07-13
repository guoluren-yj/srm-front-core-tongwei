import React, { useMemo } from "react";
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor } from "choerodon-ui/pro/lib/button/enum";
import { useObserver } from 'mobx-react-lite';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { downloadFileByAxios } from 'srm-front-boot/lib/services/MarmotDownloadButtonServices';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';

import {
  confirmAndSummaryPageData,
} from '../../api';
import { useStore } from '../store/StoreProvider';


// 类型断言，解决组件 Props 类型缺失导致的报错
const TypedBidPriceComparison = BidPriceComparison as React.ComponentType<any>;


const PageHeader: React.FC<any> = () => {
  const {
    commonDs: {
      evaluationHeaderDs,
    } = {},
    editorFlag,
    pageLoading,
    setPageLoading = () => {},
    pageType = '',
    history,
    prefix,
    rfxHeaderId,
  } = useStore();

  const { diyLadderQuotationFlag, biddingTarget } = useObserver(() =>
    evaluationHeaderDs?.current?.get(['diyLadderQuotationFlag', 'biddingTarget']) || {}
  );

  // 确认及汇总
  const handleConfirmAndSummary = async () => {
    setPageLoading(true);
    return confirmAndSummaryPageData({
      postType: 'SUBMIT',
      ...(evaluationHeaderDs?.current?.toData() || {}),
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push({
          pathname: '/scux/ssrc/bid-evaluation-management/list',
        });
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 比价助手
  const handleRenderPriceCompare = () => {
    const priceComparisonProps = {
      biddingTarget,
      rfxId: rfxHeaderId,
      sourceCategory: 'RFQ',
      diyLadderQuotationFlag, // 是否含有阶梯报价对比tab页签
      history,
    };
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      children: <TypedBidPriceComparison {...priceComparisonProps} />,
      drawer: true,
      footer: null,
      style: { width: '80%' },
    });
  }

  // 汇总导出
  const handleSummaryExport = () => {
    const requestUrl = `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqU5ZyY3ia26UNmltpoaCQ89BAYpf43oiaEoLxM9rhIuibG2`;
    return getResponse(downloadFileByAxios({
      requestUrl,
      method: 'POST',
      queryData: { rfxHeaderId },
    }));
  };

  const getButtons = () => {
    return [
      pageType === 'update' ?  (
        <Button icon="check" wait={1000} loading={pageLoading} color={ButtonColor.primary} onClick={handleConfirmAndSummary}>
          {intl.get(`${prefix}.view.button.priceAssistant`).d('确认及汇总')}
        </Button>
        ) : null,
      <Button wait={1000} loading={pageLoading} onClick={handleRenderPriceCompare}>
        {intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手')}
      </Button>,
      pageType === 'update' ? (
        <Button icon="export" wait={1000} loading={pageLoading} onClick={handleSummaryExport}>
        {intl.get(`${prefix}.view.button.summaryExport`).d('汇总导出')}
        </Button>
      ) : null,
    ].filter(Boolean);
  };

  // 标题
  const pageTitle = useMemo(() => {
    switch (pageType) {
      case 'update':
        return intl.get('scux.bidEvaluationManagement.view.title.page.summary').d('评标汇总');
      case 'view':
        return intl.get('scux.bidEvaluationManagement.view.title.page.viewEvaluationProcess').d('评标进度查看');
      default:
        return intl.get('scux.bidEvaluationManagement.view.title.page.viewEvaluationProcess').d('评标进度查看');
    }
  }, [editorFlag]);

  return (
    <Header
      title={pageTitle}
      backPath='/scux/ssrc/bid-evaluation-management/list'
    >
      {!editorFlag ? [] : getButtons()}
    </Header>
  );
};

export default PageHeader;