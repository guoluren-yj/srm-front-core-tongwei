import React from "react";
import { Form, Output, DataSet } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

interface BaseInfoProps {
  baseInfoDs: DataSet;
};

const BaseInfo: React.FC<BaseInfoProps> = (props) => {
  const { baseInfoDs } = props;

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
      <Output name="sourceProjectNum" />
      <Output name="sourceProjectName" />
      <Output name="attributeVarchar10Meaning" />
      <Output name="attributeDecimal10" />
      <Output name="attributeVarchar11" />
      <Output name="sourceProjectRemark" newLine colSpan={2} />
    </Form>
  );
};

export default BaseInfo;