import React, { useMemo } from "react";
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor } from "choerodon-ui/pro/lib/button/enum";
import { useObserver } from 'mobx-react-lite';

import { Header } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import OperationRecordCux from 'srm-front-boot/lib/components/OperationRecordCux';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';

import {
  saveOrSubmitPageData,
  supReturnOrConfirm,
} from '../../api';
import { useStore } from '../store/StoreProvider';

// 操作记录icon
const statusIconTypes = [
  {
    value: 'CUX_QB_CREATE',
    PUBLISHED: '创建',
    icon: 'add',
  },
  {
    value: 'CUX_QB_SUBMIT',
    PUBLISHED: '提交',
    icon: 'check',
  },
  {
    value: 'CUX_QB_RETURN',
    PUBLISHED: '退回',
    icon: 'assignment_return-o',
  },
  {
    value: 'CUX_QB_CANCEL',
    PUBLISHED: '作废',
    icon: 'cancel',
  },
  {
    value: 'CUX_QB_COMPLETE',
    PUBLISHED: '确认完成',
    icon: 'finished',
  },
  {
    "value": "CUX_QB_CONFIRM",
    "PUBLISHED": "确认",
    "icon": "publish2",
  },
];

const PageHeader: React.FC<any> = () => {
  const {
    commonDs: {
      baseInfoDs,
      lineInfoDs,
    } = {},
    editorFlag,
    supplierFlag,
    initData = () => {},
    pageLoading,
    setPageLoading = () => {},
    qbHeaderId,
    history,
  } = useStore();

  const qbStatus = useObserver(() => baseInfoDs?.current?.get('qbStatus'));

  // 校验页面数据
  const validatePageData = async () => {
    if (!baseInfoDs || !lineInfoDs) {
      return Promise.reject(new Error('Data sets are not initialized'));
    };

    const validateRes = await Promise.all([
      baseInfoDs.validate(),
      lineInfoDs.validate(),
    ]);
    if (validateRes.some((item) => !item)) return false;
    return true;
  };

  // 获取页面数据
  const getPageData = async (params: { operationType?: string } = {}) => {
    const { operationType = '' } = params || {};
    if (['SAVE', 'SUBMIT'].includes(operationType) && !await validatePageData()) {
      notification.error({
        message: intl.get('scux.clearTenderManagement.view.tip.validatePageMessage').d('有必填字段未填写'),
      });
      return;
    };
    return {
      qbHeader: baseInfoDs?.current?.toData() || {},
      qbLineList: lineInfoDs?.toData() || [],
    };
  };

  // 保存
  const handleSave = async () => {
    setPageLoading(true);
    const pageData = await getPageData({ operationType: 'SAVE' });
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    return saveOrSubmitPageData({
      ...pageData,
      operationType: 'SAVE',
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
  const handleSubmit = async (operationType = 'SUBMIT') => {
    setPageLoading(true);
    const pageData = await getPageData({ operationType: 'SUBMIT' });
    if (!pageData) {
      setPageLoading(false);
      return;
    };

    const confirmMessageObj = {
      SUBMIT: intl.get('scux.clearTenderManagement.view.tip.submitMessage').d('确认要提交清标维护单吗？'),
      COMPLETE: intl.get('scux.clearTenderManagement.view.tip.completeMessage').d('提交确认后不可修改，请确定是否进行提交'),
      CANCEL: intl.get('scux.clearTenderManagement.view.tip.cancelMessage').d('作废后不可修改，请确定是否进行作废'),
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: <div>{confirmMessageObj[operationType]}</div>,
      onOk: () => {
        return saveOrSubmitPageData({
          ...pageData,
          operationType,
        }).then(res => {
          if (getResponse(res)) {
            notification.success({});
            history.push('/scux/ssrc/clear-tender-management/pur/list');
          };
        }).finally(() => {
          setPageLoading(false);
        });
      },
      onCancel: () => {
        setPageLoading(false);
      },
    });
  };

  // 删除
  const handleDelete = async () => {
    setPageLoading(true);
    const pageData = await getPageData();
    return saveOrSubmitPageData({
      ...pageData,
      operationType: 'DELETE',
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push('/scux/ssrc/clear-tender-management/pur/list');
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 退回
  const handlerBack = async () => {
    setPageLoading(true);
    const pageData = await getPageData();
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    if (!pageData.qbHeader.supplierFeedback) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: <div>{intl.get('scux.clearTenderManagement.view.tip.returnMessage').d('清标退回时，清标确认说明必输，请确认')}</div>,
        okButton: false,
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
        onCancel: () => {
          setPageLoading(false);
        },
      });
      return;
    };
    return supReturnOrConfirm({
      ...pageData,
      operationType: 'RETURN',
    }).then(res => {
      if (getResponse(res)) {
        notification.success({});
        history.push('/scux/ssrc/clear-tender-management/sup/list');
      };
    }).finally(() => {
      setPageLoading(false);
    });
  };

  // 确认
  const handleConfirm = async () => {
    setPageLoading(true);
    const pageData = await getPageData();
    if (!pageData) {
      setPageLoading(false);
      return;
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: <div>{intl.get('scux.clearTenderManagement.view.tip.confirmMessage').d('点击“确认”即视为认可清标结果且不可撤回，请仔细核对！')}</div>,
      onOk: () => {
        return supReturnOrConfirm({
          ...pageData,
          operationType: 'CONFIRM',
        }).then(res => {
          if (getResponse(res)) {
            notification.success({});
            history.push('/scux/ssrc/clear-tender-management/sup/list');
          };
        }).finally(() => {
          setPageLoading(false);
        });
      },
      onCancel: () => {
        setPageLoading(false);
      },
    });
  };


  const getButtons = () => {
    if (!editorFlag) {
      if (supplierFlag) {
        return [];
      }
      return [
        qbStatus === 'CONFIRMED' && (
          <Button icon="check" wait={1000} color={ButtonColor.primary} onClick={() => handleSubmit('COMPLETE')} disabled={pageLoading}>
            {intl.get('scux.clearTenderManagement.button.confirmationCompleted').d('确认完成')}
          </Button>
        ),
        qbStatus === 'CONFIRMED' && (
          <Button icon="cancel" wait={1000} onClick={() => handleSubmit('CANCEL')} disabled={pageLoading}>
            {intl.get('scux.clearTenderManagement.button.cancellation').d('作废')}
          </Button>
        ),
        <OperationRecordCux
          method="GET"
          btnIcon=""
          btnType="button"
          modalContentType="tabs"
          tableUrl={`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/7dWljYbh2Q31dA6XOhvoq5l4Kj5vbnNLLATEufJ01Xw`}
          tableOtherParams={{
            qbHeaderId,
            queryType: 'ACTION',
            queryRole: 'PURCHASE',
          }}
          statusIconTypes={statusIconTypes}
        />,
      ];
    };
    if (supplierFlag) {
      return [
        <Button icon="submit" wait={1000} color={ButtonColor.primary} onClick={handleConfirm} disabled={pageLoading}>
          {intl.get('hzero.common.view.button.confirm').d('确认')}
        </Button>,
        <Button icon="assignment_return-o" wait={1000} onClick={handlerBack} disabled={pageLoading}>
          {intl.get('hzero.common.button.return').d('退回')}
        </Button>,
      ];
    };
    return [
      <Button icon="check_circle_outline-o" wait={1000} color={ButtonColor.primary} onClick={() => handleSubmit('SUBMIT')} disabled={pageLoading}>
        {intl.get('hzero.common.button.submit').d('提交')}
      </Button>,
      <Button icon="save" wait={1000} onClick={handleSave} disabled={pageLoading}>
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      qbStatus === 'NEW' && (
        <Button icon="delete" wait={1000} onClick={handleDelete} disabled={pageLoading}>
          {intl.get('hzero.common.button.cancel').d('取消')}
        </Button>
      ),
      <OperationRecordCux
        method="GET"
        btnIcon=""
        btnType="button"
        modalContentType="tabs"
        tableUrl={`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/7dWljYbh2Q31dA6XOhvoq5l4Kj5vbnNLLATEufJ01Xw`}
        tableOtherParams={{
          qbHeaderId,
          queryType: 'ACTION',
          queryRole: 'PURCHASE',
        }}
        statusIconTypes={statusIconTypes}
      />,
    ];
  };

  // 标题
  const pageTitle = useMemo(() => {
    if (editorFlag) {
      return intl.get('scux.clearTenderManagement.view.title.page.update').d('清标维护');
    }
    return intl.get('scux.clearTenderManagement.view.title.page.detail').d('清标明细');
  }, [editorFlag]);

  return (
    <Header
      title={pageTitle}
      backPath={supplierFlag ? '/scux/ssrc/clear-tender-management/sup/list' : '/scux/ssrc/clear-tender-management/pur/list'}
    >
      {getButtons()}
    </Header>
  );
};

export default PageHeader;
