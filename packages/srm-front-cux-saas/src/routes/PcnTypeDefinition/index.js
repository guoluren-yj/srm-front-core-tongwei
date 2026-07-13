/*
 * @Autor: wenjia.hong@going-link.com
 * @Date: 2021-06-01 21:03:46
 * @LastEditTime: 2021-08-12 15:24:22
 * @Description:
 * @Version: 2.0
 */
import React, { Component } from 'react';
import {
  DataSet,
  Modal,
  Form,
  Table,
  Button,
  TextField,
  Switch,
  IntlField,
  Select,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { yesOrNoRender } from 'utils/renderer';
import Upload from '_components/C7NUpload';
import notification from 'utils/notification';

import { getTableDs, editFormDS } from './store/tableDS';

@formatterCollections({
  code: ['siec.pcnType'],
})
export default class index extends Component {
  constructor(props) {
    super(props);
    this.pcnTableDataSetObject = new DataSet(getTableDs());
    this.pcnEditFormDS = new DataSet(editFormDS());
  }

  @Bind()
  clickCompile = ({ record }) => {
    return (
      <div onClick={this.openPCNTypeModal.bind(this, record)}>
        <a>{intl.get('siec.pcnType.view.button.edit').d('编辑')}</a>
      </div>
    );
  };

  @Bind()
  openPCNTypeModal = (record) => {
    this.pcnEditFormDS.loadData([record.toJSONData()]);
    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get('siec.pcnType.view.title.model.pcnEdit').d('PCN变更类型编辑'),
      style: {
        width: 600,
        height: '100%',
        position: 'fixed',
        right: 0,
        top: 0,
      },
      closable: true,
      children: (
        <Form dataSet={this.pcnEditFormDS}>
          <TextField disabled name="typeCode" />
          <IntlField name="typeName" />

          <Upload
            name="attachmentUuid"
            bucketName="private-bucket"
            bucketDirectory="saas-pcn"
            afterOpenUploadModal={(uuid) => this.afterOpenUploadModal(uuid, record)}
          />
          <Select name="changeCategory" />
          <Switch name="enabledFlag" />
        </Form>
      ),
      onOk: this.handleEditOk,
    });
  };

  @Bind()
  async handleEditOk() {
    const res = await this.pcnEditFormDS.submit();
    if (res) {
      if (res.failed) {
        notification.error({ description: res.message });
        return false;
      } else {
        this.pcnTableDataSetObject.query();
        return true;
      }
    }
  }

  @Bind()
  afterOpenUploadModal(uuid, record) {
    record.set({ attachmentUuid: uuid });
  }

  @Bind()
  atachmentTemplate = ({ record }) => {
    return (
      <Upload
        bucketName="private-bucket"
        bucketDirectory="saas-pcn"
        name="attachmentUuid"
        record={record}
        viewOnly
      />
    );
  };

  @Bind()
  async handleOk() {
    const res = await this.pcnEditFormDS.submit();
    if (res) {
      this.pcnTableDataSetObject.query();
    }
    return !!res;
  }

  @Bind()
  createTypeDate = () => {
    this.pcnEditFormDS.create({ enabledFlag: 1 });
    Modal.open({
      key: Modal.key(),
      title: intl.get('siec.pcnType.view.title.model.pcnCreate').d('类型创建'),
      style: {
        width: 600,
        height: '100%',
        position: 'fixed',
        right: 0,
        top: 0,
      },
      drawer: true,
      closable: true,
      children: (
        <Form dataSet={this.pcnEditFormDS}>
          <TextField name="typeCode" />
          <IntlField name="typeName" />
          <Select name="changeCategory" />
          <Switch name="enabledFlag" />
        </Form>
      ),
      onOk: this.handleOk,
      // afterClose: () => {
      //   this.pcnTableDataSetObject.remove(record);
      // },
    });
  };

  render() {
    const Headers = observer(() => {
      return (
        <React.Fragment>
          <Header title={intl.get('siec.pcnType.view.title.changeTypes').d('变更类型维护')}>
            <Button color="primary" onClick={this.createTypeDate}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          </Header>
        </React.Fragment>
      );
    });
    return (
      <React.Fragment>
        <Headers />
        <Content>
          <Table dataSet={this.pcnTableDataSetObject} selectionMode="none">
            <Table.Column name="typeCode" />
            <Table.Column name="typeName" />
            <Table.Column name="attachmentUuid" renderer={this.atachmentTemplate} />
            <Table.Column name="changeCategory" />
            <Table.Column
              name="enabledFlag"
              renderer={({ value }) => {
                return yesOrNoRender(+value);
              }}
              width={200}
            />
            <Table.Column
              header={intl.get('hzero.common.button.action').d('操作')}
              renderer={this.clickCompile}
              width={250}
              align="center"
            />
          </Table>
        </Content>
      </React.Fragment>
    );
  }
}
