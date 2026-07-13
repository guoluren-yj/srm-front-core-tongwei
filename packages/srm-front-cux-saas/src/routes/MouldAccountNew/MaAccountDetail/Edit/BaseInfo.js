/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yiping.liu
 * @LastEditTime: 2025-09-25 14:35:24
 */
import React, { useContext, useRef } from 'react';
import { TextField, DatePicker, Select, Lov, NumberField, Form } from 'choerodon-ui/pro';
import { Store } from '../store';

const BaseInfo = function BaseInfo() {
  const { headerDs, customizeForm, remoteProps } = useContext(Store);

  const formRef = useRef(null);

  const getFields = () => {
    const fields = [
      <TextField name="maNum" />,
      <Lov name="companyLov" />,
      <Lov name="supplierLov" />,
      <Lov name="mouldPrincipalLov" />,
      <Lov name="mouldLov" />,
      <TextField name="mouldName" />,
      <TextField name="modelSpecs" />,
      <Lov name="uomLov" />,
      <NumberField name="shareQuality" />,
      <NumberField name="mouldLife" />,
      <NumberField name="mouldQuality" />,
      <NumberField name="mouldValue" />,
      <TextField name="moldingCycle" />,
      <TextField name="machineTonnage" />,
      <NumberField name="cavityQuality" />,
      <Select name="mouldType" />,
      <Select name="mouldOwner" />,
      <DatePicker name="effectiveTimeFrom" />,
      <DatePicker name="effectiveTimeTo" />,
      <NumberField name="usedValue" />,
      <NumberField name="remainValue" />,
      <NumberField name="usedQuality" />,
      <NumberField name="remainQuality" />,
      <TextField name="createdByName" />,
      <DatePicker name="creationDate" />,
    ];
    return remoteProps
      ? remoteProps.process('SAAS_MOULD_ACCOUNT_REMOTE_PROCESS_EDIT_BASIC_FIELDS', fields, {
          headerDs,
        })
      : fields;
  };

  const form = customizeForm(
    {
      code: 'SIEC.MOULD_PLATFORM.DETAIL.HEADER',
      __force_record_to_update__: true,
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      showLines={6}
      columns={3}
      ref={formRef}
      labelLayout="float"
      useColon={false}
      useWidthPercent
    >
      {getFields()}
    </Form>
  );

  return form;
};

export default BaseInfo;
