import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { prefix } from './initialDs';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'hzero-front/lib/utils/intl';
import { stringify } from 'querystring';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import {
  openTechnicalReviewModal,
  openBusinessReviewModal,
  openFinanceReviewModal,
  openAddSupplierModal,
} from './modals';
import { supplierEvaluationDetailPostApi, queryRiskMonitorType, riskEmbedPage } from '../../../../services/scux/supplierEvaluationServices';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';

interface SupplierListProps {
  dataSet: any;
  type?: string;
  history?: any;
  basicInfoDs: any;
  onBusinessStandard?: () => void;
  onTechnicalStandard?: () => void;
}

const SupplierList: React.FC<SupplierListProps> = observer(({ dataSet, type, history, basicInfoDs, onBusinessStandard, onTechnicalStandard }) => {
  const readOnly = type !== 'edit' && type !== 'change';

  const handleRiskScan = async (record: any) => {
    const riskMonitorTypeResult = getResponse(await queryRiskMonitorType({partnerCode: 'ZHENYUN_PARTNER'}));
    const { supplierCompanyName, supplierCompanyId, companyId, supplierName } = (record?.data || record) || {};
    const enterpriseName = supplierCompanyName || supplierName;
    if (riskMonitorTypeResult) {
      const { partnerCode: riskMonitorType = '' } = riskMonitorTypeResult || {};
      if (['SRD', 'ZHENYUN_PARTNER'].includes(riskMonitorType)) {
        const prompt = `<p style="text-align: center">${intl.get('spfm.common.view.riskMonitoring.loading').d('正在加载')}...</p>`;
        const riskWindow = window.open();
        if (riskWindow) {
          riskWindow.document.body.innerHTML = prompt;
        }
        riskEmbedPage({ companyId, enterpriseName, supplierCompanyId, partnerCode: riskMonitorType }).then(response => {
          const res = getResponse(response);
          if (riskWindow) {
            if (res && !res.failed) {
              riskWindow.location = res.monitorUrl;
              record.set('riskScanDate', res.riskScanDate);
              record.set('fileUrl', res.fileUrl);
              record.set('riskLevelMeaning', res.riskLevelMeaning);
            } else {
              const errPrompt = `<p style="text-align: center">${response.message}</p>`;
              riskWindow.document.body.innerHTML = errPrompt;
            }
          }
        });
      }
    }
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
    openBusinessReviewModal(record, type, dataSet, basicInfoDs);
  };

  const handleFinanceReview = (record: any) => {
    openFinanceReviewModal(record, type, dataSet, basicInfoDs);
  };

  const handleAddSupplier = () => {
    const existingIds = dataSet.map((record: any) => record.get('supplierCompanyId')).filter(Boolean).join(',');
    openAddSupplierModal(dataSet, basicInfoDs, existingIds);
  };

  const handleRemindReviewer = async () => {
    const res = await supplierEvaluationDetailPostApi({ nominationHeaderId: basicInfoDs.current?.get('nominationHeaderId') }, 'REVIEW_MESSAGE');
    if (getResponse(res)) {
      notification.success({});
    }
  };

  const isNew = basicInfoDs?.current?.get('nominationStatus') === 'NEW';
  const clickableReview = type === 'submit' || type === 'view' || type === 'readOnly';

  // 操作列按钮数量
  const { businessUserFlag: bf, financeUserFlag: ff, technologyUserFlag: tf } = basicInfoDs?.current?.get(['businessUserFlag', 'financeUserFlag', 'technologyUserFlag']) || {};
  const showTech = +tf === 1 || type === 'unreleasedReadOnly';
  const showBiz = +bf === 1 || type === 'unreleasedReadOnly';
  const showFin = +ff === 1 || type === 'unreleasedReadOnly';
  const btnCount = [showTech, showBiz, showFin].filter(Boolean).length;

  const columns = [
    { name: 'seqNum', width: 80 },
    !isNew && { name: 'isSelected', width: 100 },
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
    { name: 'contactPersonLov', editor: (record: any) => !readOnly && record.get('releaseFlag') !== '1', width: 120 },
    { name: 'contactMobilephone', editor: (record: any) => !readOnly && record.get('releaseFlag') !== '1', width: 130 },
    { name: 'contactMail', editor: (record: any) => !readOnly && record.get('releaseFlag') !== '1', width: 150 },
    { name: 'recommenderLov', editor: (record: any) => !readOnly && record.get('releaseFlag') !== '1', width: 120 },
    { name: 'employeeCompanyName', width: 150 },
    !isNew && {
      name: 'technologyReviewResult',
      width: 120,
      renderer: ({ text, record }: any) => clickableReview ? (
        <Button funcType={FuncType.link} onClick={() => handleTechnicalReview(record)}>
          {text}
        </Button>
      ) : text,
    },
    !isNew && {
      name: 'businessReviewResult',
      width: 120,
      renderer: ({ text, record }: any) => clickableReview ? (
        <Button funcType={FuncType.link} onClick={() => handleBusinessReview(record)}>
          {text}
        </Button>
      ) : text,
    },
    !isNew && {
      name: 'financeReviewResult',
      width: 120,
      renderer: ({ text, record }: any) => clickableReview ? (
        <Button funcType={FuncType.link} onClick={() => handleFinanceReview(record)}>
          {text}
        </Button>
      ) : text,
    },
    !isNew && { name: 'summaryReviewResult', width: 120 },
    { name: 'riskScanDate', width: 160 },
    { name: 'riskLevelMeaning', width: 100 },
    {
      name: 'fileUrl',
      header: '最新风险报告',
      width: 130,
      renderer: ({ value }: any) => {
        if (!value) return null;
        return <a href={value} target="_blank" rel="noopener noreferrer">查看</a>;
      },
    },
    type !== 'view' && type !== 'submit' && type !== 'readOnly' && {
      name: 'riskScanning',
      header: intl.get(`${prefix}.button.riskScan`).d('风险扫描'),
      width: 150,
      lock: 'right',
      align: 'center',
      renderer: ({ record }: any) => (
        <Button
          funcType={FuncType.flat}
          onClick={() => handleRiskScan(record)}
        >
          {intl.get(`${prefix}.button.riskScan`).d('风险扫描')}
        </Button>
      ),
    },
    { name: 'remark', editor: (record: any) => !readOnly && record.get('releaseFlag') !== '1', width: 150 },
    !clickableReview && (type === 'pendingReview' || type === 'unreleasedReadOnly') && {
      name: 'action',
      header: intl.get(`${prefix}.button.operation`).d('操作'),
      width: btnCount * 90,
      lock: 'right',
      align: 'center',
      renderer: ({ record }) => (
        <>
          {showTech && (
            <Button funcType={FuncType.flat} onClick={() => handleTechnicalReview(record)}>
              {intl.get(`${prefix}.button.technical`).d('技术')}
            </Button>
          )}
          {showBiz && (
            <Button funcType={FuncType.flat} onClick={() => handleBusinessReview(record)}>
              {intl.get(`${prefix}.button.business`).d('商务')}
            </Button>
          )}
          {showFin && (
            <Button funcType={FuncType.flat} onClick={() => handleFinanceReview(record)}>
              {intl.get(`${prefix}.button.finance`).d('财务')}
            </Button>
          )}
        </>
      ),
    },
  ].filter(Boolean) as ColumnProps[];

  const hasEmptyReview = dataSet.some((r: any) => !r.get('technologyReviewResult') || !r.get('businessReviewResult') || !r.get('financeReviewResult'));

  const buttons = useMemo(() => {
    const btns: any[] = [];
    if (type === 'edit' || type === 'change') {
      btns.push(
        <Button
          funcType={FuncType.flat}
          onClick={handleAddSupplier}
          icon="add"
          key="add"
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>,
        <Button
          funcType={FuncType.flat}
          onClick={() => {
            const selected = dataSet.selected;
            const released = selected.filter((r: any) => r.get('releaseFlag') === '1');
            if (released.length > 0) {
              notification.warning({ message: '已发布的数据不能删除' });
              return;
            }
            dataSet.delete(selected);
          }}
          icon="delete"
          key="delete"
        >
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      );
      if (type === 'edit') {
        btns.push(
          <Button
            funcType={FuncType.flat}
            onClick={onBusinessStandard}
            key="businessStandard"
          >
            {intl.get(`${prefix}.button.businessStandard`).d('商务入围标准设置')}
          </Button>,
          <Button
            funcType={FuncType.flat}
            onClick={onTechnicalStandard}
            key="technicalStandard"
          >
            {intl.get(`${prefix}.button.technicalStandard`).d('技术入围标准设置')}
          </Button>
        );
      }
    }
    if ((clickableReview || type === 'pendingReview') && hasEmptyReview) {
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
  }, [type, onBusinessStandard, onTechnicalStandard, dataSet, clickableReview, hasEmptyReview]);

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={buttons}
      customizedCode="customized"
    />
  );
});

export default SupplierList;
