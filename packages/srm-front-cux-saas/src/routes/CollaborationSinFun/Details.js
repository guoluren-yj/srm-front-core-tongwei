import React, { Component, Fragment } from 'react';
import { Table, DataSet, Form, Button, Modal } from 'choerodon-ui/pro';
import { Collapse, notification } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isNil } from 'lodash';
import { observer } from 'mobx-react';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { headerInfoData, tableLineData, operationData } from './initialDataDs';
import {
  saveLine,
  deleteLine,
  saveData,
  submitData,
  deleteData,
  headerBtnAffairHandle,
  fetchHeaderBtn,
} from '@/services/collaborationSinFunServices';
import OperateButtons from './OperateButtons';

const prefix = 'scux.collaborationSinFun';
const { Panel } = Collapse;
@WithCustomizeC7N({
  unitCode: [
    'SCUX.CUSTOMIZE.DETAIL.MAINTAIN', // 单据头信息
    'SCUX.CUSTOMIZE.DETAIL.LINE', // 单据行信息
    'SCUX.CUSTOMIZE.DETAIL.LINE_BUTTON', // 行按钮组
    'SCUX.CUSTOMIZE.DETAIL.BUTTON', // 头按钮组
    'SCUX.CUSTOMIZE.MAINTAIN.ATTRIBUTE.DETAIL', // 操作记录
  ],
})
@formatterCollections({ code: ['scux.collaborationSinFun', 'scux.common'] })
@observer
export default class Details extends Component {
  headerInfoData = new DataSet(headerInfoData());

  tableLineData = new DataSet(tableLineData());

  operationData = new DataSet(operationData());

  constructor(props) {
    super(props);
    const {
      match: { params },
      location: { search },
    } = props;
    const routerParams = querystring.parse(search.substr(1));
    this.state = {
      routerParams,
      customizeHeaderId: params.customizeHeaderId,
      pageOperationList: [],
    };
  }

  componentDidMount() {
    const { customizeHeaderId, routerParams } = this.state;
    if (routerParams.statusConfigId) {
      fetchHeaderBtn(routerParams.statusConfigId).then((res) => {
        if (res) {
          const { statusList } = res;
          const { pageOperationList } = statusList || {};
          this.setState({ pageOperationList });
        }
      });
    }
    if (customizeHeaderId) {
      this.fetchData(customizeHeaderId);
    }
  }

  @Bind()
  fetchData(customizeHeaderId) {
    this.headerInfoData.setQueryParameter('customizeHeaderId', customizeHeaderId);
    this.tableLineData.setQueryParameter('customizeHeaderId', customizeHeaderId);
    this.headerInfoData.query().then((res) => {
      if (res) {
        const { statusList } = res;
        const { pageOperationList } = statusList || {};
        this.setState({ pageOperationList });
      }
    });
    this.tableLineData.query();
  }

  @Bind()
  handleCreateLine() {
    this.tableLineData.create({});
  }

  @Bind()
  async handleSaveLine() {
    const { customizeHeaderId } = this.state;
    const validFlag = await this.tableLineData.validate();
    if (validFlag) {
      const tableData = this.tableLineData.toJSONData();
      const newData = tableData.map((item) => ({ ...item, customizeHeaderId }));
      saveLine(newData).then((res) => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
          } else {
            notification.success({
              message: intl.get(`${prefix}.view.message.saveSuccess`).d('保存成功!'),
              placement: 'bottomRight',
            });
            this.tableLineData.setQueryParameter('customizeHeaderId', customizeHeaderId);
            this.tableLineData.setQueryParameter('customizeUnitCode', 'SCUX.CUSTOMIZE.DETAIL.LINE');
            this.tableLineData.query();
          }
        }
      });
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.warning`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
    }
  }

  @Bind()
  handleDeleteLine(selectedData) {
    const { customizeHeaderId } = this.state;
    const filterData = selectedData.filter((item) => !isNil(item.customizeLineId));
    const everyFlag = selectedData.every((item) => isNil(item.customizeLineId));
    if (everyFlag) {
      this.tableLineData.remove(this.tableLineData.selected);
      return;
    }
    deleteLine(filterData).then((res) => {
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
          this.tableLineData.setQueryParameter('customizeHeaderId', customizeHeaderId);
          this.tableLineData.setQueryParameter('customizeUnitCode', 'SCUX.CUSTOMIZE.DETAIL.LINE');
          this.tableLineData.query();
        }
      }
    });
  }

  @Bind()
  handleOperation() {
    const { customizeTable } = this.props;
    const { customizeHeaderId } = this.state;
    this.operationData.setQueryParameter('customizeHeaderId', customizeHeaderId);
    this.operationData.query();
    Modal.open({
      title: intl.get('hzero.common.view.button.operationRecord').d('操作记录'),
      children: customizeTable(
        {
          code: 'SCUX.CUSTOMIZE.MAINTAIN.ATTRIBUTE.DETAIL', // 单元编码，必传
        },
        <Table dataSet={this.operationData} columns={[]} />
      ),
      closable: true,
      footer: null,
    });
  }

  @Bind()
  async handleSave() {
    const { customizeHeaderId } = this.state;
    const validFlag = await this.headerInfoData.current.validate();
    if (validFlag) {
      const headerData = this.headerInfoData.current.toJSONData();
      saveData([headerData]).then((res) => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
          } else {
            notification.success({
              message: intl.get(`${prefix}.view.message.saveSuccess`).d('保存成功!'),
              placement: 'bottomRight',
            });
            this.headerInfoData.setQueryParameter('customizeHeaderId', customizeHeaderId);
            this.headerInfoData.query();
          }
        }
      });
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.fillInRequired`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
    }
  }

  @Bind()
  async handleSubmit() {
    const { customizeHeaderId } = this.state;
    const validFlag = await this.headerInfoData.current.validate();
    if (validFlag) {
      const headerData = this.headerInfoData.current.toJSONData();
      submitData([headerData]).then((res) => {
        if (res) {
          if (res.failed) {
            notification.warning({
              message: res.message,
              placement: 'bottomRight',
            });
          } else {
            notification.success({
              message: intl.get(`${prefix}.view.message.submitSuccess`).d('提交成功!'),
              placement: 'bottomRight',
            });
            this.headerInfoData.setQueryParameter('customizeHeaderId', customizeHeaderId);
            this.headerInfoData.query();
          }
        }
      });
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.fillInRequired`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
    }
  }

  @Bind()
  async handleDelete() {
    const headerData = this.headerInfoData.current.toJSONData();
    deleteData([headerData]).then((res) => {
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
          this.props.history.push('/scux/collaboration-single-function/list');
        }
      }
    });
  }

  /**
   * renderButton - 渲染按钮
   */
  @Bind()
  renderButton(newPageOperationList) {
    if (newPageOperationList?.length > 0) {
      return newPageOperationList.map((v) => (
        <Button onClick={() => this.handleHeaderBtnAffairHandle(v)}>{v.operationDesc}</Button>
      ));
    }
  }

  @Bind()
  async handleHeaderBtnAffairHandle(item = {}) {
    const { detail, routerParams } = this.state;
    const { operationCode, operationDesc } = item;
    const validFlag =
      (await this.headerInfoData.current.validate()) && (await this.tableLineData.validate());
    if (validFlag) {
      const newData = this.headerInfoData.current.toJSONData();
      const customizeLineList = this.tableLineData.toJSONData();
      const response = await headerBtnAffairHandle([
        {
          ...detail,
          ...newData,
          statusConfigId: routerParams.statusConfigId,
          operationCode,
          operationDesc,
          enabledFlag: 1,
          customizeLineList,
        },
      ]);
      if (response) {
        if (response.failed) {
          notification.error({ description: response.message });
          return;
        }
        const { customizeHeaderId = '' } = response[0];
        if (customizeHeaderId) {
          notification.success({
            message: intl.get(`scux.common.view.message.operationSuccess`).d('操作成功!'),
            placement: 'bottomRight',
          });
          if (response[0].operationCode === 'SAVE') {
            this.fetchData(customizeHeaderId);
          } else {
            this.props.history.push('/scux/collaboration-single-function/list');
          }
        }
      }
    } else {
      notification.warning({
        message: intl.get(`scux.common.view.message.warning`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
    }
  }

  render() {
    const {
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      location: { pathname },
    } = this.props;
    const { customizeHeaderId, pageOperationList } = this.state;
    const selectedData = this.tableLineData.selected.map((item) => item.data);
    const ButtonsProps = {
      tableDs: this.headerInfoData,
      handleSave: this.handleSave,
      handleSubmit: this.handleSubmit,
      handleDelete: this.handleDelete,
      onButtonsRef: this.onButtonsRef,
      handleOperation: this.handleOperation,
      customizeBtnGroup,
      pathname,
      attachmentUuid: this.headerInfoData.current.get('attachmentUuid'),
    };

    const HeaderButtons = () => {
      return (
        !location.pathname.includes('/pub') && (
          <Fragment>{this.renderButton(pageOperationList)}</Fragment>
        )
      );
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`${prefix}.view.title.collaborationSinFunDetails`).d('协作单明细')}
          backPath="/scux/collaboration-single-function/list"
        >
          <OperateButtons {...ButtonsProps} />
          <HeaderButtons />
        </Header>
        <Content>
          <Collapse defaultActiveKey={['header', 'line']}>
            <Panel header={intl.get(`${prefix}.view.title.baseInfo`).d('基本信息')} key="header">
              {customizeForm(
                {
                  code: 'SCUX.CUSTOMIZE.DETAIL.MAINTAIN', // 单元编码，必传
                },
                <Form dataSet={this.headerInfoData} columns={3} />
              )}
            </Panel>
            <Panel header={intl.get(`${prefix}.view.title.lineInfo`).d('行信息')} key="line">
              <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                {customizeBtnGroup({ code: 'SCUX.CUSTOMIZE.DETAIL.LINE_BUTTON' }, [
                  <Button
                    color="primary"
                    data-name="new"
                    onClick={this.handleCreateLine}
                    wait={500}
                    waitType="debounce"
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>,
                  <Button
                    data-name="save"
                    onClick={this.handleSaveLine}
                    wait={500}
                    waitType="debounce"
                    disabled={!customizeHeaderId}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>,
                  <Button
                    data-name="delete"
                    onClick={() => this.handleDeleteLine(selectedData)}
                    wait={500}
                    disabled={isEmpty(selectedData)}
                    waitType="debounce"
                  >
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>,
                ])}
              </div>
              {customizeTable(
                {
                  code: 'SCUX.CUSTOMIZE.DETAIL.LINE', // 单元编码，必传
                },
                <Table dataSet={this.tableLineData} queryFieldsLimit={3} columns={[]} />
              )}
            </Panel>
          </Collapse>
        </Content>
      </Fragment>
    );
  }
}
