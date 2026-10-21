import React, { useMemo } from 'react';
import { observer, useObserver } from 'mobx-react-lite';
import { Button, Modal, DataSet, Form, TextArea, Attachment } from 'choerodon-ui/pro';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { noop } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { Header } from 'hzero-front/lib/components/Page';

import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';

import { isRatingEnabled } from '../store/storeDS';
import { useStore } from '../store/StoreProvider';
import { operatePreWinningBid, confirmPostBidBargain } from '../api';

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

  // 校验供应商列表：启用最终价同步时逐条全量校验（附件必填只针对最终价被改过的行，
  // 这些行本来就是 dirty、ds.validate() 也能覆盖，这里逐条校验只是全量兜底）
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
    // 通威二开 - 已触发标后议价流程（attributeBigint2 === 1）时的弱校验提示：
    // 仅做二次确认，不阻断提交；取消关闭弹框，确定继续走原有提交逻辑
    if (Number(headerDs?.current?.get('attributeBigint2')) === 1) {
      const weakCheckRes = await Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('scux.preWinningBid.view.message.postBidBargainConfirm')
          .d('该招标单已触发标后议价流程，是否确认提交？'),
      });
      if (weakCheckRes !== 'ok') return;
    }
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

  // 通威二开 - 标后议价：侧弹框填写标后议价原因 + 附件（均必填）后调用确认接口
  const handlePostBidBargain = () => {
    // 已触发过标后议价流程（审批中/审批通过）时不允许重复发起，
    // attributeVarchar27 存议价状态（值集 SCUX.TWNF_BID_BARGAIN_STATUS）、
    // attributeLongtext24 存FBC流程（流程单号/地址）
    // APPROVING-审批中，APPROVED-审批通过（与项目内其他审批流状态编码保持一致）
    const bargainStatus = headerDs?.current?.get('attributeVarchar27');
    if (bargainStatus === 'APPROVING' || bargainStatus === 'APPROVED') {
      const bargainNum = headerDs?.current?.get('attributeLongtext24');
      notification.error({
        message: intl
          .get('scux.preWinningBid.view.message.postBidBargainDuplicated', { bargainNum })
          .d(`已触发标后议价流程${bargainNum || ''}，请勿重复发起`),
        placement: 'bottomRight',
      });
      return;
    }

    const bargainDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'attributeLongtext27',
          label: intl.get('scux.preWinningBid.view.model.postBidBargainReason').d('标后议价原因'),
          type: FieldType.string,
          required: true,
          maxLength: 200,
        },
        {
          name: 'attributeLongtext28',
          label: intl.get('scux.preWinningBid.view.model.postBidBargainAttachment').d('附件'),
          type: FieldType.attachment,
          required: true,
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-rfx-rfxheader',
        },
      ],
    });
    Modal.open({
      title: intl.get('scux.preWinningBid.view.title.postBidBargain').d('标后议价'),
      drawer: true,
      closable: true,
      destroyOnClose: true,
      style: { width: 600 },
      children: (
        <Form dataSet={bargainDs} columns={1} labelLayout={LabelLayout.float}>
          <TextArea name="attributeLongtext27" resize={ResizeType.vertical} />
          <Attachment name="attributeLongtext28" />
        </Form>
      ),
      onOk: async () => {
        if (!(await bargainDs.validate())) {
          return false;
        }
        const { attributeLongtext27, attributeLongtext28 } = bargainDs.current?.toData() || {};
        const res = await confirmPostBidBargain({
          rfxHeaderId,
          attributeLongtext27,
          attributeLongtext28,
        });
        if (getResponse(res)) {
          notification.success({});
          // 议价结果落在招标单头上，成功后必须等页面数据重新拉取完再关闭弹框，
          // 避免用户接着保存/提交时带着旧的 objectVersionNumber 触发乐观锁
          await initData();
          return true;
        }
        return false;
      },
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
        <Button {...commonBtnProps} onClick={handlePostBidBargain}>
          {intl.get('scux.preWinningBid.view.button.postBidBargain').d('标后议价')}
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
    handlePostBidBargain,
    handleOpenPriceAssistant,
  ]);

  return (
    <Header backPath="/ssrc/new-bid-hall/list" title={intl.get('scux.preWinningBid.view.title.preWinningBid').d('定标')}>
      {buttons}
    </Header>
  );
});

export default PageHeader;
