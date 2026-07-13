import React from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import {
  prefix,
  financeReviewInfoDS,
  financeReviewResultDS,
} from '../initialDs';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import FormPro from '../../../../../components/FormPro';
import notification from 'hzero-front/lib/utils/notification';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { supplierEvaluationDetailPostApi } from '../../../../../services/scux/supplierEvaluationServices';

import styles from './index.less';

const { Panel } = Collapse;

export const openFinanceReviewModal = async (record: any, type?: string, dataSet?: any) => {
  const nominationHeaderId = dataSet.getState('nominationHeaderId');
  const nominationSupLineId = record.get('nominationSupLineId');
  let modal;
  const infoDs = new DataSet(financeReviewInfoDS(nominationHeaderId, nominationSupLineId));
  const resultDs = new DataSet(financeReviewResultDS(nominationHeaderId, nominationSupLineId));

  infoDs.bind(resultDs, 'children');
  
  await resultDs.query();
  const isReadOnly = type === 'unreleasedReadOnly' || resultDs.current?.get('reviewStatus') === '2';

  const infoColumns = [
    { name: 'year', editor: !isReadOnly, width: 100 },
    { name: 'operatingRevenue', editor: !isReadOnly, width: 150 },
    { name: 'netProfit', editor: !isReadOnly, width: 150 },
    { name: 'totalAssets', editor: !isReadOnly, width: 150 },
    { name: 'netAssets', editor: !isReadOnly, width: 150 },
    { name: 'interestBearingDebt', editor: !isReadOnly, width: 150 },
    { name: 'totalLiabilities', editor: !isReadOnly, width: 150 },
    { name: 'assetLiabilityRatio', width: 130 },
    { name: 'returnOnEquity', width: 130 },
  ];

  const infoButtons = isReadOnly ? [] : [TableButtonType.add, TableButtonType.delete];

  const resultFields = [
    { name: 'financeAvgLiabilityRatio', _type: 'NumberField', disabled: true },
    { name: 'financeAvgRevenueRatio', _type: 'NumberField', disabled: true },
    { name: 'empty', _type: 'empty' },
    { name: 'financeReviewDesc', _type: 'TextArea', colSpan: 2 },
    { name: 'financeReviewResult', _type: 'Select' },
    { name: 'financeSubmitUserName', _type: 'TextField', disabled: true },
    { name: 'financeSubmitDate', _type: 'DateTimePicker', disabled: true },
  ];

  const handleSaveOrSubmit = async (submitFlag?:boolean) => {
    const valid = await Promise.all([
      infoDs.validate(),
      resultDs.validate(),
    ]);
    if (!valid.every(Boolean)) {
      return false;
    }
    if (infoDs.length === 0) {
      notification.warning({
        message: intl.get(`${prefix}.message.financeReviewInfoRequired`).d('财务评审行不能为空'), 
      });
      return false;
    }
    const res = await supplierEvaluationDetailPostApi({ financeReviewInfo: { nominationHeaderId, nominationSupLineId, ...resultDs.current?.toJSONData(), financeReviewLineList: infoDs.toData(), children: null  } }, !!submitFlag ? 'FIN_REVIEW_SUBMIT' : 'FIN_REVIEW_SAVE');
    if (getResponse(res)) {
      notification.success({});
      if(!submitFlag) {
        infoDs.query();
        resultDs.query();
      } else if(modal) {
        dataSet.query();
        modal.close();
      }
    }
  };

  modal = Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get(`${prefix}.view.financeReview`).d('财务入围评审'),
    style: { width: 1080 },
    closeable: true,
    children: (
      <div className={styles['detail-container']}>
        <Collapse trigger="text-icon" ghost expandIconPosition="text-right" defaultActiveKey={['reviewInfo', 'reviewResult']}>
          <Panel header={intl.get(`${prefix}.view.panel.financeReviewInfo`).d('评审信息')} key="reviewInfo">
            <Table
              dataSet={infoDs}
              columns={infoColumns}
              buttons={infoButtons}
              customizedCode="financeReviewInfo"
            />
          </Panel>
          <Panel header={intl.get(`${prefix}.view.panel.financeReviewResult`).d('财务入围评审结果')} key="reviewResult">
            <FormPro
              dataSet={resultDs}
              columns={3}
              fields={resultFields}
              readOnly={isReadOnly}
            />
          </Panel>
        </Collapse>
      </div>
    ),
    footer: (_, closeBtn: any) => (
      <div>
        {!isReadOnly && (
          <>
            <Button color={ButtonColor.primary} onClick={() => handleSaveOrSubmit()}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Button color={ButtonColor.primary} onClick={() => handleSaveOrSubmit(true)}>
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
          </>
        )}
        {closeBtn}
      </div>
    ),
    destroyOnClose: true,
  });
};

const FinanceReviewModal: React.FC = () => {
  return null;
};

export default FinanceReviewModal;
