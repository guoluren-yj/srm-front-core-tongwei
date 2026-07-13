/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yiping.liu
 * @LastEditTime: 2025-09-25 15:32:58
 */
import React, { useContext, useRef } from 'react';
import intl from 'utils/intl';
import { Output, Form, Tooltip } from 'choerodon-ui/pro';
import { Store } from '../store';

const BaseInfo = function BaseInfo() {
  const { headerDs, customizeForm, remoteProps } = useContext(Store);

  const formRef = useRef(null);
  const trueValueData = {
    companyLov: ['companyId', 'companyName'],
    supplierLov: ['supplierCompanyId', 'supplierCompanyName'],
    mouldPrincipalLov: ['mouldPrincipalId', 'mouldPrincipalName'],
    mouldLov: ['mouldId', 'mouldCode'],
    uomLov: ['uomId', 'uomName'],
  };
  const textColorRender = ({ text, name }) => {
    const modifyHeader = headerDs.getState('modifyHeader') || {};
    const [compareField, compareMeaning] = trueValueData[name] || [name, name];
    if (
      name === 'supplierLov' &&
      (modifyHeader.supplierCompanyId || modifyHeader.oldSupplierCompanyId)
    ) {
      return (
        <Tooltip
          title={intl
            .get(`sprm.common.model.common.beforeChanged`, {
              value: modifyHeader.oldSupplierCompanyName,
            })
            .d(`变更前：${modifyHeader.oldSupplierCompanyName}`)}
        >
          <span style={{ color: 'red' }}> {modifyHeader[compareMeaning] || '-'} </span>
        </Tooltip>
      );
    }
    if (modifyHeader && modifyHeader[compareField]) {
      return (
        <Tooltip
          title={intl
            .get(`sprm.common.model.common.beforeChanged`, {
              value: text,
            })
            .d(`变更前：${text}`)}
        >
          <span style={{ color: 'red' }}> {modifyHeader[compareMeaning] || '-'} </span>
        </Tooltip>
      );
    } else {
      return text;
    }
  };

  const getFields = () => {
    const fields = [
      <Output name="maNum" renderer={textColorRender} />,
      <Output name="companyLov" renderer={textColorRender} />,
      <Output name="supplierLov" renderer={textColorRender} />,
      <Output name="mouldPrincipalLov" renderer={textColorRender} />,
      <Output name="mouldLov" renderer={textColorRender} />,
      <Output name="mouldName" renderer={textColorRender} />,
      <Output name="modelSpecs" renderer={textColorRender} />,
      <Output name="uomLov" renderer={textColorRender} />,
      <Output name="shareQuality" renderer={textColorRender} />,
      <Output name="mouldLife" renderer={textColorRender} />,
      <Output name="mouldQuality" renderer={textColorRender} />,
      <Output name="mouldValue" renderer={textColorRender} />,
      <Output name="moldingCycle" renderer={textColorRender} />,
      <Output name="machineTonnage" renderer={textColorRender} />,
      <Output name="cavityQuality" renderer={textColorRender} />,
      <Output name="mouldType" renderer={textColorRender} />,
      <Output name="mouldOwner" renderer={textColorRender} />,
      <Output name="effectiveTimeFrom" renderer={textColorRender} />,
      <Output name="effectiveTimeTo" renderer={textColorRender} />,
      <Output name="usedValue" renderer={textColorRender} />,
      <Output name="remainValue" renderer={textColorRender} />,
      <Output name="usedQuality" renderer={textColorRender} />,
      <Output name="remainQuality" renderer={textColorRender} />,
      <Output name="createdByName" />,
      <Output name="creationDate" />,
    ];
    return remoteProps
      ? remoteProps.process('SAAS_MOULD_ACCOUNT_REMOTE_PROCESS_CHANGE_BASIC_FIELDS', fields, {
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
