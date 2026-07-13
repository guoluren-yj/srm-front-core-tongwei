import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import styles from './index.less';

const ReadForm = ({ customizeForm, code, dataSet }) => {
  return customizeForm(
    {
      code, // 必传，和unitCode一一对应
      dataSet,
    },
    <Form
      dataSet={dataSet}
      columns={3}
      labelLayout="vertical"
      labelAlign="left"
      className={`c7n-pro-vertical-form-display ${styles.readOnlyForm}`}
    >
      <Output name="maNum" />
      <Output name="companyLov" />
      <Output name="supplierLov" />
      <Output name="mouldPrincipalLov" />
      <Output name="mouldLov" />
      <Output name="mouldName" />
      <Output name="modelSpecs" />
      <Output name="uomLov" />
      <Output name="shareQuality" />
      <Output name="mouldLife" />
      <Output name="mouldQuality" />
      <Output name="mouldValue" />
      <Output name="moldingCycle" />
      <Output name="machineTonnage" />
      <Output name="cavityQuality" />
      <Output name="mouldType" />
      <Output name="mouldOwner" />
      <Output name="effectiveTimeFrom" />
      <Output name="effectiveTimeTo" />
      <Output name="usedValue" />
      <Output name="remainValue" />
      <Output name="usedQuality" />
      <Output name="remainQuality" />
      <Output name="createdByName" />
      <Output name="creationDate" />
    </Form>
  );
};

export default ReadForm;
