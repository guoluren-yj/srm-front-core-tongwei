/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-21 17:44:42
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-07 17:21:27
 */
import React from 'react';
import { Form, TextArea, Lov, Select } from 'choerodon-ui/pro';

const Remark = ({ reasonForm, pageForm }) => {
  return (
    <div>
      <Form dataSet={reasonForm} columns={1} labelLayout="float" useColon={false}>
        <TextArea name="reason" />
        {pageForm === 'transfer' && <Select name="supplierFlag" />}
        {pageForm === 'transfer' && <Lov name="supplierLov" />}
      </Form>
    </div>
  );
};

export default Remark;
