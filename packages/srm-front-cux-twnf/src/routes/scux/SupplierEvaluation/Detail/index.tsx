import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { DataSet, Modal, Table, Output } from 'choerodon-ui/pro';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import { Collapse } from 'choerodon-ui';
import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { observer } from 'mobx-react-lite';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import OperationRecordCux from 'srm-front-boot/lib/components/OperationRecordCux';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';

import FormPro from '../../../../components/FormPro';
import { basicInfoDS, supplierListDS, prefix, businessStandardDS, technicalStandardLineDS } from './initialDs';
import BasicInfo from './BasicInfo';
import EvaluationInfo from './EvaluationInfo';
import SupplierList from './SupplierList';
import styles from './index.less';
import { supplierEvaluationPostApi, supplierEvaluationDetailPostApi } from '../../../../services/scux/supplierEvaluationServices';

const getDefaultActiveKey = (type: string) => {
  if (type === 'view' || type === 'readOnly') {
    return ['evaluationInfo', 'supplierList'];
  }
  return ['basicInfo', 'evaluationInfo', 'supplierList'];
};
const { Panel } = Collapse;

const TitleWithProject = observer(({ basicInfoDs, type }: any) => {
  const num = basicInfoDs.current?.get('sourceProjectNum');
  const name = basicInfoDs.current?.get('sourceProjectName');
  const title = type === 'submit'
    ? intl.get(`${prefix}.view.submitTitle`).d('入围单提交')
    : (type === 'view' || type === 'readOnly')
      ? intl.get(`${prefix}.view.viewTitle`).d('入围查看')
      : intl.get(`${prefix}.view.detailTitle`).d('入围单维护');
  return (
    <span>
      {title}
      {(num || name) && (
        <span style={{ marginLeft: 16, fontSize: 14, color: '#666' }}>
          {num} - {name}
        </span>
      )}
    </span>
  );
});

const SupplierEvaluationDetail = ({ location, history }: any) => {
  const { search } = location || {};
  const searchParams = new URLSearchParams(search || '');
  const nominationHeaderId = searchParams.get('nominationHeaderId');
  const type = searchParams.get('type') || 'readOnly';
  console.log(type)

  const basicInfoDs = useMemo(() => new DataSet(basicInfoDS(nominationHeaderId)), [nominationHeaderId]);
  const supplierListDs = useMemo(() => new DataSet(supplierListDS(nominationHeaderId, type, () => basicInfoDs?.current?.get('companyId'))), [nominationHeaderId, type, basicInfoDs]);

  useEffect(() => {
    supplierListDs.setState('nominationHeaderId', nominationHeaderId)
  }, []);

  const readOnly = type !== 'edit';

  const backPath = useMemo(() => '/scux/supplier-evaluation/list', []);

  const backList = useCallback(() => {
    history.push(backPath);
  }, [history, backPath]);

  const validateAll = async () => {
    const valid = await Promise.all([
      basicInfoDs.validate(),
      supplierListDs.validate(),
    ]);
    return valid.every(Boolean);
  };

  const getSavePayload = () => {
    const nominationHeader = basicInfoDs.current?.toJSONData?.() || {};
    const supplierLineList = supplierListDs?.toData() || [];
    return { nominationHeader, supplierLineList };
  };

  const handleSave = useCallback(async () => {
    const ok = await validateAll();
    if (!ok) {
      return;
    }
    const res = await supplierEvaluationPostApi(getSavePayload(), 'SAVE_NOMINATION');
    if (getResponse(res)) {
      notification.success({});
      basicInfoDs.query();
      supplierListDs.query();
    }
  }, []);

  const handlePublish = useCallback(async () => {
    const ok = await validateAll();
    if (!ok) {
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: intl.get(`${prefix}.message.publishConfirm`).d('是否确定发布？'),
      onOk: async () => {
        const res = await supplierEvaluationPostApi(getSavePayload(), 'RELEASE');
        if (getResponse(res)) {
          notification.success({});
          backList();
        }
      },
    });
  }, [backList]);

const handleBusinessStandard = useCallback(() => {
    const businessStandardDs = new DataSet(businessStandardDS(nominationHeaderId, basicInfoDs));

    const columns = [
      { name: 'seqNum', header: '序号', width: 60 },
      { name: 'itemName', header: '评审项目', width: 120, editor: false },
      {
        name: 'valueCode',
        header: '入围要求',
        width: 200,
        editor: (record: any) => record.get('isRequired') === '1',
      },
      { name: 'isRequired', header: '是否要求', width: 80, editor: (record: any) => !record.get('requiredLocked') },
    ];

    const handleOk = async () => {
      const valid = await businessStandardDs.validate();
      if (!valid) {
        return false;
      }
      const rows = businessStandardDs.toData();
      const firstRow: any = rows[0] || {};
      const businessCfg: any = {
        nominationHeaderId,
        businessCfgId: firstRow.businessCfgId,
        objectVersionNumber: firstRow.objectVersionNumber,
      };
      rows.forEach((row: any) => {
        switch (row.itemCode) {
          case 'taxGrade':
            businessCfg.taxGrade = Array.isArray(row.valueCode) ? row.valueCode.join(',') : row.valueCode;
            businessCfg.taxGradeRequired = '1';
            break;
          case 'supplierRating':
            businessCfg.supplierRating = Array.isArray(row.valueCode) ? row.valueCode.join(',') : row.valueCode;
            businessCfg.supplierRatingRequired = row.isRequired;
            break;
          case 'registeredCapital':
            businessCfg.registeredCapitalFrom = row.valueCode ? Number(row.valueCode) : undefined;
            businessCfg.registeredCapitalTo = row.valueTo || undefined;
            businessCfg.registeredCapitalRequired = row.isRequired;
            break;
          case 'paidInCapital':
            businessCfg.paidInCapitalFrom = row.valueCode ? Number(row.valueCode) : undefined;
            businessCfg.paidInCapitalTo = row.valueTo || undefined;
            businessCfg.paidInCapitalRequired = row.isRequired;
            break;
          case 'establishmentYears':
            businessCfg.establishmentYearsFrom = row.valueCode ? Number(row.valueCode) : undefined;
            businessCfg.establishmentYearsTo = row.valueTo || undefined;
            businessCfg.establishmentYearsRequired = row.isRequired;
            break;
        }
      });
      const res = await supplierEvaluationPostApi({ businessCfg }, 'SAVE_BUSINESS_CFG');
      if (getResponse(res)) {
        notification.success({});
        basicInfoDs.query();
        supplierListDs.query();
        return true;
      }
      return false;
    };

    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get(`${prefix}.view.businessStandard`).d('商务标准设置'),
      style: { width: 800 },
      resizable: true,
      children: (
        <Table
          dataSet={businessStandardDs}
          columns={columns}
        />
      ),
      onOk: handleOk,
      okText: intl.get('hzero.common.button.ok').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      destroyOnClose: true,
    });
  }, [basicInfoDs, nominationHeaderId, supplierListDs]);

  const handleTechnicalStandard = useCallback(() => {
    const technicalStandardLineDs = new DataSet(technicalStandardLineDS(nominationHeaderId));

    const fields = [
      { name: 'nominationNum', _type: 'TextField', disabled: true },
      { name: 'createdByName', _type: 'TextField', disabled: true },
      { name: 'creationDate', _type: 'DateTimePicker', disabled: true },
    ];

    const columns = [
      { name: 'seqNum', width: 80 },
      { name: 'qualificationType', editor: true },
      { name: 'qualificationGrade', editor: true },
      { name: 'isRequired', editor: true, width: 100 },
    ];

    const handleOk = async () => {
      const valid = await technicalStandardLineDs.validate();
      if (!valid) {
        return false;
      }
      const technologyCfgList = technicalStandardLineDs.toJSONData();
      const res = await supplierEvaluationPostApi({ technologyCfgList, nominationHeaderId }, 'SAVE_TECHNOLOGY_CFG');
      if (getResponse(res)) {
        notification.success({});
        basicInfoDs.query();
        supplierListDs.query();
        return true;
      }
      return true;
    };

    const buttons = [TableButtonType.add, TableButtonType.delete];

    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get(`${prefix}.view.technicalStandard`).d('技术标准设置'),
      style: { width: 800 },
      resizable: true,
      children: (
        <div>
          {/* <FormPro
            dataSet={basicInfoDs}
            columns={3}
            fields={fields}
          /> */}
          <Table
            dataSet={technicalStandardLineDs}
            columns={columns}
            buttons={buttons}
            style={{ marginTop: 16 }}
            customizedCode="customized"
          />
        </div>
      ),
      onOk: handleOk,
      okText: intl.get('hzero.common.button.ok').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      destroyOnClose: true,
    });
  }, [basicInfoDs]);

  const handleSubmit = useCallback(async () => {
    const ok = await basicInfoDs?.current?.validate(true);
    if (!ok) {
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: intl.get(`${prefix}.message.submitConfirm`).d('是否确定提交？'),
      onOk: async () => {
        const res = await supplierEvaluationPostApi(getSavePayload(), 'SUBMIT');
        if (getResponse(res)) {
          notification.success({});
          backList();
        }
      },
    });
  }, [backList]);


  const handleSubmitReview = useCallback(async () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: intl.get(`${prefix}.message.submitConfirm`).d('是否确定提交？'),
      onOk: async () => {
        const res = await supplierEvaluationDetailPostApi(getSavePayload(), 'WHOEL_REVIEW_SUBMIT');
        if (getResponse(res)) {
          notification.success({});
          backList();
        }
      },
    });
  }, [backList]);

  const HeaderButtons = useMemo(
    () =>
      observer(() => {
        const buttons = [
          {
            name: 'submit',
            hidden: type !== 'unreleasedReadOnly',
            child: intl.get('hzero.common.button.submit').d('提交'),
            btnProps: { icon: 'publish2', color: 'primary', onClick: handleSubmit },
          },
          {
            name: 'submitReview',
            hidden: type !== 'pendingReview',
            child: intl.get('hzero.common.button.submitReview').d('提交评审'),
            btnProps: { icon: 'publish2', color: 'primary', onClick: handleSubmitReview },
          },
          {
            name: 'publish',
            hidden: !!readOnly,
            child: intl.get(`${prefix}.button.publishNew`).d('发布评审'),
            btnProps: { icon: 'publish2', color: 'primary', onClick: handlePublish },
          },
          {
            name: 'save',
            hidden: !!readOnly,
            child: intl.get('hzero.common.btn.save').d('保存'),
            btnProps: { icon: 'save', funcType: 'flat', onClick: handleSave },
          },
          {
            name: 'operation',
            hidden: !readOnly,
            btnComp: OperationRecordCux,
            child: '',
            btnProps: {
              btnType: 'button',
              method: 'GET',
              modalContentType: 'tabs',
              tableOtherParams: { nominationHeaderId, queryType: 'ACTION' },
              tableUrl: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
            },
          },
        ];
        return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
      }),
    [handleSubmit, handleSave, handlePublish, handleBusinessStandard, handleTechnicalStandard, readOnly, nominationHeaderId, type]
  );

  const contentList = useMemo(() => {
    // const headers = `${basicInfoDs.current?.get('supplierEntryCode') || ''} - ${basicInfoDs.current?.get('supplierName') || ''}`;
    return [
      {
        key: 'basicInfo',
        content: (
          <Panel key="basicInfo" header={intl.get(`${prefix}.view.panel.basicInfo`).d('基础信息')}>
            <BasicInfo dataSet={basicInfoDs} />
          </Panel>
        ),
      },
      {
        key: 'evaluationInfo',
        content: (
          <Panel key="evaluationInfo" header={intl.get(`${prefix}.view.panel.evaluationInfo`).d('评审详情')}>
            <EvaluationInfo dataSet={basicInfoDs} type={type} />
          </Panel>
        ),
      },
      {
        key: 'supplierList',
        content: (
          <Panel key="supplierList" header={intl.get(`${prefix}.view.panel.supplierList`).d('供应商列表')}>
            <SupplierList dataSet={supplierListDs} type={type} history={history} basicInfoDs={basicInfoDs} onBusinessStandard={handleBusinessStandard} onTechnicalStandard={handleTechnicalStandard} />
          </Panel>
        ),
      },
    ];
  }, [basicInfoDs, supplierListDs, type]);

  return (
    <>
      <Header backPath={backPath} title={<TitleWithProject basicInfoDs={basicInfoDs} type={type} />}>
        <HeaderButtons />
      </Header>
      <Content>
        <div className={styles['detail-container']}>
          <Collapse
            trigger="text-icon"
            ghost
            expandIconPosition="text-right"
            defaultActiveKey={getDefaultActiveKey(type)}
          >
            {contentList.map(i => i.content)}
          </Collapse>
        </div>
      </Content>
    </>
  );
};

export default React.memo(formatterCollections({ code: [prefix] })(SupplierEvaluationDetail));
