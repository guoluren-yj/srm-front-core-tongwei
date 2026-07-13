import React, { useMemo, useState } from "react";
import { Button } from 'choerodon-ui/pro';
import { ButtonColor } from "choerodon-ui/pro/lib/button/enum";
import { useObserver } from 'mobx-react-lite';
import { isEmpty, isBoolean } from 'lodash';
import querystring from 'querystring';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { transfer as transferApi } from '@/services/expertScoringService';
import ExpertLibraryModal from '@/routes/sbid/ExpertScoring/Update/ExpertLibraryModal';
import SubAccount from '@/routes/components/SubAccount';

import {
  techEvaluationSaveAndSubmit,
} from '../../api';
import { useStore } from '../store/StoreProvider';

const PageHeader: React.FC<any> = () => {
  const {
    commonDs: {
      evaluationHeaderDs,
      evaluationItemsDs,
    } = {},
    editorFlag,
    initData = () => {},
    pageLoading,
    setPageLoading = () => {},
    pageType = '',
    history,
    prefix,
  } = useStore();

  const [expertModalVisible, setExpertModalVisible] = useState(false);
  const [subAccountVisible, setSubAccountVisible] = useState(false);

  const { expertSource, rfxHeaderId, evaluateExpertId, scoreTeam, quotationHeaderId, evaluateLeaderFlag } = useObserver(() =>
    evaluationHeaderDs?.current?.get(['expertSource', 'rfxHeaderId', 'evaluateExpertId', 'scoreTeam', 'quotationHeaderId', 'evaluateLeaderFlag']) || {}
  );

  // 校验页面数据
  const validatePageData = async () => {
    if (!evaluationHeaderDs || !evaluationItemsDs) {
      return Promise.reject(new Error('Data sets are not initialized'));
    };
    const validateRes = await Promise.all([
      evaluationItemsDs.validate(),
    ]);
    if (validateRes.some((item) => !item)) return false;
    return true;
  };

  // 获取评分列表数据
  const getScoreListData = (newScoreList) => {
    const sourceScoreTableList = evaluationHeaderDs?.current?.get('scoreList');
    if (sourceScoreTableList?.length > 0) {
      return sourceScoreTableList.map((item) => {
        if (item.detailEnabledFlag) {
          const { evaluateScoreLineDetailS = [], ...otherItem } = item;
          const elements = newScoreList.find((ele) => ele.evaluateIndicId === item.evaluateIndicId);
          const newLineItem = evaluateScoreLineDetailS.map((element) => {
            const ele = newScoreList.find((e) => e.indicateId === element.indicateId);
            return {
              ...element,
              ...ele,
            };
          });
          return {
            ...otherItem,
            ...elements,
            evaluateScoreLineDetailS: newLineItem,
          };
        } else {
          const element = newScoreList.find((ele) => ele.evaluateIndicId === item.evaluateIndicId);
          return {
            ...item,
            ...element,
          };
        }
      });
    }
  }

  // 获取页面数据
  const getPageData = async () => {
    if (!await validatePageData()) {
      notification.error({
        message: intl.get(`${prefix}.view.tip.validatePageMessage`).d('有必填字段未填写'),
      });
      return;
    };
    return {
      ...(evaluationHeaderDs?.current?.toData() || {}),
      scoreList: getScoreListData(evaluationItemsDs?.toData() || []),
    };
  };

  // 保存
  const handleSave = async () => {
    setPageLoading(true);
    const pageData = await getPageData();
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    return techEvaluationSaveAndSubmit({
      ...pageData,
      postType: 'SAVE',
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        initData();
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 提交
  const handleSubmit = async () => {
    setPageLoading(true);
    const pageData = await getPageData();
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    return techEvaluationSaveAndSubmit({
      ...pageData,
      postType: 'SUBMIT',
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push('/scux/ssrc/bid-evaluation-management/list');
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 跳转到商务谈判
  const handleBusinessNegotiate = () => {
    if (!quotationHeaderId || !rfxHeaderId) return;
    history.push({
      pathname: `/ssrc/new-bid-hall/new-rfx-bargain/${rfxHeaderId}`,
      search: querystring.stringify({
        quotationHeaderId,
        sourceStatus: 'newInquiryHallToBargain',
      }),
    });
  };

  const getButtons = () => {
    if (!editorFlag) {
      return [];
    };
    return [
      <Button icon="check" wait={1000} color={ButtonColor.primary} onClick={handleSubmit} disabled={pageLoading}>
        {intl.get('hzero.common.button.submit').d('提交')}
      </Button>,
      <Button icon="save" wait={1000} onClick={handleSave} disabled={pageLoading}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      <Button icon="transfer" wait={1000} onClick={() => operateTransferModal(true)} disabled={pageLoading}>
        {intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交')}
      </Button>,
      scoreTeam === 'PRICE' && Number(evaluateLeaderFlag) === 1 && (
        <Button wait={1000} disabled={pageLoading} onClick={handleBusinessNegotiate}>
          {intl.get(`${prefix}.view.button.businessNegotiate`).d('商务谈判')}
        </Button>
      ),
    ].filter(Boolean);
  };

  // 转交-确认
  const transfer = (selectRow, otherParams = {}) => {
    if (isEmpty(selectRow)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return;
    };
    const routerPath = '/scux/ssrc/bid-evaluation-management/list';
    if (expertSource === 'EXPERT_LIBRARY') {
      const { expertId, userId } = selectRow;
      transferApi({
        expertId,
        sourceFrom: 'RFX',
        sourceHeaderId: rfxHeaderId,
        evaluateExpertId,
        expertUserId: userId,
        ...otherParams,
      }).then((res) => {
        if (res) {
          history.push(routerPath);
          setExpertModalVisible(false);
        }
      });
    } else {
      const { id } = selectRow;
      transferApi({
        sourceFrom: 'RFX',
        sourceHeaderId: rfxHeaderId,
        expertUserId: id,
        evaluateExpertId,
        ...otherParams,
      }).then((res) => {
        if (res) {
          history.push(routerPath);
          setSubAccountVisible(false);
        }
      });
    }
  };

  // 打开或者关闭转交弹框
  const operateTransferModal = (flag = false) => {
    if (expertSource === 'EXPERT_LIBRARY') {
      setExpertModalVisible(isBoolean(flag) ? flag : false); // isBoolean(flag)解决弹框关闭传过来的是事件对象
    } else {
      setSubAccountVisible(isBoolean(flag) ? flag : false);
    }
  }

  // 专家账户
  const expertModalProps = useMemo(() => {
    return {
      visible: expertModalVisible,
      onOk: transfer,
      onCancel: operateTransferModal,
    };
  }, [expertModalVisible, transfer, operateTransferModal]);

  // 子账户
  const subAccountProps = useMemo(() => {
    return {
      visible: subAccountVisible,
      onOk: transfer,
      onCancel: operateTransferModal,
      bidFlag: true,
    };
  }, [subAccountVisible, transfer, operateTransferModal]);

  // 标题
  const pageTitle = useMemo(() => {
    if (pageType === 'view') {
      return intl.get('scux.bidEvaluationManagement.view.title.page.techEvaluationDetail').d('查看评标');
    };
    if (!scoreTeam) {
      return '';
    };
    const recordField = evaluationHeaderDs?.current?.getField('scoreTeam');
    const prefixTitle = recordField?.getText(scoreTeam);
    return `${prefixTitle || ''}${intl.get('scux.bidEvaluationManagement.view.title.evaluate').d('评标')}`
  }, [scoreTeam, pageType, evaluationHeaderDs?.current]);

  return (
    <Header
      title={pageTitle}
      backPath='/scux/ssrc/bid-evaluation-management/list'
    >
      {!editorFlag ? [] : getButtons()}
      {expertModalVisible && <ExpertLibraryModal {...expertModalProps} />}
      {subAccountVisible && <SubAccount {...subAccountProps} />}
    </Header>
  );
};

export default PageHeader;
