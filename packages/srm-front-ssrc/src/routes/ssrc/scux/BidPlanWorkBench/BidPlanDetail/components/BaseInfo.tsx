import React from "react";
import { Form, TextField, TextArea, Lov, IntlField, NumberField, Select, Output } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';

import { useStore } from '../store/StoreProvider';
const BaseInfo: React.FC<any> = () => {
  const {
    commonDs: { baseInfoDs, bidPlanNodeDs } = {},
    editorFlag,
    changeFlag,
  } = useStore();

  if (!baseInfoDs) {
    return null;
  }

  // 切换模板
  const handleChangeTemplate = (value) => {
    const { nodeStatusList, bidNodeList, templateId, templateName } = value || {};
    baseInfoDs.current?.set({
      nodeStatusList: nodeStatusList || [],
      // attributeVarchar10: ,
      // attributeVarchar10Meaning: templateName,
    });
    if (bidPlanNodeDs) {
      bidPlanNodeDs.loadData(bidNodeList || []);
    };
  };

  return editorFlag || changeFlag ? (
    <Form dataSet={baseInfoDs} columns={3} useWidthPercent labelLayout={LabelLayout.float}>
      <TextField name="sourceProjectNum" disabled={changeFlag} />
      <IntlField name="sourceProjectName" disabled={changeFlag} />
      <Lov name="attributeVarchar10" noCache onChange={handleChangeTemplate} disabled={changeFlag} />
      <NumberField name="attributeDecimal10" disabled={changeFlag} />
      <Select name="attributeVarchar11" disabled={changeFlag} />
      <TextField name="createdByName" disabled={changeFlag} />
      <Lov name="attributeVarchar12" disabled={changeFlag} />
      <Lov name="attributeVarchar14" />
      <TextArea name="sourceProjectRemark" resize={ResizeType.vertical} newLine colSpan={2} disabled={changeFlag} />
    </Form>
  ) : (
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
      <Output name="createdByName" />
      <Output name="attributeVarchar12Meaning" />
      <Output name="attributeVarchar14Meaning" />
      <Output name="sourceProjectRemark" newLine colSpan={2} />
    </Form>
  );
};

export default BaseInfo;