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
    { name: 'technologyReviewDesc', _type: 'TextArea', colSpan: 2, newLine: true },
    // { name: 'technologySubmitUserName', _type: 'TextField', disabled: true },
    // { name: 'technologySubmitDate', _type: 'DateTimePicker', disabled: true },
  ];

  const handleSaveOrSubmit = async (submitFlag?:boolean) => {
    if (submitFlag) {
      const valid = await Promise.all([
        caseDs.validate(),
        formDs.validate(),
      ]);
      if (!valid.every(Boolean)) {
        return false;
      }
      if (caseDs.length <= 1) {
        notification.warning({
          message: intl.get(`${prefix}.message.techReviewInfoRequired`).d('请维护案例信息（至少两行，可添加多行）'),
        });
        return false;
      }
    }
    const res = await supplierEvaluationDetailPostApi({ technologyReviewInfo: { nominationHeaderId, nominationSupLineId, ...formDs.current?.toJSONData(), techReviewLineList: caseDs.toData(), } }, submitFlag ? 'TECH_REVIEW_SUBMIT' : 'TECH_REVIEW_SAVE');
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

  // 二开：批量删除案例行
  // - 无 technologyReviewLineId（新增/未落库）的行：前端直接物理移除，不调删除接口
  // - 有 technologyReviewLineId（已落库）的行：调删除接口（TECH_LINE_DELETE），成功后前端物理移除
  const handleDeleteCase = () => {
    const selectedRecords = caseDs.selected.slice();
    if (selectedRecords.length === 0) {
      notification.warning({
        message: intl.get('hzero.common.message.selectRecord').d('请先选择要删除的数据'),
      });
      return;
    }
    const localRecords = selectedRecords.filter((row: any) => !row.get('technologyReviewLineId'));
    const serverRecords = selectedRecords.filter((row: any) => !!row.get('technologyReviewLineId'));
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('删除确认'),
      children: intl.get(`${prefix}.message.deleteCaseLine`).d('确定批量删除选中的案例行吗？'),
      onOk: async () => {
        if (serverRecords.length > 0) {
          // delete() 的第二个参数 false：避免重复弹删除确认框；delete 内部会调 TECH_LINE_DELETE 接口
          try {
            const res = await caseDs.delete(serverRecords, false);
            if (getResponse(res)) {
              // 接口删除成功：forceRemove 物理移除，避免停留在删除标记（变灰）状态
              caseDs.remove(serverRecords, true);
            } else {
              // 接口删除失败：重新查询，恢复被 delete 误标记的行
              caseDs.query();
              return;
            }
          } catch (e) {
            // 接口异常：重新查询恢复
            caseDs.query();
            return;
          }
        }
        if (localRecords.length > 0) {
          caseDs.remove(localRecords, true);
        }
      },
    });
  };

  // 二开：案例表格新增保存按钮，接口调用与弹框左下角保存一致（TECH_REVIEW_SAVE）
  const caseButtons = isReadOnly ? [] : [
    TableButtonType.add,
    <Button key="delete" onClick={handleDeleteCase}>
      {intl.get('hzero.common.button.deleteAll').d('批量删除')}
    </Button>,
    <Button key="save" color={ButtonColor.primary} onClick={() => handleSaveOrSubmit()}>
      {intl.get('hzero.common.button.save').d('保存')}
    </Button>,
  ];

  modal = Modal.open({
    key: Modal.key(),
    drawer: true,
    title,
    style: { width: 1080 },
    closable: true,
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
            message={intl.get(`${prefix}.tip.techReviewInfo`).d('请维护技术评审信息（至少两行，可添加多行）')}
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
                { name: 'techInspectionEvaluationDesc', _type: 'TextField' },
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
    footer: () => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {!isReadOnly && (
          <Button color={ButtonColor.primary} style={{ marginRight: 8 }} onClick={() => handleSaveOrSubmit()}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        )}
        {!isReadOnly && (
          <Button color={ButtonColor.primary} style={{ marginRight: 8 }} onClick={() => handleSaveOrSubmit(true)}>
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
        )}
        <Button onClick={() => modal.close()}>
          {intl.get('hzero.common.button.close').d('关闭')}
        </Button>
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
