import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { DataSet, Table, Button, Modal, Attachment } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Header, Content } from 'hzero-front/lib/components/Page';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import notification from 'hzero-front/lib/utils/notification';
import { observer, useComputed } from 'mobx-react-lite';
import DynamicButtons from 'srm-front-boot/lib/components/DynamicButtons';
import FormPro from 'srm-front-cux-twnf/src/components/FormPro';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import OperationRecordCux from 'srm-front-boot/lib/components/OperationRecordCux';

import styles from './index.less';
import { headerDsConfig, lineDsConfig, lineDetailDsConfig, prefix } from './initialDs';
import { saveInspection, submitInspection, cancelInspection, saveInspectionDetail } from '@/services/scux/inspectionManagementService';

const defaultActiveKey = ['basicInfo', 'detailInfo'];
const { Panel } = Collapse;

const InspectionDetail = ({ location, history }: any) => {
  const { search } = location || {};
  const searchParams = new URLSearchParams(search || '');
  const inspHeaderId = searchParams.get('inspHeaderId');
  const readOnly = searchParams.get('readOnly') === '1';

  const headerDS = useMemo(() => new DataSet(headerDsConfig(inspHeaderId)), [inspHeaderId]);
  const lineDS = useMemo(() => new DataSet(lineDsConfig(inspHeaderId)), [inspHeaderId]);
  const [lineAttributeVarchar18Flag, setLineAttributeVarchar18Flag] = useState(false)

  useEffect(() => {
    lineDS.bind(headerDS, 'children');
    lineDS.addEventListener('load', () => {
      setLineAttributeVarchar18Flag(lineDS?.current?.get('attributeVarchar18') === 'ZC')
    })
    return () => { lineDS.removeEventListener('load') };
  }, []);

  const backPath = useMemo(() => '/scux/inspection-management/list', []);

  const backList = useCallback(() => {
    history.push(backPath);
  }, [history, backPath]);

  const validateAll = async () => {
    const valid = await Promise.all([headerDS.validate(), lineDS.validate()]);
    return valid.every(Boolean);
  };

  const getSavePayload = () => {
    const header = headerDS.current?.toJSONData?.() || {};
    const inspLineList = lineDS?.toData() || [];
    return { ...header, inspLineList, children: null };
  };

  const handleSave = useCallback(async () => {
    const ok = await validateAll();
    if (!ok) {
      return;
    }
    const res = await saveInspection(getSavePayload());
    if (getResponse(res)) {
      notification.success({});
      headerDS.query();
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const ok = await validateAll();
    if (!ok) {
      return;
    }
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: intl.get(`${prefix}.message.submitConfirm`).d('是否确定提交？'),
      onOk: async () => {
        const res = await submitInspection(getSavePayload());
        if (getResponse(res)) {
          notification.success({});
          backList();
        }
      },
    });
  }, [backList]);

  const handleCancelDoc = useCallback(async () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('提示'),
      children: intl.get(`${prefix}.message.cancelConfirm`).d('确认取消此单据？'),
      onOk: async () => {
        const res = await cancelInspection(getSavePayload());
        if (getResponse(res)) {
          notification.success({});
          backList();
        }
      },
    });
  }, [inspHeaderId, backList]);

  const handleInitiateBusiness = useCallback(
    () => {
      history.push({
        pathname: '/sqam/createClaim/create',
      });
    },
    [history]
  );

  const headerFields = useMemo(
    () => [
      { name: 'inspTitle', _type: 'TextField' },
      { name: 'inspNum', _type: 'TextField', disabled: true },
      { name: 'inspStatus', _type: 'TextField', disabled: true },
      { name: 'createdName', _type: 'TextField', disabled: true },
      { name: 'creationDate', _type: 'DateTimePicker', disabled: true },
      { name: 'companyLov', _type: 'Lov' },
      { name: 'ouLov', _type: 'Lov' },
      { name: 'purchaseOrgLov', _type: 'Lov' },
      { name: 'unitLov', _type: 'Lov' },
      { name: 'participantsLov', _type: 'Lov', colSpan: 2 },
      { name: 'attachmentUuid', FormField: Attachment },
      { name: 'remark', _type: 'TextArea', rowSpan: 3, colSpan: 2 },
    ],
    []
  );

  const openLineDetailModal = (record: any) => {
    const contractType = record.get('attributeVarchar10');
    const inspLineId = record.get('inspLineId');
    const lineDetailDS = new DataSet(lineDetailDsConfig(inspLineId));

    const projectFields = [
      { name: 'pcNum', _type: 'TextField', disabled: true },
      { name: 'pcName', _type: 'TextField', disabled: true },
      { name: 'companyName', _type: 'TextField', disabled: true },
      { name: 'supplierCompanyName', _type: 'TextField', disabled: true },
    ];

    const approvalFields = [
      { name: 'paReportAnalysis', _type: 'TextArea', colSpan: 2, resize: 'both' },
      {
        name: 'paTargetFlag',
        _type: 'Select',
      },
      {
        name: 'paBudgetFlag',
        _type: 'Select',
      },
    ];

    const executeFields = [
      contractType === '1' && { name: 'projEng', _type: 'TextArea', colSpan: 2, resize: 'both' },
      contractType === '1' && {
        name: 'projEngDataCompleteFlag',
        _type: 'Select',
      },
      contractType === '1' && {
        name: 'projEngAsDrawingFlag',
        _type: 'Select',
      },
      contractType === '1' && {
        name: 'projEngQualityDeviationFlag',
        _type: 'Select',
      },
      contractType === '2' && { name: 'projEquip', _type: 'TextArea', colSpan: 2, resize: 'both' },
      contractType === '2' && {
        name: 'projEquipListFlag',
        _type: 'Select',
      },
      contractType === '2' && {
        name: 'projEquipMissingFlag',
        _type: 'Select',
      },
      contractType === '2' && {
        name: 'projEquipQualityDeviationFlag',
        _type: 'Select',
      },
      contractType === '3' && { name: 'projService', _type: 'TextArea', colSpan: 2, resize: 'both' },
    ].filter(Boolean);

    const handleOk = async () => {
      const valid = await lineDetailDS.validate();
      if (!valid) {
        return false;
      }
      const res = await saveInspectionDetail(lineDetailDS?.current?.toData());
      if (getResponse(res)) {
        notification.success({});
        return true;
      }
      return false;
    };

    const detailContentList = [
      {
        key: 'project',
        content: (
          <Panel key="project" header={intl.get(`${prefix}.tab.project`).d('项目信息')}>
            <FormPro dataSet={lineDetailDS} columns={2} fields={projectFields} readOnly={true} />
          </Panel>
        ),
      },
      {
        key: 'approval',
        content: (
          <Panel key="approval" header={intl.get(`${prefix}.tab.approval`).d('立项信息')}>
            <FormPro dataSet={lineDetailDS} columns={2} fields={approvalFields} readOnly={readOnly} />
          </Panel>
        ),
      },
      contractType && {
        key: 'execute',
        content: (
          <Panel key="execute" header={intl.get(`${prefix}.tab.execute`).d('项目执行信息')}>
            <FormPro dataSet={lineDetailDS} columns={2} fields={executeFields} readOnly={readOnly} />
          </Panel>
        ),
      },
    ].filter(Boolean)

    Modal.open({
      key: Modal.key(),
      drawer: true,
      title: intl.get(`${prefix}.view.lineDetail`).d('点检明细'),
      style: { width: 920 },
      children: (
        <div className={styles['detail-container']}>
          <Collapse
            trigger="text-icon"
            ghost
            expandIconPosition="text-right"
            defaultActiveKey={['project', 'approval', 'execute']}
          >
            {detailContentList.map(i => i.content)}
          </Collapse>
        </div>
      ),
      onOk: handleOk,
      okText: intl.get('hzero.common.button.ok').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      destroyOnClose: true,
    });
  };

  const columns: any[] = useMemo(
    () => [
      { name: 'lineNum', width: 80 },
      { name: 'pcNum', width: 160 },
      { name: 'pcName', width: 200 },
      { name: 'pcCompanyName', width: 160 },
      { name: 'supplierCompanyName', width: 180 },
      { name: 'taxIncludeAmount', width: 120, align: 'right' },
      { name: 'pcCreatedName', width: 120 },
      !!lineAttributeVarchar18Flag && {
        name: 'inspResult',
        width: 110,
        editor: !readOnly,
      },
      {
        name: 'lineDetail',
        width: 110,
        renderer: ({ record }) => (
          <Button funcType={FuncType.link} onClick={() => openLineDetailModal(record)} disabled={!record.get('exsitDetailFlag') && readOnly}>
            {intl.get(`${prefix}.button.detail`).d('点检明细')}
          </Button>
        ),
      },
      { name: 'lineRemark', editor: !readOnly, width: 220 },
      { name: 'lineAttachmentUuid', editor: !readOnly, width: 160 },
      { name: 'pcStatusCodeMeaning', width: 120 },
      { name: 'attributeVarchar18Meaning', width: 120 },
      { name: 'attributeVarchar10', width: 120 },
    ].filter(Boolean),
    [readOnly, lineAttributeVarchar18Flag]
  );

  const HeaderButtons = useMemo(
    () =>
      observer(({ dataSet, lineDs }: any) => {
        const buttons = [
          {
            name: 'submit',
            hidden: !!readOnly,
            child: intl.get('hzero.common.button.submit').d('提交'),
            btnProps: { icon: 'publish2', color: 'primary', onClick: handleSubmit },
          },
          {
            name: 'save',
            hidden: !!readOnly,
            child: intl.get('hzero.common.btn.save').d('保存'),
            btnProps: { icon: 'save', funcType: 'flat', onClick: handleSave },
          },
          {
            name: 'cancel',
            hidden: !!readOnly,
            child: intl.get('hzero.common.button.cancel').d('取消'),
            btnProps: { funcType: 'flat', onClick: handleCancelDoc },
          },
          {
            name: 'initiateBusiness',
            hidden: !readOnly || +dataSet.current?.get('unqualifiedFlag') !== 1,
            child: intl.get(`${prefix}.view.btn.initiateBusiness`).d('发起商务'),
            btnProps: { funcType: 'flat', onClick: handleInitiateBusiness },
          },
          {
            name: 'operation',
            hidden: !readOnly,
            btnComp: OperationRecordCux,
            child: '',
            btnProps: {
              btnType: 'button',
              method: 'POST',
              modalContentType: 'tabs',
              tableOtherParams: { inspHeaderId, type: 'record' },
              tableUrl: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia14BYYpWNAzIJLm0TGia2rHibwj7VjbmmW1kjgAwyEO2Hic`,
              statusIconTypes: [
                { value: 'NEW', icon: 'add' },
                { value: 'FINISHED', icon: 'check' },
                { value: 'CANCELLED', icon: 'cancel' },
              ],
            },
          },
        ];
        return <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />;
      }),
    [handleSave, handleSubmit, handleCancelDoc, readOnly]
  );

  const contentList = useMemo(() => {
    return [
      {
        key: 'basicInfo',
        content: (
          <Panel key="basicInfo" header={intl.get(`${prefix}.view.panel.basicInfo`).d('基本信息')}>
            <FormPro dataSet={headerDS} columns={3} fields={headerFields} readOnly={readOnly} />
          </Panel>
        ),
      },
      {
        key: 'detailInfo',
        content: (
          <Panel
            key="detailInfo"
            header={intl.get(`${prefix}.view.panel.AssetDetailInfo`).d('合同信息')}
          >
            <Table dataSet={lineDS} columns={columns} />
          </Panel>
        ),
      },
    ];
  }, [headerDS, lineDS, readOnly, columns]);

  return (
    <>
      <Header backPath={backPath} title={intl.get(`${prefix}.view.detailTitle`).d('点检维护')}>
        <HeaderButtons dataSet={headerDS} />
      </Header>
      <Content>
        <div className={styles['detail-container']}>
          <Collapse
            trigger="text-icon"
            ghost
            expandIconPosition="text-right"
            defaultActiveKey={defaultActiveKey}
          >
            {contentList.map(i => i.content)}
          </Collapse>
        </div>
      </Content>
    </>
  );
};

export default React.memo(formatterCollections({ code: [prefix] })(InspectionDetail));

