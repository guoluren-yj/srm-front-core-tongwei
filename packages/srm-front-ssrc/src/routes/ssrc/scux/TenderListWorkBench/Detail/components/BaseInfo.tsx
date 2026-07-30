import React from "react";
import { Form, TextArea, Output } from 'choerodon-ui/pro';
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

  return (
    <Form
      dataSet={baseInfoDs}
      columns={3}
      useWidthPercent
      labelLayout={LabelLayout.vertical}
      className="c7n-pro-vertical-form-display"
    >
      <Output name="companyName" />
      <Output name="sourceProjectName" />
      <Output name="templateName" />
      <Output name="sourceProjectNum" />
      <Output name="bidDirectorName" />
      <Output name="catelogNum" />
      <Output name="createdByName" />
      <Output name="creationDate" />
      <Output name="catalogStatusMeaning" />
      {editorFlag ? (
        <TextArea name="remark" resize={ResizeType.vertical} newLine colSpan={2} />
      ) : (
        <Output name="remark" newLine colSpan={2} />
      )}
    </Form>
  );
};

export default BaseInfo;
