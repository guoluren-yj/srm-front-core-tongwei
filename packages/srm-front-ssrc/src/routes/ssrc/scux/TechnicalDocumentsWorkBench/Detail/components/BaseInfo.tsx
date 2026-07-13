import React from "react";
import { Form, TextField, TextArea, Select, Output } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';

import { useStore } from '../store/StoreProvider';
const BaseInfo: React.FC<any> = () => {
  const {
    commonDs: { baseInfoDs } = {},
    editorFlag,
  } = useStore();

  if (!baseInfoDs) {
    return null;
  }

  return editorFlag ? (
    <Form
      dataSet={baseInfoDs}
      columns={3}
      useWidthPercent
      labelLayout={LabelLayout.float}
    >
      <TextField name="techFileNum" />
      <TextField name="confirmedByName" />
      <TextField name="confirmedDate" />
      <Select name="techFileStatus" />
      <TextArea name="remark" resize={ResizeType.vertical} newLine colSpan={2} />
    </Form>
  ) : (
    <Form
      dataSet={baseInfoDs}
      columns={3}
      useWidthPercent
      labelLayout={LabelLayout.vertical}
      className="c7n-pro-vertical-form-display"
    >
      <Output name="techFileNum" />
      <Output name="confirmedByName" />
      <Output name="techFileStatus" />
      <Output name="confirmedDate" />
      <Output name="remark" newLine colSpan={2} />
    </Form>
  );
};

export default BaseInfo;