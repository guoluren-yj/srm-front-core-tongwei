import React, { Component, Fragment } from 'react';
// import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import CommonImport from 'hzero-front/lib/components/Import';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { observer } from 'mobx-react-lite';
import cacheComponent from 'components/CacheComponent';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import cuxRemote from 'hzero-front/lib/utils/remote';
import {
  queryInitialStateCorrespondingOperation,
  queryPageInfo,
  mouldMasterDataDetail, // 明细
  mouldMasterDataCreate, // 新增
  mouldMasterDataModify, // 修改
  mouldMasterDataDelete, // 删除
  mouldMasterDataEffective, // 生效
  mouldMasterDataChange, // 变更
  batchEffective, // 批量生效
  approveMould, // 模具审批通过
  rejecteMould, // 模具审批拒绝
  revokeMould, // 模具撤销变更
  customMasterData, // 模具状态机自定义按钮接口
} from '@/services/mouldMasterData';
import History from '@/routes/Mould/OperationHistory';
import ListTable from './ListTable';
import { TableDs, LineTableDs } from './store/tableDs';
import { detailDS, tableLineDS, maExpandLineDs } from './store/detailDS';
import { getColumns, getLineColumns } from './columns';
import DetailModal from './Detail/index';

import styles from './index.less';

// const { Column } = Table;
const organizationId = getCurrentOrganizationId();
@formatterCollections({
  code: ['hzero.common', 'siec.mould', 'sprm.common'],
})
@cuxRemote(
  {
    code: 'SMDM_Mould_LIST',
    name: 'remote',
  },
  {
    process: {
      handleDsUpdate: undefined,
    },
  }
)
@WithCustomizeC7N({
  unitCode: ['SIEC.MOULD_DATA.LIST.LIST', 'SIEC.MOULD_DATA.LIST.LINE_LIST'],
})
@cacheComponent({ cacheKey: '/scux/mould/list' })
class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statusConfigId: null, // 状态机配置id
      operationCodes: [], // 状态机初始化按钮
      statusMap: new Map(), // 弹窗状态机状态按钮map
      // mouldStatus: 'DEFAULT',
      mouldId: null,
      tableStatus: 'header',
      allBtnText: {},
    };
    this.queryInitialStateCorrespondingOperation('MOULD_MAIN');
    this.tableDataDs = new DataSet(TableDs(this.getStatusConfigId.bind(this)));
    this.lineTableDataDs = new DataSet(LineTableDs(this.getStatusConfigId.bind(this)));
  }

  queryInitialStateCorrespondingOperation = async moduleCode => {
    const res = await queryInitialStateCorrespondingOperation({ moduleCode });
    if (res) {
      this.setState({ statusConfigId: res.statusConfigId });
      const operationCodes = (res.pageOperationList || []).map(item => item.operationCode);
      this.setState({ operationCodes });
      this.queryPageInfo(res.statusConfigId);
    }
  };

  queryPageInfo = async statusConfigId => {
    try {
      const res = await queryPageInfo({ statusConfigId });
      const statusMap = new Map();
      const allBtnText = {};
      if (res) {
        // eslint-disable-next-line no-unused-expressions
        (res?.statusList || [])?.forEach(item => {
          statusMap.set(item.statusCode, (item.pageOperationList || []).map(i => i.operationCode));
          (item.pageOperationList || []).forEach(e => {
            if (e && e.operationCode && e.operationDesc) {
              allBtnText[e.operationCode] = e.operationDesc;
            }
          });
        });

        this.setState({ statusMap, allBtnText });
      }
    } catch (err) {
      console.log(err);
    }
  };

  getStatusConfigId() {
    return this.state.statusConfigId;
  }

  // 保存
  handleSave = async (formDs, tableDS, maExpandDs) => {
    const { statusConfigId, mouldId } = this.state;
    const updateFlag = await formDs.validate();
    const updateLineFlag = await tableDS.validate();
    if (updateFlag && updateLineFlag) {
      const [params = {}] = formDs.toJSONData();
      params.customizeUnitCode =
        'SIEC.MOULD_DATA.DETAIL.HEADER,SIEC.MOULD_DATA.DETAIL.LIST,SIEC.MOULD_DATA.DETAIL.EXPAND_LIST';
      params.mouldItemList = tableDS.toJSONData();
      params.mouldLineExpandList = maExpandDs.toJSONData();
      params.statusConfigId = statusConfigId;
      if (!mouldId) {
        return new Promise((resolve, reject) => {
          mouldMasterDataCreate(params).then(res => {
            const resData = getResponse(res);
            if (resData && resData?.mouldId) {
              notification.success();
              this.setState({ mouldId: res.mouldId });
              this.getTableDs().query();
              formDs.setQueryParameter('mouldId', res.mouldId);
              formDs.setQueryParameter('mouldStatus', res.mouldStatus);
              mouldMasterDataDetail(res.mouldId)
                .then(() => {
                  formDs.query();
                  // const { mouldItemList, mouldLineExpandList, ...headerInfo } = data;
                  // formDs.loadData([headerInfo]);
                  // tableDS.loadData(mouldItemList);
                  // maExpandDs.loadData(mouldLineExpandList);
                  // this.setState({ mouldStatus: formDs?.current?.mouldStatus ?? 'DEFAULT' });
                  // 子组件添加@observer监听，监听ds变化，达到重新渲染
                  // detailModal.update({
                  //   children: (
                  //     <DetailModal
                  //       formDs={formDs}
                  //       tableDS={tableDS}
                  //       maExpandDs={maExpandDs}
                  //     />
                  //   ),
                  // });
                })
                .finally(() => {
                  resolve();
                });
            } else {
              reject();
            }
          });
        });
      } else {
        return new Promise((resolve, reject) => {
          mouldMasterDataModify(params).then(res => {
            const resData = getResponse(res);
            if (resData && resData.mouldId) {
              // this.getDetailData(res.mouldId).then(() => notification.success());
              mouldMasterDataDetail(this.state.mouldId).then(data => {
                notification.success();
                const { mouldItemList, mouldLineExpandList, ...headerInfo } = data;
                formDs.loadData([headerInfo]);
                tableDS.loadData(mouldItemList);
                maExpandDs.loadData(mouldLineExpandList);
                resolve();
              });
            } else {
              reject();
            }
          });
        });
      }
    } else {
      const headerError = await formDs.getValidationErrors();
      const LineError = await tableDS.getValidationErrors();
      console.log(headerError, LineError);
    }
  };

  // 生效
  handleEffective = async (formDs, tableDS, maExpandDs) => {
    const { statusConfigId } = this.state;
    const params = formDs.toData()[0];
    params.mouldItemList = tableDS.toJSONData();
    params.mouldLineExpandList = maExpandDs.toJSONData();
    params.statusConfigId = statusConfigId;
    const updateFlag = await formDs.validate();
    const updateLineFlag = await tableDS.validate();
    if (updateFlag && updateLineFlag) {
      return new Promise((resolve, reject) => {
        mouldMasterDataEffective(params).then(res => {
          const resData = getResponse(res);
          if (resData) {
            notification.success();
            this.getTableDs().query();
            Modal.destroyAll();
            resolve();
          } else {
            reject();
          }
        });
      });
    } else {
      const headerError = await formDs.getValidationErrors();
      const LineError = await tableDS.getValidationErrors();
      console.log(headerError, LineError);
    }
  };

  // 状态机自定义按钮
  handleCustom = async (formDs, tableDS, maExpandDs, operateCode) => {
    const { statusConfigId } = this.state;
    const params = formDs.toData()[0];
    params.mouldItemList = tableDS.toJSONData();
    params.mouldLineExpandList = maExpandDs.toJSONData();
    params.statusConfigId = statusConfigId;
    params.operateCode = operateCode;
    const updateFlag = await formDs.validate();
    const updateLineFlag = await tableDS.validate();
    if (updateFlag && updateLineFlag) {
      return new Promise((resolve, reject) => {
        customMasterData(params).then(res => {
          const resData = getResponse(res);
          if (resData) {
            notification.success();
            this.getTableDs().query();
            Modal.destroyAll();
            resolve();
          } else {
            reject();
          }
        });
      });
    } else {
      const headerError = await formDs.getValidationErrors();
      const LineError = await tableDS.getValidationErrors();
      console.log(headerError, LineError);
    }
  };

  // 审批通过
  handleApprove = async (formDs, tableDS, maExpandDs) => {
    const { statusConfigId } = this.state;
    return Modal.confirm({
      title: intl.get(`siec.mould.message.confirm.mouldApprove`).d('确定进行审批通过？'),
      onOk: () => {
        const params = formDs.toData()[0];
        params.statusConfigId = statusConfigId;
        params.mouldItemList = tableDS.toData();
        params.mouldLineExpandList = maExpandDs.toJSONData();
        return new Promise(resolve => {
          approveMould(params).then(res => {
            const resData = getResponse(res);
            if (resData && !resData?.failed) {
              notification.success();
              this.getTableDs().query();
              Modal.destroyAll();
              resolve();
            } else {
              resolve();
            }
          });
        });
      },
    });
  };

  // 审批拒绝
  handleReject = async (formDs, tableDS, maExpandDs) => {
    const { statusConfigId } = this.state;
    return Modal.confirm({
      title: intl.get(`siec.mould.message.confirm.mouldReject`).d('确定进行审批拒绝？'),
      onOk: () => {
        const params = formDs.toData()[0];
        params.statusConfigId = statusConfigId;
        params.mouldItemList = tableDS.toData();
        params.mouldLineExpandList = maExpandDs.toJSONData();
        return new Promise(resolve => {
          rejecteMould(params).then(res => {
            const resData = getResponse(res);
            if (resData && !resData.failed) {
              notification.success();
              this.getTableDs().query();
              Modal.destroyAll();
              resolve();
            } else {
              resolve();
            }
          });
        });
      },
    });
  };

  // 撤销变更
  handleRevoke = async (formDs, tableDS, maExpandDs) => {
    const { statusConfigId } = this.state;
    return Modal.confirm({
      title: intl.get(`siec.mould.message.confirm.mouldRevoke`).d('确定进行撤销变更？'),
      onOk: () => {
        const params = formDs.toData()[0];
        params.statusConfigId = statusConfigId;
        params.mouldItemList = tableDS.toData();
        params.mouldLineExpandList = maExpandDs.toJSONData();
        return new Promise(resolve => {
          revokeMould(params).then(res => {
            const resData = getResponse(res);
            if (resData && !resData.failed) {
              notification.success();
              this.getTableDs().query();
              Modal.destroyAll();
              resolve();
            } else {
              resolve();
            }
          });
        });
      },
    });
  };

  // 删除
  handleDelete = (formDs, tableDS, maExpandDs) => {
    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.removeData`).d('确定删除数据'),
      onOk: () => {
        const params = formDs.toData()[0];
        params.mouldItemList = tableDS.toData();
        params.mouldLineExpandList = maExpandDs.toJSONData();
        return new Promise(resolve => {
          mouldMasterDataDelete(params).then(res => {
            const resData = getResponse(res);
            if (resData) {
              notification.success();
              this.getTableDs().query();
              Modal.destroyAll();
              resolve();
            } else {
              resolve();
            }
          });
        });
      },
    });
  };

  // 变更
  handleChange = (formDs, tableDS, maExpandDs) => {
    const { statusConfigId } = this.state;
    return Modal.confirm({
      title: intl.get(`siec.mould.message.confirm.mouldChange`).d('确定进行模具变更？'),
      onOk: () => {
        const params = formDs.toData()[0];
        params.statusConfigId = statusConfigId;
        params.mouldItemList = tableDS.toData();
        params.mouldLineExpandList = maExpandDs.toJSONData();
        return new Promise(resolve => {
          mouldMasterDataChange(params).then(res => {
            const resData = getResponse(res);
            if (resData && !resData.failed) {
              notification.success();
              this.getTableDs().query();
              Modal.destroyAll();
              resolve();
            } else {
              resolve();
            }
          });
        });
      },
    });
  };

  openDetailModal = (record = null) => {
    const { statusMap, allBtnText } = this.state;
    const { handleDsUpdate } = this.props.remote?.props?.process || {};
    const mouldId = record ? record.get('mouldId') : null;
    const mouldStatus = record ? record.get('mouldStatus') : null;
    this.setState({ mouldId });
    const modaltitle = record
      ? record.get('mouldStatus') === 'NEW'
        ? intl.get('siec.mould.model.common.editMould').d('编辑模具')
        : intl.get('siec.mould.model.common.mouldDetail').d('模具主数据详情')
      : intl.get('siec.mould.model.common.createMould').d('新建模具');
    // let mouldStatus = 'DEFAULT';
    const tableDS = new DataSet(tableLineDS());
    const maExpandDs = new DataSet(maExpandLineDs());
    const formDs = new DataSet(detailDS({ tableDS, maExpandDs, handleDsUpdate }));
    if (mouldId) {
      formDs.setQueryParameter('mouldId', mouldId);
      formDs.setQueryParameter('mouldStatus', mouldStatus);
      // const data = await mouldMasterDataDetail(
      //   mouldId,
      //   mouldStatus === 'EFFECTIVE'
      //     ? 'SIEC.MOULD_DATA.DETAIL.HEADER_CHANGE,SIEC.MOULD_DATA.DETAIL.LIST,SIEC.MOULD_DATA.DETAIL.EXPAND_LIST'
      //     : undefined
      // );
      // if (data) {
      //   const { mouldItemList, mouldLineExpandList, ...headerInfo } = data;
      formDs.query();
      // this.setState({ mouldStatus: formDs?.current?.mouldStatus ?? 'DEFAULT' });
      // }
    }

    const onCancelModal = () => {
      const currentTabDs = this.getTableDs();
      this.getTableDs().query(currentTabDs?.currentPage);
    };

    /**
     * 打开操作记录
     * @param {String} mouldId
     */
    const openOperatorRecord = () => {
      Modal.open({
        key: Modal.key(),
        destroyOnClose: true,
        drawer: true,
        style: { width: '800px' },
        title: intl.get(`hzero.common.button.operated`).d('操作记录'),
        closable: true,
        children: <History mouldId={mouldId || this.state.mouldId} />,
        footer: null,
      });
    };

    const ObserverBtn = observer(({ btnStatus, fn, text, color }) => {
      const currentStatus = formDs?.current?.get('mouldStatus') || 'DEFAULT';
      const changeApprovalMethod = formDs?.current?.get('changeApprovalMethod');
      const changeButtonNotAvailableFlag = formDs?.current?.get('changeButtonNotAvailableFlag');
      console.log(statusMap);
      return statusMap.size &&
        statusMap.get(currentStatus) &&
        statusMap.get(currentStatus).includes(btnStatus) &&
        (changeApprovalMethod === 'FUNCTIONAL' || currentStatus !== 'CHANGE_APPROVING') ? (
          <Button
            color={color}
            onClick={fn}
            waitType="debounce"
            wait={300}
            disabled={[1, '1'].includes(changeButtonNotAvailableFlag)}
          >
            {text}
          </Button>
      ) : null;
    });

    const CustomBtnList = observer(() => {
      const currentStatus = formDs?.current?.get('mouldStatus') || 'DEFAULT';
      const customBtn = statusMap
        .get(currentStatus)
        ?.filter(
          e =>
            ![
              'SAVE',
              'EFFECTIVE',
              'DELETE',
              'NEW',
              'CHANGE',
              'Decv',
              'CHANGE_REVOKE',
              'CHANGE_APPROVED',
              'CHANGE_REJECTED',
            ].includes(e)
        );
      return (customBtn || []).map(e =>
        statusMap.size &&
        statusMap.get(currentStatus) &&
        statusMap.get(currentStatus).includes(e) ? (
          <Button
            onClick={() => this.handleCustom(formDs, tableDS, maExpandDs, e)}
            waitType="debounce"
            wait={300}
          >
            {allBtnText[e]}
          </Button>
        ) : null
      );
    });

    const OperationBtn = observer(() => {
      return formDs?.current?.get('mouldId') || mouldId ? (
        <Button onClick={() => openOperatorRecord()}>
          {intl.get(`hzero.common.button.operation`).d('操作记录')}
        </Button>
      ) : null;
    });

    Modal.open({
      drawer: true,
      style: { width: '1200px' },
      className: styles.detailModal,
      title: modaltitle,
      closable: true,
      destroyOnClose: true,
      children: (
        <DetailModal
          formDs={formDs}
          tableDS={tableDS}
          maExpandDs={maExpandDs}
          statusMap={statusMap}
        />
      ),
      onCancel: () => onCancelModal(),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (_, cancelBtn) => (
        <div>
          <ObserverBtn
            fn={() => this.handleEffective(formDs, tableDS, maExpandDs)}
            color="primary"
            btnStatus="EFFECTIVE"
            text={intl.get('siec.mould.common.button.effective').d('生效')}
          />
          <ObserverBtn
            fn={() => this.handleApprove(formDs, tableDS, maExpandDs)}
            btnStatus="CHANGE_APPROVED"
            text={intl.get('siec.mould.common.button.approve').d('审批通过')}
          />
          <ObserverBtn
            fn={() => this.handleReject(formDs, tableDS, maExpandDs)}
            btnStatus="CHANGE_REJECTED"
            text={intl.get('siec.mould.common.button.reject').d('审批拒绝')}
          />
          <ObserverBtn
            fn={() => this.handleRevoke(formDs, tableDS, maExpandDs)}
            btnStatus="CHANGE_REVOKE"
            text={intl.get('siec.mould.common.button.revoke').d('撤销变更')}
          />
          <ObserverBtn
            fn={() => this.handleSave(formDs, tableDS, maExpandDs)}
            btnStatus="SAVE"
            text={intl.get(`hzero.common.button.save`).d('保存')}
          />
          <ObserverBtn
            fn={() => this.handleDelete(formDs, tableDS, maExpandDs)}
            btnStatus="DELETE"
            text={intl.get('hzero.common.button.delete').d('删除')}
          />
          <ObserverBtn
            fn={() => this.handleChange(formDs, tableDS, maExpandDs)}
            btnStatus="CHANGE"
            text={intl.get('hzero.common.button.change').d('变更')}
          />
          <CustomBtnList />
          <OperationBtn />
          {cancelBtn}
        </div>
      ),
    });
  };

  getQueryFrom = () => {
    const { statusConfigId, tableStatus } = this.state;
    const dataSet = this.getTableDs();
    const key = tableStatus === 'header' ? 'mouldId' : 'mouldItemId';
    const customizeUnitCode =
      tableStatus === 'header'
        ? 'SIEC.MOULD_DATA.LIST.SEARCH_BAR,SIEC.MOULD_DATA.LIST.LIST'
        : 'SIEC.MOULD_DATA.LIST.LINE_LIST,SIEC.MOULD_DATA.LIST.LINE_SEARCH_BAR';
    const selectedDate = dataSet.selected ? dataSet.selected.map(ele => ele.toData()) : [];
    if (selectedDate.length > 0) {
      return { statusConfigId, [`${key}s`]: selectedDate.map(ele => ele[key]) };
    } else {
      const queryData = dataSet.queryDataSet.toData();
      const currentQueryDate = queryData[0];
      return currentQueryDate
        ? filterNullValueObject({
            statusConfigId,
            ...currentQueryDate,
            customizeUnitCode,
          })
        : {};
    }
  };

  // 批量生效
  handleBatchEffective = () => {
    const { statusConfigId } = this.state;
    const data = this.tableDataDs.selected.map(record => ({
      ...record.toData(),
      statusConfigId,
    }));
    return new Promise((resolve, reject) => {
      batchEffective(data).then(res => {
        const resData = getResponse(res);
        if (resData) {
          notification.success();
          this.tableDataDs.query();
          resolve();
        } else {
          reject();
        }
      });
    });
  };

  setTableStatus = tableStatus => {
    if (tableStatus === 'header') {
      this.tableDataDs.query();
    } else {
      this.lineTableDataDs.query();
    }
    this.setState({
      tableStatus,
    });
  };

  getTableDs = () => {
    const { tableStatus } = this.state;

    return tableStatus === 'header' ? this.tableDataDs : this.lineTableDataDs;
  };

  render() {
    const { operationCodes, statusMap, tableStatus } = this.state;
    const { customizeTable, remote } = this.props;
    const DoneAllBtn = observer(({ dataSet }) => {
      const templateCode =
        tableStatus === 'header' ? 'SIEC_MOULD_DATA_EXPORT' : 'SIEC_MOULD_ITEM_EXPORT';
      const requestUrl =
        tableStatus === 'header'
          ? `${SRM_SIEC}/v1/${organizationId}/mould/list/export`
          : `${SRM_SIEC}/v1/${organizationId}/mould/list-item/export`;
      return (
        <>
          {operationCodes && operationCodes.includes('SAVE') && (
            <Button color="primary" onClick={() => this.openDetailModal(null)} icon="add">
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          )}

          <ExcelExportPro
            templateCode={templateCode}
            method='POST'
            buttonText={
              dataSet.selected.length > 0
                ? intl.get('sprm.common.button.exportSelect').d('勾选导出-新')
                : intl.get('hzero.common.export.new').d('导出-新')
            }
            requestUrl={requestUrl}
            queryParams={() => this.getQueryFrom()}
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: 'srm.pcn-admin.mould-manager.mould-data.ps.export',
                  type: 'button',
                },
              ],
            }}
          />
          <CommonImport
            prefixPatch={`${SRM_SIEC}`}
            businessObjectTemplateCode="SIEC_MOULD_DATA_IMPORT"
            buttonProps={{
              type: 'c7n-pro',
              funcType: 'flat',
              permissionList: [
                {
                  code: `srm.pcn-admin.mould-manager.mould-data.ps.import`,
                  type: 'button',
                  meaning: '导入-新',
                },
              ],
            }}
            buttonText={intl.get('hzero.common.button.import.new').d('导入-新')}
          />
          {tableStatus === 'header' &&
          statusMap.size &&
          statusMap.get(`NEW`) &&
          statusMap.get(`NEW`).includes('EFFECTIVE') ? (
            <Button
              funcType="flat"
              type="c7n-pro"
              disabled={
                !dataSet.selected?.length ||
                !dataSet.selected.every(record => record.get('mouldStatus') === 'NEW')
              }
              waitType="debounce"
              wait={300}
              onClick={() => this.handleBatchEffective()}
            >
              {intl.get('siec.mould.common.button.effective').d('生效')}
            </Button>
          ) : null}
        </>
      );
    });
    return (
      <Fragment>
        <Header title={intl.get('siec.mould.modal.title').d('模具主数据')}>
          <DoneAllBtn
            dataSet={tableStatus === 'header' ? this.tableDataDs : this.lineTableDataDs}
          />
        </Header>
        <Content>
          {tableStatus === 'header' ? (
            <ListTable
              code="SIEC.MOULD_DATA.LIST.LIST"
              searchCode="SIEC.MOULD_DATA.LIST.SEARCH_BAR"
              dataSet={this.tableDataDs}
              columns={
                remote
                  ? remote.process(
                      'SMDM_Mould_LIST_PROCESS_COLUMNS',
                      getColumns(this.openDetailModal)
                    )
                  : getColumns(this.openDetailModal)
              }
              tableStatus={tableStatus}
              customizeTable={customizeTable}
              key="header"
              setTableStatus={this.setTableStatus}
            />
          ) : (
            <ListTable
              code="SIEC.MOULD_DATA.LIST.LINE_LIST"
              searchCode="SIEC.MOULD_DATA.LIST.LINE_SEARCH_BAR"
              dataSet={this.lineTableDataDs}
              columns={
                remote
                  ? remote.process(
                      'SMDM_Mould_LIST_PROCESS_LINE_COLUMNS',
                      getLineColumns(this.openDetailModal)
                    )
                  : getLineColumns(this.openDetailModal)
              }
              tableStatus={tableStatus}
              customizeTable={customizeTable}
              key="line"
              setTableStatus={this.setTableStatus}
            />
          )}
        </Content>
      </Fragment>
    );
  }
}

export default Index;
