import React, { useContext, Fragment, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Spin, Modal, DataSet, notification } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import classnames from 'classnames';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';
import { Header, Content } from 'components/Page';
import { Collapse } from 'choerodon-ui';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import PromptModal from '../../components/PromptModal';
import BaseInfo from './BaseInfo.js';
import ItemTable from './ItemTable.js';
import LinkTable from './LinkTable.js';
import History from '@/routes/MouldAccountNew/components/OperationHistory';
import AttachmentInfo from '../../components/Attachment';
import { remarkDataDs } from '../../stores/maListDs';
import {
  sureData,
  resetData,
  approveData,
  rejectData,
  changeApply,
} from '@/services/mouldAccountService';
import { maDetailModifyDs, tableLineDS, maExpandLine } from '../../stores/maDetailDs.js';
import { Store } from '../store.js';
import { revokeWorkFlow } from '../../components/util.js';
import Remark from './Remark';
import ChangeMould from './ChangeModal';
import styles from './index.less';

const { Panel } = Collapse;
const THROTTLE_TIME = 300;
const defaultActiveKey = ['baseInfo', 'relateItemInfo', 'expandLine', 'attachment'];

const HeaderButtons = observer(() => {
  const {
    maHeaderId,
    headerDs,
    itemTableDs,
    linkTableDs,
    statusConfigId,
    statusMaps = {},
    handleGetInfo,
    pageForm,
    reasonForm,
    history,
    customizeTable,
    customizeForm,
    isSupplier,
    showContent,
    remoteProps,
  } = useContext(Store);
  const { current } = headerDs;
  const [headerLoading] = useState(null);
  const { renderExtendCuxHeaderTitle, cuxChangeApply, renderExtendCuxReason } =
    remoteProps?.props?.process || {};

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
      style: { width: '380px' },
      title: intl.get('siec.mould.model.common.approveRemark').d('审批意见'),
      closable: true,
      movable: false,
      onCancel: () => { },
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
      style: { width: '380px' },
      title: intl.get('siec.mould.model.common.approveRemark').d('审批意见'),
      closable: true,
      movable: false,
      onCancel: () => { },
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

  // 确认
  const sureMould = () => {
    const canValidateFlag = headerDs.current?.get('needValidateFlag');
    return new Promise(async resolve => {
      const headerInfo = canValidateFlag ? await handleGetInfo() : headerDs.current?.toData() || {};
      if (headerInfo) {
        sureData({ ...headerInfo, statusConfigId }).then(res => {
          const resData = getResponse(res);
          if (resData?.failNum) {
            notification.error({ message: resData?.failMessage });
            resolve(false);
          } else if (resData) {
            history.push({
              pathname: !isSupplier
                ? `/scux/mould-account-purchaser/list`
                : `/scux/mould-account/list`,
            });
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  };

  const resetMould = () => {
    const headerInfo = headerDs.current?.toData() ?? {};
    return new Promise(resolve => {
      resetData({ ...headerInfo, statusConfigId }).then(res => {
        const resData = getResponse(res);
        if (resData) {
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
  };

  const handleRevoke = async () => {
    const { workflowBusinessKey } =
      current?.get(['workflowBusinessKey', 'workflowRevokeFlag']) || {};
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
  // 维修，转移，报废确认
  const submitMould = () => {
    const headerInfo = headerDs.current?.toJSONData() ?? {};
    reasonForm.current.status = 'update';

    const extendCuxReasoneObj = isFunction(renderExtendCuxReason) ? renderExtendCuxReason() : {};
    const reasonlabel = {
      maintain: intl.get(`siec.mould.model.common.maintainReason`).d('维修原因'),
      scrap: intl.get(`siec.mould.model.common.scrapReason`).d('报废原因'),
      transfer: intl.get(`siec.mould.model.common.transferReason`).d('转移原因'),
      ...extendCuxReasoneObj,
    };
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: {
        width: '380px',
      },
      title: reasonlabel[pageForm],
      closable: true,
      children: (
        <Remark
          reasonForm={reasonForm}
          pageForm={pageForm}
          label={reasonlabel[pageForm]}
          customizeForm={customizeForm}
        />
      ),
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn} {cancelBtn}
        </div>
      ),
      onOk: async () => {
        if (await reasonForm.validate()) {
          const { __dirty, __id, _status, ...others } = reasonForm.current.toJSONData() ?? {};
          return new Promise(resolve => {
            const request = isFunction(cuxChangeApply)
              ? cuxChangeApply(pageForm, changeApply)
              : changeApply;
            request({
              ...others,
              maHeaderId: headerInfo.maHeaderId,
              statusConfigId,
              // XX原因取值判断
              changeType: pageForm.toLocaleUpperCase(),
              maChangeModify: {
                formDs: undefined,
                maLineList: undefined,
                ...others,
                modifyLineList: [],
                modifyLineExpandList: [],
              },
            }).then(res => {
              const resData = getResponse(res);
              if (resData) {
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
        } else {
          return false;
        }
      },
    });
  };

  const changeMould = () => {
    const changeTableDs = new DataSet(tableLineDS());
    // 模具变更物料扩展行
    const maExpandLineDs = new DataSet(maExpandLine());
    const changeFormDs = new DataSet(
      maDetailModifyDs({ maHeaderId, source: 'modify', changeTableDs, maExpandLineDs })
    );
    changeFormDs.loadData(headerDs.toData());
    changeTableDs.loadData(itemTableDs.toData());
    maExpandLineDs.loadData(linkTableDs.toData());
    changeTableDs.forEach(e => {
      e.selectable = false;
    });
    maExpandLineDs.forEach(e => {
      e.selectable = false;
    });
    const headerInfo = headerDs?.current.toJSONData();
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: 1090 },
      title: intl.get(`siec.mould.model.common.modifyMould`).d('变更模具'),
      closable: true,
      children: (
        <ChangeMould
          customizeTable={customizeTable}
          customizeForm={customizeForm}
          changeFormDs={changeFormDs}
          changeTableDs={changeTableDs}
          maExpandLineDs={maExpandLineDs}
          showContent={showContent}
        />
      ),
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn} {cancelBtn}
        </div>
      ),
      onOk: async () => {
        if (await changeFormDs.validate()) {
          const { __dirty, __id, _status, modifyLineList, modifyLineExpandList, ...others } =
            changeFormDs.current.toJSONData() ?? {};
          const modifyLineLists = changeTableDs.toData();
          const modifyLineExpandLists = maExpandLineDs.toData();
          debugger;
          return new Promise(resolve => {
            changeApply({
              ...others,
              maHeaderId: headerInfo.maHeaderId,
              statusConfigId,
              // XX原因取值判断
              ...others,
              customizeUnitCode:
                'SIEC.MOULD_PLATFORM.APPROVE.READATTACH,SIEC.MOULD_PLATFORM.APPROVE.HEADER,SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE_EXPAND',
              changeType: pageForm.toLocaleUpperCase(),
              maChangeModify: {
                ...others,
                modifyLineList: modifyLineLists,
                modifyLineExpandList: modifyLineExpandLists,
              },
            }).then(res => {
              const resData = getResponse(res);
              if (resData) {
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
        } else {
          return false;
        }
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
    const { renderExtendCuxEditBtn } = remoteProps?.props?.process || {};
    const exTendCuxBtn = isFunction(renderExtendCuxEditBtn)
      ? renderExtendCuxEditBtn({
        statusMaps,
        currentStatus,
        headerDs,
        itemTableDs,
        linkTableDs,
        history,
      })
      : [];
    const headerButtons = [
      ...exTendCuxBtn,
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
        name: 'edit',
        btnComp: Button,
        btnProps: {
          icon: 'mode_edit',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: () => {
            history.push({
              pathname: !isSupplier
                ? `/scux/mould-account-purchaser/edit/${maHeaderId}`
                : `/scux/mould-account/edit/${maHeaderId}`,
            });
          },
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          statusMaps.get(currentStatus) &&
          statusMaps.get(currentStatus).includes('SAVE')
        ),
        child: intl.get('hzero.common.button.edit').d('编辑'),
      },
      {
        name: 'sure',
        btnComp: Button,
        btnProps: {
          icon: 'check',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: sureMould,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden:
          (isSupplier && headerDs?.current?.get('userCamp') === 'SUPPLIER') ||
          !(
            statusMaps.size &&
            currentStatus &&
            statusMaps.get(currentStatus) &&
            statusMaps.get(currentStatus).includes('CONFORM')
          ),
        child: intl.get(`hzero.common.button.confrim`).d('确认'),
      },
      {
        name: 'sure',
        btnComp: Button,
        btnProps: {
          icon: 'reply',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: resetMould,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden:
          (isSupplier && headerDs?.current?.get('userCamp') === 'SUPPLIER') ||
          !(
            statusMaps.size &&
            currentStatus &&
            statusMaps.get(currentStatus) &&
            statusMaps.get(currentStatus).includes('SEND_BACK')
          ),
        child: intl.get(`hzero.common.button.sendBack`).d('退回'),
      },
      {
        name: 'submit',
        btnComp: Button,
        btnProps: {
          icon: 'done',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: submitMould,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          statusMaps.get(currentStatus) &&
          pageForm !== 'modify' &&
          statusMaps.get(currentStatus).includes(pageForm?.toLocaleUpperCase())
        ),
        child: intl.get(`hzero.common.button.submit`).d('提交'),
      },
      {
        name: 'change',
        btnComp: Button,
        btnProps: {
          icon: 'mode_edit',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: changeMould,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          statusMaps.get(currentStatus) &&
          pageForm === 'modify' &&
          statusMaps.get(currentStatus).includes(pageForm?.toLocaleUpperCase())
        ),
        child: intl.get(`siec.mould.common.button.modify`).d('变更'),
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

  const extendCuxTitleObj = isFunction(renderExtendCuxHeaderTitle)
    ? renderExtendCuxHeaderTitle()
    : {};

  const titlelabel = {
    maintain: intl.get(`siec.mould.model.common.maintainMould`).d('维修模具'),
    scrap: intl.get(`siec.mould.model.common.scrapMould`).d('报废模具'),
    transfer: intl.get(`siec.mould.model.common.transferMould`).d('转移模具'),
    modify: intl.get(`siec.mould.model.common.modifyMould`).d('变更模具'),
    ...extendCuxTitleObj,
  };

  return (
    <Header
      backPath={!isSupplier ? `/scux/mould-account-purchaser/list` : `/scux/mould-account/list`}
      title={
        pageForm
          ? titlelabel[pageForm]
          : intl.get('siec.mould.model.common.viewReadMould').d('查看模具')
      }
    >
      {headerBtn()}
    </Header>
  );
});

const Detail = () => {
  const { headerDs, itemTableDs, customizeForm, showContent, remoteProps } = useContext(Store);
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
                  formDs={headerDs}
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
