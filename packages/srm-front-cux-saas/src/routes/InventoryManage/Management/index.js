/**
 * @description 库存管理
 * @export DhqflyManage
 * @class DhqflyManage
 * @extends {Component}
 */

import React, { Fragment, useMemo, useState, useEffect } from 'react';
import { Table, DataSet, Button, Modal, Form, TextField } from 'choerodon-ui/pro';
import { notification } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import { isArray } from 'lodash';
import ExcelExport from 'components/ExcelExport';
import { observer } from 'mobx-react-lite';
import withProps from 'utils/withProps';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';
import DoubleTabs from '_components/DoubleTabs';

import { tableData, detailData, operation, toReject } from './initialDataDs';
import { headerSubmit, approve, reject, fetchNumber } from '@/services/inventoryManageService';

const prefix = 'scux.dhqflyInventoryManage';
const organizationId = getCurrentOrganizationId();

const DhqflyManage = ({tableSubmitDs, tableApprovalDs, tableUnderreviewDs, detailDs, tabKeys, history}) => {
  const operationDs = new DataSet(operation());
  const toRejectDs = new DataSet(toReject());

  const [tabKey, setTabKey] = useState(tabKeys.key1);
  const [detailKey, setDetailKey] = useState(tabKeys.key2);
  const [num, setNum] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);

  useEffect(() => {
    handleOnTabChange([tabKeys.key1, tabKeys.key2]);
    fetchNum();
  }, []);

  const fetchNum = () => {
    fetchNumber().then(res => {
      if (res) {
        setNum(res);
      }
    });
  };

  const handleSubmit = async () => {
    const data = tableSubmitDs.selected.map(item => item.toData());
    if (data.length < 1) {
      notification.warning({
        message: intl.get(`${prefix}.message.notNull`).d('请先选择数据在进行操作'),
        placement: 'bottomRight',
      });
      return;
    }
    const response = await headerSubmit(data);
    if(getResponse(response)) {
      notification.success({
        message: intl.get(`${prefix}.message.submitSuccess`).d('提交成功'),
        placement: 'bottomRight',
      });
      tableSubmitDs.setQueryParameter('statusFlag', 0);
      tableSubmitDs.query();
      fetchNum();
    }
  };

  const handleApprove = () => {
    Modal.confirm({
      children: intl.get(`${prefix}.message.approve`).d('是否确认审批通过'),
      onOk: () => {
        setLoadingApprove(true);
        let flag = true;
        const data = detailKey === '1' ? tableApprovalDs.selected.map(item => item.toData()) : tableUnderreviewDs.selected.map(item => item.toData());
        approve(data[0]).then(res => {
          if (res) {
            if (res.failed) {
              notification.warning({
                message: res.message,
                placement: 'bottomRight',
              });
              flag = false;
            } else {
              notification.success({
                message: intl.get(`${prefix}.message.success`).d('操作成功'),
                placement: 'bottomRight',
              });
              if (detailKey === '1') {
                tableApprovalDs.setQueryParameter('statusFlag', 1);
                tableApprovalDs.query();
              } else {
                tableUnderreviewDs.setQueryParameter('statusFlag', 2);
                tableUnderreviewDs.query();
              }
              fetchNum();
            }
          }
        }).finally(() => {
          setLoadingApprove(false);
        });

        return flag;
      },
    });
  };

  const handleReject = () => {
    Modal.open({
      title: intl.get(`${prefix}.message.approveRefReason`).d('请输入拒绝理由'),
      children: (
        <Form dataSet={toRejectDs} label={130}>
          <TextField name="rejectReason" />
        </Form>
      ),
      onOk: async () => {
        setLoading(true);
        const validFlag = await toRejectDs.validate();
        const rejectReason = toRejectDs.current?.get('rejectReason');
        const newData = detailKey === '1' ? tableApprovalDs.selected.map(item => ({ ...item.toData(), rejectReason })) : tableUnderreviewDs.selected.map(item => ({ ...item.toData(), rejectReason }));
        if (validFlag) {
          const response = reject(newData[0]);
          response
            .then(res => {
              if (res) {
                if (res.failed) {
                  notification.warning({
                    message: res.message,
                    placement: 'bottomRight',
                  });
                } else {
                  notification.success({
                    message: intl.get(`${prefix}.message.approveRefSuccess`).d('审批拒绝'),
                    placement: 'bottomRight',
                  });
                  if (detailKey === '1') {
                    tableApprovalDs.setQueryParameter('statusFlag', 1);
                    tableApprovalDs.query();
                  } else {
                    tableUnderreviewDs.setQueryParameter('statusFlag', 2);
                    tableUnderreviewDs.query();
                  }
                  fetchNum();
                }
              }
              // eslint-disable-next-line
              toRejectDs.current?.reset();
            })
            .finally(() => {
              setLoading(false);
            });
        } else {
          notification.warning({
            message: intl.get(`${prefix}.message.warningRequired`).d('请填写必填项!'),
            placement: 'bottomRight',
          });
          setLoading(false);
          return false;
        }
      },
    });
  };

  const handleCreate = status => {
    history.push({
      pathname: `/scux/inventory-manage/create/${status}`,
    });
  };

  const toDetail = record => {
    history.push({
      pathname: `/scux/inventory-manage/detail/${record.get(
        'inventoryManageHeaderId'
      )}/${record.get('inventoryType')}`,
    });
  };

  const handleOperation = record => {
    const columns = [
      {
        name: 'processUserName',
      },
      {
        name: 'processDate',
      },
      {
        name: 'processStatus',
      },
      {
        name: 'processRemark',
      },
    ];
    operationDs.setQueryParameter('inventoryManageHeaderId', record.get('inventoryManageHeaderId'));
    operationDs.query();
    Modal.open({
      title: intl.get(`${prefix}.model.dhqflyInventoryManage.operation`).d('操作记录'),
      style: { width: 800 },
      closable: true,
      children: <Table dataSet={operationDs} columns={columns} />,
    });
  };

  const columns = useMemo(
    () => [
      {
        name: 'statusMeaning',
      },
      {
        name: 'inventoryTypeMeaning',
      },
      {
        name: 'documentCode',
        renderer: ({ record, value }) => <a onClick={() => toDetail(record)}>{value}</a>,
      },
      {
        name: 'organizationName',
      },
      {
        name: 'inventoryName',
      },
      {
        name: 'remark',
      },
      {
        header: intl.get(`${prefix}.model.dhqflyInventoryManage.operation`).d('操作记录'),
        align: 'center',
        renderer: ({ record }) => (
          <a onClick={() => handleOperation(record)}>
            {intl.get(`${prefix}.model.dhqflyInventoryManage.operation`).d('操作记录')}
          </a>
        ),
      },
    ],
    []
  );

  const detailColumns = useMemo(
    () => [
      {
        name: 'statusMeaning',
        width: 140,
      },
      {
        name: 'inventoryTypeMeaning',
        width: 140,
      },
      {
        name: 'documentCode',
        width: 140,
      },
      {
        name: 'organizationName',
        width: 140,
      },
      {
        name: 'inventoryName',
        width: 140,
      },
      {
        name: 'remark',
        width: 140,
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        name: 'itemCode',
        width: 140,
      },
      {
        name: 'itemName',
        width: 140,
      },
      {
        name: 'inventoryUnitName',
        width: 140,
      },
      {
        name: 'specifications',
        width: 140,
      },
      {
        name: 'model',
        width: 140,
      },
      {
        name: 'unitPrice',
        width: 140,
      },
      {
        name: 'changeBeforeQuantity',
        width: 140,
      },
      {
        name: 'changeAfterQuantity',
        width: 140,
      },
      {
        name: 'changeQuantity',
        width: 140,
      },
      {
        name: 'changeAmount',
        width: 140,
      },
    ],
    []
  );

  const getQueryData = datas => {
    if (datas) {
      const data = Object.assign(datas);
      Object.keys(data).forEach(item => {
        if (!data[item]) {
          delete data[item];
        }
      });
      return data;
    }
  };

  const Buttons = observer(propss => {
    const data = propss.dataSet.selected.map(item => item.toData());
    return (
      <Fragment>
        {tabKey === 'detail' && (
          <ExcelExport
            buttonText={intl.get('hzero.common.button.export').d('导出')}
            requestUrl={`${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-manage-headers/export`}
            queryParams={getQueryData(propss.dataSet.queryDataSet.toData()[0])}
          />
        )}
        {tabKey === 'wholeorder' && detailKey === '0' && (
          <>
            <Button type="primary" onClick={() => handleCreate('BF')}>
              {intl.get(`${prefix}.button.scrap`).d('库存报废')}
            </Button>
            {/* <Button type="primary" onClick={() => handleCreate('CF')}>
              {intl.get(`${prefix}.button.split`).d('包装拆分')}
            </Button> */}
            <Button type="primary" onClick={() => handleCreate('PD')}>
              {intl.get(`${prefix}.button.inventory`).d('库存盘点')}
            </Button>
            <Button icon="check" wait={500} onClick={handleSubmit}>
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          </>
        )}
        {tabKey === 'wholeorder' && (detailKey === '1' || detailKey === '2') && (
          <>
            <Button onClick={handleApprove} wait={500} loading={loadingApprove} disabled={data.length !== 1}>
              {intl.get(`${prefix}.button.approve`).d('审批通过')}
            </Button>
            <Button
              onClick={handleReject}
              wait={500}
              disabled={data.length !== 1}
              loading={loading}
            >
              {intl.get(`${prefix}.button.reject`).d('审批拒绝')}
            </Button>
          </>
        )}
      </Fragment>
    );
  });

  const handleOnTabChange = (keys) => {
    if (isArray(keys[1])) {
      Object.assign(tabKeys, {
        keys1: 'wholeorder',
        key2: '0',
      });
      setTabKey('wholeorder');
      setDetailKey('0');
      tableSubmitDs.setQueryParameter('statusFlag', 0);
      tableSubmitDs.query();
    } else {
      Object.assign(tabKeys, {
        keys1: keys[0],
        key2: keys[1],
      });
      setTabKey(keys[0]);
      setDetailKey(keys[1]);
      switch (keys[1]) {
        case undefined:
          detailDs.query();
          break;
        case '0':
          tableSubmitDs.setQueryParameter('statusFlag', 0);
          tableSubmitDs.query();
          break;
        case '1':
          tableApprovalDs.setQueryParameter('statusFlag', 1);
          tableApprovalDs.query();
          break;
        default:
          tableUnderreviewDs.setQueryParameter('statusFlag', 2);
          tableUnderreviewDs.query();
          break;
      }
    }
  };

  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.title.dhqflyInventoryManage`).d('库存管理')}>
        <Buttons dataSet={tabKey === 'detail' ? detailDs : (detailKey ==='0' ? tableSubmitDs : (detailKey === '1' ? tableApprovalDs : tableUnderreviewDs))} />
      </Header>
      <Content>
        <DoubleTabs
          disableActiveFirst
          activeKeys={[tabKey, detailKey]}
          onTabChange={(_, keys) => handleOnTabChange(keys)}
          parentList={[
            {
              key: 'wholeorder',
              node: intl.get(`${prefix}.view.button.wholeorder`).d('整单'),
            },
            {
              key: 'detail',
              node: intl.get(`${prefix}.view.button.detail`).d('明细'),
            },
          ]}
          subList={[
            {
              key: '0',
              parentKey: 'wholeorder',
              num: num.newCount,
              node: intl.get(`${prefix}.view.tabPane.waitSubmited`).d('待提交'),
            },
            {
              key: '1',
              parentKey: 'wholeorder',
              num: num.itemAwaitCount,
              node: intl.get(`${prefix}.view.tabPane.waitApproval`).d('待审批'),
            },
            // {
            //   key: '2',
            //   parentKey: 'wholeorder',
            //   num: num.regionAwaitCount,
            //   node: intl.get(`${prefix}.view.tabPane.toBeReleased`).d('待区域审批'),
            // },
            {
              key: '2',
              parentKey: 'wholeorder',
              num: num.approvalCount,
              node: intl.get(`${prefix}.view.tabPane.feedbackUnderReview`).d('已审批'),
            },
          ]}
        />
        <Table
          dataSet={tabKey === 'wholeorder' ? (detailKey ==='0' ? tableSubmitDs : (detailKey === '1' ? tableApprovalDs : tableUnderreviewDs)) : detailDs}
          columns={tabKey === 'wholeorder' ? columns : detailColumns}
          queryFieldsLimit={3}
        />
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['scux.dhqflyInventoryManage', 'hzero.common'] })(
  withProps(() => {
    const tableSubmitDs = new DataSet(tableData());
    const tableApprovalDs = new DataSet(tableData());
    const tableUnderreviewDs = new DataSet(tableData());

    const detailDs = new DataSet(detailData());

    return {
      tableSubmitDs,
      tableApprovalDs,
      tableUnderreviewDs,
      detailDs,
      tabKeys: {
        key1: 'wholeorder',
        key2: '0',
      },
    };
  }, {
    cacheState: true,
  })(DhqflyManage)
);
