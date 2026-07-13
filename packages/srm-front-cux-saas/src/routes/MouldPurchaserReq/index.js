import { connect } from 'dva';
import { DataSet, Modal, Button, Form, Lov, Select, Table } from 'choerodon-ui/pro';
import React, { Fragment, useCallback, useState, useEffect } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import withProps from 'utils/withProps';
import { compose, isEmpty } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import { openApproveModal } from '_components/ApproveModal';
import ApproveRecordSimple from '_components/ApproveRecordSimple';
import { checkPermission } from 'services/api';
import { colorTagRender, revokeWorkFlow } from './util';
import { batchSubmitData, changeCurrentLine, deleteBatchData } from '@/services/mouldReqService';

import { maListDs, maVisionDs, mouldReqCreate } from './indexDs';

const Index = ({ history, customizeBtnGroup, customizeTable, lineDs, ...props }) => {
  const [init, setInit] = useState(false);
  const [loadings, setLoading] = useState({});
  const [changeCreateFlag, setChangeCreateFlag] = useState(true);
  const supplierUrlFlag = location.pathname?.includes('supplier');

  const renderActionBtn = ({ record, dataSet }) => {
    const approvaFlags = dataSet.getState('approvaFlags') || {};

    const operationFlags = dataSet.getState('operationFlags') || {};
    const { mouldReqStatus, approvalMethod, mouldReqVersion, workflowBusinessKey } = record?.get([
      'mouldReqId',
      'mouldReqStatus',
      'approvalMethod',
      'mouldReqVersion',
      'workflowBusinessKey',
    ]);
    const approvaFlag = approvaFlags?.[workflowBusinessKey] || false;
    const operationFlag = operationFlags?.[workflowBusinessKey] || false;
    console.log(operationFlags?.[workflowBusinessKey], approvaFlags?.[workflowBusinessKey]);
    const allActions = {
      edit: (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleJumpDetail('edit', record)}
        >
          {intl.get(`hzero.common.button.edit`).d('编辑')}
        </Button>
      ),
      change: (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleJumpDetail('change', record)}
        >
          {intl.get(`hzero.common.button.edit`).d('编辑')}
        </Button>
      ),
      approve: (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleJumpDetail('approved', record)}
        >
          {intl.get(`siec.mould.button.approved`).d('审批')}
        </Button>
      ),
      vision: (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleVision(record)}
        >
          {intl.get(`siec.mould.button.vision`).d('历史记录')}
        </Button>
      ),
      workflowApprove: (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleWorkFlowApprove(record)}
        >
          {intl.get('hzero.common.button.approval').d('审批')}
        </Button>
      ),
      workflowRevoke: (
        <Button
          type="text"
          funcType="link"
          style={{ marginLeft: 0, marginRight: 16 }}
          onClick={() => handleRevoke(record)}
        >
          {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
        </Button>
      ),
    };
    const { edit, approve, vision, workflowApprove, workflowRevoke } = allActions;
    const btns = [];
    if (
      ['NEW', 'APPROVAL_REJECTED', 'REJECTED'].includes(mouldReqStatus) &&
      ((supplierUrlFlag && record.get('userCamp') === 'SUPPLIER') ||
        (!supplierUrlFlag && record.get('userCamp') === 'PURCHASE'))
    ) {
      btns.push(edit);
    }
    if (
      ((supplierUrlFlag && record.get('userCamp') === 'SUPPLIER') ||
        (!supplierUrlFlag && record.get('userCamp') === 'PURCHASE')) &&
      ['CHANGE_NEW', 'CHANGE_REJECTED'].includes(mouldReqStatus)
    ) {
      btns.push(edit);
    }
    if (
      ['APPROVING'].includes(mouldReqStatus) &&
      approvalMethod === 'FUNCTIONAL' &&
      !supplierUrlFlag
    ) {
      btns.push(approve);
    }
    if (
      ['APPROVING'].includes(mouldReqStatus) &&
      approvalMethod === 'WORKFLOW' &&
      !supplierUrlFlag &&
      approvaFlag
    ) {
      btns.push(workflowApprove);
    }
    if (
      ['APPROVING'].includes(mouldReqStatus) &&
      approvalMethod === 'WORKFLOW' &&
      !supplierUrlFlag &&
      operationFlag?.REVOKE
    ) {
      btns.push(workflowRevoke);
    }
    if (mouldReqVersion > 1) {
      btns.push(vision);
    }
    return btns.filter(e => e)?.length > 0 ? btns : null;
  };

  const viewDetail = ({ record, dataSet }) => {
    const simpleApprovalHistoryData = dataSet.getState('simpleApprovalHistoryData') || {};
    return (
      <ApproveRecordSimple data={simpleApprovalHistoryData[record.get('workflowBusinessKey')]} />
    );
  };

  const lineColumns = [
    {
      name: 'mouldReqStatus',
      width: 120,
      renderer: colorTagRender,
    },
    { name: 'operate', renderer: renderActionBtn, minWidth: 130 },
    {
      name: 'mouldReqNum',
      width: 160,
      renderer: ({ record, value }) => (
        <a onClick={() => handleJumpDetail('query', record)}>{value}</a>
      ),
    },
    {
      name: 'workFlowApproveProcess',
      width: 180,
      renderer: viewDetail,
      tooltip: 'none',
    },
    { name: 'mouldNum', width: 140 },
    { name: 'mouldName', width: 140 },
    { name: 'companyId', width: 220, renderer: ({ record }) => record?.get('companyName') },
    {
      name: 'supplier',
      width: 220,
      renderer: ({ record }) => record?.get('supplierCompanyName') || record?.get('supplierName'),
    },
    { name: 'createdBy', width: 140, renderer: ({ record }) => record?.get('createdByName') },
    {
      name: 'userCamp',
      width: 120,
      renderer: ({ value }) => (value ? yesOrNoRender(+(value === 'SUPPLIER')) : null),
    },
    {
      name: 'lastUpdatedBy',
      width: 120,
      renderer: ({ record }) => record?.get('lastUpdatedByName'),
    },
    { name: 'approvalMethod', renderer: ({ record }) => record?.get('approvalMethodMeaning') },
  ];

  const handleRevoke = async record => {
    const { workflowBusinessKey } =
      record?.get(['workflowBusinessKey', 'workflowRevokeFlag']) || {};
    const res = await revokeWorkFlow(workflowBusinessKey);
    if (res) {
      lineDs.query();
    }
  };

  const handleWorkFlowApprove = async record => {
    const approvaFlags = lineDs.getState('approvaFlags') || {};
    const { workflowBusinessKey } = record?.get(['workflowBusinessKey']) || {};
    const approvaFlag = approvaFlags?.[workflowBusinessKey];
    const { taskId, processInstanceId } = approvaFlag || {};
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
  };

  const handleJumpDetail = (type = 'create', record) => {
    if (type === 'create') {
      history.push({
        pathname: supplierUrlFlag
          ? '/scux/mould-req-supplier/create'
          : '/scux/mould-req-purchaser/create',
      });
    } else if (type === 'edit' && record?.get('mouldReqVersion') === 1) {
      history.push({
        pathname: supplierUrlFlag
          ? `/scux/mould-req-supplier/edit/${record?.get('mouldReqId')}`
          : `/scux/mould-req-purchaser/edit/${record?.get('mouldReqId')}`,
      });
    } else if (type === 'edit' && record?.get('mouldReqVersion') > 1) {
      history.push({
        pathname: supplierUrlFlag
          ? `/scux/mould-req-supplier/change/${record?.get('mouldReqId')}`
          : `/scux/mould-req-purchaser/change/${record?.get('mouldReqId')}`,
      });
    } else if (type === 'query' && record) {
      history.push({
        pathname: supplierUrlFlag
          ? `/scux/mould-req-supplier/query/${record?.get('mouldReqId')}`
          : `/scux/mould-req-purchaser/query/${record?.get('mouldReqId')}`,
      });
    } else if (type === 'approved') {
      history.push({
        pathname: supplierUrlFlag
          ? `/scux/mould-req-supplier/approved/${record?.get('mouldReqId')}`
          : `/scux/mould-req-purchaser/approved/${record?.get('mouldReqId')}`,
      });
    } else {
      history.push({
        pathname: supplierUrlFlag
          ? `/scux/mould-req-supplier/query/${record?.get('mouldReqId')}`
          : `/scux/mould-req-purchaser/query/${record?.get('mouldReqId')}`,
      });
    }
  };

  const handleCreate = () => {
    if (changeCreateFlag) {
      const mouldReqCreateDs = new DataSet(mouldReqCreate());
      Modal.open({
        title: intl.get(`hzero.common.button.creation`).d('新建'),
        children: (
          <Form dataSet={mouldReqCreateDs} labelLayout="float">
            <Select name="mouldReqType" />
            <Lov name="mould" />
          </Form>
        ),
        closable: true,
        drawer: true,
        style: { width: '380px' },
        onOk: async () => {
          const validateFlag = await mouldReqCreateDs.validate();
          if (validateFlag) {
            const [currentLine] = mouldReqCreateDs.toJSONData() || [];
            if (currentLine.mouldReqType === 'NEW') {
              history.push({
                pathname: supplierUrlFlag
                  ? '/scux/mould-req-supplier/create'
                  : '/scux/mould-req-purchaser/create',
              });
            } else {
              const data = getResponse(
                await changeCurrentLine({ ...currentLine, ...currentLine?.mould, mould: null })
              );
              if (data?.mouldReqId) {
                history.push({
                  pathname: supplierUrlFlag
                    ? `/scux/mould-req-supplier/change/${data?.mouldReqId}`
                    : `/scux/mould-req-purchaser/change/${data?.mouldReqId}`,
                });
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        },
      });
    } else {
      history.push({
        pathname: supplierUrlFlag
          ? '/scux/mould-req-supplier/create'
          : '/scux/mould-req-purchaser/create',
      });
    }
  };

  useEffect(() => {
    const codeList = supplierUrlFlag
      ? [`srm.bg.manager.mold.application.supplier.button.change`]
      : [`srm.bg.manager.mold.application.button.change`];
    const getPermissionRes = async () => {
      const [{ approve: changeFlag }] = getResponse(await checkPermission(codeList)) || [
        { approve: true },
      ];
      setChangeCreateFlag(changeFlag);
    };
    getPermissionRes();
  }, []);

  // 提交
  const handleSubmit = useCallback(async () => {
    const { selected = [] } = lineDs;
    if (isEmpty(selected)) {
      notification.error({
        message: intl.get(`hzero.common.validation.atLeast`).d('请至少选择一条数据'),
      });
    } else {
      const prHeaderList = selected.map(ele => ele.toJSONData());
      Modal.confirm({
        bodyStyle: { padding: '20px' },
        children: '是否确认提交',
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        okText: intl.get(`sprm.purchaseReqCreation.view.message.confirmOk`).d('确定'),
        cancelText: intl.get(`sprm.purchaseReqCreation.view.message.confirmCancelText`).d('取消'),
        onOk: async () => {
          setLoading({ ...loadings, submitLoading: true });
          const data = getResponse(await batchSubmitData(prHeaderList));
          const errorList = data?.filter(e => e.submitErrorFlag === 1);
          if (errorList.length > 0) {
            const errorListStr = errorList.map(e => `${e.mouldReqNum}${e.submitErrorMessage}`);
            notification.error({ message: errorListStr.join(',') });
          } else {
            notification.success();
            lineDs.unSelectAll();
            lineDs.clearCachedSelected();
            lineDs.query();
          }
          setLoading({ ...loadings, submitLoading: false });
        },
      });
    }
  }, []);

  const handleVision = record => {
    const { mouldId, mouldReqId } = record.get(['mouldId', 'mouldReqId']);
    const maChangeLineDs = new DataSet(maVisionDs({ mouldReqId, mouldId }));
    const columns = [
      {
        name: 'mouldReqNum',
        width: 180,
        renderer: ({ record: current, value }) => (
          <a onClick={() => handleJumpDetail('query', current)}>{value}</a>
        ),
      },
      { name: 'createdBy', renderer: ({ record: current }) => current?.get('createdByName') },
      { name: 'creationDate' },
    ];
    Modal.open({
      title: intl.get('hzero.common.view.button.history').d('历史记录'),
      drawer: true,
      style: { width: 742 },
      children: (
        <Table
          dataSet={maChangeLineDs}
          columns={columns}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          customizedCode="siec-mould-req-history"
        />
      ),
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleDelete = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: <p>{intl.get('hzero.common.view.mouldReq').d('确认删除模具申请单？')}</p>,
      onOk: () => {
        const params = lineDs.toJSONData();
        return new Promise(resolve => {
          deleteBatchData(params).then(res => {
            if (res && !res.failed) {
              notification.success();
              lineDs.unSelectAll();
              lineDs.clearCachedSelected();
              lineDs.query();
              resolve();
            } else {
              notification.error({ message: res.message });
              resolve();
            }
          });
        });
      },
    });
  };

  const HeaderBtn = observer(() => {
    const { selected } = lineDs;
    const headerButtons = [
      {
        name: 'create',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.creation`).d('新建'),
        btnProps: {
          icon: 'add',
          type: 'c7n-pro',
          color: 'primary',
          funcType: 'raised',
          onClick: handleCreate,
        },
      },
      {
        name: 'sbumit',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.submit`).d('提交'),
        btnProps: {
          icon: 'check',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleSubmit,
          disabled:
            selected.length === 0 ||
            selected.some(
              e =>
                !['NEW', 'APPROVAL_REJECTED', 'REJECTED', 'CHANGE_NEW', 'CHANGE_REJECTED'].includes(
                  e.get('mouldReqStatus')
                ) || (e.get('userCamp') === 'SUPPLIER') !== supplierUrlFlag
            ),
        },
      },
      {
        name: 'delete',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.batchDelete`).d('批量删除'),
        btnProps: {
          icon: 'delete_sweep',
          type: 'c7n-pro',
          funcType: 'flat',
          onClick: handleDelete,
          disabled:
            selected.length === 0 ||
            selected.some(
              e =>
                (e.get('userCamp') === 'SUPPLIER') !== supplierUrlFlag ||
                !['NEW', 'APPROVAL_REJECTED', 'REJECTED', 'CHANGE_NEW', 'CHANGE_REJECTED'].includes(
                  e.get('mouldReqStatus')
                )
            ),
        },
      },
    ];
    return (
      <>
        {customizeBtnGroup(
          {
            code: 'SIEC.MOULD_REQ.BTN',
            pro: true,
          },
          <DynamicButtons
            buttons={headerButtons}
            permissions={
              supplierUrlFlag
                ? [
                    {
                      code: `srm.bg.manager.mold.application.supplier.button.create`,
                      name: 'create',
                    },
                    {
                      code: `srm.bg.manager.mold.application.supplier.button.submit`,
                      name: 'sbumit',
                    },
                    {
                      code: `srm.bg.manager.mold.application.supplier.button.delete`,
                      name: 'delete',
                    },
                  ]
                : [
                    { code: `srm.bg.manager.mold.application.button.create`, name: 'create' },
                    { code: `srm.bg.manager.mold.application.button.submit`, name: 'sbumit' },
                    { code: `srm.bg.manager.mold.application.button.delete`, name: 'delete' },
                  ]
            }
          />
        )}
      </>
    );
  });

  const resetQueryDs = () => {
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet?.current?.reset();
  };

  const handleChangeField = ({ name, value }) => {
    if (name === 'tempKey') {
      const { supplierCompanyId, supplierId } = value || {};
      // eslint-disable-next-line no-unused-expressions
      lineDs.queryDataSet?.current?.set({
        supplierCompanyId,
        supplierId,
      });
    } else if (!value) {
      // eslint-disable-next-line no-unused-expressions
      lineDs.queryDataSet?.current?.set({ [name]: undefined });
    }
  };

  const handleQuery = ({ params = {} }) => {
    const { location = {} } = props;
    const { state: { _back } = {} } = location;
    const { customizeOrderField = undefined } = params;
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = lineDs.queryDataSet?.current?.toData() || {};
    if (dataObj) {
      for (const key in dataObj) {
        if (!['mouldReqNumList', 'supplierCompanyId', 'supplierId'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    lineDs.setQueryParameter('supplierCompanyId', null);
    lineDs.setQueryParameter('supplierId', null);
    lineDs.setQueryParameter('customizeOrderField', customizeOrderField);
    // eslint-disable-next-line no-unused-expressions
    lineDs.queryDataSet.current
      ? lineDs.queryDataSet.current.set({
          ...params,
          customizeOrderField,
          ...clearParams,
        })
      : lineDs.queryDataSet.loadData([
          {
            ...params,
            customizeOrderField,
            ...clearParams,
          },
        ]);

    if (_back === -1 && !init) {
      lineDs.query(lineDs.currentPage);
    } else {
      lineDs.query();
    }
    setInit(true);
  };

  return (
    <Fragment>
      <Header
        title={intl.get('siec.mouldReq.common.title.mouldReqPurcharse').d('模具申请单（采）')}
      >
        <HeaderBtn />
      </Header>
      <Content>
        <div style={{ height: 'calc(100vh - 200px)' }}>
          {customizeTable(
            {
              code: 'SIEC.MOULD_REQ.LIST',
              dataSet: lineDs,
            },
            <SearchBarTable
              style={{ maxHeight: `calc(100vh - 200px)` }}
              searchCode="SIEC.MOULD_REQ.SEARCHAR"
              dataSet={lineDs}
              cacheState
              columns={lineColumns}
              searchBarConfig={{
                left: {
                  render: () => (
                    <MutlTextFieldSearch
                      name="mouldReqNumList"
                      dataSet={lineDs}
                      placeholder={intl
                        .get('sprm.project.search.multiMouldReqNum')
                        .d('请输入模具申请单单号查询')}
                    />
                  ),
                },
                onClear: resetQueryDs,
                onReset: resetQueryDs,
                onQuery: handleQuery,
                onFieldChange: handleChangeField,
              }}
            />
          )}
        </div>
      </Content>
    </Fragment>
  );
};

export default compose(
  connect(() => ({})),
  formatterCollections({
    code: [
      'sprm.common',
      'siec.mould',
      'sprm.purchaseReqCreation',
      'hzero.common',
      'sprm.project',
      'entity.company',
    ],
  }),
  withProps(
    () => {
      const lineDs = new DataSet(maListDs({ isSupplier: location.pathname?.includes('supplier') }));
      return {
        lineDs,
      };
    },
    { cacheState: true }
  ),
  withCustomize({
    unitCode: [
      'SIEC.MOULD_REQ.LIST',
      'SIEC.MOULD_REQ.BTN',
      'SIEC.MOULD_REQ.SEARCHAR',
      'SIEC.MOULD_REQ.CHANGE_LIST',
    ],
  })
)(Index);
