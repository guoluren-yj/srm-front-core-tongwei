/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yiping.liu
 * @LastEditTime: 2025-09-25 15:35:44
 */
import React, { useContext, useRef } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { Store } from '../store';

const BaseInfo = function BaseInfo() {
  const { headerDs, customizeForm, remoteProps } = useContext(Store);

  const formRef = useRef(null);

  const getFields = () => {
    const fields = [
      <Output name="maNum" />,
      <Output name="companyLov" />,
      <Output name="supplierLov" />,
      <Output name="mouldPrincipalLov" />,
      <Output name="mouldLov" />,
      <Output name="mouldName" />,
      <Output name="modelSpecs" />,
      <Output name="uomLov" />,
      <Output name="shareQuality" />,
      <Output name="mouldLife" />,
      <Output name="mouldQuality" />,
      <Output name="mouldValue" />,
      <Output name="moldingCycle" />,
      <Output name="machineTonnage" />,
      <Output name="cavityQuality" />,
      <Output name="mouldType" />,
      <Output name="mouldOwner" />,
      <Output name="effectiveTimeFrom" />,
      <Output name="effectiveTimeTo" />,
      <Output name="usedValue" />,
      <Output name="remainValue" />,
      <Output name="usedQuality" />,
      <Output name="remainQuality" />,
      <Output name="createdByName" />,
      <Output name="creationDate" />,
    ];
    return remoteProps
      ? remoteProps.process('SAAS_MOULD_ACCOUNT_REMOTE_PROCESS_READONLY_BASIC_FIELDS', fields, {
          headerDs,
        })
      : fields;
  };

  const form = customizeForm(
    {
      code: 'SIEC.MOULD_PLATFORM.APPROVE.HEADER',
      __force_record_to_update__: true,
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      showLines={6}
      columns={3}
      ref={formRef}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      useWidthPercent
    >
      {getFields()}
    </Form>
  );

  return form;
};

export default BaseInfo;
