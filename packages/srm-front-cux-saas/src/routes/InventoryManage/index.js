/**
 * @description 库存查询
 * @export DhqflyInventoryManage
 * @class DhqflyInventoryManage
 * @extends {Component}
 */

import React, { useMemo, Fragment, useState } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { Tabs } from 'choerodon-ui';
import { Header, Content } from 'components/Page';
// import { isEmpty } from 'lodash';
import ExcelExport from 'components/ExcelExport';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_CUSTOMIZATION } from '_utils/config';

import { tableData, detailData } from './initialDataDs';

const prefix = 'scux.dhqflyInventoryManage';
const organizationId = getCurrentOrganizationId();

const DhqflyInventoryManage = () => {
  const tableDs = useMemo(() => new DataSet(tableData()), []);

  const detailDs = useMemo(() => new DataSet(detailData()), []);

  const [key, setKey] = useState('list');

  const changeTabs = (type) => {
    setKey(type);
    if (type === 'list') {
      tableDs.query();
    } else {
      detailDs.query();
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'inventoryUnitName',
        width: 150,
      },
      {
        name: 'bookInventory',
        width: 150,
      },
      {
        name: 'occupiedInventory',
        width: 150,
      },
      {
        name: 'availableInventory',
        width: 150,
      },
      {
        name: 'specifications',
        width: 150,
      },
      {
        name: 'model',
        width: 150,
      },
      {
        name: 'unitPrice',
        width: 150,
      },
      {
        name: 'inventoryTime',
        width: 150,
      },
      {
        name: 'organizationName',
        width: 150,
      },
      {
        name: 'inventoryName',
        width: 150,
      },
    ],
    []
  );

  const detailColumns = useMemo(
    () => [
      {
        name: 'changeTypeMeaning',
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
        name: 'inventoryUnitName',
        width: 150,
      },
      {
        name: 'specifications',
        width: 150,
      },
      {
        name: 'model',
        width: 150,
      },
      {
        name: 'beforeChangeQuantity',
        width: 150,
      },
      {
        name: 'afterChangeQuantity',
        width: 150,
      },
      {
        name: 'changeQuantity',
        width: 150,
        renderer: ({ value }) => {
          if (Number(value) > 0) {
            return <span>{`+${value}`}</span>;
          } else {
            return value;
          }
        },
      },
      {
        name: 'unitPrice',
        width: 150,
      },
      {
        name: 'amount',
        width: 150,
      },
      {
        name: 'organizationName',
        width: 150,
      },
      {
        name: 'inventoryName',
        width: 150,
      },
      {
        name: 'changeTime',
        width: 150,
      },
      {
        name: 'changeInfoCode',
        width: 150,
      },
      {
        name: 'taxRate',
      },
      {
        name: 'netPrice',
      },
      {
        name: 'netAmount',
      },
      {
        name: 'taxIncludedAmount',
      },
      {
        name: 'taxRateAmount',
      },
    ],
    []
  );

  const getQueryData = (datas) => {
    if (datas) {
      const data = Object.assign(datas);
      Object.keys(data).forEach((item) => {
        if (!data[item]) {
          delete data[item];
        }
      });
      return data;
    }
  };

  const Buttons = observer((propss) => {
    return (
      <Fragment>
        <ExcelExport
          buttonText={intl.get('hzero.common.button.export').d('导出')}
          requestUrl={
            key === 'list'
              ? `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-querys/export`
              : `${SRM_CUSTOMIZATION}/v1/${organizationId}/dhqfly-inventory-change-infos/export`
          }
          queryParams={getQueryData(propss.dataSet.queryDataSet.toData()[0])}
        />
      </Fragment>
    );
  });

  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.title.dhqflyInventoryQuery`).d('库存查询')}>
        <Buttons dataSet={key === 'list' ? tableDs : detailDs} />
      </Header>
      <Content>
        <Tabs animated={false} onChange={changeTabs}>
          <Tabs.TabPane key="list" tab={intl.get(`${prefix}.view.tab.list`).d(`库存查询`)}>
            <Table dataSet={tableDs} columns={columns} queryFieldsLimit={3} />
          </Tabs.TabPane>
          <Tabs.TabPane
            key="listDetail"
            tab={intl.get(`${prefix}.view.tab.listDetail`).d(`库存变动明细`)}
          >
            <Table dataSet={detailDs} columns={detailColumns} queryFieldsLimit={3} />
          </Tabs.TabPane>
        </Tabs>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({ code: ['scux.dhqflyInventoryManage', 'hzero.common'] })(
  DhqflyInventoryManage
);
