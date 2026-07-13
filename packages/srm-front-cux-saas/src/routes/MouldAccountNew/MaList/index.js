import React, { Fragment, useState, useEffect } from 'react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { connect } from 'dva';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DataSet, Modal, Button, Dropdown, Menu, Icon } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import remote from 'hzero-front/lib/utils/remote';
import { Tabs, Tag } from 'choerodon-ui';
import { compose, isFunction } from 'lodash';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import classnames from 'classnames';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';
import History from '@/routes/MouldAccountNew/components/OperationHistory/index.js';
import DynamicButtons from '_components/DynamicButtons';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import {
  queryPageInfo,
  publishAll,
  queryInitialStateCorrespondingOperation,
  // fetchPermissions,
  // revokeWorkflow,
} from '@/services/mouldAccountService';
// import {
//   mouldMasterDataDetail, // 明细
// } from '@/services/mouldMasterData';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
// import { maDetailDs, tableLineDS, maExpandLine } from '../stores/maDetailDs';
import { revokeWorkFlow } from '../components/util.js';

// import MouldOutput from '../../MouldApprove/index.js';
// import
import { maListDs, maDetailList } from '../stores/maListDs.js';
import styles from '../index.less';
// import MaDetailModal from '../MaDetail';

const organizationId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const { Item: MenuItem } = Menu;
const Index = ({
  maListLineDs,
  maChangeLineDs,
  customizeTable,
  customizeBtnGroup,
  customizeTabPane,
  maDetailListDs,
  mouldAccount = {},
  remoteProps,
  history,
  dispatch,
  // remote,
}) => {
  const [normalCount, setNormalCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [currenttab, setCurrenttab] = useState(mouldAccount.activeKey); // 优先展示带订单页签
  const [tableStatus, setTableStatus] = useState(mouldAccount.tableStatus || 'header');
  // const [showContent, setShowContent] = useState(false);
  const [statusConfigId, setStatusConfigId] = useState(null); // 获取初始statusConfigId
  const [initStatusBtnConfig, setInitStatusBtnConfig] = useState([]); // 获取列表界面的按钮操作
  const [statusBtnConfig, setStatusBtnConfig] = useState({}); // 当前单据状态不同的状态，按钮显示不同的逻辑
  const [isSupplier] = useState(!location.pathname?.includes('purchaser')); // 是否供应商

  // const onCancelModal = () => {
  //   maListLineDs.query(maListLineDs.currentPage).then(data => {
  //     const normalNum = data ? (data.totalElements > 99 ? '99+' : data.totalElements) : null;
  //     setNormalCount(normalNum);
  //   });
  //   maChangeLineDs.query(maListLineDs.currentPage).then(data => {
  //     const changeNum = data ? (data.totalElements > 99 ? '99+' : data.totalElements) : null;
  //     setChangeCount(changeNum);
  //   });
  // };

  /**
   * 跳转到明细页
   * @param {String} maHeaderId
   */
  const redirectDetail = (record, type) => {
    const maStatus = record ? record.get('maStatus') : 'PENDING';
    const currentBtnConfig = statusBtnConfig[maStatus] || [];
    const editPageFlag =
      currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'SAVE');
    if (!isSupplier) {
      if ((maStatus === 'PENDING' || editPageFlag) && type !== 'readOnly') {
        // 非异动 && 下发/保存
        history.push({
          pathname: `/scux/mould-account-purchaser/edit/${record.get('maHeaderId')}`,
        });
        // openMaDetailModal(record ? record.get('maHeaderId') : null, record);
      } else if (
        ['modify', 'transfer'].includes(type) &&
        ['TRANSFER', 'MODIFY'].includes(record.get('maType'))
      ) {
        history.push({
          pathname: `/scux/mould-account-purchaser/readChangeOnly/${record?.get('maHeaderId')}`,
          search: `pageAction=${type}`,
        });
      } else if (['maintain', 'transfer', 'scrap', 'modify'].includes(type)) {
        history.push({
          pathname: `/scux/mould-account-purchaser/readOnly/${record?.get('maHeaderId')}`,
          search: `pageAction=${type}`,
        });
      } else {
        history.push({
          pathname: `/scux/mould-account-purchaser/readOnly/${record?.get('maHeaderId')}`,
        });
      }
    } else if (maStatus === 'PENDING') {
      history.push({
        pathname: `/scux/mould-account/edit/${record.get('maHeaderId')}`,
      });
      // openMaDetailModal(record ? record.get('maHeaderId') : null, record);
    } else if (type === 'modify' && record.get('maType') === 'MODIFY') {
      history.push({
        pathname: `/scux/mould-account/readChangeOnly/${record?.get('maHeaderId')}`,
        search: `pageAction=${type}`,
      });
    } else if (['maintain', 'transfer', 'scrap', 'modify'].includes(type)) {
      history.push({
        pathname: `/scux/mould-account/readOnly/${record?.get('maHeaderId')}`,
        search: `pageAction=${type}`,
      });
    } else {
      history.push({
        pathname: `/scux/mould-account/readOnly/${record?.get('maHeaderId')}`,
      });
    }
  };

  const pageIntNum = () => {
    queryInitialOperation('MOULD_ACCOUNT').then(() => {
      Promise.all([
        maListLineDs.query(maListLineDs.currentPage),
        maChangeLineDs.query(maChangeLineDs.currentPage),
      ]).then(res => {
        if (res) {
          const normalNum = res[0]
            ? res[0].totalElements > 99
              ? '99+'
              : res[0].totalElements
            : null;
          const changeNum = res[1]
            ? res[1].totalElements > 99
              ? '99+'
              : res[1].totalElements
            : null;
          setNormalCount(normalNum);
          setChangeCount(changeNum);
        }
      });
    });
  };

  useEffect(() => {
    pageIntNum();
  }, []);

  const queryInitialOperation = async moduleCode => {
    await queryInitialStateCorrespondingOperation({ moduleCode }).then(res => {
      if (res && !res.failed) {
        // 添加查询参数
        maListLineDs.setQueryParameter('statusConfigId', res.statusConfigId);
        maChangeLineDs.setQueryParameter('statusConfigId', res.statusConfigId);
        maDetailListDs.setQueryParameter('statusConfigId', res.statusConfigId);
        setStatusConfigId(res.statusConfigId);
        setInitStatusBtnConfig(
          res.pageOperationList && (res.pageOperationList || []).map(item => item.operationCode)
        );
        fetchPageInfo(res.statusConfigId);
      }
    });
  };

  const fetchPageInfo = async currentStatusConfigId => {
    const result = getResponse(await queryPageInfo({ statusConfigId: currentStatusConfigId }));
    if (result) {
      const { statusList = [] } = result;
      const btnConfig = {};
      (statusList || []).forEach(ele => {
        const { statusCode, pageOperationList = [] } = ele;
        btnConfig[statusCode] = pageOperationList.map(item => ({
          operationCode: item.operationCode,
          operationDesc: item.operationDesc,
        }));
      });
      setStatusBtnConfig(btnConfig);
    }
  };

  /**
   * 打开操作记录
   * @param {String} maHeaderId
   */
  const openOperatorRecord = (record, maHeaderIdC) => {
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: '742px' },
      title: intl.get(`hzero.common.button.operated`).d('操作记录'),
      closable: true,
      children: <History maHeaderId={maHeaderIdC || record.get('maHeaderId')} isFilterFlag={!isSupplier} />,

      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleRevoke = async record => {
    const lineDs = currenttab === 'normal' ? maListLineDs : maChangeLineDs;
    const { workflowBusinessKey } =
      record?.get(['workflowBusinessKey', 'workflowRevokeFlag']) || {};
    const res = await revokeWorkFlow(workflowBusinessKey);
    if (res) {
      lineDs.query();
    }
  };

  const ActionList = (upperMaStatus, record) => {
    const currentBtnConfig = statusBtnConfig[upperMaStatus] || [];
    const { renderExtendCuxEditBtn } = remoteProps?.props?.process || {};
    const cuxExtendCuxBtns = isFunction(renderExtendCuxEditBtn)
      ? renderExtendCuxEditBtn(currentBtnConfig, record, history, isSupplier)
      : [];
    const lineDs = currenttab === 'normal' ? maListLineDs : maChangeLineDs;
    const approvaFlags = lineDs.getState('approvaFlags') || {};
    const operationFlags = lineDs.getState('operationFlags');
    const { workflowBusinessKey } = record?.get(['workflowBusinessKey']) || {};
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const operationFlag = operationFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
    const { approvalMethod } = record.get(['approvalMethod']) || {};
    const buttonList = [
      {
        name: 'maintain',
        func: () => redirectDetail(record, 'maintain'),
        showFlag:
          currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'MAINTAIN'),
        child: intl.get(`siec.mould.common.button.maintain`).d('维修'),
      },
      {
        name: 'transfer',
        func: () => redirectDetail(record, 'transfer'),
        showFlag:
          currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'TRANSFER'),
        child: intl.get(`siec.mould.common.button.transfer`).d('转移'),
      },
      {
        name: 'scrap',
        child: intl.get(`siec.mould.common.button.scrap`).d('报废'),
        func: () => redirectDetail(record, 'scrap'),
        showFlag: currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'SCRAP'),
      },
      {
        name: 'modify',
        child: intl.get(`siec.mould.common.button.modify`).d('变更'),
        func: () => redirectDetail(record, 'modify'),
        showFlag: currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'MODIFY'),
      },
      {
        name: 'workflowApprove',
        child: intl.get('hzero.common.button.approval').d('审批'),
        func: () => {
          openApproveModal({
            modalProps: {
              closable: true,
            },
            taskId,
            processInstanceId,
            onSuccess: () => {
              lineDs.query();
            },
          });
        },
        showFlag:
          currentBtnConfig &&
          currentBtnConfig.some(ele => ele.operationCode === 'APPROVED') &&
          !(record.get('userCamp') === 'SUPPLIER' && isSupplier) &&
          approvalMethod === 'WORKFLOW' &&
          approvaFlags &&
          approvaFlag,
        // workflowApprovalFlag === 1,
      },
      {
        name: 'workflowRevoke',
        child: intl.get(`hzero.common.button.revokeApproval`).d('撤销审批'),
        func: () => handleRevoke(record),
        showFlag:
          currentBtnConfig &&
          currentBtnConfig.some(ele => ele.operationCode === 'APPROVED') &&
          !(record.get('userCamp') === 'SUPPLIER' && isSupplier) &&
          approvalMethod === 'WORKFLOW' &&
          operationFlags &&
          operationFlag?.REVOKE,
      },
      ...cuxExtendCuxBtns,
      {
        name: 'operated',
        showFlag: true,
        child: intl.get(`hzero.common.button.operated`).d('操作记录'),
        func: () => openOperatorRecord(record),
      },
    ];
    const allShowButtonList = buttonList.filter(e => e.showFlag) || [];
    if (allShowButtonList.length >= 3) {
      const [bt1, bt2, ...others] = allShowButtonList;
      const menu = (
        <Menu>
          {others.map(item => {
            const { name, child, func } = item;
            return (
              <MenuItem key={name} onClick={func}>
                {child}
              </MenuItem>
            );
          })}
        </Menu>
      );
      return (
        <div>
          <Button
            funcType="link"
            type="c7n-pro"
            className={styles['sprm-col-btn']}
            onClick={bt1.func}
          >
            {bt1.child}
          </Button>
          <Button
            funcType="link"
            type="c7n-pro"
            className={styles['sprm-col-btn']}
            onClick={bt2.func}
          >
            {bt2.child}
          </Button>
          <Dropdown funcType="flat" overlay={menu}>
            <Button funcType="link" className={styles['sprm-col-btn']}>
              {intl.get('hzero.common.button.more').d('更多')}
              <Icon type="expand_more" style={{ fontSize: 14 }} />
            </Button>
          </Dropdown>
        </div>
      );
    } else {
      return allShowButtonList.map(e => (
        <Button funcType="link" type="c7n-pro" className={styles['sprm-col-btn']} onClick={e.func}>
          {e.child}
        </Button>
      ));
    }
  };

  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return (
      <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('workflowBusinessKey')]} />
    );
  };

  const getCol = type => {
    const columns = [
      {
        name: 'maStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          // const approvalMethod = record.get('approvalMethod');
          const { maStatus } = record.get(['maStatus']) || {};
          let tagColor = 'c7n-tag-yellow';
          if (
            [
              'DEFAULT',
              'PENDING',
              'APPROVING',
              'CONFIRMING',
              'APPROVING_CH',
              'APPROVING_RL',
            ].includes(maStatus)
          ) {
            tagColor = 'c7n-tag-yellow';
          } else if (['CONFORMED', 'MOLD_CONFIRM_COMP', 'HEALTH_CHECK_COMP'].includes(maStatus)) {
            tagColor = 'c7n-tag-green';
          } else if (['SCRAPPED'].includes(maStatus) || maStatus.includes('REJECT')) {
            tagColor = 'c7n-tag-red';
          } else {
            tagColor = 'c7n-tag-yellow';
          }
          return (
            <Tag className={classnames(tagColor)} style={{ border: 0 }}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'operate',
        width: 150,
        renderer: ({ record }) => {
          const approvalMethod = record.get('approvalMethod');
          const upperMaStatus = record?.get('maStatus') || '';
          const lineDs = currenttab === 'normal' ? maListLineDs : maChangeLineDs;
          const approvaFlags = lineDs.getState('approvaFlags') || {};
          const operationFlags = lineDs.getState('operationFlags');
          const { workflowBusinessKey } = record?.get(['workflowBusinessKey']) || {};
          const approvaFlag = approvaFlags?.[workflowBusinessKey];
          const operationFlag = operationFlags?.[workflowBusinessKey];
          const { taskId, processInstanceId } = approvaFlag || {};
          if (currenttab === 'change') {
            return ActionList(upperMaStatus, record);
          } else {
            const currentBtnConfig = statusBtnConfig[upperMaStatus] || [];
            return (
              <div>
                {currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'SAVE') && (
                  <Button
                    funcType="link"
                    type="c7n-pro"
                    className={styles['sprm-col-btn']}
                    onClick={() =>
                      redirectDetail(
                        record,
                        record.get('maType') === 'NORMAL'
                          ? ''
                          : record.get('maType').toLocaleLowerCase()
                      )
                    }
                  >
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </Button>
                )}
                {currentBtnConfig &&
                  currentBtnConfig.some(ele => ele.operationCode === 'CONFORM') &&
                  !(record.get('userCamp') === 'SUPPLIER' && isSupplier) && (
                    <Button
                      funcType="link"
                      type="c7n-pro"
                      className={styles['sprm-col-btn']}
                      onClick={() =>
                        redirectDetail(
                          record,
                          record.get('maType') === 'NORMAL'
                            ? ''
                            : record.get('maType').toLocaleLowerCase()
                        )
                      }
                    >
                      {intl.get('hzero.common.button.confirm').d('确认')}
                    </Button>
                  )}
                {currentBtnConfig &&
                  currentBtnConfig.some(ele => ele.operationCode === 'APPROVED') &&
                  !(record.get('userCamp') === 'SUPPLIER' && isSupplier) &&
                  approvalMethod === 'WORKFLOW' &&
                  approvaFlags &&
                  approvaFlag && (
                    <Button
                      funcType="link"
                      type="c7n-pro"
                      className={styles['sprm-col-btn']}
                      onClick={() => {
                        openApproveModal({
                          modalProps: {
                            closable: true,
                          },
                          taskId,
                          processInstanceId,
                          onSuccess: () => {
                            lineDs.query();
                          },
                        });
                      }}
                    >
                      {intl.get('hzero.common.button.approval').d('审批')}
                    </Button>
                  )}
                {currentBtnConfig &&
                  currentBtnConfig.some(ele => ele.operationCode === 'APPROVED') &&
                  !(record.get('userCamp') === 'SUPPLIER' && isSupplier) &&
                  approvalMethod === 'WORKFLOW' &&
                  operationFlags &&
                  operationFlag?.REVOKE && (
                    <Button
                      funcType="link"
                      type="c7n-pro"
                      className={styles['sprm-col-btn']}
                      onClick={() => handleRevoke(record)}
                    >
                      {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
                    </Button>
                  )}
                <Button
                  onClick={() => openOperatorRecord(record)}
                  funcType="link"
                  className={styles['sprm-col-btn']}
                >
                  {intl.get(`hzero.common.button.operated`).d('操作记录')}
                </Button>
              </div>
            );
          }
        },
      },
      {
        name: 'maNum',
        width: 180,
        renderer: ({ text, record }) => {
          const status = record.get('maType').toLocaleLowerCase();
          return (
            <a
              onClick={() =>
                redirectDetail(record, ['normal'].includes(status) ? 'readOnly' : status)
              }
            >
              {text}
            </a>
          );
        },
      },
      {
        name: 'workFlowApproveProcess',
        width: 180,
        renderer: viewDetail,
        tooltip: 'none',
      },

      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'mouldPrincipalName',
        width: 120,
      },
      {
        name: 'mouldNum',
        width: 150,
      },
      {
        name: 'mouldName',
        width: 150,
      },
      {
        name: 'modelSpecs',
        width: 120,
      },
      {
        name: 'uomName',
        width: 120,
      },
      {
        name: 'shareQuality',
        width: 120,
      },
      {
        name: 'mouldLife',
        width: 120,
      },
      {
        name: 'moldingCycle',
        width: 120,
      },
      {
        name: 'machineTonnage',
        width: 120,
      },
      {
        name: 'cavityQuality',
        width: 120,
      },
      {
        name: 'mouldTypeMeaning',
        width: 120,
      },
      {
        name: 'mouldOwnerMeaning',
        width: 120,
      },
      {
        name: 'mouldValue',
        width: 120,
      },
      {
        name: 'effectiveTimeFrom',
        width: 120,
      },
      {
        name: 'effectiveTimeTo',
        width: 120,
      },
      {
        name: 'usedValue',
        width: 120,
      },
      {
        name: 'remainValue',
        width: 120,
      },
      {
        name: 'usedQuality',
        width: 120,
      },
      {
        name: 'remainQuality',
        width: 120,
      },
      {
        name: 'createdByName',
        width: 120,
      },
      {
        name: 'sourcePlatformMeaning',
        width: 120,
      },
      {
        name: 'attachmentUuid',
        width: 120,
      },
      {
        name: 'companyName',
        width: 200,
      },
    ];
    if (type === 'change') {
      const changeCol = columns.filter(
        ele => !['usedValue', 'remainValue', 'usedQuality', 'remainQuality'].includes(ele.name)
      );
      return changeCol;
    } else {
      return columns;
    }
  };

  const getColumns = () => {
    const columns = [
      {
        name: 'maStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          // const approvalMethod = record.get('approvalMethod');
          const maStatus = record.get('maStatus');
          let tagColor = 'c7n-tag-yellow';
          if (
            [
              'DEFAULT',
              'PENDING',
              'APPROVING',
              'CONFIRMING',
              'APPROVING_CH',
              'APPROVING_RL',
            ].includes(maStatus)
          ) {
            tagColor = 'c7n-tag-yellow';
          } else if (
            ['CONFORMED', 'MOLD_CONFIRM_COMP', 'HEALTH_CHECK_COMP'].includes(maStatus) ||
            value.includes('APPROVED')
          ) {
            tagColor = 'c7n-tag-green';
          } else if (['SCRAPPED'].includes(maStatus) || maStatus.includes('REJECT')) {
            tagColor = 'c7n-tag-red';
          } else {
            tagColor = 'c7n-tag-yellow';
          }
          return (
            <Tag className={classnames(tagColor)} style={{ border: 0 }}>
              {value}
            </Tag>
          );
        },
      },
      {
        name: 'maNum',
        width: 180,
        renderer: ({ text, record }) => {
          const status = record.get('maType').toLocaleLowerCase();
          return (
            <a onClick={() => redirectDetail(record, status === 'PENDING' ? 'readOnly' : status)}>
              {`${text}-${record.get('lineNum')}`}
            </a>
          );
        },
      },
      {
        name: 'companyId',
        width: 200,
        renderer: ({ record }) => record.get('companyName'),
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'mouldPrincipalId',
        width: 120,
        renderer: ({ record }) => record.get('mouldPrincipalName'),
      },
      {
        name: 'createdByName',
        width: 120,
      },
      {
        name: 'mouldNum',
        width: 150,
      },
      {
        name: 'mouldName',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'categoryId',
        width: 150,
        renderer: ({ record }) => record.get('categoryName'),
      },
      {
        name: 'uomId',
        width: 120,
        renderer: ({ record }) => record.get('uomName'),
      },
      {
        name: 'quantity',
        width: 120,
      },
      {
        name: 'modelSpecs',
        width: 120,
      },
    ];
    return columns;
  };

  const publishAllData = () => {
    const headerList = maListLineDs.selected.map(ele => ({
      ...ele.toJSONData(),
      statusConfigId,
    }));
    return new Promise(resolve => {
      publishAll(headerList)
        .then(res => {
          const resData = getResponse(res);
          if (resData && !resData?.failed) {
            if (res.failNum > 0) {
              notification.error({ message: res.failMessage });
            }
            maListLineDs.query();
          }
        })
        .finally(() => {
          resolve();
        });
    });
  };

  const getQueryFrom = () => {
    const currentDs = tableStatus === 'header' ? maListLineDs : maDetailListDs;
    const selectedDate = currentDs.selected ? currentDs.selected.map(ele => ele.toData()) : [];
    if (selectedDate.length > 0) {
      const maHeaderIds = selectedDate.map(ele => ele.maHeaderId);
      const maLineIds = selectedDate.map(ele => ele.maLineId);
      return { statusConfigId, maHeaderIds, maLineIds };
    } else {
      const queryData = currentDs.queryDataSet.toData();
      const currentQueryDate = queryData[0];
      return currentQueryDate
        ? filterNullValueObject({
            statusConfigId,
            ...currentQueryDate,
            customizeUnitCode:
              tableStatus === 'header'
                ? 'SIEC.MOULD_PLATFORM.LIST.ACCTOUNT_FILTER, SIEC.MOULD_PLATFORM.LIST.EXPORT_LIST'
                : 'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_FILTER_LINE,SIEC.MOULD_PLATFORM.LIST.ACCOUNT_LINE',
          })
        : {};
    }
  };

  const HeaderBtn = observer(({ dataSet }) => {
    const { renderExtendHeaderBtn } = remoteProps?.props?.process || {};
    // 导出按钮
    const exTendCuxBtn =
      typeof renderExtendHeaderBtn === 'function' ? renderExtendHeaderBtn({ dataSet }) : [];
    const DoneAllBtn = [
      ...exTendCuxBtn,
      {
        name: 'export',
        noNest: true,
        child: () => (
          <ExcelExportPro
            templateCode={
              tableStatus === 'header'
                ? 'SIEC_MOULD_ACCOUNT_EXPORT'
                : 'SIEC_MOULD_ACCOUNT_LINE_EXPORT'
            }
            buttonText={
              dataSet.selected.length > 0
                ? intl.get('hzero.common.button.checkedExport').d('勾选导出')
                : intl.get('hzero.common.view.button.export').d('导出')
            }
            requestUrl={
              tableStatus === 'header'
                ? `/siec/v1/${organizationId}/mould-account/list/export`
                : `/siec/v1/${organizationId}/mould-account/line-list/export`
            }
            queryParams={() => getQueryFrom()}
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: isSupplier
                    ? 'srm.pcn-admin.mould-manager.mould-accounts.ps.new.list.export'
                    : 'srm.pcn-admin.mould-manager.mould-accounts-purchaser.ps.new.list.export',
                  type: 'button',
                },
              ],
            }}
          />
        ),
      },
    ];

    if (!isSupplier && tableStatus === 'header') {
      const releaseDisableFlag = dataSet.selected.some(ele => ele.get('maStatus') !== 'PENDING');
      // 下发按钮
      DoneAllBtn.push({
        name: 'release',
        noNest: true,
        btnProps: {
          onClick: publishAllData,
        },
        child: () => (
          <Button
            icon="done_all"
            funcType="flat"
            onClick={() => publishAllData()}
            disabled={(dataSet.selected && !dataSet.selected.length) || releaseDisableFlag}
            waitType="debounce"
            wait={300}
          >
            {intl.get(`siec.mould.common.release`).d('下发')}
          </Button>
        ),
      });
      // 导入按钮
      DoneAllBtn.push({
        name: 'import',
        noNest: true,
        child: () => (
          <CommonImport
            prefixPatch={`${SRM_SIEC}`}
            businessObjectTemplateCode="SIEC_MOULD_ACCOUNT_IMPORT"
            buttonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: `srm.pcn-admin.mould-manager.mould-accounts-purchaser.ps.import`,
                  type: 'button',
                  meaning: '导入-新',
                },
              ],
            }}
            buttonText={intl.get('hzero.common.button.import').d('导入')}
          />
        ),
      });
    }

    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_BUTTONS',
            pro: true,
          },
          <DynamicButtons buttons={DoneAllBtn} />
        )}
      </>
    );
  });

  const handleChangeTab = key => {
    setCurrenttab(key);
    let currentDs = maListLineDs;
    if (key === 'normal' && tableStatus === 'header') {
      currentDs = maListLineDs;
    } else if (key === 'normal' && tableStatus !== 'header') {
      currentDs = maDetailListDs;
    } else {
      currentDs = maChangeLineDs;
    }
    dispatch({
      type: 'mouldAccount/updateState',
      payload: { activeKey: key },
    });
    if (currentDs.getState('initFlag')) {
      currentDs.query(currentDs.currentPage, {}, true);
    }
  };

  const handleQuery = ({ params = {} }) => {
    let currentDs = maListLineDs;
    if (currenttab === 'normal' && tableStatus === 'header') {
      currentDs = maListLineDs;
    } else if (currenttab === 'normal' && tableStatus !== 'header') {
      currentDs = maDetailListDs;
    } else {
      currentDs = maChangeLineDs;
    }
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = currentDs.queryDataSet?.current?.toData();
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectHeaderNums', 'multiSelectHeaderAndLineNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    const { customizeOrderField } = params;
    // eslint-disable-next-line no-unused-expressions
    currentDs.queryDataSet?.current?.set({
      ...params,
      ...clearParams,
    });
    currentDs.setQueryParameter('customizeOrderField', customizeOrderField);
    currentDs.query(currentDs.currentPage);
  };

  const resetQueryDs = () => {
    let currentDs;
    if (currenttab === 'normal' && tableStatus === 'header') {
      currentDs = maListLineDs;
    } else if (currenttab === 'normal' && tableStatus !== 'header') {
      currentDs = maDetailListDs;
    } else {
      currentDs = maChangeLineDs;
    }

    // eslint-disable-next-line no-unused-expressions
    currentDs.queryDataSet?.current?.reset();
  };

  const handleCreate = () => {
    history.push({
      pathname: !isSupplier ? `/scux/mould-account-purchaser/create` : `/scux/mould-account/create`,
    });
  };
  const code =
    tableStatus === 'header'
      ? 'SIEC.MOULD_PLATFORM.LIST.ACCTOUNT_FILTER'
      : 'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_FILTER_LINE';
  return (
    <Fragment>
      <Header title={intl.get('siec.mould.common.maListTitle').d('模具工作台')}>
        {
          <Fragment>
            {!isSupplier &&
              currenttab === 'normal' &&
              initStatusBtnConfig &&
              initStatusBtnConfig.includes('SAVE') && (
                <Button
                  icon="add"
                  type="c7n-pro"
                  color="primary"
                  onClick={() => {
                    handleCreate();
                  }}
                >
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>
              )}
            {currenttab === 'normal' && (
              <HeaderBtn dataSet={tableStatus === 'header' ? maListLineDs : maDetailListDs} />
            )}
          </Fragment>
        }
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SIEC.MOULD_PLATFORM.LIST.TABS',
            custLoading: false,
          },
          <Tabs
            className={styles.maListTabs}
            activeKey={currenttab}
            onChange={handleChangeTab}
            hideOnlyGroup
            keyboard={false}
          >
            <TabPane
              tab={
                <>
                  {intl.get('siec.mould.common.maLedger').d('模具台账')}
                  <span>{` ${normalCount}`}</span>
                </>
              }
              key="normal"
            >
              <div style={{ height: 'calc(100vh - 242px)' }}>
                {customizeTable(
                  {
                    code:
                      tableStatus === 'header'
                        ? 'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_LIST'
                        : 'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_LINE',
                    dataSet: tableStatus === 'header' ? maListLineDs : maDetailListDs,
                  },
                  <SearchBarTable
                    cacheState
                    style={{ maxHeight: 'calc(100% - 22px)' }}
                    searchCode={code}
                    key={tableStatus}
                    dataSet={tableStatus === 'header' ? maListLineDs : maDetailListDs}
                    columns={tableStatus === 'header' ? getCol('normal') : getColumns()}
                    data={[]}
                    queryFieldsLimit={3}
                    searchBarConfig={{
                      left: {
                        render: () =>
                          tableStatus === 'header' ? (
                            <MutlTextFieldSearch
                              name="multiSelectHeaderNums"
                              dataSet={maListLineDs}
                              placeholder={intl
                                .get('siec.mould.modal.enterPrNumSearch')
                                .d('请输入模具台帐单号查询')}
                            />
                          ) : (
                            <MutlTextFieldSearch
                              name="multiSelectHeaderAndLineNums"
                              dataSet={maDetailListDs}
                              placeholder={intl
                                .get('siec.mould.modal.enterMaNumLineNumSearch')
                                .d('请输入模具台帐单号-行号查询')}
                            />
                          ),
                      },
                      right: {
                        render: () => (
                          <div className={styles.rightTabs}>
                            <div
                              className={tableStatus === 'header' ? 'active' : ''}
                              onClick={() => {
                                setTableStatus('header');
                                dispatch({
                                  type: 'mouldAccount/updateState',
                                  payload: { tableStatus: 'header' },
                                });
                                maListLineDs.query(maListLineDs.currentPage);
                              }}
                            >
                              <span>
                                {intl.get(`siec.mould.modal..byMoldAccountHeader`).d('按台账单')}
                              </span>
                            </div>
                            <div
                              className={tableStatus !== 'header' ? 'active' : ''}
                              onClick={() => {
                                setTableStatus('line');
                                dispatch({
                                  type: 'mouldAccount/updateState',
                                  payload: { tableStatus: 'line' },
                                });
                                maDetailListDs.query(maDetailListDs.currentPage);
                              }}
                            >
                              <span>{intl.get(`siec.mould.modal.byMoldLine`).d('按台账行')}</span>
                            </div>
                          </div>
                        ),
                      },
                      onQuery: handleQuery,
                      onClear: resetQueryDs,
                      onReset: resetQueryDs,
                    }}
                  />
                )}
              </div>
            </TabPane>
            <TabPane
              tab={
                <>
                  {intl.get('siec.mould.common.maTransactionHandling').d('模具异动处理')}
                  <span>{` ${changeCount}`}</span>
                </>
              }
              key="change"
            >
              <div style={{ height: 'calc(100vh - 242px)' }}>
                {customizeTable(
                  {
                    code: 'SIEC.MOULD_PLATFORM.LIST.CHANGE_LIST',
                    dataSet: maChangeLineDs,
                  },
                  <SearchBarTable
                    style={{ maxHeight: 'calc(100% - 22px)' }}
                    cacheState
                    searchCode="SIEC.MOULD_PLATFORM.LIST.CHANGE_FILTER"
                    dataSet={maChangeLineDs}
                    columns={getCol('change')}
                    data={[]}
                    queryFieldsLimit={3}
                    searchBarConfig={{
                      left: {
                        render: () => (
                          <MutlTextFieldSearch
                            name="multiSelectHeaderNums"
                            dataSet={maChangeLineDs}
                            placeholder={intl
                              .get('siec.mould.modal.enterPrNumSearch')
                              .d('请输入模具台帐单号查询')}
                          />
                        ),
                      },
                      onQuery: handleQuery,
                      onClear: resetQueryDs,
                      onReset: resetQueryDs,
                    }}
                  />
                )}
              </div>
            </TabPane>
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(({ mouldAccount }) => ({ mouldAccount })),
  formatterCollections({
    code: ['hzero.common', 'siec.mould', 'entity.attachment', 'entity.company'],
  }),
  withCustomize({
    unitCode: [
      'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_LIST',
      'SIEC.MOULD_PLATFORM.LIST.CHANGE_LIST',
      'SIEC.MOULD_PLATFORM.LIST.TABS',
      'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_LINE',
      'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_BUTTONS',
    ],
  }),
  withProps(
    () => {
      const maListLineDs = new DataSet(maListDs({ type: 'normal' }));
      const maChangeLineDs = new DataSet(maListDs({ type: 'change' }));
      const maDetailListDs = new DataSet(maDetailList({ type: 'change' }));
      return {
        maListLineDs,
        maChangeLineDs,
        maDetailListDs,
      };
    },
    { cacheState: true }
  ),
  remote(
    {
      code: 'SAAS_MOULD_WORKBENCHE_REMOTE', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
      name: 'remoteProps', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      process: {
        renderExtendCuxEditBtn: undefined,
        renderExtendHeaderBtn: undefined,
      },
    }
  )
)(Index);
