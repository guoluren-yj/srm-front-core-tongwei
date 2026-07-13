/**
 * @description 库存领用
 * @export DhqflyInventoryReceive
 * @class DhqflyInventoryReceive
 * @extends {Component}
 */

import React, { Fragment, useEffect, useState } from 'react';
import { Table, DataSet, Button } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import ExcelExport from 'components/ExcelExport';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';

import { tableData } from './initialDataDs';
import { toReceiveAdd } from '@/services/inventoryManageService';

const prefix = 'scux.dhqflyInventoryManage';
const organizationId = getCurrentOrganizationId();

const DhqflyInventoryReceive = ({tableNewDs, tableReceiveDs, tableInboundDs, tableFinishDs, tabKey, history}) => {
  const [status, setStatus] = useState(tabKey.key);

  useEffect(() => {
    changeTabs(status);
  }, [status]);

  const changeTabs = (type='') => {
    if(type) {
      Object.assign(tabKey, {key: type});
      setStatus(type);
    }
    switch (type) {
      case 'new':
        tableNewDs.setQueryParameter('nodeStatus', 'NEW');
        tableNewDs.query();
        break;
      case 'receive':
        tableReceiveDs.setQueryParameter('nodeStatus', 'RECEIVE');
        tableReceiveDs.query();
        break;
      case 'inbound':
        tableInboundDs.setQueryParameter('nodeStatus', 'INBOUND');
        tableInboundDs.query();
        break;
      default:
        tableFinishDs.setQueryParameter('nodeStatus', 'FINISH');
        tableFinishDs.query();
        break;
    }
  };

  const handleAdd = async () => {
    const res = await toReceiveAdd();
    if (getResponse(res)) {
      history.push({
        pathname: `/scux/inventory-receiving/detail/${res.inventoryReceiveHeaderId}/${res.receiveStatus}`,
      });
    }
  };

  const jumpDetail = (record) => {
    const id = record.get('inventoryReceiveHeaderId');
    const receiveStatus = record.get('receiveStatus');
    history.push({
      pathname: `/scux/inventory-receiving/detail/${id}/${receiveStatus}`,
    });
  };

  const columns = [
    {
      name: 'receiveNumber',
    },
    {
      name: 'receiveNum',
      header: intl.get(`${prefix}.message.receiveNum`).d('查看'),
      renderer: ({ record }) => (
        <a onClick={() => jumpDetail(record)}>
          {intl.get(`${prefix}.message.receiveNum`).d('查看')}
        </a>
      ),
    },
    {
      name: 'receiveTypeMeaning',
    },
    {
      name: 'outDepotName',
    },
    {
      name: 'inDepotName',
    },
    {
      name: 'departmentName',
    },
    {
      name: 'outOrganizationName',
    },
    {
      name: 'inOrganizationName',
    },
    {
      name: 'receiveStatusMeaning',
    },
    {
      name: 'manager',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'finishDate',
    },
    {
      name: 'remark',
    },
  ];

  // const getQueryData = (datas) => {
  //   if (datas) {
  //     const data = Object.assign(datas);
  //     Object.keys(data).forEach((item) => {
  //       if (!data[item]) {
  //         delete data[item];
  //       }
  //     });
  //     return data;
  //   }
  // };

  const Buttons = observer(() => {
    return (
      <Fragment>
        {status === 'new' && (
          <Button icon="add" onClick={handleAdd}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        )}
        <ExcelExport
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          requestUrl={`${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-receive-headers/export`}
          // queryParams={getQueryData(propss.dataSet.queryDataSet.toData()[0])}
          queryParams={{
            nodeStatus: status.toUpperCase(),
          }}
        />
      </Fragment>
    );
  });

  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.title.dhqflyInventoryReceive`).d('库存领用')}>
        <Buttons dataSet={status === 'new' ? tableNewDs : (status === 'receive' ? tableReceiveDs : (status === 'inbound' ? tableInboundDs : tableFinishDs))} />
      </Header>
      <Content>
        <Tabs animated={false} onChange={changeTabs} activeKey={status}>
          <Tabs.TabPane key="new" tab={intl.get(`${prefix}.view.tab.new`).d(`待提交`)}>
            <Table dataSet={tableNewDs} columns={columns} queryFieldsLimit={3} />
          </Tabs.TabPane>
          <Tabs.TabPane key="receive" tab={intl.get(`${prefix}.view.tab.receive`).d(`领用方审批`)}>
            <Table dataSet={tableReceiveDs} columns={columns} queryFieldsLimit={3} />
          </Tabs.TabPane>
          <Tabs.TabPane key="inbound" tab={intl.get(`${prefix}.view.tab.inbound`).d(`出库方审批`)}>
            <Table dataSet={tableInboundDs} columns={columns} queryFieldsLimit={3} />
          </Tabs.TabPane>
          <Tabs.TabPane key="finish" tab={intl.get(`${prefix}.view.tab.finish`).d(`完成`)}>
            <Table dataSet={tableFinishDs} columns={columns} queryFieldsLimit={3} />
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['scux.dhqflyInventoryManage', 'hzero.common'] })(
  withProps(() => {
    const tableNewDs = new DataSet(tableData());
    const tableReceiveDs = new DataSet(tableData());
    const tableInboundDs = new DataSet(tableData());
    const tableFinishDs = new DataSet(tableData());

    return {
      tableNewDs,
      tableReceiveDs,
      tableInboundDs,
      tableFinishDs,
      tabKey: {
        key: 'new',
      },
    };
  }, {
    cacheState: true,
  })(DhqflyInventoryReceive)
);
