import React from "react";
import { Form, TextField, TextArea, Lov, IntlField, Output, Attachment, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';
import { FuncType } from "choerodon-ui/pro/lib/button/enum";

import { useStore } from '../store/StoreProvider';
const BaseInfo: React.FC<any> = () => {
  const {
    commonDs: { baseInfoDs, lineInfoDs } = {},
    editorFlag,
  } = useStore();

  if (!baseInfoDs) {
    return null;
  }

  // 切换异常类型
  const handleChangeExceptionType = (value) => {
    baseInfoDs.setQueryParameter('exceptionType', value);
    if (baseInfoDs && baseInfoDs.current) {
      baseInfoDs.current.set({
        rfxNum: null,
        exceptionContent: null,
        exceptionReason: null,
        handlingOpinion: null,
      });
    }
  }

  // 切换招标文件编号
  const handleChangeBidFileNo = (value) => {
    if (lineInfoDs) {
      lineInfoDs.loadData([]);
    };
  };

  // 变更岗位
  const handleChangePosition = (value) => {
    const { unitId, unitName } = value || {};
    if (baseInfoDs && baseInfoDs.current) {
      baseInfoDs.current.set('createUnitId', {
        unitId,
        unitName,
      });
    };
  };

  return editorFlag ? (
    <Form dataSet={baseInfoDs} columns={3} useWidthPercent labelLayout={LabelLayout.float}>
      <Select name="exceptionType" onChange={handleChangeExceptionType}/>
      <Lov name="rfxNum" onChange={handleChangeBidFileNo}/>
      <TextField name="rfxTitle" />
      <Lov name="positionId" onChange={handleChangePosition}/>
      <Lov name="createUnitId" />
      <Lov name="companyId" />
      <TextField name="creationDate" />
      <TextField name="abnormalNum" />
      <TextField name="abnormalStatus" />
      <TextField name="createdByName" />
      <Select name="exceptionContent" />
      <Select name="exceptionReason" />
      <Select name="handlingOpinion" />
      <TextField name="approvalResult" />
      <TextField name="rejectReason" />
      <Attachment name="attachmentUuid" />
      <TextField name="totalControlPrice" />
      <TextField name="overBudgetPercent" />
      <TextArea name="detailedDesc" resize={ResizeType.vertical} newLine colSpan={3} />
    </Form>
  ) : (
    <Form
      dataSet={baseInfoDs}
      columns={3}
      useWidthPercent
      labelLayout={LabelLayout.vertical}
      className="c7n-pro-vertical-form-display"
    >
      <Output name="exceptionType" />
      <Output name="rfxNum" />
      <Output name="rfxTitle" />
      <Output name="positionName" />
      <Output name="createUnitName" />
      <Output name="companyName" />
      <Output name="creationDate" />
      <Output name="abnormalNum" />
      <Output name="abnormalStatus" />
      <Output name="createdByName" />
      <Output name="exceptionContent" />
      <Output name="exceptionReason" />
      <Output name="handlingOpinion" />
      <Output name="approvalResult" />
      <Output name="rejectReason" />
      <Attachment name="attachmentUuid" viewMode="popup" funcType={FuncType.link} readOnly />
      <Output name="totalControlPrice" />
      <Output name="overBudgetPercent" />
      <Output name="detailedDesc" />
    </Form>
  );
};

export default BaseInfo;