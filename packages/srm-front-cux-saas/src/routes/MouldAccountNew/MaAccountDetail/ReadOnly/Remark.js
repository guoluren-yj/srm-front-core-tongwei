import React from 'react';
import { Form, TextArea, Lov, Select } from 'choerodon-ui/pro';

const Remark = ({ reasonForm, pageForm, label, customizeForm }) => {
  if (pageForm === 'transfer') {
    return customizeForm(
      {
        code: 'SIEC.MOULD_PLATFORM.APPROVE.CHANGE', // 单元编码，必传
        dataSet: reasonForm,
      },
      <Form dataSet={reasonForm} columns={1} labelLayout="float" useColon={false}>
        <TextArea name="reason" resize="vertical" label={label} />
        <Select name="supplierFlag" />
        <Lov name="supplierLov" />
      </Form>
    );
  } else {
    return (
      <Form dataSet={reasonForm} columns={1} labelLayout="float" useColon={false}>
        <TextArea name="reason" resize="vertical" label={label} />
      </Form>
    );
  }
};

export default Remark;
