/**
 * index.js - 供应商录入
 * @date: 2022-03-14
 * @author: CDJ <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import querystring from 'querystring';
import { isEmpty, compose } from 'lodash';
import { Spin, Alert } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { DataSet, Modal, Tabs, notification, useDataSet } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useEffect, useState, useMemo } from 'react';

import remote from 'utils/remote';
import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getResponse, filterNullValueObject } from 'utils/utils';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { operationRecordsModal } from '@/routes/components/OperationRecords';

import { renderStatus, tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { checkBlackListSupplier } from '@/routes/components/utils/commonCheckUtils/blackListSupplier';
import { handleQueryCount, handleDeleteEntry } from '@/services/supplierEntryService';
import { fetchSettings } from '@/services/commonService';
import { queryMenuPermissions } from '@/services/workbenchService';
import { createEntryForm } from '../../services/supplierEntryService';
import { getTabs, getJumpUrl } from './utils';

import { getCreateFormDs, getOperateTypeDs } from './stores/createForm.js';
import { indexDS } from './stores/indexDS';
import CreateForm from './CreateForm';
import ModalChildren from './ModalChildren';
import HeaderBtn from './HeaderBtns';

import styles from './index.less';

const { TabPane } = Tabs;

const Index = ({
  dispatch,
  tableDs,
  location,
  customizeTable,
  createFormDs,
  customizeTabPane,
  custLoading,
  entryListRemote,
}) => {
  const operateTypeDs = useDataSet(() => getOperateTypeDs(), []);
  const [currentTabKey, setCurrentTabKey] = useState('all');
  const [count, setCount] = useState({});
  const [loading, setLoading] = useState(false);
  const tabs = useMemo(() => getTabs(), []);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [textSearchFlag, setTextSearchFlag] = useState(false);

  const [menuPermissionsFlag, setMenuPermissionsFlag] = useState(false); // 判断当前用户是否有菜单权限

  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const { supplierCompanyName, unifiedSocialCode, sourceType } = routerParams;

  const openCreateModal = sourceType === 'EXTERNAL';

  // 供应商管理工作台，操作指引跳转进来，默认打开新建弹框
  useEffect(() => {
    if (supplierCompanyName || openCreateModal) {
      createFormDs.current.set({
        companyName: supplierCompanyName,
        unifiedSocialCode,
      });
      handleCreate();
    }
  }, [supplierCompanyName, unifiedSocialCode, openCreateModal]);

  // 查询角色菜单权限
  const handleMenuPermissions = useCallback(() => {
    queryMenuPermissions({
      code: 'srm.partner.my-partner.supplier-inform-change-new',
    }).then(res => {
      if (getResponse(res)) {
        setMenuPermissionsFlag(res['srm.partner.my-partner.supplier-inform-change-new']);
      }
    });
  }, []);

  let createModal;
  let operateGuideMdal;

  const columns = [
    {
      name: 'reqStatusMeaning',
      width: 120,
      lock: true,
      renderer: renderStatus,
    },
    {
      name: 'action',
      width: 120,
      lock: true,
      renderer: ({ record }) => {
        const { reqStatus, changeReqId } = record.data;
        const params = { documentType: 'SUPPLIER_ENTRY', documentId: changeReqId, changeReqId };
        return ['NEW', 'REJECTED'].includes(reqStatus) ? (
          <Fragment>
            <a
              onClick={() => handleJumpDetail(record, 'edit')}
              style={{
                marginRight: '8px',
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a onClick={() => operationRecordsModal(params)}>
              {intl.get('hzero.common.button.operation').d('操作记录')}
            </a>
          </Fragment>
        ) : (
          <Fragment>
            <a onClick={() => operationRecordsModal(params)}>
              {intl.get('hzero.common.button.operation').d('操作记录')}
            </a>
          </Fragment>
        );
      },
    },
    {
      name: 'changeReqNumber',
      width: 150,
      renderer: ({ value, record }) => (
        <a onClick={() => handleJumpDetail(record, 'view')}>{value}</a>
      ),
    },
    {
      name: 'partnerCompanyNum',
      width: 150,
    },
    {
      name: 'partnerCompanyName',
      width: 200,
    },
    {
      name: 'createUserName',
      width: 150,
    },
    {
      name: 'creationDate',
      width: 130,
    },
  ];

  /**
   * 跳转详情页
   */
  const handleJumpDetail = useCallback((record, editStatus) => {
    const {
      data: { changeReqId },
    } = record;
    dispatch(
      routerRedux.push({
        pathname: `/sslm/supplier-entry/detail/${changeReqId}/${editStatus}`,
      })
    );
  }, []);

  /**
   * 处理继续录入
   */
  const handleContinueAttestation = async () => {
    const formValues = createFormDs.current.toData();
    // 获取操作选项标识
    const { firstType, secondType } = operateTypeDs?.current?.get(['firstType', 'secondType']);
    const partnerFlag = firstType === 'createPartnership' || secondType === 'createPartnership';
    const payload = {
      ...formValues,
      checkFlag: false,
      buildNewPartnerFlag: partnerFlag ? 1 : 0, // 选择新增合作关系传1
    };
    const res = await createEntryForm(payload);
    if (getResponse(res)) {
      operateGuideMdal.close();
      createModal.close();
      notification.success({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      handleJumpDetail({ data: res }, 'create');
    }
    return false;
  };

  const handleCreateOk = async () => {
    const formValues = createFormDs.current.toData();
    const checkResult = await createFormDs.validate();
    const payload = {
      ...formValues,
      checkFlag: true,
    };
    if (checkResult) {
      // 校验
      return handleCreateCheck(payload);
    } else {
      return false;
    }
  };

  const handleCreateCheck = async (params = {}) => {
    const blackListParam = {
      supplierInfo: { ...params },
      effectiveType: 'supplierEntry',
    };
    const blackListRes = await checkBlackListSupplier(blackListParam);
    if (blackListRes) {
      return createEntryForm(params).then(res => {
        if (getResponse(res)) {
          const { terminationFlag = false } = res;
          // 接口返回成功增加埋点额外的弹窗提示
          const result = entryListRemote
            ? entryListRemote.process('SSLM_SUPPLIER_ENTRY_LIST_CHECK_PROCESS', res, {})
            : res;
          if (!terminationFlag) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            createFormDs.reset();
            handleJumpDetail({ data: result }, 'create');
          } else {
            // 存在唯一认证
            handleOperateGuide(result);
            return false;
          }
        } else {
          return false;
        }
      });
    }
    return blackListRes;
  };

  const handleJumpOtherPage = (selectValue, newRegisterFlag, supplierInfo = {}) => {
    const { partnerCompanyId } = supplierInfo;
    const urlObj = getJumpUrl({ newRegisterFlag, name: selectValue, menuPermissionsFlag });

    let params = {};
    if (selectValue === 'updateSupplier' && menuPermissionsFlag) {
      params = {
        supplierCompanyId: partnerCompanyId,
      };
    }
    const { url = '' } = urlObj || {};
    dispatch(
      routerRedux.push({
        pathname: url,
        search: querystring.stringify(filterNullValueObject(params)),
      })
    );
  };
  const handleModalOk = ({
    newRegisterFlag = false,
    moreOneStepFlag = false,
    supplierInfo = {},
  } = {}) => {
    const { firstType, secondType } = operateTypeDs?.current?.get(['firstType', 'secondType']);
    // 是否需要校验第二个步骤
    const needCheckSecond = firstType === 'continueEntry' && moreOneStepFlag;
    // 当步骤条超过1个时，根据第一个步骤条选的值，判断第二个步骤条选的值：第一个步骤为continueEntry，第二个没值需报错
    // checkSecondType: false通过，true 不通过，默认通过
    const checkSecondType = needCheckSecond ? !secondType : false;
    if (!firstType || checkSecondType) {
      notification.error({
        placement: 'bottomRight',
        message: intl.get('sslm.supplierEntry.view.message.operateType').d('请选择操作类型'),
      });
      return false;
    }
    // 处理跳转其他页面
    let goToOtherPage = false;
    let pageType = '';
    if (!needCheckSecond) {
      goToOtherPage = ['sendInvite', 'updateSupplier', 'viewSupplier'].includes(firstType);
      pageType = firstType;
    } else {
      goToOtherPage = ['sendInvite', 'updateSupplier', 'viewSupplier'].includes(secondType);
      pageType = secondType;
    }
    if (goToOtherPage) {
      operateGuideMdal.close();
      createModal.close();
      handleJumpOtherPage(pageType, newRegisterFlag, supplierInfo);
    } else {
      return handleContinueAttestation();
    }
  };

  const handleOperateGuide = (result = {}) => {
    // 每次打开弹窗重置ds
    operateTypeDs.reset();
    const { enteringCheckVo = {} } = result;
    const {
      newRegisterFlag,
      urlRegisterBeforeFlag,
      partnerType,
      privateFlag,
      partnerVOS = [],
    } = enteringCheckVo;
    // partnerType 0 完全合作  1 部分合作  2 完全未合作
    const partPartnerShipFlag = partnerType === 1;
    // 协同标识
    const coordinationFlag = urlRegisterBeforeFlag === 1 || privateFlag === 0;
    // 部分合作且有协同，展示步骤条
    const moreOneStepFlag = partPartnerShipFlag && coordinationFlag;
    operateGuideMdal = Modal.open({
      key: Modal.key(),
      title: intl.get('sslm.supplierEntry.view.message.operateGuide').d('操作指引'),
      cancelText: intl.get('hzero.common.button.cance').d('取消'),
      okFirst: true,
      destroyOnClose: true,
      children: <ModalChildren childrenProps={enteringCheckVo} operateTypeDs={operateTypeDs} />,
      onOk: () =>
        handleModalOk({
          newRegisterFlag,
          moreOneStepFlag,
          supplierInfo: isEmpty(partnerVOS) ? {} : partnerVOS[0],
        }),
      drawer: true,
      style: {
        width: 400,
      },
      bodyStyle: {
        padding: 0,
      },
    });
  };

  // 新建回调
  const handleCreate = useCallback(() => {
    createModal = Modal.open({
      key: Modal.key(),
      drawer: true,
      style: {
        width: 400,
      },
      className: styles.createModal,
      bodyStyle: {
        padding: 0,
        overflow: 'hidden',
      },
      title: intl.get('sslm.supplierEntry.view.title.preInfor').d('预录入信息'),
      okText: intl.get('hzero.common.button.confirm').d('确认'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      okFirst: true,
      destroyOnClose: true,
      children: (
        <Fragment>
          <Alert
            banner
            showIcon
            closable
            type="info"
            iconType="help"
            className={styles.supEntryAlert}
            message={intl
              .get('sslm.supplierEntry.view.alert.createWarning')
              .d(
                '请正确完整地填写真实有效的企业关键信息以查询企业是否已在平台认证，若查询无结果则直接进入录入页面，在预录入内容的基础上维护其他信息，预录入的内容不允许变更。'
              )}
          />
          <CreateForm dataSet={createFormDs} textSearchFlag={textSearchFlag} />
        </Fragment>
      ),
      onOk: handleCreateOk,
      afterClose: () => {
        createFormDs.reset();
      },
    });
  }, [textSearchFlag, menuPermissionsFlag]);

  const handleDelete = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.supplierEntryDetail.view.message.deleteReqConfirm').d('确认删除？'),
      onOk: () => {
        const params = tableDs.selected.map(item => {
          return item.data.changeReqId;
        });
        setDeleteLoading(true);
        handleDeleteEntry(params)
          .then(res => {
            if (getResponse(res)) {
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              tableDs.unSelectAll(); // 详情页返回清空勾选
              tableDs.clearCachedSelected();
              tableDs.query(tableDs.currentPage);
            }
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      },
    });
  };

  // 筛选器左侧渲染
  // const renderLeftSearchBar = useCallback(() => {
  //   return (
  //     <MultipleTextField
  //       dataSet={tableDs}
  //       name="multiSelectReqNums"
  //       placeholder={intl.get('sslm.common.modal.sample.multiSelectReqNums').d('请输入申请单号')}
  //     />
  //   );
  // }, []);

  // 查询供应商录入列表
  const queryEntryList = ({ params }) => {
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = tableDs.queryDataSet?.current?.toData();
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectReqNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current?.set({
      ...params,
      ...clearParams,
    });
    setLoading(true);
    tableDs.query(tableDs.currentPage).finally(() => setLoading(false));
  };

  // 清空、重置回调
  const clearValues = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current.reset();
  }, []);

  const queryList = newActiveKey => {
    const activeKey = newActiveKey || currentTabKey;
    switch (activeKey) {
      case 'submitted':
        tableDs.setQueryParameter('reqStatusList', ['NEW', 'REJECTED']);
        break;

      case 'approvaling':
        tableDs.setQueryParameter('reqStatusList', ['APPROVING']);
        break;

      default:
        tableDs.setQueryParameter('reqStatusList', null);
        break;
    }
    setLoading(true);
    tableDs.query(tableDs.currentPage).finally(() => setLoading(false));
  };

  useEffect(() => {
    // tableDs.query(tableDs.currentPage);
    queryList();
    handleQueryCount().then(res => {
      if (getResponse(res)) {
        setCount(res);
      }
    });
    // 查询平台征信配置，取配置5
    platformCreditConfig();
    // 查询菜单权限
    handleMenuPermissions();
    // 页面卸载调用
    return () => {
      tableDs.unSelectAll(); // 详情页返回清空勾选
      tableDs.clearCachedSelected();
    };
  }, []);

  const platformCreditConfig = useCallback(() => {
    fetchSettings().then(response => {
      const res = getResponse(response);
      if (res) {
        setTextSearchFlag(res['000108'] === '1');
      }
    });
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sslm.supplierEntry.view.title.supplierEntry').d('供应商录入')}>
        <HeaderBtn
          dataSet={tableDs}
          handleDelete={handleDelete}
          handleCreate={handleCreate}
          loading={loading}
          deleteLoading={deleteLoading}
          queryList={queryList}
          currentTabKey={currentTabKey}
          entryListRemote={entryListRemote}
        />
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTabPane(
            {
              code: 'SSLM.SUPPLIER_ENTRY_LIST.TABPANE',
            },
            <Tabs
              activeKey={currentTabKey}
              animated={false}
              onChange={newActiveKey => {
                setCurrentTabKey(newActiveKey);
                queryList(newActiveKey);
              }}
            >
              {tabs.map(({ key, tab, searchBarCode, countCode }) => {
                return (
                  <TabPane tab={`${tab} ${count[countCode] || ''}`} key={key}>
                    <div style={{ height: tableHeight.hasTab }}>
                      {customizeTable(
                        {
                          code: 'SSLM.SUPPLIER_ENTRY_LIST.TABLE_LIST',
                        },
                        <SearchBarTable
                          cacheState
                          dataSet={tableDs}
                          columns={columns}
                          custLoading={custLoading}
                          searchCode={searchBarCode}
                          searchBarConfig={{
                            // left: {
                            //   render: renderLeftSearchBar,
                            // },
                            onQuery: queryEntryList,
                            onReset: clearValues,
                            onClear: clearValues,
                          }}
                          style={{
                            maxHeight: tableMaxHeight.hasTab,
                          }}
                        />
                      )}
                    </div>
                  </TabPane>
                );
              })}
            </Tabs>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.supplierEntry', 'sslm.supplierEntryDetail', 'sslm.common'],
  }),
  remote({
    code: 'SSLM_SUPPLIER_ENTRY_LIST',
    name: 'entryListRemote',
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLIER_ENTRY_LIST.TABPANE',
      'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_ALL',
      'SSLM.SUPPLIER_ENTRY_LIST.TABLE_LIST',
      'SSLM.SUPPLIER_ENTRY_LIST.SEA_APPROVALING',
      'SSLM.SUPPLIER_ENTRY_LIST.SEARCH_SUBMITTED',
    ],
  }),
  withProps(
    () => {
      const tableDs = new DataSet(indexDS());
      const createFormDs = new DataSet(getCreateFormDs());
      // const sourceResultDs = new DataSet(sourceResultDS());
      return { tableDs, createFormDs };
    },
    { cacheState: true }
  )
)(Index);
