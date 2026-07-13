import React, { useContext, Fragment, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Spin, Modal, Button, DataSet } from 'choerodon-ui/pro';
import classnames from 'classnames';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import { Collapse } from 'choerodon-ui';
import { isFunction } from 'lodash';
import { openApproveModal } from '_components/ApproveModal';
// import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import History from '@/routes/MouldAccountNew/components/OperationHistory';
import { approveData, rejectData } from '@/services/mouldAccountService';
import { remarkDataDs } from '../../stores/maListDs';
import BaseInfo from './BaseInfo.js';
import ItemTable from './ItemTable.js';
import LinkTable from './LinkTable.js';
import AttachmentInfo from '../../components/Attachment';
import { Store } from '../store.js';
import PromptModal from '../../components/PromptModal';
import { revokeWorkFlow } from '../../components/util';
import styles from './index.less';

const { Panel } = Collapse;
const THROTTLE_TIME = 300;
const defaultActiveKey = ['baseInfo', 'relateItemInfo', 'expandLine', 'attachment'];

const HeaderButtons = observer(() => {
  const {
    maHeaderId,
    headerDs,
    itemTableDs,
    statusConfigId,
    statusMaps = {},
    history,
    isSupplier,
    pageForm,
  } = useContext(Store);
  const [headerLoading] = useState(null);
  const { current } = headerDs;

  const openOperatorRecord = () => {
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: '742px' },
      title: intl.get(`hzero.common.button.operated`).d('操作记录'),
      closable: true,
      children: <History maHeaderId={maHeaderId} isFilterFlag={!isSupplier} />,
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  // 审批通过
  const approveMould = () => {
    const headerInfo = headerDs?.current.toJSONData();
    const remarkDs = new DataSet(remarkDataDs());
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: '742px' },
      title: intl.get('siec.mould.model.common.approveRemark').d('审批意见'),
      closable: true,
      movable: false,
      onCancel: () => {},
      children: <PromptModal ds={remarkDs} />,
      footer: (_, cancelBtn) => (
        <div>
          <Button
            onClick={async () => {
              const remarkData = remarkDs.toJSONData();
              const { approvedRemark = '' } = remarkData[0] ? remarkData[0] : {};
              return new Promise(resolve => {
                approveData({ ...headerInfo, statusConfigId, approvedRemark }).then(res => {
                  const resData = getResponse(res);
                  if (resData && !resData.failed) {
                    history.push({
                      pathname: !isSupplier
                        ? `/scux/mould-account-purchaser/list`
                        : `/scux/mould-account/list`,
                    });
                  } else {
                    resolve(false);
                  }
                });
              });
            }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  };

  // 审批拒绝
  const rejectMould = () => {
    const headerInfo = headerDs?.current.toJSONData();
    const remarkDs = new DataSet(remarkDataDs('reject'));
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: '742px' },
      title: intl.get('siec.mould.model.common.approveRemark').d('审批意见'),
      closable: true,
      movable: false,
      onCancel: () => {},
      children: <PromptModal ds={remarkDs} />,
      footer: (_, cancelBtn) => (
        <div>
          <Button
            onClick={async () => {
              const remarkData = remarkDs.toJSONData();
              const { approvedRemark = '' } = remarkData[0] ? remarkData[0] : {};
              return new Promise(resolve => {
                rejectData({ ...headerInfo, statusConfigId, approvedRemark }).then(res => {
                  const resData = getResponse(res);
                  if (resData && !resData.failed) {
                    history.push({ pathname: '/scux/mould-account-purchaser/list' });
                  } else {
                    resolve(false);
                  }
                });
              });
            }}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  };

  const handleRevoke = async () => {
    const { workflowBusinessKey } = current?.get(['workflowBusinessKey']) || {};
    const res = await revokeWorkFlow(workflowBusinessKey);
    if (getResponse(res)) {
      history.push({
        pathname: !isSupplier ? `/scux/mould-account-purchaser/list` : `/scux/mould-account/list`,
      });
    }
  };

  const handleWorkFlowApprove = async () => {
    const approvaFlags = headerDs.getState('approvaFlags');
    const { workflowBusinessKey } = current?.get(['workflowBusinessKey']) || {};
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    openApproveModal({
      modalProps: {
        closable: true,
      },
      taskId,
      processInstanceId,
      onSuccess: () => {
        history.push({
          pathname: !isSupplier ? `/scux/mould-account-purchaser/list` : `/scux/mould-account/list`,
        });
      },
    });
  };
  const headerBtn = () => {
    const currentStatus = current?.get('maStatus') || 'PENDING';
    const approvalMethod = current?.get('approvalMethod');
    const approvaFlags = headerDs.getState('approvaFlags') || {};
    const operationFlags = headerDs.getState('operationFlags');
    const { workflowBusinessKey } = current?.get(['workflowBusinessKey']) || {};
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const operationFlag = operationFlags?.[workflowBusinessKey];
    const headerButtons = [
      {
        name: 'approve',
        btnComp: Button,
        btnProps: {
          icon: 'check',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: approveMould,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          statusMaps.get(currentStatus) &&
          statusMaps.get(currentStatus).includes('APPROVED') &&
          approvalMethod === 'FUNCTIONAL'
        ),
        child: intl.get(`hzero.common.button.approvalAdopt`).d('审批通过'),
      },
      {
        name: 'refuse',
        btnComp: Button,
        btnProps: {
          icon: 'close',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: rejectMould,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          statusMaps.get(currentStatus) &&
          statusMaps.get(currentStatus).includes('REJECT') &&
          approvalMethod === 'FUNCTIONAL'
        ),
        child: intl.get(`hzero.common.button.approvalRefuse`).d('审批拒绝'),
      },
      {
        name: 'workFlowApprove',
        btnComp: Button,
        btnProps: {
          icon: 'authorize',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleWorkFlowApprove,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          statusMaps.get(currentStatus) &&
          statusMaps.get(currentStatus).includes('APPROVED') &&
          approvalMethod === 'WORKFLOW' &&
          approvaFlags &&
          approvaFlag
        ),
        child: intl.get('hzero.common.button.approval').d('审批'),
      },
      {
        name: 'workFlowRevoke',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleRevoke,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          statusMaps.get(currentStatus) &&
          statusMaps.get(currentStatus).includes('APPROVED') &&
          approvalMethod === 'WORKFLOW' &&
          operationFlags &&
          operationFlag?.REVOKE
        ),
        child: intl.get(`hzero.common.button.revokeApproval`).d('撤销审批'),
      },
    ];
    if (maHeaderId) {
      headerButtons.push({
        name: 'operating',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'assignment',
          funcType: 'flat',
          onClick: openOperatorRecord,
        },
      });
    }
    return (
      <>
        <DynamicButtons buttons={headerButtons} />
      </>
    );
  };

  const reasonlabel = {
    maintain: intl.get(`siec.mould.model.common.maintainMould`).d('维修模具'),
    scrap: intl.get(`siec.mould.model.common.scrapMould`).d('报废模具'),
    transfer: intl.get(`siec.mould.model.common.transferMould`).d('转移模具'),
    modify: intl.get(`siec.mould.model.common.modifyMould`).d('变更模具'),
  };

  return (
    <Header
      backPath={!isSupplier ? `/scux/mould-account-purchaser/list` : `/scux/mould-account/list`}
      title={
        pageForm
          ? reasonlabel[pageForm]
          : intl.get('siec.mould.model.common.viewReadMould').d('查看模具')
      }
    >
      {headerBtn()}
    </Header>
  );
});

const Detail = () => {
  const { headerDs, itemTableDs, changeDs, customizeForm, showContent, remoteProps } = useContext(
    Store
  );
  const { handleRenderDetail, cuxDefaultActiveKey } = remoteProps?.props?.process || {};
  const newDefaultActiveKey = isFunction(cuxDefaultActiveKey)
    ? cuxDefaultActiveKey()
    : defaultActiveKey;
  return (
    <Fragment>
      <HeaderButtons />
      <Spin spinning={headerDs.status !== 'ready' || itemTableDs.status !== 'ready'}>
        <div className={styles.sprm_fixed_header}>
          <Content
            className={classnames(styles['sprm-new-detail-content'], 'sprm-detail')}
            style={{ overflowY: 'auto' }}
          >
            <Collapse
              ghost
              expandIconPosition="text-right"
              defaultActiveKey={newDefaultActiveKey}
              // expandIcon={expandIconRender}
              trigger="text-icon"
            >
              <Panel
                key="baseInfo"
                id="siec-mould-detail-content-basicInfo"
                header={intl.get('siec.mould.model.common.mouldBaseInfo').d('模具基础信息')}
              >
                <BaseInfo />
              </Panel>
              <Panel
                key="relateItemInfo"
                id="siec-mould-detail-content-relateItemInfo"
                header={intl.get('siec.mould.common.relateItemInfo').d('关联物料信息')}
              >
                <ItemTable />
              </Panel>
              {showContent && (
                <Panel
                  key="expandLine"
                  id="siec-mould-detail-content-expandLine"
                  header={intl.get('siec.mould.common.expandLine').d('关联子模具信息')}
                >
                  <LinkTable />
                </Panel>
              )}
              {isFunction(handleRenderDetail) && handleRenderDetail({ headerDs })}
              <Panel
                key="attachment"
                id="siec-mould-detail-content-attachment"
                header={intl.get('siec.mould.model.common.attachment').d('附件')}
              >
                <AttachmentInfo
                  attachmentUuid={headerDs.current?.get('attachmentUuid')}
                  formDs={headerDs.current?.get('maType') === 'MODIFY' ? changeDs : headerDs}
                  customizeForm={customizeForm}
                  ready
                  code="SIEC.MOULD_PLATFORM.APPROVE.READATTACH"
                />
              </Panel>
            </Collapse>
          </Content>
        </div>
      </Spin>
    </Fragment>
  );
};

export default observer(Detail);
