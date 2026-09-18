/**
 * MaintainTable - 澄清维护table
 * @date: 2019-11-13
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React from 'react';
import { Table, Popover, Modal } from 'hzero-ui';

import intl from 'utils/intl';

export default class MaintainTable extends React.Component {
  state = {
    readModalVisible: false,
    readModalRecord: {},
  };

  /**
   * 打开供应商查阅情况弹框
   */
  openReadModal = (record = {}) => {
    this.setState({ readModalVisible: true, readModalRecord: record });
  };

  closeReadModal = () => {
    this.setState({ readModalVisible: false, readModalRecord: {} });
  };

  render() {
    const {
      Loading,
      onChange,
      onClarfDetail,
      // clarifyStatus = [],
      fetchMaintainList,
      maintainListPagination,
      customizeTable,
      // sourceKey,
      bidFlag,
    } = this.props;
    const { readModalVisible, readModalRecord } = this.state;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionNo`).d('澄清单号'),
        dataIndex: 'clarifyNum',
        width: 100,
        render: (val, record) => <a onClick={() => onClarfDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionState`).d('状态'),
        dataIndex: 'clarifyStatusMeaning',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionDescription`).d('标题'),
        dataIndex: 'title',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      // 澄清答疑查阅情况：仅招标场景展示
      bidFlag && {
        title: intl.get('ssrc.supplierQuotation.model.supQuo.clarifyReadRatio').d('澄清答疑'),
        dataIndex: 'clarifyReadRatio',
        width: 100,
        render: (val, record) => {
          const { readNum, allNum } = record || {};
          // 未读/总数，数据由列表接口下发；两个字段都没有时不展示
          if (readNum === undefined || allNum === undefined) {
            return '-';
          }
          return (
            <a onClick={() => this.openReadModal(record)}>
              {`${readNum ?? 0}/${allNum ?? 0}`}
            </a>
          );
        },
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.questionUser`).d('发布人'),
        dataIndex: 'submittedByUserName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.publishDate`).d('发布时间'),
        dataIndex: 'submittedDate',
        width: 150,
      },
      {
        title: intl.get('ssrc.common.company').d('公司'),
        dataIndex: 'companyName',
        width: 100,
      },
    ].filter(Boolean);

    // 弹框：该澄清单的供应商查阅情况（数据取自行上的 supplierCompanyList）
    const supplierColumns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        dataIndex: 'companyNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.whetherRead`).d('是否查阅'),
        dataIndex: 'readFlag',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.readDate`).d('查阅时间'),
        dataIndex: 'readDate',
        width: 160,
      },
    ];

    const table = (
      <Table
        bordered
        rowKey="clarifyId"
        columns={columns}
        dataSource={fetchMaintainList}
        pagination={maintainListPagination}
        loading={Loading}
        onChange={(page) => onChange(page)}
      />
    );

    const tableNode = customizeTable
      ? customizeTable(
          {
            code: bidFlag
              ? 'SSRC.BID_HALL.NEW_CLARIFY.LIST_CLARIFICATION'
              : 'SSRC.INQUIRY_HALL.NEW_CLARIFY.LIST_CLARIFICATION',
            readOnly: true,
          },
        <Table
          bordered
          rowKey="clarifyId"
          columns={columns}
          dataSource={fetchMaintainList}
          pagination={maintainListPagination}
          loading={Loading}
          onChange={(page) => onChange(page)}
        />
        )
      : table;

    return (
      <React.Fragment>
        {tableNode}
        <Modal
          title={intl.get('ssrc.supplierQuotation.model.supQuo.clarifyReadRatio').d('澄清答疑')}
          visible={readModalVisible}
          width={720}
          footer={null}
          onCancel={this.closeReadModal}
        >
          <Table
            bordered
            rowKey="companyId"
            columns={supplierColumns}
            dataSource={readModalRecord.supplierCompanyList || []}
            pagination={false}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
