import React from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Collapse, Alert } from 'choerodon-ui';

import {
  prefix,
  technicalReviewBasicInfoDS,
  technicalReviewCaseDS,
  technicalReviewFormDS,
} from '../initialDs';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import FormPro from '../../../../../components/FormPro';
import OperationRecordCux from 'srm-front-boot/lib/components/OperationRecordCux';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import styles from './index.less';
import { supplierEvaluationDetailPostApi } from '../../../../../services/scux/supplierEvaluationServices';

const { Panel } = Collapse;

interface TechnicalReviewModalProps {
  record: any;
  type?: string;
}

export const openTechnicalReviewModal = async (record: any, type?: string, dataSet?: any) => {
  const nominationHeaderId = dataSet.getState('nominationHeaderId');
  const nominationSupLineId = record.get('nominationSupLineId');

  const basicInfoDs = new DataSet(technicalReviewBasicInfoDS(nominationHeaderId, record));
  const caseDs = new DataSet(technicalReviewCaseDS(nominationHeaderId, nominationSupLineId));
  const formDs = new DataSet(technicalReviewFormDS(nominationHeaderId, nominationSupLineId));
  let modal;

  await Promise.all([basicInfoDs.query(), formDs.query()]);
  const nominationStatus = basicInfoDs.current?.get('nominationStatus');
  const isReadOnly = type === 'unreleasedReadOnly' || (nominationStatus !== 'PENDING_REVIEW' && nominationStatus !== 'TO_BE_RELEASED');
  console.log(type, nominationStatus);

  // 构建标题：技术入围评审 - 标的类型 - 供应商名称
  const supplierName = record.get('supplierCompanyName') || '';
  const reviewTypeCode = basicInfoDs.current?.get('reviewType') || '';
  const reviewTypeField = basicInfoDs.getField('reviewType');
  const reviewTypeText = reviewTypeCode ? (reviewTypeField?.getText(reviewTypeCode) || reviewTypeCode) : '';
  const title = `技术入围评审${reviewTypeText ? ` - ${reviewTypeText}` : ''}${supplierName ? ` - ${supplierName}` : ''}`;

  const basicInfoFields = [
    { name: 'companyName' },
    { name: 'sourceProjectName' },
    { name: 'bidDirectorName' },
    { name: 'technicalPersonName' },
  ];

  const reviewInfoFields = [
    { name: 'nominationNum', _type: 'TextField' },
    { name: 'nominationStatusMeaning', _type: 'TextField' },
    { name: 'createdByName', _type: 'TextField' },
    { name: 'creationDate', _type: 'DateTimePicker' },
    { name: 'submitTime', _type: 'DateTimePicker' },
    { name: 'reviewType', _type: 'Select' },
    { name: 'caseRequirementCount', _type: 'NumberField' },
    { name: 'nominationAttachmentUuid', _type: 'TextField' },
    { name: 'warrantyPolicy', _type: 'TextField' },
    { name: 'supplierCompanyName', _type: 'TextField' },
    { name: 'contactName', _type: 'TextField' },
    { name: 'position', _type: 'TextField' },
    { name: 'contactMail', _type: 'TextField' },
  ];

  const caseColumns = [
    { name: 'seqNum', width: 80 },
    { name: 'caseName', editor: !isReadOnly, width: 150 },
    { name: 'employer', editor: !isReadOnly, width: 120 },
    { name: 'caseStatus', editor: !isReadOnly, width: 100 },
    { name: 'caseTime', editor: !isReadOnly, width: 100 },
    { name: 'contractAmount', editor: !isReadOnly, width: 120 },
    { name: 'employerContact', editor: !isReadOnly, width: 120 },
    { name: 'contactPhone', editor: !isReadOnly, width: 120 },
    { name: 'remark', editor: !isReadOnly, width: 150 },
    { name: 'attachmentUuid', editor: !isReadOnly, width: 100 },
  ];

  const caseButtons = isReadOnly ? [] : [TableButtonType.add, TableButtonType.delete];

  const reviewCards = [
    { title: intl.get(`${prefix}.field.techCapability`).d('技术/方案能力'), meet: 'techCapabilityMeet', desc: 'techCapabilityDesc' },
    { title: intl.get(`${prefix}.field.techQualityControl`).d('质量控制'), meet: 'techQualityControlMeet', desc: 'techQualityControlDesc' },
    { title: intl.get(`${prefix}.field.techPreparationCycle`).d('备货周期'), meet: 'techPreparationCycleMeet', desc: 'techPreparationCycleDesc' },
    { title: intl.get(`${prefix}.field.techCaseQuantity`).d('案例数量'), meet: 'techCaseQuantityMeet', desc: 'techCaseQuantityDesc' },
    { title: intl.get(`${prefix}.field.techWarrantyPolicy`).d('质保政策'), meet: 'techWarrantyPolicyMeet', desc: 'techWarrantyPolicyDesc' },
    { title: intl.get(`${prefix}.field.techSalesResponse`).d('售后响应'), meet: 'techSalesResponseMeet', desc: 'techSalesResponseDesc' },
  ];

  const resultFields = [
    { name: 'technologyReviewResult', _type: 'Select' },
    { name: 'technologyReviewDesc', _type: 'TextArea' },
    // { name: 'technologySubmitUserName', _type: 'TextField', disabled: true },
    // { name: 'technologySubmitDate', _type: 'DateTimePicker', disabled: true },
  ];

  const handleSaveOrSubmit = async (submitFlag?:boolean) => {
    const valid = await Promise.all([
      caseDs.validate(),
      formDs.validate(),
    ]);
    if (!valid.every(Boolean)) {
      return false;
    }
    if (caseDs.length === 0) {
      notification.warning({
        message: intl.get(`${prefix}.message.techReviewInfoRequired`).d('技术评审信息有且必须维护一行'),
      });
      return false;
    }
    const res = await supplierEvaluationDetailPostApi({ technologyReviewInfo: { nominationHeaderId, nominationSupLineId, ...formDs.current?.toJSONData(), techReviewLineList: caseDs.toData(), } }, !!submitFlag ? 'TECH_REVIEW_SUBMIT' : 'TECH_REVIEW_SAVE');
    if (getResponse(res)) {
      notification.success({});
      if(!submitFlag) {
        caseDs.query();
        formDs.query();
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
      <Collapse trigger="text-icon" ghost expandIconPosition="text-right" defaultActiveKey={['basicInfo', 'reviewInfo', 'technicalReviewInfo', 'reviewResult']}>
        {/* <Panel header={intl.get(`${prefix}.view.panel.basicInfo`).d('基础信息')} key="basicInfo">
          <FormPro
            dataSet={basicInfoDs}
            columns={2}
            fields={basicInfoFields}
            readOnly
          />
        </Panel>
        <Panel header={intl.get(`${prefix}.view.panel.reviewInfo`).d('评审信息')} key="reviewInfo">
          <FormPro
            dataSet={basicInfoDs}
            columns={3}
            fields={reviewInfoFields}
            readOnly
          />
        </Panel> */}
        <Panel header={intl.get(`${prefix}.view.panel.technicalReviewInfo`).d('技术评审信息')} key="technicalReviewInfo">
          <Alert
            type="info"
            showIcon
            message={intl.get(`${prefix}.tip.techReviewInfo`).d('技术评审信息有且必须维护一行')}
            style={{ marginBottom: 8 }}
          />
          <Table
            dataSet={caseDs}
            columns={caseColumns}
            buttons={caseButtons}
            style={{ marginBottom: 16 }}
            customizedCode="technicalReviewCase"
          />
          {reviewCards.map((card) => (
            <div key={card.meet} style={{ marginBottom: 12 }}>
              <div className={styles['review-card-title']}>{card.title}</div>
              <FormPro
                dataSet={formDs}
                columns={2}
                fields={[
                  { name: card.meet, _type: 'Select' },
                  { name: card.desc, _type: 'TextField' },
                ]}
                readOnly={isReadOnly}
              />
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <div className={styles['review-card-title']}>
              {intl.get(`${prefix}.field.techInspectionEvaluation`).d('考察评价')}
            </div>
            <FormPro
              dataSet={formDs}
              columns={2}
              fields={[
                { name: 'techInspectionMethod', _type: 'Select' },
                { name: 'techInspectionEvaluationDesc', _type: 'TextArea' },
              ]}
              readOnly={isReadOnly}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <div className={styles['review-card-title']}>
              {intl.get(`${prefix}.view.panel.reviewResult`).d('技术入围评审结果')}
            </div>
            <FormPro
              dataSet={formDs}
              columns={2}
              fields={resultFields}
              readOnly={isReadOnly}
            />
          </div>
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
        {/* <OperationRecordCux
          btnType="button"
          method="POST"
          modalContentType="tabs"
          tableOtherParams={{ nominationHeaderId, nominationSupLineId, type: 'technical' }}
          tableUrl={`${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/supplier-evaluation/technical-review/operation-record`}
        /> */}
      </div>
    ),
    destroyOnClose: true,
  });
};

const TechnicalReviewModal: React.FC<TechnicalReviewModalProps> = () => {
  return null;
};

export default TechnicalReviewModal;
