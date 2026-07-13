// 补充协议
import React, { Component, Fragment } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
// import { Tag } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { Bind } from 'lodash-decorators';
// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import StatusTag from '../../../../components/StatusTag';
import ChangeCompare from '../changeCompare';

// @WithCustomizeC7N({
//   unitCode: ['SPCM.WORKSPACE_DETAIL.CONTRACTREPLENISH'],
// })
@withRouter
export default class ContractReplenish extends Component {
  changeSkip(record) {
    const { redirectDetail = e => e } = this.props;
    return <a onClick={() => redirectDetail(record.get('pcHeaderId'))}>{record.get('pcNum')}</a>;
  }

  @Bind
  showHistoryCompare = record => {
    // 返利标识从协议头上面获取
    const {rebateFlag} =this.props;
    const { mainContractId, pcHeaderId, pcNum } = record?.get([
      'mainContractId',
      'pcHeaderId',
      'pcNum',
    ]);
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: Modal.key(),
      drawer: true,
      title: `${intl.get(`spcm.common.model.fieldComparison`).d('字段对比')}-${pcNum}`,
      children: (
        <ChangeCompare
          {...this.props}
          mainContractId={mainContractId}
          pcHeaderId={pcHeaderId}
          rebateFlag={rebateFlag}
          fieldComparison
        />
      ),
      cancelProps: {
        color: 'primary',
      },
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn, cancelBtn) => cancelBtn,
      bodyStyle: { padding: 10, backgroundColor: '#f4f4f4' },
      style: { width: '1200px' },
    });
  };

  renderColumns() {
    const { remoteWorkDetail } = this.props;
    const columns = [
      {
        name: 'pcStatusCodeMeaning',
        width: 200,
        renderer: ({ value, record }) => (
          <StatusTag text={value} value={record.get('pcStatusCode')} />
        ),
      },
      {
        name: 'pcNum',
        width: 200,
        renderer: ({ record }) => {
          return this.changeSkip(record);
        },
      },
      {
        name: 'version',
        width: 100,
      },
      {
        name: 'fieldComparison',
        renderer: ({ record }) => (
          <a onClick={() => this.showHistoryCompare(record)}>
            {intl.get('spcm.common.view.clickToview').d('点击查看')}
          </a>
        ),
      },
      {
        name: 'createdName',
        width: 200,
      },
      {
        name: 'creationDate',
        width: 200,
      },
      {
        name: 'effectDate',
        width: 200,
      },
    ];
    return remoteWorkDetail
      ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_REPLENISH_RENDER_COLUMNS', columns, {
          current: this,
        })
      : columns;
  }

  render() {
    const { replenishDs, customizeTable, custCode } = this.props;
    return (
      <Fragment>
        {customizeTable(
          {
            code: custCode || 'SPCM.WORKSPACE_DETAIL.CONTRACTREPLENISH',
          },
          <Table dataSet={replenishDs} columns={this.renderColumns()} />
        )}
      </Fragment>
    );
  }
}
