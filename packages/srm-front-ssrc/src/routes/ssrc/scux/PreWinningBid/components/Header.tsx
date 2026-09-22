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

import { isRatingEnabled } from '../store/storeDS';
import { useStore } from '../store/StoreProvider';
import { operatePreWinningBid } from '../api';

// 类型断言，解决组件 Props 类型缺失导致的报错
const TypedBidPriceComparison = BidPriceComparison as React.ComponentType<any>;

const PageHeader: React.FC = observer(() => {
  const { pageLoading, setPageLoading = noop, history, getStoreData, initData = noop, rfxHeaderId, commonDs } = useStore();
  const { headerDs, supplierListDs, sectionListDs } = commonDs || {};

  const { biddingTarget, diyLadderQuotationFlag, templateScoreType } = useObserver(() => headerDs?.current?.get(['biddingTarget', 'diyLadderQuotationFlag', 'templateScoreType']) || {});

  // 通威二开 - 未启用评标时才启用「最终价同步 + 附件必填」，与「供应商列表」tab 的最终价编辑、附件列同一开关
  const finalPriceSync = !isRatingEnabled(templateScoreType);

  // 同步最终价：保存/提交前把 qtnTotalAmount 赋值给 attributeDecimal2，保证两字段值一致
  const syncFinalPrice = () => {
    if (!finalPriceSync || !supplierListDs) return;
    supplierListDs.forEach((record) => {
      record.set('attributeDecimal2', record.get('qtnTotalAmount'));
    });
  };

  // 校验供应商列表：启用最终价同步时须逐条全量校验，ds.validate() 只校验有改动（非 sync）的记录，
  // 覆盖不到「最终价有值、附件为空且用户没动过这行」的情况，附件必填就形同虚设
  const validateSupplierList = () => {
    if (!supplierListDs) return Promise.resolve(false);
    if (!finalPriceSync) return supplierListDs.validate();
    const promises: Promise<boolean>[] = [];
    supplierListDs.forEach((record) => {
      promises.push(record.validate(true));
    });
    return Promise.all(promises).then((results) => results.every((flag) => flag));
  };

  const validateData = async (): Promise<boolean> => {
    if (!headerDs || !supplierListDs) return false;

    syncFinalPrice();

    const { validateAttachmentListTable = null } = getStoreData ? getStoreData('fileTemplateAttachmentRef') || {} : {};

    const validateFlag = (await Promise.all([headerDs.validate(), validateSupplierList(), validateAttachmentListTable ? validateAttachmentListTable() : true])).every((flag) => flag);

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

  // 获取页面数据，包含header、supplierList、sectionList、attachmentList
  const getPageData = () => {
    if (!headerDs || !supplierListDs) return;
    return {
      rfxHeader: headerDs.current?.toData(),
      supplierList: supplierListDs.toData(),
      // 通威二开 - 标段列表的「推荐中标」开关改的是 sectionListDs，保存/提交时一并发给后端
      sectionList: sectionListDs?.toData(),
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
        notification.success({});
        // 保存后必须 await 重新拉取完成才能结束：initData 里包含 header/supplierList/sectionList
        // 的重新加载以及附件表格的刷新，任何一环没等到就放行按钮（finally 的 setPageLoading(false)），
        // 第二次保存都会提交带着旧 objectVersionNumber 的记录 → 后端乐观锁报「数据已过时」；
        // 且刷新过程抛错会变成 unhandled rejection 被静默吞掉，表格停在旧数据。
        await initData();
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
    const confirmMessage = preApproveType === 'EXT' ? intl.get('scux.preWinningBid.view.message.submitFbcApprovalMessage').d('定标结果提交至FBC审批，请确认') : intl.get('scux.preWinningBid.view.message.submitSelfApprovalMessage').d('提交后自动完成决标审批，请确认');
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
          history.push('/ssrc/new-bid-hall/list');
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
      funcType: FuncType.raised,
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
    <Header backPath="/ssrc/new-bid-hall/list" title={intl.get('scux.preWinningBid.view.title.preWinningBid').d('定标')}>
      {buttons}
    </Header>
  );
});

export default PageHeader;
