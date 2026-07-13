import React, { Component } from 'react';
import { Form, TextArea } from 'choerodon-ui/pro';

export default class assignedRemark extends Component {
  render() {
    const { ds } = this.props;
    return (
      <Form labelLayout="float" columns={1} dataSet={ds}>
        <TextArea name="approvedRemark" resize="vertical" />
      </Form>
    );
  }
}
