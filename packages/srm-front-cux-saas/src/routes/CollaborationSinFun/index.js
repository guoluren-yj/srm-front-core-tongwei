import React, { Component, Fragment } from 'react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { notification, Tabs } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { observer } from 'mobx-react';

import { Header, Content } from 'components/Page';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { tableData, tableDetailsData } from './initialDataDs';
import OperateButtons from './OperateButtons';
import {
  saveData,
  submitData,
  deleteData,
  initialMethod,
  headerBtnAffairHandle,
} from '@/services/collaborationSinFunServices';

const prefix = 'scux.collaborationSinFun';
const { TabPane } = Tabs;

@WithCustomizeC7N({
  unitCode: [
    'SCUX.CUSTOMIZE.MAINTAIN.INIT', // 列表信息
    'SCUX.CUSTOMIZE.MAINTAIN.BUTTON', // 按钮组
    'SCUX.CUSTOMIZE.MAINTAIN.INIT.DETAIL', // 明细列表
  ],
})
@formatterCollections({ code: ['scux.collaborationSinFun', 'scux.common'] })
@observer
export default class CollaborationSinFun extends Component {
  tableDs = new DataSet(tableData());

  tableDetailsData = new DataSet(tableDetailsData());

  state = {
    pageOperationList: [], // 初始化按钮队列
    tabKey: 'mantain',
    statusConfigId: '',
  };

  componentDidMount() {
    initialMethod().then((res) => {
      if (res) {
        const { pageOperationList } = res;
        // 通过initialFlag区分初始化“新增”按钮与其他按钮
        const newPageOperationList = pageOperationList?.map((n) => ({ ...n, initialFlag: true }));
        this.setState({
          pageOperationList: newPageOperationList,
          statusConfigId: res.statusConfigId,
        });
      }
    });
    this.fetchData(this.state.tabKey);
  }

  @Bind()
  fetchData(key) {
    const { statusConfigId } = this.state;
    if (key === 'mantain') {
      this.tableDs.setQueryParameter('customizeUnitCode', 'SCUX.CUSTOMIZE.MAINTAIN.INIT.QUERY');
      this.tableDs.setQueryParameter('statusConfigId', statusConfigId);
      this.tableDs.query();
    } else {
      this.tableDetailsData.setQueryParameter(
        'customizeUnitCode',
        'SCUX.CUSTOMIZE.MAINTAIN.INIT.LINE_QUERY'
      );
      this.tableDetailsData.query();
    }
  }

  @Bind()
  handleUpdate(customizeHeaderId = '', statusList = {}) {
    const { statusConfigId } = this.state;
    if (customizeHeaderId) {
      const { relationPageValue } = statusList;
      this.props.history.push({
        pathname: relationPageValue,
        search: querystring.stringify({
          statusConfigId,
        }),
      });
    } else {
      this.props.history.push({
        pathname: '/scux/collaboration-single-function/create',
        search: querystring.stringify({
          statusConfigId,
        }),
      });
    }
  }

  @Bind()
  toggleButtonsLoading(isLoading = false) {
    const { toggleButtonLoading = () => {} } = this.OperateButtonRef;
    toggleButtonLoading(isLoading);
  }

  @Bind()
  async handleSave() {
    this.toggleButtonsLoading(true);
    const validFlag = await this.tableDs.validate();
    if (validFlag) {
      const tableDatas = this.tableDs.toData();
      saveData(tableDatas).then((res) => {
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
            this.tableDs.query();
          }
        }
        this.toggleButtonsLoading();
      });
    } else {
      notification.warning({
        message: intl.get(`${prefix}.view.message.fillInRequired`).d('请填写必填项!'),
        placement: 'bottomRight',
      });
      this.toggleButtonsLoading();
    }
  }

  @Bind()
  async handleSubmit() {
    this.toggleButtonsLoading(true);
    const selectedData = this.tableDs.selected.map((item) => item.toJSONData());
    submitData(selectedData).then((res) => {
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
          this.tableDs.query();
        }
      }
      this.toggleButtonsLoading();
    });
  }

  @Bind()
  async handleDelete() {
    this.toggleButtonsLoading(true);
    const selectedData = this.tableDs.selected.map((item) => item.toJSONData());
    deleteData(selectedData).then((res) => {
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
      this.toggleButtonsLoading();
    });
  }

  @Bind()
  handleImport() {
    this.props.history.push({
      pathname: '/scux/collaboration-single-function/data-import/SCUX.CUSTOMIZE.HEADER.IMPORT',
      search: querystring.stringify({
        action: 'hzero.common.button.import',
        backPath: `/scux/collaboration-single-function/list`,
      }),
    });
  }

  @Bind()
  async handleHeaderBtnAffairHandle(operationItem) {
    const { statusConfigId } = this.state;
    const { operationCode, initialFlag, operationDesc } = operationItem || {};
    const selectedRows = this.tableDs.selected.map((s) => s.toData()) || [];
    const params = selectedRows.map((v) => ({
      ...v,
      operationCode,
      operationDesc,
      statusConfigId,
    }));
    if (initialFlag) {
      this.props.history.push({
        pathname: '/scux/collaboration-single-function/create',
        search: querystring.stringify({
          statusConfigId,
        }),
      });
    } else {
      const response = await headerBtnAffairHandle(params);
      if (response) {
        if (response.failed) {
          notification.warning({
            message: response.message,
            placement: 'bottomRight',
          });
        } else {
          notification.success({
            message: intl.get(`scux.common.view.message.operationSuccess`).d('操作成功!'),
            placement: 'bottomRight',
          });
          this.tableDs.setQueryParameter('customizeUnitCode', 'SCUX.CUSTOMIZE.MAINTAIN.INIT');
          this.tableDs.setQueryParameter('statusConfigId', statusConfigId);
          this.tableDs.query();
        }
      }
    }
  }

  @Bind()
  handleChnageTabs(key) {
    this.fetchData(key);
    this.setState({ tabKey: key });
  }

  // 头部操作按钮ref
  @Bind()
  onButtonsRef(ref) {
    this.OperateButtonRef = ref;
  }

  /**
   * renderButton - 渲染按钮
   */
  @Bind()
  renderButton(btnConfig) {
    if (btnConfig) {
      return (
        btnConfig.map &&
        btnConfig.map((v) => (
          <Button onClick={() => this.handleHeaderBtnAffairHandle(v)}>{v.operationDesc}</Button>
        ))
      );
    }
  }

  render() {
    const {
      customizeTable,
      customizeBtnGroup,
      location: { pathname },
    } = this.props;
    const { pageOperationList, tabKey } = this.state;
    const selectedRows = this.tableDs.selected.map((item) => item.data) || [];
    const isShowBtn =
      selectedRows.length > 0 &&
      selectedRows.every((v) => v.statusCode === selectedRows[0].statusCode);
    // 已选中的按钮队列
    const selectedPageOperationList =
      selectedRows.length > 0 &&
      selectedRows[0].statusList &&
      selectedRows[0].statusList.pageOperationList;
    const ButtonsProps = {
      tableDs: this.tableDs,
      handleUpdate: this.handleUpdate,
      handleSave: this.handleSave,
      handleSubmit: this.handleSubmit,
      handleDelete: this.handleDelete,
      handleImport: this.handleImport,
      onButtonsRef: this.onButtonsRef,
      customizeBtnGroup,
      pathname,
      tabKey,
    };
    const columns = [
      {
        name: 'docNum',
        renderer: ({ value, record }) => (
          <a
            onClick={() =>
              this.handleUpdate(record.get('customizeHeaderId'), record.get('statusList'))
            }
          >
            {value}
          </a>
        ),
      },
    ];
    return (
      <Fragment>
        <Header title={intl.get(`${prefix}.view.title.collaborationSinFun`).d('协作单功能')}>
          {tabKey === 'mantain' &&
            (isShowBtn
              ? this.renderButton(selectedPageOperationList)
              : this.renderButton(pageOperationList))}
          <OperateButtons {...ButtonsProps} />
        </Header>
        <Content>
          <Tabs defaultActiveKey="mantain" onChange={this.handleChnageTabs}>
            <TabPane key="mantain" tab={intl.get(`${prefix}.view.tab.mantain`).d('按单查询')}>
              {customizeTable(
                {
                  code: 'SCUX.CUSTOMIZE.MAINTAIN.INIT', // 单元编码，必传
                },
                <SearchBarTable
                  searchCode="SCUX.CUSTOMIZE.MAINTAIN.INIT.QUERY"
                  dataSet={this.tableDs}
                  columns={columns}
                  data={[]}
                  queryFieldsLimit={3}
                />
              )}
            </TabPane>
            <TabPane key="details" tab={intl.get(`${prefix}.view.tab.details`).d('按单明细查询')}>
              {customizeTable(
                {
                  code: 'SCUX.CUSTOMIZE.MAINTAIN.INIT.DETAIL', // 单元编码，必传
                },
                <SearchBarTable
                  searchCode="SCUX.CUSTOMIZE.MAINTAIN.INIT.LINE_QUERY"
                  dataSet={this.tableDetailsData}
                  columns={[]}
                  data={[]}
                  queryFieldsLimit={3}
                />
              )}
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
