/**
 * @description 客户管理
 */

import React, { Fragment, useMemo, useEffect, useCallback } from 'react';
import { DataSet, Button, Table, Form, TextField, Spin, Select } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { headerData, lineData, fetchRecord } from './indexDs';
import './index.less';

const Details = ({ match }) => {
  const {
    params: { id },
  } = match;
  const headerDs = useMemo(() => new DataSet(headerData()), []);
  const lineDs = useMemo(() => new DataSet(lineData(headerDs)), [headerDs]);

  useEffect(() => {
    if(id) {
      pageQuery();
    }
  }, [id]);

  const pageQuery = useCallback(()=>{
    headerDs.setQueryParameter('type', 'Detail');
    headerDs.setQueryParameter('id', id);
    headerDs.query().then(res => {
      if(res){
        lineDs.loadData(res.lineList || []);
      }
    });
    // lineDs.setQueryParameter('headerId', id);
    // lineDs.query();
  }, []);

  const columns = useMemo(() => {
    return [
      {
        name: 'communicationTime',
        editor: true,
      },
      {
        name: 'remark',
        editor: true,
      },
    ];
  }, []);

  /**
   * 保存
   */
  const handleRecord = useCallback( async (type)=>{
    const { current } = headerDs;
    const validate = await current.validate();
    const lineValidate = await lineDs.validate();
    if(validate && lineValidate){
      current.set('lineList', lineDs.toJSONData());
      const data = current.toJSONData();
      const res = await fetchRecord(data, type);
      if(getResponse(res)){
        notification.success();
        if(id){
          pageQuery();
        }
      }
    }else{
      notification.warning({
        message: intl.get(`scux.common.message.request`).d('请填写必填项！'),
      });
    }
  }, []);

  const Buttons = observer(() => {
    return (
      <>
        <Button wait={500} onClick={()=> handleRecord('U')}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      </>
    );
  });

  const lineButtons = useMemo(()=>{
    return [
      'add',
      ['delete', {help: intl.get('scux.customerManagement.button.delete.help').d('仅删除未保存的行数据')}],
    ];
  }, []);

  return (
    <Fragment>
      <Header
        title={intl
          .get(`scux.customerManagement.view.title.customerManagement.detail`)
          .d('客户管理明细')}
        backPath="/scux/customer-management/list"
      >
        <Buttons dataSet={headerDs} />
      </Header>
      <Content className="contentStyle">
        <Card>
          <div className="titleTag">
            {intl.get(`scux.customerManagement.view.itemInfo`).d('基础信息')}
          </div>
          <Spin dataSet={headerDs}>
            <Form dataSet={headerDs} labelLayout="float" columns={3}>
              <TextField name="enterpriseName" />
              <TextField name="contacts" />
              <TextField name="phone" disabled />
              <TextField name="creationDate" disabled />
              <TextField name="lastUpdateDate" disabled />
              <Select name="status" />
            </Form>
          </Spin>
        </Card>
        <Card>
          <div className="titleTag">
            {intl.get(`scux.customerManagement.view.lineList`).d('行信息')}
          </div>
          <Table columns={columns} dataSet={lineDs} buttons={lineButtons} />
        </Card>
      </Content>
    </Fragment>
  );
};

export default formatterCollections({
  code: ['scux.customerManagement', 'hzero.common', 'scux.common'],
})(Details);
