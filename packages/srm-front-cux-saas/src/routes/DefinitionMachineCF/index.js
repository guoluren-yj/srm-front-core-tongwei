/**
 * @description 状态机分类定义
 * @export DefinitionMachineCF
 * @class DefinitionMachineCF
 * @extends {Component}
 */

import React, { Component, Fragment } from 'react';
import {
  Table,
  DataSet,
  Button,
  Modal,
  Form,
  TextField,
  Spin,
  NumberField,
  Select,
  Switch,
  Lov,
  IntlField,
} from 'choerodon-ui/pro';
import { notification, Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  confirmData,
  fetchDelete,
  tablePageDataSave,
  tablePageDataDelete,
  tablePostActionDataSave,
  // tablePageDataQuery,
  // tablePostActionDataQuery,
  tablePostActionDataDelete,
} from '@/services/definitionMachineCFServices';
import { tableData, drawerData, pageTableData, postActionTableData } from './initialDataDs.js';

const prefix = 'scux.definitionMachineCF';

@formatterCollections({
  code: ['scux.definitionMachineCF', 'scux.moldFileManagement', 'hzero.common'],
})
export default class DefinitionMachineCF extends Component {
  tableDs = new DataSet(tableData());

  drawerDataDs = new DataSet(drawerData());

  pageTableDataDS = new DataSet(pageTableData()); // 页面定义DS

  postActionTableDataDS = new DataSet(postActionTableData()); // 后置动作DS

  // 后置动作列
  postActionColumns = [
    {
      name: 'functionPath',
      width: 180,
      editor: (record) => {
        if (record.getState('editing')) {
          return <TextField name="functionPath" />;
        } else {
          return record.getState('editing');
        }
      },
    },
    {
      name: 'functionName',
      width: 120,
      editor: (record) => record.getState('editing'),
      // editor: (record) => {
      //   if (record.getState('editing')) {
      //     return <IntlField name="functionName" />;
      //   } else {
      //     return record.getState('editing');
      //   }
      // },
    },
    {
      name: 'enabledFlag',
      width: 80,
      editor: (record) => {
        if (record.getState('editing')) {
          return <Switch name="enabledFlag" unCheckedValue={0} checkedValue={1} />;
        } else {
          return false;
        }
      },
    },
    {
      name: 'operation',
      header: intl.get('hzero.common.btn.action').d('操作'),
      align: 'center',
      renderer: ({ record }) => this.commands(record, 'postAction'),
      lock: 'right',
    },
  ];

  // 操作列渲染
  @Bind()
  commands(record, commandType) {
    const btns = [];
    if (!record.getState('editing')) {
      btns.push(
        <a
          style={{ cursor: 'pointer', marginRight: '8px' }}
          onClick={() => this.handleAction(record, commandType)}
          disabled={this.pageTableDataDS.getState('hidden')}
        >
          {intl.get('hzero.common.status.editor').d('编辑')}
        </a>,
        <a
          style={{ cursor: 'pointer' }}
          onClick={() => this.lineDelete(record, commandType)}
          disabled={this.pageTableDataDS.getState('hidden')}
        >
          {intl.get('hzero.common.status.delete').d('删除')}
        </a>
      );
    } else {
      btns.push(
        <a style={{ cursor: 'pointer' }} onClick={() => this.handleAction(record, commandType)}>
          {intl.get('hzero.common.status.cancel').d('取消')}
        </a>
      );
    }
    return btns;
  }

  /**
   * 操作行的编辑与取消
   * @param {*object} record - 行数据
   */
  @Bind()
  handleAction(record, commandType) {
    if (!record.getState('editing')) {
      record.setState('editing', true);
    } else if (
      record.get('relationPageId') ||
      record.get('postActionId') ||
      record.get('statusOperationId')
    ) {
      record.reset();
      record.setState('editing', false);
    } else if (commandType === 'page') {
      this.pageTableDataDS.remove(record);
    } else {
      this.postActionTableDataDS.remove(record);
    }
  }

  /**
   * 确认
   */
  @Bind()
  async handleConfirm(flag, record = {}) {
    const validFlag = await this.drawerDataDs.current.validate();
    if (validFlag) {
      const currentData = this.drawerDataDs.current.toJSONData();
      const paramArray = this.pageTableDataDS.toData();
      const postActionparamArray = this.postActionTableDataDS.toData();
      const newData = {
        ...currentData,
        parentConfigId:
          Object.keys(record).length === 0
            ? 0
            : flag
            ? currentData.parentConfigId
            : record.get('statusConfigId'),
      };
      const response = confirmData(newData);
      response.then((res) => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
            return false;
          } else {
            const newParamArray = paramArray.map((n) => ({
              ...n,
              postActionId: flag === 2 ? '' : n?.postActionId,
              statusConfigId: res?.statusConfigId,
              pageOrganizationId: res?.organizationId,
              tenantId: res?.organizationId,
            }));
            const newPostActionparamArray = postActionparamArray.map((n) => ({
              ...n,
              postActionId: flag === 2 ? '' : n?.postActionId,
              statusConfigId: res?.statusConfigId,
              pageOrganizationId: res?.organizationId,
              tenantId: res?.organizationId,
            }));
            if (flag === 2) {
              notification.success({
                message: intl.get(`${prefix}.view.message.saveSuccess`).d('保存成功!'),
                placement: 'bottomRight',
              });
            } else {
              Promise.all([
                tablePageDataSave(newParamArray),
                tablePostActionDataSave(newPostActionparamArray),
              ]).then((resp) => {
                if (resp) {
                  const errorArray = resp.filter((n) => n?.failed);
                  if (errorArray.length > 0) {
                    notification.warning({
                      message: errorArray[0].message,
                      placement: 'bottomRight',
                    });
                    return false;
                  }
                  notification.success({
                    message: intl.get(`${prefix}.view.message.saveSuccess`).d('保存成功!'),
                    placement: 'bottomRight',
                  });
                }
              });
            }
            this.tableDs.query();
            this.tableDs.reset();
            return true;
          }
        }
      });
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.warning`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
      return false;
    }
  }

  @Bind()
  lineAdd() {
    const record = this.pageTableDataDS.create({});
    record.setState('editing', true);
    record.init('statusConfigId', this.drawerDataDs.current.get('statusConfigId'));
  }

  @Bind()
  postActionLineAdd() {
    const record = this.postActionTableDataDS.create({}, 0);
    record.setState('editing', true);
    record.init('statusConfigId', this.drawerDataDs.current.get('statusConfigId'));
  }

  @Bind()
  async lineDelete(record, commandType) {
    if (commandType === 'page') {
      tablePageDataDelete([record.toJSONData()]).then((res) => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
          } else {
            notification.success({
              message: intl.get(`${prefix}.view.message.deleteSuccess`).d('删除成功!'),
              placement: 'bottomRight',
            });
            this.pageTableDataDS.setQueryParameter('statusConfigId', record.get('statusConfigId'));
            this.pageTableDataDS.setQueryParameter(
              'pageOrganizationId',
              this.drawerDataDs.current.get('organizationId')
            );
            this.pageTableDataDS.query();
          }
        }
      });
    } else {
      // 删除前添加校验
      // const validFlag = await this.drawerDataDs.validate();
      // if (!validFlag) {
      //   notification.warning({
      //     message: intl.get(`${prefix}.view.message.warning`).d('请填写必填项!'),
      //     placement: 'bottomRight',
      //   });
      //   return false;
      // }
      tablePostActionDataDelete([record.toJSONData()]).then((res) => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
          } else {
            notification.success({
              message: intl.get(`${prefix}.view.message.deleteSuccess`).d('删除成功!'),
              placement: 'bottomRight',
            });
            this.postActionTableDataDS.setQueryParameter(
              'statusConfigId',
              record.get('statusConfigId')
            );
            this.postActionTableDataDS.setQueryParameter(
              'pageOrganizationId',
              this.drawerDataDs.current.get('organizationId')
            );
            this.postActionTableDataDS.query();
          }
        }
      });
    }
  }

  // 跳出数据编辑弹框
  @Bind()
  handleCreate(flag, recordAll = {}, serviceFlag = '') {
    let statusConfigId;
    // this.drawerDataDs.current.reset();
    // this.drawerDataDs.getField('organizationLOV').set('required', true);
    if (flag) {
      statusConfigId = !isEmpty(recordAll) ? recordAll.get('statusConfigId') : undefined;
      this.drawerDataDs.setQueryParameter('statusConfigId', statusConfigId);
      this.drawerDataDs.query().then((res) => {
        if (res) {
          this.drawerDataDs.current.status = 'update';

          if (this.drawerDataDs.current.get('typeCode') === 'CATALOGUE') return;

          if (flag === 2) {
            this.drawerDataDs.current.set({
              statusConfigId: '',
              organizationLOV: null,
              parentConfigId: this.drawerDataDs.current.get('parentConfigId'),
            });
            this.pageTableDataDS.setState('hidden', true);
            this.postActionTableDataDS.setState('hidden', true);
          } else {
            this.pageTableDataDS.setState('hidden', false);
            this.postActionTableDataDS.setState('hidden', false);
          }
          this.pageTableDataDS.setQueryParameter('statusConfigId', statusConfigId);
          this.pageTableDataDS.setQueryParameter('pageOrganizationId', res.organizationId);
          this.pageTableDataDS.query().then((response) => {
            if (response) {
              this.pageTableDataDS.forEach((item) => {
                item.set('status', 'update');
              });
            }
          });
          this.postActionTableDataDS.setQueryParameter('statusConfigId', statusConfigId);
          this.postActionTableDataDS.setQueryParameter('pageOrganizationId', res.organizationId);
          this.postActionTableDataDS.query().then((response) => {
            if (response) {
              this.postActionTableDataDS.forEach((item) => {
                item.set('status', 'update');
              });
            }
          });
        }
      });
    } else {
      this.drawerDataDs = new DataSet(drawerData());
      // if (!serviceFlag) {
      // this.drawerDataDs.getField('organizationLOV').set('required', false);
      // }
      if (recordAll) {
        this.drawerDataDs.current.set({
          parentConfigId: this.drawerDataDs.current.get('statusConfigId'),
          typeCode: serviceFlag ? 'SERVICE' : 'CATALOGUE',
        });
      }
    }

    const buttons = [
      <Button key="create" funcType="flat" icon="add" onClick={this.lineAdd} disabled={flag === 2}>
        {intl.get('hzero.common.button.new').d('新建')}
      </Button>,
    ];

    const postActionButtons = [
      <Button
        key="create"
        funcType="flat"
        icon="add"
        onClick={() => this.postActionLineAdd()}
        disabled={flag === 2}
      >
        {intl.get('hzero.common.button.new').d('新建')}
      </Button>,
    ];

    // 页面定义列
    const pageColumns = [
      {
        name: 'relationPageDesc',
        width: 180,
        editor: (record) => record.getState('editing'),
        // editor: (record) => {
        //   if (record.getState('editing')) {
        //     return <IntlField name="relationPageDesc" />;
        //   } else {
        //     return record.getState('editing');
        //   }
        // },
      },
      {
        name: 'relationPageValue',
        width: 120,
        editor: (record) => {
          if (record.getState('editing')) {
            return <TextField name="relationPageValue" />;
          } else {
            return record.getState('editing');
          }
        },
      },
      {
        name: 'enableFlag',
        width: 80,
        editor: (record) => {
          if (record.getState('editing')) {
            return <Switch name="enableFlag" unCheckedValue={0} checkedValue={1} />;
          } else {
            return false;
          }
        },
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.btn.action').d('操作'),
        align: 'center',
        renderer: ({ record }) => this.commands(record, 'page'),
        lock: 'right',
      },
    ];

    Modal.open({
      title:
        flag === 0
          ? serviceFlag === 1
            ? intl.get(`${prefix}.modal.title.newService`).d('新建服务')
            : intl.get(`${prefix}.model.definitionMachineCF.newClass`).d('新建分类')
          : flag === 1
          ? intl.get(`${prefix}.modal.title.edit`).d('编辑服务')
          : intl.get(`${prefix}.modal.title.copy`).d('复制服务'),
      drawer: true,
      children: (
        <Fragment>
          <Card>
            <Spin dataSet={this.drawerDataDs}>
              <Form dataSet={this.drawerDataDs} labelAlign="left" labelWidth={100}>
                <TextField name="moduleCode" disabled={flag} />
                <IntlField name="moduleDesc" />
                {/* <TextField name="statusMachineDesc" /> */}
                <Select name="typeCode" disabled />
                {flag && <Lov name="categoryParentLov" />}
                <NumberField name="sortNum" />
                {((flag && recordAll.get('typeCode') !== 'CATALOGUE') || serviceFlag) && (
                  <Lov name="organizationLOV" />
                )}
                <Switch name="enabledFlag" />
              </Form>
            </Spin>
          </Card>

          {statusConfigId && recordAll.get('typeCode') !== 'CATALOGUE' && (
            <Fragment>
              <Card title={intl.get(`${prefix}.modal.title.pageMaintain`).d('页面维护')}>
                <Spin dataSet={this.pageTableDataDS}>
                  <Table dataSet={this.pageTableDataDS} columns={pageColumns} buttons={buttons} />
                </Spin>
              </Card>
              <Card title={intl.get(`${prefix}.modal.title.postActionConfig`).d('后置动作配置')}>
                <Table
                  dataSet={this.postActionTableDataDS}
                  columns={this.postActionColumns}
                  buttons={postActionButtons}
                />
              </Card>
            </Fragment>
          )}
        </Fragment>
      ),
      style: { width: 650 },
      onOk: () => this.handleConfirm(flag, recordAll),
      afterClose: () => {
        this.drawerDataDs.reset();
        this.pageTableDataDS.reset();
        this.postActionTableDataDS.reset();
      },
    });
  }

  @Bind()
  handleDelete(record = {}) {
    const {
      data: { statusConfigId },
    } = record;
    if (statusConfigId) {
      Modal.confirm({
        title: intl.get(`${prefix}.modal.title.deleteModal`).d('是否确认删除'),
        okText: intl.get('hzero.common.button.sure').d('确定'),
        cancelText: intl.get('hzero.common.button.cancel').d('取消'),
        onOk: () => {
          const response = fetchDelete(statusConfigId);
          response.then((res) => {
            if (res) {
              if (res.failed) {
                notification.warning({
                  message: res.message,
                  placement: 'bottomRight',
                });
              } else {
                notification.success({
                  message: intl.get(`${prefix}.view.message.deleteSuccess`).d('删除成功!'),
                  placement: 'bottomRight',
                });
                this.tableDs.query();
              }
            }
          });
        },
      });
    }
  }

  render() {
    const columns = [
      {
        name: 'moduleDesc',
      },
      {
        name: 'moduleCode',
      },
      {
        name: 'sortNum',
      },
      {
        name: 'typeCodeMeaning',
      },
      {
        name: 'enabledFlag',
        width: 100,
      },
      {
        name: 'tenantName',
      },
      {
        header: intl.get(`${prefix}.model.definitionMachineCF.subCategory`).d('下级分类'),
        renderer: ({ record }) => {
          return (
            <Fragment>
              {/* <a onClick={() => this.handleCreate(0, record, 0)}>
                {intl.get(`${prefix}.model.definitionMachineCF.newClass`).d('新建分类')}
              </a> */}
              {record.get('typeCode') === 'CATALOGUE' && (
                <a onClick={() => this.handleCreate(0, record, 1)} style={{ marginLeft: '10px' }}>
                  {intl.get(`${prefix}.modal.title.newService`).d('新建服务')}
                </a>
              )}
              {record.get('typeCode') === 'SERVICE' && (
                <a onClick={() => this.handleCreate(2, record)} style={{ marginLeft: '10px' }}>
                  {intl.get(`${prefix}.model.definitionMachineCF.copy`).d('复制')}
                </a>
              )}
            </Fragment>
          );
        },
      },
      {
        header: intl.get(`${prefix}.model.definitionMachineCF.operation`).d('操作'),
        align: 'center',
        renderer: ({ record }) => {
          return (
            <Fragment>
              <a onClick={() => this.handleCreate(1, record)} style={{ marginRight: '8px' }}>
                {intl.get(`${prefix}.model.definitionMachineCF.editor`).d('编辑')}
              </a>
              <a onClick={() => this.handleDelete(record)}>
                {intl.get(`${prefix}.model.definitionMachineCF.delete`).d('删除')}
              </a>
            </Fragment>
          );
        },
      },
    ];

    return (
      <Fragment>
        <Header title={intl.get(`${prefix}.view.title.definitionMachineCF`).d('状态机分类定义')}>
          <Button icon="add" color="primary" onClick={() => this.handleCreate(0)}>
            {intl.get(`${prefix}.model.definitionMachineCF.newClass`).d('新建分类')}
          </Button>
        </Header>
        <Content>
          <Table dataSet={this.tableDs} columns={columns} customizable={false} mode="tree" />
        </Content>
      </Fragment>
    );
  }
}
