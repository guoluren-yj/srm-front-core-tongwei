/**
 * @description 客户管理
 */

import React, { Fragment, useMemo, useCallback, useEffect } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import withProps from 'utils/withProps';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';

import { tableData } from './indexDs';

const WhiteListApply = ({ tableDs, history }) => {

  useEffect(()=>{
    tableDs.setQueryParameter('type', 'S');
    tableDs.query();
  }, []);

  const handleJumpDetails = useCallback((record) => {
    history.push(
      `/scux/customer-management/detail/${record.get('id')}`
    );
  }, []);

  const columns = useMemo(() => [
    {
      name: 'enterpriseName',
    },
    {
      name: 'contacts',
    },
    {
      name: 'phone',
    },
    {
      name: 'creationDate',
    },
    {
      name: 'lastUpdateDate',
    },
    {
      name: 'status',
    },
    {
      name: 'record',
      renderer: ({ record }) => (
        <a onClick={() => handleJumpDetails(record)}>
          {intl.get(`scux.customerManagement.model.record`).d('跟进记录')}
        </a>
      ),
    },
  ], []);

  return (
    <Fragment>
      <Header
        title={intl
          .get(`scux.customerManagement.view.title.CustomerManagement`)
          .d('客户管理查询')}
      />
      <Content>
        <FilterBarTable
          key="CustomerManagement"
          cacheState
          border={false}
          customizable
          customizedCode="SCUX.CUSTOMIZEDCODE.SAAS.CustomerManagement"
          filterBarConfig={{
            cacheKey: 'CustomerManagement',
            autoQuery: false,
          }}
          dataSet={tableDs}
          columns={columns}
        />
      </Content>
    </Fragment>
  );
};

export default formatterCollections(
  { code: ['scux.customerManagement', 'hzero.common'] })(
    withProps(
      () => {
        const tableDs = new DataSet(tableData());;
        return { tableDs };
      },
      { cacheState: true }
    )(WhiteListApply)
);
