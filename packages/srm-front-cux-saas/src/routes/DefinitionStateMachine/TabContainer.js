import React, { Component, Fragment } from 'react';
import { Table, Form, Spin, Output } from 'choerodon-ui/pro';

export default class TabContainer extends Component {
  render() {
    const { headerDataDs, currentDS, columns } = this.props;
    return (
      <Fragment>
        <Spin dataSet={headerDataDs}>
          <Form dataSet={headerDataDs} columns={3} labelWidth={130}>
            <Output name="classificationDesc" />
            <Output name="moduleDesc" />
            <Output name="statusMachineDesc" />
          </Form>
        </Spin>
        <div
          style={{
            position: 'relative',
            marginTop: '20px',
            borderTop: '1px solid #ddd',
            paddingTop: '14px',
          }}
        >
          <Table dataSet={currentDS} columns={columns} customizable={false} mode="tree" />
        </div>
      </Fragment>
    );
  }
}
