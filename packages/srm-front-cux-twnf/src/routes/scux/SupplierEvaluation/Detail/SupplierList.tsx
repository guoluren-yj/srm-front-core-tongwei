import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';

import { prefix } from './initialDs';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import { stringify } from 'querystring';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import {
  openTechnicalReviewModal,
  openBusinessReviewModal,
  openFinanceReviewModal,
  openAddSupplierModal,
} from './modals';
import { supplierEvaluationDetailPostApi, supplierRiskScanApi, linkRiskScanApi } from '../../../../services/scux/supplierEvaluationServices';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import {isEmpty} from 'lodash';
import {validatorConfirmModal} from './modals/confirmModal'

const urlReg = /(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;

interface SupplierListProps {
  dataSet: any;
  type?: string;
  history?: any;
  basicInfoDs: any;
}

const SupplierList: React.FC<SupplierListProps> = ({ dataSet, type, history, basicInfoDs }) => {
  const readOnly = type !== 'edit';
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

  const handleTechnicalReview = (record: any) => {
    openTechnicalReviewModal(record, type, dataSet);
  };

  const handleBusinessReview = (record: any) => {
    openBusinessReviewModal(record, type, dataSet);
  };

  const handleFinanceReview = (record: any) => {
    openFinanceReviewModal(record, type, dataSet);
  };

  const handleAddSupplier = () => {
    openAddSupplierModal(dataSet, basicInfoDs);
  };

  const handleRemindReviewer = async () => {
    const res = await supplierEvaluationDetailPostApi({ nominationHeaderId: basicInfoDs.current?.get('nominationHeaderId') }, 'REVIEW_MESSAGE');
    if (getResponse(res)) {
      notification.success({});
    }
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
    { name: 'contactPersonLov', editor: !readOnly, width: 120 },
    { name: 'contactMobilephone', editor: !readOnly, width: 130 },
    { name: 'contactMail', editor: !readOnly, width: 150 },
    { name: 'technologyReviewResult', width: 120 },
    { name: 'businessReviewResult', width: 120 },
    { name: 'financeReviewResult', width: 120 },
    { name: 'summaryReviewResult', width: 120 },
    { name: 'remark', editor: !readOnly, width: 150 },
    {
      header: intl.get(`${prefix}.button.riskScan`).d('风险扫描'),
      width: 130,
      renderer: ({ record }: any) => (
        <Button
          funcType={FuncType.flat}
          onClick={() => handleRiskScan(record)}
        >
          {intl.get(`${prefix}.button.riskScan`).d('风险扫描')}
        </Button>
      ),
    },
    (type === 'pendingReview' || type === 'unreleasedReadOnly') && {
      header: intl.get(`${prefix}.button.operation`).d('操作'),
      width: 200,
      renderer: ({ record }) => {
        const { businessUserFlag, financeUserFlag, technologyUserFlag } = basicInfoDs?.current?.get(['businessUserFlag', 'financeUserFlag', 'technologyUserFlag']) || {};
        const showTechnical = +technologyUserFlag === 1 || type === 'unreleasedReadOnly';
        const showBusiness = +businessUserFlag === 1 || type === 'unreleasedReadOnly';
        const showFinance = +financeUserFlag === 1 || type === 'unreleasedReadOnly';

        return (
          <>
            {showTechnical && (
              <Button
                funcType={FuncType.flat}
                onClick={() => handleTechnicalReview(record)}
              >
                {intl.get(`${prefix}.button.technical`).d('技术')}
              </Button>
            )}
            {showBusiness && (
              <Button
                funcType={FuncType.flat}
                onClick={() => handleBusinessReview(record)}
              >
                {intl.get(`${prefix}.button.business`).d('商务')}
              </Button>
            )}
            {showFinance && (
              <Button
                funcType={FuncType.flat}
                onClick={() => handleFinanceReview(record)}
              >
                {intl.get(`${prefix}.button.finance`).d('财务')}
              </Button>
            )}
          </>
        );
      },
    },
  ].filter(Boolean) as ColumnProps[], [readOnly, type]);

  const buttons = useMemo(() => {
    const btns: any[] = [];
    if (type === 'edit') {
      btns.push(
        <Button
          funcType={FuncType.flat}
          onClick={handleAddSupplier}
          icon="add"
          key="add"
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
        TableButtonType.delete
      );
    }
    if (type === 'readOnly' && basicInfoDs?.current?.get('nominationStatus') === 'PENDING_REVIEW') {
      btns.push(
        <Button
          funcType={FuncType.flat}
          onClick={handleRemindReviewer}
          key="remind"
        >
          {intl.get(`${prefix}.button.remindReviewer`).d('提醒评审人员')}
        </Button>
      );
    }
    return btns;
  }, [type]);

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      customizedCode="customized"
    />
  );
};

export default SupplierList;
