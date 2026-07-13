import React, { useMemo } from 'react';
import { observer, useObserver } from 'mobx-react-lite';
import { Button, Modal } from 'choerodon-ui/pro';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { noop } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { Header } from 'hzero-front/lib/components/Page';

import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';

import { useStore } from '../store/StoreProvider';
import { operatePreWinningBid } from '../api';

// 类型断言，解决组件 Props 类型缺失导致的报错
const TypedBidPriceComparison = BidPriceComparison as React.ComponentType<any>;

const PageHeader: React.FC = observer(() => {
  const { pageLoading, setPageLoading = noop, history, getStoreData, initData = noop, rfxHeaderId, commonDs } = useStore();
  const { headerDs, supplierListDs } = commonDs || {};

  const { biddingTarget, diyLadderQuotationFlag } = useObserver(() => headerDs?.current?.get(['biddingTarget', 'diyLadderQuotationFlag']) || {});

  const validateData = async (): Promise<boolean> => {
    if (!headerDs || !supplierListDs) return false;

    const { validateAttachmentListTable = null } = getStoreData ? getStoreData('fileTemplateAttachmentRef') || {} : {};

    const validateFlag = (await Promise.all([headerDs.validate(), supplierListDs.validate(), validateAttachmentListTable ? validateAttachmentListTable() : true])).every((flag) => flag);

    if (!validateFlag) {
      notification.warning({
        message: intl.get('scux.preWinningBid.view.message.validationFailed').d('有必填字段未填写'),
      });
      return false;
    }

    return true;
  };

  // 获取附件表格数据
  const getAttachmentList = () => {
    if (getStoreData) {
      const { getAttachmentListData } = getStoreData('fileTemplateAttachmentRef') || {};
      if (getAttachmentListData) {
        return { attachmentLineList: getAttachmentListData() };
      }
      return {};
    }
    return {};
  };

  // 获取页面数据，包含header、supplierList、attachmentList
  const getPageData = () => {
    if (!headerDs || !supplierListDs) return;
    return {
      rfxHeader: headerDs.current?.toData(),
      supplierList: supplierListDs.toData(),
      ...getAttachmentList(),
    };
  };

  // 保存
  const handleSave = async () => {
    setPageLoading(true);
    const isValid = await validateData();
    const pageData = getPageData();
    if (!isValid || !pageData) {
      setPageLoading(false);
      return;
    };
    try {
      const res = await operatePreWinningBid({
        ...pageData,
        operationType: 'SAVE',
      });
      if (getResponse(res)) {
        initData();
        notification.success({});
      }
    } catch (error) {
      throw error;
    } finally {
      setPageLoading(false);
    };
  };

  const handleSubmit = async () => {
    const preApproveType = headerDs?.current?.get('preApproveType');
    // 若自审批，弹框提示【提交后自动完成决标审批，请确认】，若走外部审批，进行弹框【定标结果提交至FBC审批，请确认】
    const confirmMessage = preApproveType === 'EXTERNAL' ? intl.get('scux.preWinningBid.view.message.submitFbcApprovalMessage').d('定标结果提交至FBC审批，请确认') : intl.get('scux.preWinningBid.view.message.submitSelfApprovalMessage').d('提交后自动完成决标审批，请确认');
    const modalRes = await Modal.confirm({
      title: intl.get('scux.preWinningBid.view.title.bidSubmit').d('定标提交'),
      children: confirmMessage,
    });
    if (modalRes === 'ok') {
      setPageLoading(true);
      const isValid = await validateData();
      const pageData = getPageData();
      if (!isValid || !pageData) {
        setPageLoading(false);
        return;
      };
      try {
        const res = await operatePreWinningBid({
          ...pageData,
          operationType: 'SUBMIT',
        });
        if (getResponse(res)) {
          notification.success({});
          history.push('/scux/ssrc/bid-plan-workbench');
        }
      } catch (error) {
        throw error;
      } finally {
        setPageLoading(false);
      };
    }
  };

  // 比价助手
  const handleOpenPriceAssistant = () => {
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
  };

  const buttons = useMemo(() => {
    const commonBtnProps = {
      wait: 500,
      loading: pageLoading,
      funcType: FuncType.flat,
    };
    return (
      <>
        <Button {...commonBtnProps} funcType={FuncType.raised} onClick={handleSubmit} color={ButtonColor.primary}>
          {intl.get('scux.preWinningBid.view.button.submit').d('提交')}
        </Button>
        <Button {...commonBtnProps} onClick={handleSave}>
          {intl.get('scux.preWinningBid.view.button.save').d('保存')}
        </Button>
        <Button {...commonBtnProps} onClick={handleOpenPriceAssistant}>
          {intl.get('scux.preWinningBid.view.button.priceAssistant').d('比价助手')}
        </Button>
      </>
    );
  }, [
    pageLoading,
    handleSave,
    handleSubmit,
    handleOpenPriceAssistant,
  ]);

  return (
    <Header backPath="/ssrc/new-bid-hall/list" title={intl.get('scux.preWinningBid.view.title.preWinningBid').d('拟中标')}>
      {buttons}
    </Header>
  );
});

export default PageHeader;
