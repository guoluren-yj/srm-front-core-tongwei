/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-04-07 17:56:26
 */
import React, { useContext, useRef } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { Store } from '../Store/store';

const BaseInfo = function BaseInfo() {
  const { headerDs, customizeForm, headerUnitCode } = useContext(Store);

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
      className="c7n-pro-vertical-form-display"
      labelLayout="vertical"
      useWidthPercent
    >
      <Output name="mouldReqNum" />
      <Output name="mouldName" />
      <Output name="mouldNum" />
      <Output name="creationDate" />
      <Output name="companyId" />
      <Output name="supplierLov" />
      <Output name="createdBy" renderer={({ record }) => record?.get('createdByName')} />
      <Output name="mouldType" />
      <Output
        name="sourcePlatform"
        renderer={({ record }) => record?.get('sourcePlatformMeaning')}
      />
      <Output name="mouldQuality" />
      <Output name="shareQuality" />
      <Output
        name="userCamp"
        renderer={({ value }) => (value ? yesOrNoRender(+(value === 'SUPPLIER')) : null)}
      />
      <Output name="mouldOwner" />
      <Output name="uomId" />
      <Output name="modelSpecs" />
      <Output name="mouldPrincipalId" />
      <Output name="machineTonnage" />
      <Output name="cavityQuality" />
      <Output name="mouldLife" />
      <Output name="moldingCycle" />
      <Output name="mouldReqVersion" />
      <Output name="mouldValue" />
    </Form>
  );

  return form;
};

export default BaseInfo;
