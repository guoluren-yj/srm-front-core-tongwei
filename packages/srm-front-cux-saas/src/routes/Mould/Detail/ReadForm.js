import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import styles from '../index.less';

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
      <Output name="mouldNum" />
      <Output name="mouldName" />
      <Output name="creationDate" />
      <Output name="companyLov" />
      <Output name="supplierLov" />
      <Output name="mouldPrincipalLov" />
      <Output name="mouldType" />
      <Output name="createdByName" />
      <Output name="sourcePlatform" />
      <Output name="mouldQuality" />
      <Output name="cavityQuality" />
      <Output name="shareQuality" />
      <Output name="mouldOwner" />
      <Output name="uomLov" />
      <Output name="modelSpecs" />
      <Output name="machineTonnage" />
      <Output name="mouldLife" />
      <Output name="moldingCycle" />
      <Output name="objectVersionNumber" />
      <Output name="mouldValue" />
      <Output name="remark" colSpan={2} />
    </Form>
  );
};

export default ReadForm;
