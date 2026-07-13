import React, { useContext, Fragment, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Spin, Modal, Button, DataSet } from 'choerodon-ui/pro';
import classnames from 'classnames';
import DynamicButtons from '_components/DynamicButtons';

import { Header, Content } from 'components/Page';
import { Collapse } from 'choerodon-ui';
import { openApproveModal } from '_components/ApproveModal';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import BaseInfo from './Base.js';
import ItemTable from './ItemTable.js';
import LinkTable from './ExpandTable.js';
import AttachmentInfo from './AttachmentInfo.js';
// import Anchor from '../Component/Anchor.js';
import History from '../Component/OperationHistory';

import PromptModal from '../Component/PromptModal.js';
import { remarkDataDs } from '../Store/allDs.js';
import { Store } from '../Store/store';
import { revokeWorkFlow } from '../../util.js';
import styles from './index.less';
import { rejectData, approveData } from '@/services/mouldReqService.js';

const { Panel } = Collapse;
const THROTTLE_TIME = 300;
const defaultActiveKey = ['baseInfo', 'relateItemInfo', 'expandLine', 'attachment'];

const HeaderButtons = observer(() => {
  const {
    mouldReqId,
    pubPathFlag,
    headerDs,
    itemTableDs,
    history,
    customizeBtnGroup,
    buttonUnit,
  } = useContext(Store);
  const { current } = headerDs;
  const [headerLoading] = useState(null);
  const supplierUrlFlag = location.pathname?.includes('supplier');
  const approvaFlags = headerDs.getState('approvaFlags') || {};
  const operationFlags = headerDs.getState('operationFlags') || {};
  const { workflowBusinessKey } = current?.get(['workflowBusinessKey']) || {};

  const approveMould = type => {
    const headerInfo = current.toJSONData();
    const remarkDs = new DataSet(remarkDataDs(type));
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: '380px' },
      title: intl.get('siec.mould.model.common.approveRemark').d('审批意见'),
      closable: true,
      movable: false,
      onCancel: () => {},
      children: <PromptModal ds={remarkDs} />,
      onOk: async () => {
        if (type === 'approve') {
          await approve(headerInfo, remarkDs);
        } else {
          await reject(headerInfo, remarkDs);
        }
      },
    });
  };

  const approve = async (headerInfo, remarkDs) => {
    const remarkData = remarkDs.toJSONData();
    const { approvedRemark = '' } = remarkData[0] ? remarkData[0] : {};
    const res = getResponse(await approveData({ ...headerInfo, approvedRemark }));
    if (res) {
      history.push({
        pathname: supplierUrlFlag
          ? `/scux/mould-req-supplier/list`
          : `/scux/mould-req-purchaser/list`,
      });
    }
  };

  const reject = async (headerInfo, remarkDs) => {
    const remarkData = remarkDs.toJSONData();
    const { approvedRemark = '' } = remarkData[0] ? remarkData[0] : {};
    const res = getResponse(await rejectData({ ...headerInfo, approvedRemark }));
    if (res) {
      history.push({
        pathname: supplierUrlFlag
          ? `/scux/mould-req-supplier/list`
          : `/scux/mould-req-purchaser/list`,
      });
    }
  };

  const handleRevoke = async () => {
    const res = await revokeWorkFlow(workflowBusinessKey);
    if (res) {
      history.push({
        pathname: supplierUrlFlag
          ? `/scux/mould-req-supplier/list`
          : `/scux/mould-req-purchaser/list`,
      });
    }
  };

  const handleWorkFlowApprove = async () => {
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
          pathname: supplierUrlFlag
            ? `/scux/mould-req-supplier/list`
            : `/scux/mould-req-purchaser/list`,
        });
      },
    });
  };

  const openOperatorRecord = () => {
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      title: intl.get(`hzero.common.button.operated`).d('操作记录'),
      closable: true,
      children: <History mouldReqId={mouldReqId} isFilterFlag={!supplierUrlFlag} />,
      style: { width: '742px' },
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const headerBtn = () => {
    const headerButtons = [
      {
        name: 'approve',
        btnComp: Button,
        btnProps: {
          icon: 'check_circle',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: () => approveMould('approve'),
          wait: THROTTLE_TIME,
          hidden: !location.pathname?.includes('approved'),
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        child: intl.get('hzero.common.button.approvalAdopt').d('审批通过'),
      },
      {
        name: 'reject',
        btnComp: Button,
        btnProps: {
          icon: 'cancel',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => approveMould('reject'),
          wait: THROTTLE_TIME,
          hidden: !location.pathname?.includes('approved'),
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
        },
        child: intl.get('hzero.common.button.approvalRefuse').d('审批拒绝'),
      },
      {
        name: 'workflowApprove',
        btnComp: Button,
        btnProps: {
          icon: 'authorize',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => handleWorkFlowApprove(),
          wait: THROTTLE_TIME,
          hidden: !pubPathFlag || !approvaFlags[workflowBusinessKey] || supplierUrlFlag,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        child: intl.get('hzero.common.button.approval').d('审批'),
      },
      {
        name: 'workflowRevoke',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: () => handleRevoke(),
          wait: THROTTLE_TIME,
          hidden: !pubPathFlag || !operationFlags[workflowBusinessKey]?.REVOKE || supplierUrlFlag,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
        },
        child: intl.get(`hzero.common.button.revokeApproval`).d('撤销审批'),
      },
    ];
    if (mouldReqId) {
      headerButtons.push({
        name: 'operating',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: openOperatorRecord,
        },
      });
    }

    return customizeBtnGroup(
      {
        code: buttonUnit,
        pro: true,
      },
      <DynamicButtons
        buttons={headerButtons}
        permissions={[
          { code: `srm.bg.manager.mold.application.button.approve`, name: 'approve' },
          { code: `srm.bg.manager.mold.application.button.reject`, name: 'reject' },
        ]}
      />
    );
  };

  return (
    <Header
      backPath={
        supplierUrlFlag ? '/scux/mould-req-supplier/list' : `/scux/mould-req-purchaser/list`
      }
      title={intl.get('siec.mould.model.common.viewMould').d('查看模具申请单')}
    >
      {headerBtn()}
    </Header>
  );
});

const Detail = () => {
  const { headerDs, itemTableDs, showContent } = useContext(Store);
  return (
    <Fragment>
      <HeaderButtons />
      <Spin spinning={headerDs.status !== 'ready' || itemTableDs.status !== 'ready'}>
        {/* <Anchor /> */}
        <div className={styles.sprm_fixed_header}>
          <Content
            className={classnames(styles['sprm-new-detail-content'], 'sprm-detail')}
            style={{ overflowY: 'auto' }}
          >
            <Collapse
              ghost
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
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
              <Panel
                key="attachment"
                id="siec-mould-detail-content-attachmentInfo"
                header={intl.get('siec.mould.common.attachmentInfo').d('附件信息')}
              >
                <AttachmentInfo />
              </Panel>
            </Collapse>
          </Content>
        </div>
      </Spin>
    </Fragment>
  );
};

export default observer(Detail);
