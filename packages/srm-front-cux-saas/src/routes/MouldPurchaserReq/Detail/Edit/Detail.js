import React, { useContext, Fragment, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { Spin, Modal } from 'choerodon-ui/pro';
import { Button } from 'components/Permission';
import classnames from 'classnames';
import DynamicButtons from '_components/DynamicButtons';

import { Header, Content } from 'components/Page';
import { Collapse } from 'choerodon-ui';
// import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import BaseInfo from './Base.js';
import ItemTable from './ItemTable.js';
import LinkTable from './ExpandTable.js';
import AttachmentInfo from './AttachmentInfo.js';
// import Anchor from '../Component/Anchor.js';
import History from '../Component/OperationHistory';

import { saveData, deleteData, submitData } from '@/services/mouldReqService';
import { Store } from '../Store/store';
import styles from './index.less';

const { Panel } = Collapse;
const THROTTLE_TIME = 300;
const defaultActiveKey = ['baseInfo', 'relateItemInfo', 'expandLine', 'attachment'];

const HeaderButtons = observer(() => {
  const {
    mouldReqId,
    headerDs,
    itemTableDs,
    handleGetInfo,
    history,
    buttonUnit,
    customizeBtnGroup,
  } = useContext(Store);
  const { current } = headerDs;
  const [headerLoading, setHeaderLoading] = useState(null);
  const supplierUrlFlag = location.pathname?.includes('supplier');

  // 保存
  const handleSave = async () => {
    const getCheckData = await handleGetInfo();
    setHeaderLoading(true);
    if (getCheckData) {
      return new Promise(resolve => {
        saveData({
          ...getCheckData,
          tenantId: getCurrentOrganizationId(),
        })
          .then(res => {
            const resData = getResponse(res);
            if (resData && resData.mouldReqId && !resData.failed) {
              if (!mouldReqId) {
                history.push({
                  pathname: supplierUrlFlag
                    ? `/scux/mould-req-supplier/edit/${resData.mouldReqId}`
                    : `/scux/mould-req-purchaser/edit/${resData.mouldReqId}`,
                });
              } else {
                notification.success();
                setHeaderLoading(false);
                headerDs.query();
              }
            }
          })
          .finally(() => {
            setHeaderLoading(false);
            resolve();
          });
      });
    } else {
      setHeaderLoading(false);
    }
  };

  // 删除
  const handleDelete = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: <p>{intl.get('hzero.common.view.mouldReq').d('确认删除模具申请单？')}</p>,
      onOk: () => {
        const params = headerDs.toData()[0];
        return new Promise(resolve => {
          deleteData({ ...params }).then(res => {
            if (res && !res.failed) {
              notification.success();
              resolve();
              history.push({
                pathname: supplierUrlFlag
                  ? `/scux/mould-req-supplier/list`
                  : `/scux/mould-req-purchaser/list`,
              });
            } else {
              notification.error({ message: res.message });
              resolve();
            }
          });
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

  // 提交模具申请单
  const publishCurrentData = async () => {
    const getCheckData = await handleGetInfo();
    setHeaderLoading(true);
    if (getCheckData) {
      return new Promise(resolve => {
        submitData({
          ...getCheckData,
          tenantId: getCurrentOrganizationId(),
        })
          .then(res => {
            const resData = getResponse(res);
            if (resData && !resData.failed) {
              history.push({
                pathname: supplierUrlFlag
                  ? `/scux/mould-req-supplier/list`
                  : `/scux/mould-req-purchaser/list`,
              });
              notification.success();
              // headerDs.query();
            }
          })
          .finally(() => {
            resolve();
            setHeaderLoading(false);
          });
      });
    } else {
      setHeaderLoading(false);
    }
  };

  const headerBtn = () => {
    const headerButtons = [
      {
        name: 'submit',
        btnComp: Button,
        btnProps: {
          icon: 'done',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: publishCurrentData,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        child: intl.get('hzero.common.button.submit').d('提交'),
      },
      {
        name: 'save',
        btnComp: Button,
        btnProps: {
          icon: 'save',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleSave,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
        },
        child: intl.get(`hzero.common.button.save`).d('保存'),
      },
      {
        name: 'delete',
        btnComp: Button,
        btnProps: {
          icon: 'delete',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleDelete,
          wait: THROTTLE_TIME,
          disabled: !mouldReqId,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
        },

        child: intl.get('hzero.common.button.delete').d('删除'),
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
        permissions={
          supplierUrlFlag
            ? [
                { code: `srm.bg.manager.mold.application.supplier.button.save`, name: 'save' },
                { code: `srm.bg.manager.mold.application.supplier.button.submit`, name: 'submit' },
                { code: `srm.bg.manager.mold.application.supplier.button.delete`, name: 'delete' },
              ]
            : [
                { code: `srm.bg.manager.mold.application.button.save`, name: 'save' },
                { code: `srm.bg.manager.mold.application.button.submit`, name: 'submit' },
                { code: `srm.bg.manager.mold.application.button.delete`, name: 'delete' },
              ]
        }
      />
    );
  };

  return (
    <Header
      backPath={
        supplierUrlFlag ? `/scux/mould-req-supplier/list` : `/scux/mould-req-purchaser/list`
      }
      title={
        mouldReqId && location?.pathname.includes('change')
          ? intl.get('siec.mould.model.common.changeMouldReq').d('变更模具申请单')
          : mouldReqId
          ? intl.get('siec.mould.model.common.editMouldReq').d('编辑模具申请单')
          : intl.get('siec.mould.model.common.createMouldReq').d('新建模具申请单')
      }
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
