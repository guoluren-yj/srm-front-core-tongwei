import React from 'react';
import { DataSet, Button, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import {
  prefix,
  businessReviewDS,
} from '../initialDs';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import FormPro from '../../../../../components/FormPro';
import styles from './index.less';
import { supplierEvaluationDetailPostApi } from '../../../../../services/scux/supplierEvaluationServices';

const { Panel } = Collapse;

export const openBusinessReviewModal = async (record: any, type?: string, dataSet?: any) => {
  const nominationHeaderId = dataSet.getState('nominationHeaderId');
  const nominationSupLineId = record.get('nominationSupLineId');
  let modal;
  const reviewInfoDs = new DataSet(businessReviewDS(nominationHeaderId, nominationSupLineId, record));
  await reviewInfoDs.query();
  const isReadOnly = type === 'unreleasedReadOnly' || reviewInfoDs.current?.get('reviewStatus') === '2';
  const supplierInfoFields = [
    { name: 'supplierCompanyName', _type: 'TextField', disabled: true },
    { name: 'contactName', _type: 'TextField', disabled: true },
    { name: 'contactMobilephone', _type: 'TextField', disabled: true },
    { name: 'position', _type: 'TextField', disabled: true },
    { name: 'contactMail', _type: 'TextField', disabled: true },
    { name: 'registeredCapital', _type: 'NumberField', disabled: true },
    { name: 'paidInCapital', _type: 'NumberField', disabled: true },
    { name: 'buildDate', _type: 'NumberField', disabled: true },
    { name: 'insuredNumber', _type: 'NumberField', disabled: true },
    { name: 'taxLevel', _type: 'Select', disabled: true },
    { name: 'supplierRating', _type: 'Select', disabled: true },
    { name: 'businessReferrerUserLov', _type: 'Lov' },
    { name: 'businessReferrerCompanyName', _type: 'TextField', disabled: true },
    { name: 'caseRequirementCount', _type: 'NumberField', disabled: true },
    { name: 'warrantyPolicy', _type: 'TextField', disabled: true },
  ];

  const reviewInfoFields = [
    { name: 'businessQualificationReview', _type: 'TextArea' },
    { name: 'businessCreditLawReview', _type: 'TextArea' },
    { name: 'businessLegalAction', _type: 'TextArea' },
    { name: 'businessOtherSituations', _type: 'TextArea' },
    { name: 'businessReviewDesc', _type: 'TextArea' },
  ];

  const resultFields = [
    { name: 'businessReviewResultDesc', _type: 'TextArea', colSpan: 2 },
    { name: 'businessReviewResult', _type: 'Select' },
    { name: 'businessSubmitUserName', _type: 'TextField', disabled: true },
    { name: 'businessSubmitDate', _type: 'DateTimePicker', disabled: true },
  ];

  const handleSaveOrSubmit = async (submitFlag?:boolean) => {
    const valid = await reviewInfoDs.validate();
    if (!valid) {
      return false;
    }
    const res = await supplierEvaluationDetailPostApi({ businessReviewInfo: { nominationHeaderId, nominationSupLineId, ...reviewInfoDs.current?.toJSONData()  } }, !!submitFlag ? 'BUS_REVIEW_SUBMIT' : 'BUS_REVIEW_SAVE');
    if (getResponse(res)) {
      notification.success({});
      if(!submitFlag) {
        reviewInfoDs.query();
      } else if(modal) {
        dataSet.query();
        modal.close();
      }
    }
  };

  modal = Modal.open({
    key: Modal.key(),
    drawer: true,
    title: intl.get(`${prefix}.view.businessReview`).d('商务入围评审'),
    style: { width: 1080 },
    closeable: true,
    children: (
      <div className={styles['detail-container']}>
      <Collapse trigger="text-icon" ghost expandIconPosition="text-right" defaultActiveKey={['supplierInfo', 'reviewInfo', 'reviewResult']}>
        <Panel header={intl.get(`${prefix}.view.panel.supplierInfo`).d('供应商信息')} key="supplierInfo">
          <FormPro
            dataSet={reviewInfoDs}
            columns={3}
            fields={supplierInfoFields}
            readOnly={isReadOnly}
          />
        </Panel>
        <Panel header={intl.get(`${prefix}.view.panel.businessReviewInfo`).d('商务审查信息')} key="reviewInfo">
          <FormPro
            dataSet={reviewInfoDs}
            columns={1}
            fields={reviewInfoFields}
            readOnly={isReadOnly}
          />
        </Panel>
        <Panel header={intl.get(`${prefix}.view.panel.businessReviewResult`).d('商务入围评审结果')} key="reviewResult">
          <FormPro
            dataSet={reviewInfoDs}
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

const BusinessReviewModal: React.FC = () => {
  return null;
};

export default BusinessReviewModal;
