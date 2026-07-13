/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-04-07 17:56:26
 */
import React, { useContext, useRef } from 'react';
import { TextField, DatePicker, Select, Lov, NumberField, Form } from 'choerodon-ui/pro';
import { Store } from '../Store/store';

const BaseInfo = function BaseInfo() {
  const { headerDs, customizeForm, headerUnitCode, source } = useContext(Store);

  const formRef = useRef(null);
  const form = customizeForm(
    {
      code: headerUnitCode,
      __force_record_to_update__: true,
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      columns={3}
      ref={formRef}
      labelLayout="float"
      useColon={false}
      useWidthPercent
    >
      <TextField name="mouldReqNum" disabled />
      <TextField name="mouldName" />
      <TextField name="mouldNum" disabled={source === 'change'} />
      <DatePicker name="creationDate" disabled />
      <Lov name="companyId" />
      <Lov name="supplierLov" />
      <TextField
        name="createdBy"
        renderer={({ record }) => record?.get('createdByName')}
        disabled
      />
      <Select name="mouldType" />
      <Select
        name="sourcePlatform"
        renderer={({ record }) => record?.get('sourcePlatformMeaning')}
        disabled
      />
      <NumberField name="mouldQuality" />
      <NumberField name="shareQuality" />
      <Select name="userCamp" disabled />
      <Select name="mouldOwner" />
      <Lov name="uomId" />
      <TextField name="modelSpecs" />
      <Lov name="mouldPrincipalId" />
      <TextField name="machineTonnage" />
      <NumberField name="cavityQuality" />
      <NumberField name="mouldLife" />
      <TextField name="moldingCycle" />
      <NumberField name="mouldReqVersion" disabled />
      <NumberField name="mouldValue" />
    </Form>
  );

  return form;
};

export default BaseInfo;
