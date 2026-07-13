import React, { Component, Fragment } from 'react';
import { Table, DataSet, Form, Modal, Button } from 'choerodon-ui/pro';
import { Collapse, notification } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import querystring from 'querystring';

import { Header, Content } from 'components/Page';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import { SRM_CUSTOMIZATION } from '_utils/config';

import { headerBtnAffairHandle, fetchHeaderBtn } from '@/services/collaborationSinFunServices';
import { headerInfoData, tableLineData, operationData } from './initialDataDs';

const prefix = 'scux.collaborationSinFun';
const organizationId = getCurrentOrganizationId();
const { Panel } = Collapse;
@WithCustomizeC7N({
  unitCode: [
    'SCUX.CUSTOMIZE.DTL.READONLY.HEADER', // 单据头信息
    'SCUX.CUSTOMIZE.DTL.READONLY.LINE', // 单据行信息
    'SCUX.CUSTOMIZE.MAINTAIN.ATTRIBUTE', // 操作记录
    'SCUX.CUSTOMIZE.DTL.READONLY.BUTTON', // 头按钮
    'SCUX.CUSTOMIZE.MAINTAIN.CUS_ATTRIBUTE', // 过程附件内容
  ],
})
@formatterCollections({ code: ['scux.collaborationSinFun'] })
@observer
export default class DetailsReadOnly extends Component {
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
  handleOperation(type) {
    const { customizeTable } = this.props;
    const { customizeHeaderId } = this.state;
    this.operationData.setQueryParameter('customizeHeaderId', customizeHeaderId);
    this.operationData.setQueryParameter('codeType', type);
    this.operationData.query();
    Modal.open({
      title: intl
        .get(`hzero.common.view.button.${type}`)
        .d(type === 'operation' ? '操作记录' : '过程附件查看'),
      children: customizeTable(
        {
          code:
            type === 'operation'
              ? 'SCUX.CUSTOMIZE.MAINTAIN.ATTRIBUTE'
              : 'SCUX.CUSTOMIZE.MAINTAIN.CUS_ATTRIBUTE', // 单元编码，必传
        },
        <Table dataSet={this.operationData} columns={[]} />
      ),
      closable: true,
      footer: null,
      style: { width: 700 },
    });
  }

  @Bind()
  getQueryData(datas) {
    if (datas) {
      const data = Object.assign(datas);
      Object.keys(data).forEach((item) => {
        if (!data[item]) {
          delete data[item];
        }
      });
      return data;
    }
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
    const newData = this.headerInfoData.current.toData();
    const customizeLineList = this.tableLineData.toData();
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
  }

  render() {
    const { customizeTable, customizeForm, customizeBtnGroup } = this.props;
    const { pageOperationList } = this.state;
    const params =
      this.headerInfoData.queryDataSet &&
      this.getQueryData(this.headerInfoData.queryDataSet.toData()[0]);

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
          <HeaderButtons />
          {customizeBtnGroup({ code: 'SCUX.CUSTOMIZE.DTL.READONLY.BUTTON' }, [
            <ExcelExport
              data-name="export"
              buttonText={intl.get(`hzero.common.button.export`).d('导出')}
              otherButtonProps={{ icon: 'export' }}
              requestUrl={`${SRM_CUSTOMIZATION}/v1/${organizationId}/customize-headers/export`}
              queryParams={{ ...params }}
            />,
            <Button
              data-name="operation"
              onClick={() => this.handleOperation('operation')}
              wait={500}
              waitType="debounce"
            >
              {intl.get('hzero.common.view.button.operationRecord').d('操作记录')}
            </Button>,
            <Button
              data-name="attachment"
              onClick={() => this.handleOperation('attachment')}
              wait={500}
              waitType="debounce"
            >
              {intl.get('hzero.common.view.button.attachment').d('过程附件查看')}
            </Button>,
            <Button>
              <Upload
                data-name="operation"
                filePreview
                bucketName="private-bucket"
                attachmentUUID={this.headerInfoData.current.get('attachmentUuid')}
                tenantId={organizationId}
                afterOpenUploadModal={(uuid) => {
                  this.headerInfoData.current.set('attachmentUuid', uuid);
                }}
              />
            </Button>,
          ])}
        </Header>
        <Content>
          <Collapse defaultActiveKey={['header', 'line']}>
            <Panel header={intl.get(`${prefix}.view.title.baseInfo`).d('基本信息')} key="header">
              {customizeForm(
                {
                  code: 'SCUX.CUSTOMIZE.DTL.READONLY.HEADER', // 单元编码，必传
                },
                <Form dataSet={this.headerInfoData} columns={3} />
              )}
            </Panel>
            <Panel header={intl.get(`${prefix}.view.title.lineInfo`).d('行信息')} key="line">
              {customizeTable(
                {
                  code: 'SCUX.CUSTOMIZE.DTL.READONLY.LINE', // 单元编码，必传
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
