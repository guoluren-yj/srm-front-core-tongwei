import React, { useMemo } from 'react';
import { Table, Button, Form, Output, DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import {isEmpty} from 'lodash';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { stringify } from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { validatorConfirmModal } from '@/routes/components/ConfirmModal';
import { linkRiskScan as  linkRiskScanApi, validateRiskScan as supplierRiskScanApi } from '@/services/inquiryHallService';

import { supplierEvaluationPrefix } from '../store/storeDS';

const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;

interface SupplierListProps {
  history?: any;
  supplierEvaluationHeaderDs: DataSet;
  supplierListDs: DataSet;
}

const SupplierList: React.FC<SupplierListProps> = (props) => {

  const { history, supplierEvaluationHeaderDs, supplierListDs: dataSet } = props;

  const handleRiskScan = async (record: any) => {
    const ValidateResult = await supplierRiskScanApi({
      enterpriseId: record.get('supplierCompanyId'),
      scanCode: 'rfx_supplier'
    });
    if (ValidateResult && ValidateResult.failed) {
      if (ValidateResult.message) {
        notification.warning({
          message: ValidateResult.message,
        });
      }
      return;
    }
    if (isEmpty(ValidateResult)) {
    // 如果啥都没返回 则跳转
    handleLinkRisk(record.get('supplierCompanyId'));
    return;
    }

    if (
      !ValidateResult ||
      ValidateResult.failed ||
      !(ValidateResult.code && ValidateResult.message)
    ) {
      return;
    }

    // 校验弹框提示
    validatorConfirmModal({
      response: ValidateResult,
      validatorType: 'type',
      validatorArrName: 'message',
      isOkLoading: true,
      onOk: async () => {
        await handleLinkRisk(record.get('supplierCompanyId'));
      },
    });
  };

  // 按钮确定事件逻辑
  const handleLinkRisk = async (supplierCompanyId) => {
    let res;
    try {
      res = await linkRiskScanApi({
        enterpriseId: supplierCompanyId,
        scanCode: 'rfx_supplier',
      });
    } catch (err) {
      throw err;
    }
    if (!res || !urlReg.test(res)) {
      const result = JSON.parse(res || '{}') || {};
      if (result && result.failed) {
        notification.warning({
          message: result.message || null,
        });
      }
      return;
    }
    window.open(res);
  };

  const handleSupplierDetail = (record: any) => {
    history.push({
      pathname: `/sslm/supplier-detail-new`,
      search: stringify({
        companyId: record?.get('companyId'),
        supplierCompanyId: record?.get('supplierCompanyId'),
      })
    });
  };

  const columns = useMemo(() => [
    { name: 'seqNum', width: 80 },
    { name: 'isSelected', width: 100 },
    {
      name: 'supplierCompanyNum',
      width: 150,
      renderer: ({ value, record }: any) => (
        <Button
          funcType={FuncType.link}
          onClick={() => handleSupplierDetail(record)}
        >
          {value}
        </Button>
      ),
    },
    { name: 'supplierCompanyName', width: 200 },
    { name: 'stageDescription', width: 100 },
    { name: 'contactPersonLov', width: 120 },
    { name: 'contactMobilephone', width: 130 },
    { name: 'contactMail', width: 150 },
    { name: 'technologyReviewResult', width: 120 },
    { name: 'businessReviewResult', width: 120 },
    { name: 'financeReviewResult', width: 120 },
    { name: 'summaryReviewResult', width: 120 },
    { name: 'remark', width: 150 },
    {
      header: intl.get(`${supplierEvaluationPrefix}.button.riskScan`).d('风险扫描'),
      width: 130,
      renderer: ({ record }: any) => (
        <Button
          funcType={FuncType.flat}
          onClick={() => handleRiskScan(record)}
        >
          {intl.get(`${supplierEvaluationPrefix}.button.riskScan`).d('风险扫描')}
        </Button>
      ),
    },
  ].filter(Boolean) as ColumnProps[], []);

  return (
    <>
      <Form dataSet={supplierEvaluationHeaderDs} columns={3}>
        <Output name="nominationNum" />
        <Output name="nominationStatus" />
      </Form>
      <Table
        dataSet={dataSet}
        columns={columns}
        customizedCode="customized"
      />
    </>
  );
};

export default SupplierList;
