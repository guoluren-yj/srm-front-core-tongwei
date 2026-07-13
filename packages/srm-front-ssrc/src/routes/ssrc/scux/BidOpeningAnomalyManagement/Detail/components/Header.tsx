import React, { useMemo } from "react";
import { Button } from 'choerodon-ui/pro';
import { ButtonColor } from "choerodon-ui/pro/lib/button/enum";
import { useObserver } from 'mobx-react-lite';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import {
  saveOrSubmitPageData,
} from '../../api';
import { useStore } from '../store/StoreProvider';

const PageHeader: React.FC<any> = () => {
  const {
    commonDs: {
      baseInfoDs,
      lineInfoDs,
    } = {},
    editorFlag,
    initData = () => {},
    pageLoading,
    setPageLoading = () => {},
    abnormalHeaderId,
    history,
    prefix,
  } = useStore();

  const expFbcUrl = useObserver(() => baseInfoDs?.current?.get('expFbcUrl'));

  // 校验页面数据
  const validatePageData = () => {
    if (!baseInfoDs) {
      return Promise.reject(new Error('Data sets are not initialized'));
    };

    return baseInfoDs.validate();
  };

  // 获取页面数据
  const getPageData = async () => {
    if (!await validatePageData()) {
      notification.error({
        message: intl.get(`${prefix}.view.tip.validatePageMessage`).d('有必填字段未填写'),
      });
      return;
    };
    return {
      abnormalHeader: baseInfoDs?.current?.toData() || {},
      abnormalLineList: lineInfoDs?.toData() || [],
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
    return saveOrSubmitPageData({
      ...pageData,
      opreationType: 'SAVE',
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        if (!abnormalHeaderId && res.abnormalHeaderId) {
          history.push({
            pathname: `/scux/ssrc/bid-opening-anomaly-management/update/${res.abnormalHeaderId}`,
          });
        } else if (abnormalHeaderId) {
          initData();
        };
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
    return saveOrSubmitPageData({
      ...pageData,
      opreationType: 'SUBMIT',
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push('/scux/ssrc/bid-opening-anomaly-management/list');
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 查看FBC流程
  const handleViewFBC = () => {
    if (expFbcUrl) {
      window.open(expFbcUrl);
    };
  };

  const getButtons = () => {
    const commonButtons = [
      <Button icon="collections_bookmark" onClick={handleViewFBC} disabled={!expFbcUrl}>
        {intl.get(`${prefix}.view.button.viewFBCProcess`).d('查看FBC流程')}
      </Button>,
    ];
    if (!editorFlag) {
      return commonButtons;
    };
    return [
      ...commonButtons,
      <Button icon="check" wait={1000} color={ButtonColor.primary} onClick={handleSubmit} disabled={pageLoading}>
        {intl.get('hzero.common.button.submit').d('提交')}
      </Button>,
      <Button icon="save" wait={1000} onClick={handleSave} disabled={pageLoading}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
    ];
  };

  // 标题
  const pageTitle = useMemo(() => {
    if (editorFlag) {
      return intl.get(`${prefix}.view.title.page.update`).d('开标异常维护');
    }
    return intl.get(`${prefix}.view.title.page.detail`).d('开标异常明细');
  }, [editorFlag]);

  return (
    <Header
      title={pageTitle}
      backPath='/scux/ssrc/bid-opening-anomaly-management/list'
    >
      {getButtons()}
    </Header>
  );
};

export default PageHeader;