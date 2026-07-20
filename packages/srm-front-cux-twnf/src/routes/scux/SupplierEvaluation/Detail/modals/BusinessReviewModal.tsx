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

export const openBusinessReviewModal = async (record: any, type?: string, dataSet?: any, basicInfoDs?: any) => {
  const nominationHeaderId = dataSet.getState('nominationHeaderId');
  const nominationSupLineId = record.get('nominationSupLineId');
  let modal;
  const reviewInfoDs = new DataSet(businessReviewDS(nominationHeaderId, nominationSupLineId, record));
  await reviewInfoDs.query();
  const isReadOnly = type === 'unreleasedReadOnly' || reviewInfoDs.current?.get('reviewStatus') === '2';

  const supplierName = record.get('supplierCompanyName') || '';
  const reviewTypeCode = basicInfoDs?.current?.get('reviewType') || '';
  const reviewTypeField = basicInfoDs?.getField('reviewType');
  const reviewTypeText = reviewTypeCode ? (reviewTypeField?.getText(reviewTypeCode) || reviewTypeCode) : '';
  const title = `商务入围评审${reviewTypeText ? ` - ${reviewTypeText}` : ''}${supplierName ? ` - ${supplierName}` : ''}`;
  const supplierInfoFields = [
    { name: 'supplierCompanyName', _type: 'TextField', disabled: true },
    { name: 'contactName', _type: 'TextField', disabled: true },
    { name: 'contactMobilephone', _type: 'TextField', disabled: true },
    { name: 'position', _type: 'TextField', disabled: true },
    { name: 'contactMail', _type: 'TextField', disabled: true },
    { name: 'registeredCapital', _type: 'NumberField', disabled: true },
    { name: 'paidInCapital', _type: 'NumberField', disabled: true },
    { name: 'buildDate', _type: 'DateTimePicker', disabled: true, label: '成立日期' },
    { name: 'insuredNumber', _type: 'NumberField', disabled: true },
    { name: 'taxLevel', _type: 'Select', disabled: true },
    { name: 'supplierRating', _type: 'Select', disabled: true },
    { name: 'employeeName', _type: 'TextField', disabled: true },
    { name: 'employeeCompanyName', _type: 'TextField', disabled: true },
    { name: 'caseRequirementCount', _type: 'NumberField', disabled: true },
    { name: 'warrantyPolicy', _type: 'TextField', disabled: true },
  ];

  const reviewInfoFields = [
    { name: 'businessReviewResult', _type: 'Select' },
    { name: 'businessQualificationReview', _type: 'TextArea' },
    { name: 'businessCreditLawReview', _type: 'TextArea' },
    { name: 'businessLegalAction', _type: 'TextArea' },
    { name: 'businessOtherSituations', _type: 'TextArea' },
    { name: 'businessReviewDesc', _type: 'TextArea' },
  ];

  const handleSaveOrSubmit = async (submitFlag?:boolean) => {
    const valid = await reviewInfoDs.validate();
    if (!valid) {
      return false;
    }
    const res = await supplierEvaluationDetailPostApi({ businessReviewInfo: { nominationHeaderId, nominationSupLineId, ...reviewInfoDs.current?.toJSONData() } }, !!submitFlag ? 'BUS_REVIEW_SUBMIT' : 'BUS_REVIEW_SAVE');
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
    title,
    style: { width: 1080 },
    closeable: true,
    children: (
      <div className={styles['detail-container']}>
      <Collapse trigger="text-icon" ghost expandIconPosition="text-right" defaultActiveKey={['supplierInfo', 'reviewInfo']}>
        <Panel header={intl.get(`${prefix}.view.panel.supplierInfo`).d('供应商信息')} key="supplierInfo">
          <FormPro
            dataSet={reviewInfoDs}
            columns={3}
            fields={supplierInfoFields}
            readOnly={isReadOnly}
          />
        </Panel>
        <Panel header={intl.get(`${prefix}.view.panel.businessReviewInfo`).d('商务评审信息')} key="reviewInfo">
          <FormPro
            dataSet={reviewInfoDs}
            columns={1}
            fields={reviewInfoFields}
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
            {/* <Button color={ButtonColor.primary} onClick={() => handleSaveOrSubmit()}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button> */}
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
