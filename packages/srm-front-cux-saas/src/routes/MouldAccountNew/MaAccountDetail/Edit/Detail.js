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
import { isFunction } from 'lodash';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import BaseInfo from './BaseInfo.js';
import ItemTable from './ItemTable.js';
import LinkTable from './LinkTable.js';
import History from '@/routes/MouldAccountNew/components/OperationHistory';
import AttachmentInfo from '../../components/Attachment';
// import Operation from './../commonDetail/OperationHistory';
// import {
//   mouldMasterDataChange, // 变更
// } from '@/services/mouldMasterData';

import {
  saveData,
  deleteData,
  publishData,
  customAccountData,
  // queryPageInfo,
  // publishAll,
  // queryInitialStateCorrespondingOperation,
  // fetchPermissions,
} from '@/services/mouldAccountService';
import { Store } from '../store.js';
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
    history,
    isSupplier,
    remoteProps,
    allBtnText,
  } = useContext(Store);
  const { current } = headerDs;
  const [headerLoading, setHeaderLoading] = useState(null);

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
            if (resData && resData.maHeaderId && !resData.failed) {
              if (!maHeaderId) {
                history.push({
                  pathname: !isSupplier
                    ? `/scux/mould-account-purchaser/edit/${resData.maHeaderId}`
                    : `/scux/mould-account/edit/${resData.maHeaderId}`,
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
      bodyStyle: { padding: '20px' },
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: <p>{intl.get(`hzero.common.message.confirm.removeData`).d('确定删除数据')}</p>,
      onOk: () => {
        const params = headerDs.toData()[0];
        return new Promise(resolve => {
          deleteData({ ...params, statusConfigId }).then(res => {
            if (res && !res.failed) {
              notification.success();
              resolve();
              history.push({
                pathname: !isSupplier
                  ? `/scux/mould-account-purchaser/list`
                  : `/scux/mould-account/list`,
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
      style: { width: '742px' },
      title: intl.get(`hzero.common.button.operated`).d('操作记录'),
      closable: true,
      children: <History maHeaderId={maHeaderId} isFilterFlag={!isSupplier} />,
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  // 下发模具申请单
  const publishCurrentData = async () => {
    const getCheckData = await handleGetInfo();
    setHeaderLoading(true);
    if (getCheckData) {
      return new Promise(resolve => {
        publishData({
          ...getCheckData,
          tenantId: getCurrentOrganizationId(),
        })
          .then(res => {
            const resData = getResponse(res);
            if (resData && resData.maHeaderId && !resData.failed) {
              // if (!maHeaderId) {
              notification.success();
              history.push({
                pathname: !isSupplier
                  ? `/scux/mould-account-purchaser/list`
                  : `/scux/mould-account/list`,
              });
              // } else {
              // notification.success();
              // headerDs.query();
              // }
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

  // 状态机按钮-模具工作台
  const handleCustom = async operateCode => {
    const getCheckData = await handleGetInfo();
    setHeaderLoading(true);
    if (getCheckData) {
      return new Promise(resolve => {
        customAccountData({
          ...getCheckData,
          operateCode,
          tenantId: getCurrentOrganizationId(),
        })
          .then(res => {
            const resData = getResponse(res);
            if (resData && resData.maHeaderId && !resData.failed) {
              if (!maHeaderId) {
                history.push({
                  pathname: !isSupplier
                    ? `/scux/mould-account-purchaser/list`
                    : `/scux/mould-account/list`,
                });
              } else {
                notification.success();
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

  const headerBtn = () => {
    const currentStatus = current?.get('maStatus') || 'PENDING';
    const { renderExtendCuxEditBtn } = remoteProps?.props?.process || {};
    console.log(statusMaps);
    const currentBtnList =
      statusMaps.size && currentStatus && statusMaps.get(currentStatus)
        ? statusMaps.get(currentStatus)
        : [];
    console.log(currentBtnList);
    const customBtn = currentBtnList?.filter(
      e =>
        ![
          'APPROVED',
          'CONFORM',
          'DELETE',
          'MAINTAIN',
          'MODIFY',
          'NEW',
          'REJECT',
          'RELEASE',
          'SAVE',
          'SCRAP',
          'SEND_BACK',
          'TRANSFER',
        ].includes(e)
    );
    const customBtnList = [];
    (customBtn || []).forEach(e => {
      if (e) {
        customBtnList.push({
          name: e,
          btnComp: Button,
          btnProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            onClick: () => handleCustom(e),
            wait: THROTTLE_TIME,
            loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
            disabled: !current || headerLoading,
          },
          child: allBtnText[e] || intl.get('hzero.common.button.customBtn').d('自定义按钮'),
        });
      }
    });
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
        name: 'release',
        btnComp: Button,
        btnProps: {
          icon: 'done_all',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: publishCurrentData,
          wait: THROTTLE_TIME,
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
          disabled: !current || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          statusMaps.get(currentStatus) &&
          statusMaps.get(currentStatus).includes('RELEASE')
        ),
        child: intl.get(`siec.mould.common.release`).d('下发'),
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
        hidden: !(
          statusMaps.size &&
          statusMaps.get(currentStatus || 'DEFAULT') &&
          statusMaps.get(currentStatus || 'DEFAULT').includes('SAVE')
        ),
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
          loading: headerDs.status !== 'ready' || itemTableDs.status !== 'ready' || headerLoading,
        },
        hidden: !(
          statusMaps.size &&
          currentStatus &&
          maHeaderId &&
          statusMaps.get(currentStatus) &&
          statusMaps.get(currentStatus).includes('DELETE')
        ),
        child: intl.get('hzero.common.button.delete').d('删除'),
      },
      ...customBtnList,
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

  return (
    <Header
      backPath={!isSupplier ? `/scux/mould-account-purchaser/list` : `/scux/mould-account/list`}
      title={
        maHeaderId
          ? intl.get('siec.mould.model.common.editMould').d('编辑模具')
          : intl.get('siec.mould.model.common.createMould').d('新建模具')
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
                  formDs={headerDs}
                  code="SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO"
                  customizeForm={customizeForm}
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
