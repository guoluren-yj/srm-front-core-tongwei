import React, { Fragment, useEffect, useState } from 'react';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject, getResponse } from 'utils/utils';
import { Header, Content } from 'components/Page';
import { DataSet, Modal, Button } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import CommonImport from 'hzero-front/lib/components/Import';
import { Tabs } from 'choerodon-ui';
import { compose, isFunction, isArray } from 'lodash';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { observer } from 'mobx-react-lite';

import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';
import History from '@/routes/MouldAccount/components/OperationHistory';
import DynamicButtons from '_components/DynamicButtons';
import { colorTagRender } from './../components/utils';
import {
  saveData,
  deleteData,
  publishData,
  queryPageInfo,
  publishAll,
  queryInitialStateCorrespondingOperation,
  fetchPermissions,
} from '@/services/mouldAccountService';
import {
  mouldMasterDataDetail, // 明细
} from '@/services/mouldMasterData';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import { maDetailDs, tableLineDS, maExpandLine } from '../stores/maDetailDs';

import MouldOutput from '../../MouldApprove/index.js';
// import
import { maListDs, maDetailList } from '../stores/maListDs';
import styles from '../index.less';
import MaDetailModal from '../MaDetail';

const organizationId = getCurrentOrganizationId();
const { TabPane } = Tabs;
const Index = ({
  maListLineDs,
  maChangeLineDs,
  customizeTable,
  customizeBtnGroup,
  maDetailListDs,
  remoteProps,
}) => {
  const [normalCount, setNormalCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [currenttab, setCurrenttab] = useState('normal');
  const [tableStatus, setTableStatus] = useState('header');
  const [showContent, setShowContent] = useState(false);
  const [statusConfigId, setStatusConfigId] = useState(null); // 获取初始statusConfigId
  const [initStatusBtnConfig, setInitStatusBtnConfig] = useState([]); // 获取列表界面的按钮操作
  const [statusBtnConfig, setStatusBtnConfig] = useState({}); // 当前单据状态不同的状态，按钮显示不同的逻辑
  const [isSupplier] = useState(!location.pathname?.includes('purchaser')); // 是否供应商
  // 保存调用
  const { renderExtendCuxEditBtn } = remoteProps?.props?.process || {};
  const saveCurrentData = async (formDs, tableDS, maExpandDs, maHeaderId) => {
    const updateFlag = await formDs.validate();
    const updateLineFlag = await tableDS.validate();
    const updateExpandLineFlag = await maExpandDs.validate();
    if (updateFlag && updateLineFlag && updateExpandLineFlag) {
      const [headerInfo] = formDs.toJSONData();
      const maLineList = tableDS.toJSONData();
      const mouldAccountLineExpandList = maExpandDs.toJSONData();
      return new Promise(resolve => {
        saveData({
          ...headerInfo,
          maLineList,
          mouldAccountLineExpandList,
          tenantId: organizationId,
          statusConfigId,
          customizeUnitCode:
            'SIEC.MOULD_PLATFORM.DETAIL.LIST,SIEC.MOULD_PLATFORM.DETAIL.HEADER,SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
        })
          .then(res => {
            const resData = getResponse(res);
            if (resData && resData.maHeaderId && !resData.failed) {
              formDs.setState({
                maHeaderIdC: res.maHeaderId,
              });
              if (!maHeaderId) {
                notification.success();
                formDs.setQueryParameter('newMaHeaderId', res.maHeaderId);
                formDs.query();
                maListLineDs.query().then(data => {
                  const normalNum = data
                    ? data.totalElements > 99
                      ? '99+'
                      : data.totalElements
                    : null;
                  setNormalCount(normalNum);
                });
              } else {
                notification.success();
                formDs.query();
              }
            }
          })
          .finally(() => {
            resolve();
          });
      });
    } else {
      return false;
    }
  };

  // 下发
  const publishCurrentData = async (formDs, tableDS, maExpandDs) => {
    const updateFlag = await formDs.validate();
    const updateLineFlag = await tableDS.validate();
    const maLineExpandFlag = await maExpandDs.validate();
    if (!updateFlag || !updateLineFlag || !maLineExpandFlag) {
      return;
    }
    const headerError = formDs.getValidationErrors();
    const lineError = tableDS.getValidationErrors();
    if (headerError.length === 0 && lineError.length === 0) {
      const [headerInfo] = formDs.toJSONData();
      const maLineList = tableDS.toJSONData();
      const mouldLineExpandList = maExpandDs.toJSONData();
      return new Promise((resolve, reject) => {
        publishData({
          ...headerInfo,
          maLineList,
          mouldLineExpandList,
          tenantId: organizationId,
          statusConfigId,
        }).then(res => {
          const resData = getResponse(res);
          if (resData && !resData?.failed) {
            notification.success();
            if (currenttab === 'normal') {
              maListLineDs.query();
            } else {
              maChangeLineDs.query();
            }
            Modal.destroyAll();
            resolve();
          } else {
            reject();
          }
        });
      });
    }
  };

  // 删除
  const deleteCurrentData = formDs => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.removeData`).d('确定删除数据'),
      onOk: () => {
        formDs.reset();
        const [headerInfo] = formDs.toJSONData();
        return new Promise(resolve => {
          deleteData({ ...headerInfo, tenantId: organizationId, statusConfigId }).then(res => {
            const resData = getResponse(res);
            if (resData && !resData?.failed) {
              notification.success();
              maListLineDs.query().then(data => {
                const normalNum = data
                  ? data.totalElements > 99
                    ? '99+'
                    : data.totalElements
                  : null;
                setNormalCount(normalNum);
              });
              Modal.destroyAll();
            } else {
              resolve(false);
            }
          });
        });
      },
    });
  };

  // 编辑页面的按钮组合
  const ModalBtns = observer(({ cancelBtn, formDs, tableDS, maExpandDs, maHeaderId, _record }) => {
    const maHeaderIdC = formDs.getState('maHeaderIdC');
    const currentStatus = formDs.current.get('maStatus') || 'PENDING';
    const exTendCuxBtn = isFunction(renderExtendCuxEditBtn)
      ? renderExtendCuxEditBtn({
          statusBtnConfig,
          currentStatus,
          formDs,
          tableDS,
          maExpandDs,
          maHeaderId,
          record: _record,
          currenttab,
          maListLineDs,
          maChangeLineDs,
        })
      : null;
    return (
      <div>
        {exTendCuxBtn}
        {statusBtnConfig[currentStatus] &&
          statusBtnConfig[currentStatus].some(ele => ele.operationCode === 'RELEASE') && (
            <Button
              color="primary"
              onClick={() => publishCurrentData(formDs, tableDS, maExpandDs)}
              waitType="debounce"
              wait={300}
            >
              {intl.get(`siec.mould.common.release`).d('下发')}
            </Button>
          )}
        {statusBtnConfig[currentStatus] &&
          statusBtnConfig[currentStatus].some(ele => ele.operationCode === 'SAVE') && (
            <Button
              onClick={() => saveCurrentData(formDs, tableDS, maExpandDs, maHeaderId)}
              waitType="debounce"
              wait={300}
            >
              {intl.get(`hzero.common.button.save`).d('保存')}
            </Button>
          )}

        {maHeaderIdC &&
          statusBtnConfig[currentStatus] &&
          statusBtnConfig[currentStatus].some(ele => ele.operationCode === 'DELETE') && (
            <Button onClick={() => deleteCurrentData(formDs)} waitType="debounce" wait={300}>
              {intl.get(`hzero.common.button.delete`).d('删除')}
            </Button>
          )}
        {maHeaderIdC && (
          <Button
            onClick={() => {
              openOperatorRecord(_record, maHeaderIdC);
            }}
          >
            {intl.get(`siec.mould.model.common.operatorRecord`).d('操作记录')}
          </Button>
        )}
        {cancelBtn}
      </div>
    );
  });

  // 草稿 新建Modal
  const openMaDetailModal = (maHeaderId, _record) => {
    // let currentStatus = 'PENDING';
    const modaltitle = intl.get(`siec.mould.common.detail`).d('模具详情');
    const tableDS = new DataSet(tableLineDS());
    const maExpandDs = new DataSet(maExpandLine());
    const formDs = new DataSet({
      ...maDetailDs({ maHeaderId, tableDS, maExpandDs }),
      events: {
        update: ({ name, value, record }) => {
          if (name === 'mouldLov' && value) {
            const { mouldId } = value;
            mouldMasterDataDetail(mouldId).then(res => {
              if (res && !res.failed) {
                const {
                  mouldItemList = [],
                  mouldLineExpandList = [],
                  _token,
                  creationDate,
                  objectVersionNumber,
                  ...others
                } = res;
                record.set({
                  mouldId,
                  ...others,
                });
                tableDS.loadData(mouldItemList);
                maExpandDs.loadData(mouldLineExpandList);
              }
            });
          }
        },
      },
    });
    formDs.setState({
      maHeaderIdC: maHeaderId,
    });
    if (maHeaderId) {
      formDs.setQueryParameter('newMaHeaderId', maHeaderId);
      formDs.query();
    }
    Modal.open({
      drawer: true,
      style: { width: '1200px' },
      className: styles.detailModal,
      title: modaltitle,
      closable: true,
      destroyOnClose: true,
      children: (
        <MaDetailModal
          formDs={formDs}
          tableDS={tableDS}
          showContent={showContent}
          currentStatus={maHeaderId ? _record.get('maStatus').toLocaleUpperCase() : 'PENDING'}
          maExpandDs={maExpandDs}
        />
      ),
      onCancel: () => onCancelModal(),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (_, cancelBtn) => (
        <ModalBtns
          cancelBtn={cancelBtn}
          formDs={formDs}
          tableDS={tableDS}
          maExpandDs={maExpandDs}
          maHeaderId={maHeaderId}
          _record={_record}
        />
      ),
    });
  };

  const onCancelModal = () => {
    maListLineDs.query(maListLineDs.currentPage).then(data => {
      const normalNum = data ? (data.totalElements > 99 ? '99+' : data.totalElements) : null;
      setNormalCount(normalNum);
    });
    maChangeLineDs.query(maListLineDs.currentPage).then(data => {
      const changeNum = data ? (data.totalElements > 99 ? '99+' : data.totalElements) : null;
      setChangeCount(changeNum);
    });
  };

  /**
   * 跳转到明细页
   * @param {String} maHeaderId
   */
  const redirectDetail = (record, type) => {
    const maStatus = record ? record.get('maStatus') : 'PENDING';
    if (
      type === 'normal' &&
      !maStatus?.startsWith('APPROVING') &&
      !maStatus?.startsWith('CONFORMED') &&
      !maStatus?.startsWith('CONFIRMING') &&
      !maStatus?.startsWith('SCRAPPED')
    ) {
      // 非异动 && 下发/保存
      openMaDetailModal(record ? record.get('maHeaderId') : null, record);
    } else {
      // 异动/审批/确认
      const upperMaStatus = maStatus.toLocaleUpperCase();
      const modalTitle = {
        maintain: intl.get(`siec.mould.common.maintainChange`).d('模具维修'),
        scrap: intl.get(`siec.mould.common.scrapChange`).d('模具报废'),
        modify: intl.get(`siec.mould.common.modifyChange`).d('模具变更'),
        transfer: intl.get(`siec.mould.common.changeSupplier`).d('模具转移'),
        normal: intl.get(`siec.mould.common.detail`).d('模具详情'),
      };

      Modal.open({
        drawer: true,
        style: { width: '1200px' },
        bodyStyle: { padding: 0, paddingBottom: '50px' },
        title: modalTitle[type],
        closable: true,
        destroyOnClose: true,
        children: (
          <MouldOutput
            modalHeaderId={record.get('maHeaderId')}
            changeContentIsEdit={!upperMaStatus.startsWith('APPROVING')}
            modalType={type}
            statusConfigId={statusConfigId}
            statusBtnConfig={statusBtnConfig}
            onChangeNum={onCancelModal} // 更新数量
            currentRecord={record}
            isSupplier={isSupplier}
          />
        ),
        footer: null,
      });
    }
  };

  const pageIntNum = () => {
    queryInitialOperation('MOULD_ACCOUNT').then(() => {
      Promise.all([maListLineDs.query(), maChangeLineDs.query()]).then(res => {
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
    fetchPermissions([
      isSupplier
        ? 'srm.pcn-admin.mould-manager.mould-accounts.ps.maexpend_content'
        : 'srm.pcn-admin.mould-manager.mould-accounts-purchaser.ps.maexpend_content',
    ]).then(res => {
      if (getResponse(res) && isArray(res)) {
        setShowContent(res[0]?.approve);
      }
    });
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
      // eslint-disable-next-line no-unused-expressions
      (statusList || [])?.forEach(ele => {
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
      style: { width: '800px' },
      title: intl.get(`hzero.common.button.operated`).d('操作记录'),
      closable: true,
      children: <History maHeaderId={maHeaderIdC || record.get('maHeaderId')} />,
      footer: null,
    });
  };
  const getCol = type => {
    const columns = [
      {
        name: 'maStatusMeaning',
        width: 120,
        renderer: ({ record }) =>
          colorTagRender({ record, name: 'maStatus', value: record.get('maStatus') }),
      },
      {
        name: 'maNum',
        width: 180,
        renderer: ({ text, record }) => {
          return (
            <a onClick={() => redirectDetail(record, record.get('maType').toLocaleLowerCase())}>
              {text}
            </a>
          );
        },
      },
      {
        name: 'operate',
        width: 150,
        renderer: ({ record }) => {
          const upperMaStatus = record.get('maStatus');
          const currentBtnConfig = statusBtnConfig[upperMaStatus] || [];
          return upperMaStatus === 'PENDING' ? (
            <>
              <a
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
              </a>
            </>
          ) : (
            <>
              {currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'MAINTAIN') && (
                <a
                  onClick={() => redirectDetail(record, 'maintain')}
                  style={{ marginRight: '5px' }}
                >
                  {intl.get(`siec.mould.common.button.maintain`).d('维修')}
                </a>
              )}
              {currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'TRANSFER') && (
                <a
                  onClick={() => redirectDetail(record, 'transfer')}
                  style={{ marginRight: '5px' }}
                >
                  {intl.get(`siec.mould.common.button.transfer`).d('转移')}
                </a>
              )}
              {currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'SCRAP') && (
                <a onClick={() => redirectDetail(record, 'scrap')} style={{ marginRight: '5px' }}>
                  {intl.get(`siec.mould.common.button.scrap`).d('报废')}
                </a>
              )}
              {currentBtnConfig && currentBtnConfig.some(ele => ele.operationCode === 'MODIFY') && (
                <a onClick={() => redirectDetail(record, 'modify')} style={{ marginRight: '5px' }}>
                  {intl.get(`siec.mould.common.button.modify`).d('变更')}
                </a>
              )}
              {(currentBtnConfig &&
                currentBtnConfig.some(
                  ele => !['MAINTAIN', 'TRANSFER', 'SCRAP', 'MODIFY'].includes(ele.operationCode)
                )) ||
              !currentBtnConfig
                ? '-'
                : null}
            </>
          );
        },
      },
      {
        name: 'supplierCompanyName',
        width: 220,
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
        width: 120,
      },
      {
        width: 100,
        name: 'operatorRecord',
        renderer: ({ record }) => (
          <a onClick={() => openOperatorRecord(record)}>
            {intl.get(`hzero.common.button.operated`).d('操作记录')}
          </a>
        ),
      },
    ];
    if (type === 'change') {
      const changeCol = columns.filter(
        ele => !['usedValue', 'remainValue', 'usedQuality', 'remainQuality'].includes(ele.name)
      );
      return changeCol;
    } else {
      const changeCol = columns.filter(ele => !['operate'].includes(ele.name));
      return changeCol;
    }
  };

  const getColumns = () => {
    const columns = [
      {
        name: 'maStatusMeaning',
        width: 120,
        renderer: ({ record }) =>
          colorTagRender({ record, name: 'maStatus', value: record.get('maStatus') }),
      },
      {
        name: 'maNum',
        width: 180,
        renderer: ({ text, record }) => {
          return (
            <a onClick={() => redirectDetail(record, record.get('maType').toLocaleLowerCase())}>
              {`${text}-${record.get('lineNum')}`}
            </a>
          );
        },
      },
      {
        name: 'companyId',
        width: 220,
        renderer: ({ record }) => record.get('companyName'),
      },
      {
        name: 'supplierCompanyName',
        width: 220,
      },
      {
        name: 'mouldPrincipalId',
        width: 140,
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
    // 导出按钮
    const DoneAllBtn = [
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
                ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
                : intl.get('hzero.common.export.new').d('导出-新')
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
            buttonText={intl.get('hzero.common.button.import.new').d('导入-新')}
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

    currentDs.query();
  };

  const resetQueryDs = () => {
    let currentDs = maListLineDs;
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
                  onClick={() => redirectDetail(undefined, 'normal')}
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
        <Tabs
          className={styles.maListTabs}
          defaultActiveKey={currenttab}
          onChange={value => {
            handleChangeTab(value);
          }}
          customizable
          customizedCode="SIEC.MOULD_PLATFORM.LIST.TABS"
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
            <div style={{ height: 'calc(100vh - 252px)' }}>
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
                              maListLineDs.query();
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
                              maDetailListDs.query();
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
            <div style={{ height: 'calc(100vh - 252px)' }}>
              {customizeTable(
                {
                  code: 'SIEC.MOULD_PLATFORM.LIST.CHANGE_LIST',
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
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['hzero.common', 'siec.mould', 'entity.attachment', 'entity.company'],
  }),
  withCustomize({
    unitCode: [
      'SIEC.MOULD_PLATFORM.LIST.ACCOUNT_LIST',
      'SIEC.MOULD_PLATFORM.LIST.CHANGE_LIST',
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
  )
)(Index);
