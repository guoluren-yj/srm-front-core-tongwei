import React from "react";
import { Form, TextField, TextArea, Lov, IntlField, Output, Attachment } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { FuncType } from "choerodon-ui/pro/lib/button/enum";

import { useStore } from '../store/StoreProvider';
const BaseInfo: React.FC<any> = () => {
  const {
    commonDs: { baseInfoDs } = {},
    editorFlag,
    supplierFlag,
  } = useStore();

  if (!baseInfoDs) {
    return null;
  }

  return editorFlag ? (
    <Form dataSet={baseInfoDs} columns={3} useWidthPercent labelLayout={LabelLayout.float}>
      <TextField name="qbNum" />
      <IntlField name="qbTitle" />
      <TextField name="qbStatus" />
      <TextField name="rfxNum" />
      <TextField name="rfxTitle" />
      <TextField name="companyName" />
      <Lov name="ouId" />
      <TextField name="purOrganizationName" />
      <TextField name="checkedByName" />
      <TextField name="createdByName" />
      <Lov name="createdUnitId" />
      <TextField name="creationDate" />
      <Attachment name="purAttachmentUuid" viewMode="popup" />
      <TextField name="supplierCompanyName" />
      {!!supplierFlag && (<Attachment name="supAttachmentUuid" viewMode="popup" funcType={FuncType.link} />)}
      <TextArea name="qbDetail" resize={ResizeType.vertical} newLine colSpan={2} />
      {!!supplierFlag && (<TextArea name="supplierFeedback" resize={ResizeType.vertical} newLine colSpan={2} />)}
    </Form>
  ) : (
    <Form
      dataSet={baseInfoDs}
      columns={3}
      useWidthPercent
      labelLayout={LabelLayout.vertical}
      className="c7n-pro-vertical-form-display"
    >
      <Output name="qbNum" />
      <Output name="qbTitle" />
      <Output name="qbStatus" />
      <Output name="rfxNum" />
      <Output name="rfxTitle" />
      <Output name="companyName" />
      <Output name="ouId" renderer={({ record }) => record?.get('ouName')} />
      <Output name="purOrganizationName" />
      <Output name="checkedByName" />
      <Output name="createdByName" />
      <Output name="createdUnitId" renderer={({ record }) => record?.get('createdUnitName')} />
      <Output name="creationDate" />
      <Output name="qbDetail" />
      <Attachment name="purAttachmentUuid" viewMode="popup" funcType={FuncType.link} readOnly />
      <Output name="supplierCompanyName" />
      <Attachment name="supAttachmentUuid" viewMode="popup" funcType={FuncType.link} readOnly />
      <Output name="supplierFeedback" />
      <Output name="supplierFeedbackDate" />
    </Form>
  );
};

export default BaseInfo;
