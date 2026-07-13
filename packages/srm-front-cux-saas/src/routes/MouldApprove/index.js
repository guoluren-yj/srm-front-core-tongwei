import React, { Fragment, useEffect, useState, useMemo } from 'react'; //
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import classnames from 'classnames';
import {
  TextField,
  DatePicker,
  Select,
  Lov,
  NumberField,
  Output,
  Form,
  DataSet,
  Table,
  Modal,
  TextArea,
  Button,
} from 'choerodon-ui/pro';
import History from '@/routes/MouldAccount/components/OperationHistory';
import { Spin } from 'choerodon-ui';
import { compose, isArray } from 'lodash';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import {
  // getChangeInfo,
  sureData,
  resetData,
  approveData,
  rejectData,
  changeApply,
  fetchPermissions,
} from '@/services/mouldAccountService';
import {
  maDetailDs,
  tableLineDS,
  maExpandLine,
  maDetailModifyDs,
} from '../MouldAccount/stores/maDetailDs';
import { maChangeDs, remarkDataDs } from '../MouldAccount/stores/maListDs';
import ChangeForm from './components/ChangeForm.js';
import ChangeTable from './components/changeTable.js';
import ChangeExpandTable from './components/changeExpandTable.js';
import PromptModal from '../MouldAccount/components/PromptModal';
import AttachmentInfo from '../MouldAccount/components/Attachment';

import styles from './index.less';

const Index = ({
  match = {},
  modalHeaderId,
  changeContentIsEdit = false,
  modalType,
  currentRecord, // 上层点击的行信息
  statusConfigId, // 按钮操作需要传参
  statusBtnConfig, // 控制按钮的显示逻辑
  customizeTable,
  onChangeNum, // 更新tab的数量
  customizeForm,
  modal, // 本层的弹窗
  customizeBtnGroup,
  isSupplier = false,
}) => {
  const { url = '' } = match;
  const pubPathFlag = (url || '').includes('/pub');
  const getQueryString = name => {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = (url.split('?')[1] || '').substr(0).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  };
  let maHeaderId;
  if (modalHeaderId) {
    maHeaderId = modalHeaderId;
  } else {
    maHeaderId = getQueryString('maHeaderId');
  }
  const [showContent, setShowContent] = useState(false); // 控制扩展行是否展示
  const [type, setType] = useState(modalType);

  // 只读的模具基础信息，模具行，扩展模具行
  const tableDS = useMemo(() => new DataSet(tableLineDS(false)), []);
  const maExpandDs = useMemo(() => new DataSet(maExpandLine()), []);
  const formDs = useMemo(
    () =>
      new DataSet({
        ...maDetailDs({ maHeaderId, source: 'modify', maExpandDs, read: true, tableDS }),
      }),
    []
  );

  // 模具的转移/维修报废/维修维修
  const maChangeFormDs = useMemo(
    () => new DataSet(maChangeDs({ type: modalType || 'normal', maHeaderId })),
    []
  );

  // 编辑的模具变更信息
  // 模具变更物料行
  const changeTableDs = useMemo(() => new DataSet(tableLineDS()), []);
  // 模具变更物料扩展行
  const maExpandLineDs = useMemo(() => new DataSet(maExpandLine()), []);
  const changeFormDs = useMemo(
    () =>
      new DataSet(
        maDetailModifyDs({ maHeaderId, source: 'modify', changeTableDs, maExpandLineDs })
      ),
    []
  );

  const [loading, setLoading] = useState(false);

  const columns = [
    {
      name: 'lineNum',
      width: 80,
    },
    {
      name: 'itemLov',
      width: 150,
    },
    {
      name: 'itemName',
      width: 150,
    },
    {
      name: 'categoryName',
      width: 150,
      tooltip: true,
    },
    {
      name: 'uomName',
      width: 150,
    },
    {
      name: 'quantity',
      width: 150,
    },
    {
      name: 'modelSpecs',
      width: 150,
    },
  ];

  const maExpandCol = [
    {
      name: 'lineNum',
      width: 80,
    },
  ];

  /**
   * 打开操作记录
   * @param {String} maHeaderId
   */
  const openOperatorRecord = () => {
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: '800px' },
      title: intl.get(`hzero.common.button.operated`).d('操作记录'),
      closable: true,
      children: <History maHeaderId={maHeaderId || currentRecord.get('maHeaderId')} />,
      footer: null,
    });
  };

  // 审批拒绝
  const rejectMould = () => {
    const headerInfo = currentRecord.toJSONData();
    const remarkDs = new DataSet(remarkDataDs('reject'));
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: '800px' },
      title: intl.get('siec.mould.model.common.approveRemark').d('审批意见'),
      closable: true,
      movable: false,
      children: <PromptModal ds={remarkDs} />,
      footer: (_, cancelBtn) => (
        <div>
          <Button onClick={() => rejectCurrentData(headerInfo, remarkDs)}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  };

  const rejectCurrentData = async (headerInfo, remarkDs) => {
    const flag = await remarkDs.validate();
    if (!flag) {
      return false;
    } else {
      const [{ approvedRemark }] = remarkDs.toJSONData();
      return new Promise(resolve => {
        rejectData({ ...headerInfo, statusConfigId, approvedRemark }).then(res => {
          const resData = getResponse(res);
          if (resData) {
            onChangeNum();
            notification.success();
            Modal.destroyAll();
            Modal.destroyAll();
          } else {
            resolve(false);
          }
        });
      });
    }
  };

  const approveMould = () => {
    const headerInfo = currentRecord.toJSONData();
    const remarkDs = new DataSet(remarkDataDs());
    Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      drawer: true,
      style: { width: '800px' },
      title: intl.get('siec.mould.model.common.approveRemark').d('审批意见'),
      closable: true,
      movable: false,
      onCancel: () => {},
      children: <PromptModal ds={remarkDs} />,
      footer: (_, cancelBtn) => (
        <div>
          <Button onClick={() => approve(headerInfo, remarkDs)}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  };

  const approve = async (headerInfo, remarkDs) => {
    const remarkData = remarkDs.toJSONData();
    const { approvedRemark = '' } = remarkData[0] ? remarkData[0] : {};
    return new Promise(resolve => {
      approveData({ ...headerInfo, statusConfigId, approvedRemark }).then(res => {
        const resData = getResponse(res);
        if (resData && !resData.failed) {
          onChangeNum();
          notification.success();
          Modal.destroyAll();
        } else {
          resolve(false);
        }
      });
    });
  };

  const resetMould = () => {
    const headerInfo = currentRecord.toJSONData();
    return new Promise(resolve => {
      resetData({ ...headerInfo, statusConfigId }).then(res => {
        const resData = getResponse(res);
        if (resData) {
          onChangeNum();
          notification.success();
          Modal.destroyAll();
        } else {
          resolve(false);
        }
      });
    });
  };

  const submitMould = async () => {
    // eslint-disable-next-line no-param-reassign
    maChangeFormDs.current.status = 'update';
    const flag = await maChangeFormDs.validate();
    const modifyFlag = await changeFormDs.validate();
    if (type === 'modify' && !modifyFlag) {
      return false;
    }
    if (type !== 'modify' && !flag) {
      return false;
    }

    const [submitMsg] = maChangeFormDs.toJSONData();
    const headerInfo = currentRecord.toJSONData();
    const maChangeModify = type === 'modify' ? changeFormDs.toJSONData()[0] : null;
    const modifyLineList = changeTableDs.toData();
    const modifyLineExpandList = maExpandLineDs.toData();
    return new Promise(resolve => {
      changeApply({
        ...submitMsg,
        maHeaderId: headerInfo.maHeaderId,
        statusConfigId,
        // XX原因取值判断
        reason: type === 'modify' ? maChangeModify.reason : submitMsg.reason,
        changeType: type.toLocaleUpperCase(),
        maChangeModify: {
          ...maChangeModify,
          formDs: undefined,
          maLineList: undefined,
          modifyLineList,
          modifyLineExpandList,
        },
      }).then(res => {
        const resData = getResponse(res);
        if (resData) {
          onChangeNum();
          notification.success();
          Modal.destroyAll();
        } else {
          resolve(false);
        }
      });
    });
  };

  const sureMould = () => {
    const headerInfo = formDs?.toJSONData()[0] ?? {};
    return new Promise(async resolve => {
      if (await formDs.validate()) {
        sureData({ ...headerInfo, statusConfigId }).then(res => {
          const resData = getResponse(res);
          if (resData) {
            onChangeNum();
            notification.success();
            Modal.destroyAll();
          } else {
            resolve(false);
          }
        });
      } else {
        resolve();
      }
    });
  };

  const FooterBtn = () => {
    const approvalMethod = currentRecord ? currentRecord.get('approvalMethod') : '';
    const upperMaStatus = currentRecord?.get('maStatus')?.toLocaleUpperCase();
    const currentBtnConfig = upperMaStatus ? statusBtnConfig[upperMaStatus] || [] : [];

    const footerButtons = [];
    const actionMaps = currentBtnConfig.map(ele => ele.operationCode) || [];
    if (actionMaps.includes('APPROVED') && approvalMethod === 'FUNCTIONAL') {
      footerButtons.push({
        name: 'approval',
        noNest: true,
        btnType: 'h0',
        btnProps: { onClick: approveMould },
        child: text => (
          <Button onClick={approveMould} data-name="approval" funcType="raised">
            {text || intl.get(`hzero.common.button.approvalAdopt`).d('审批通过')}
          </Button>
        ),
      });
    }
    if (actionMaps.includes('REJECT') && approvalMethod === 'FUNCTIONAL') {
      footerButtons.push({
        name: 'refuse',
        noNest: true,
        btnProps: { onClick: rejectMould },
        child: text => (
          <Button onClick={rejectMould}>
            {text || intl.get(`hzero.common.button.approvalRefuse`).d('审批拒绝')}
          </Button>
        ),
      });
    }
    if (actionMaps.includes('CONFORM')) {
      footerButtons.push({
        name: 'sure',
        noNest: true,
        btnProps: { onClick: sureMould },
        child: text => (
          <Button color="primary" onClick={sureMould} data-name="sure">
            {text || intl.get(`hzero.common.button.confrim`).d('确认')}
          </Button>
        ),
      });
    }
    if (actionMaps.includes('SEND_BACK')) {
      footerButtons.push({
        name: 'refuse',
        noNest: true,
        btnProps: { onClick: resetMould },
        child: text => (
          <Button onClick={resetMould} data-name="sendBack">
            {text || intl.get(`hzero.common.button.sendBack`).d('退回')}
          </Button>
        ),
      });
    }
    if (
      actionMaps.some(ele => ['MAINTAIN', 'TRANSFER', 'SCRAP', 'MODIFY'].includes(ele)) &&
      type &&
      type !== 'normal'
    ) {
      footerButtons.push({
        name: 'submit',
        noNest: true,
        btnProps: {
          onClick: submitMould,
        },
        child: text => (
          <Button onClick={submitMould} color="primary">
            {text || intl.get(`hzero.common.button.submit`).d('提交')}
          </Button>
        ),
      });
    }
    footerButtons.push({
      name: 'operation',
      noNest: true,
      btnType: 'c7n-pro',
      btnProps: { onClick: openOperatorRecord },
      child: text => (
        <Button onClick={openOperatorRecord}>
          {text || intl.get(`siec.mould.model.common.operatorRecord`).d('操作记录')}
        </Button>
      ),
    });
    footerButtons.push({
      name: 'close',
      noNest: true,
      btnType: 'c7n-pro',
      btnProps: {
        onClick: () => {
          modal.close();
        },
      },
      child: text => (
        <Button
          onClick={() => {
            modal.close();
          }}
        >
          {text || intl.get('hzero.common.button.close').d('关闭')}
        </Button>
      ),
    });
    return footerButtons;
  };

  useEffect(() => {
    if (maHeaderId) {
      setLoading(true);
      formDs
        .query()
        .then(res => {
          if (res && !res.failed) {
            const { maLineList, mouldAccountLineExpandList, maStatus, maType = '' } = res;
            setType(modalType || maType.toLowerCase());
            const currentType = modalType || maType.toLowerCase();
            if (currentType !== 'normal') {
              const fields = maChangeFormDs.getField('reason');
              const lebelMeaning = {
                maintain: intl.get(`siec.mould.common.maintainReason`).d('维修原因'),
                scrap: intl.get(`siec.mould.common.scrapReason`).d('报废原因'),
                modify: intl.get(`siec.mould.common.modifyReason`).d('变更原因'),
                transfer: intl.get(`siec.mould.common.transferReason`).d('转移原因'),
              };
              fields.set('label', lebelMeaning[type || maType.toLowerCase()]);
              if (
                (type === 'MODIFY' || type === 'modify' || res.maType === 'MODIFY') &&
                maStatus.includes('APPROVING')
              ) {
                changeFormDs.query();
              } else if ((type === 'MODIFY' || type === 'modify') && maStatus !== 'APPROVING_CH') {
                changeTableDs.loadData([]);
                maExpandLineDs.loadData([]);
                (maLineList || []).forEach(record => {
                  changeTableDs.create(record);
                });
                (mouldAccountLineExpandList || []).forEach(record => {
                  maExpandLineDs.create(record);
                });
              } else {
                maChangeFormDs.query();
              }
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [maHeaderId]);

  useEffect(() => {
    fetchPermissions([
      isSupplier
        ? 'srm.pcn-admin.mould-manager.mould-accounts.ps.maexpend_content'
        : 'srm.pcn-admin.mould-manager.mould-accounts-purchaser.ps.maexpend_content',
    ]).then(res => {
      if (getResponse(res) && isArray(res)) {
        setShowContent(res[0]?.approve);
      }
    });
  }, []);

  return (
    <Fragment>
      <Spin spinning={loading}>
        {pubPathFlag ? (
          <Header>
            {maHeaderId && (
              <Button onClick={() => openOperatorRecord()}>
                {intl.get(`hzero.common.button.operation`).d('操作记录')}
              </Button>
            )}
          </Header>
        ) : null}
        <div className={classnames(styles['rfx-detail-list-card'])}>
          {type && type === 'modify' && (
            <>
              <Content className={`${styles['custom-page-content']} ${styles.modifyContent}`}>
                <h3 id="newAddSupplierCompany" className={styles['rfx-card-item-title']}>
                  {intl.get('siec.mould.model.common.mouldModifyContent').d('模具变更内容')}
                </h3>
                <div className={styles['rfx-card-item-form']}>
                  {customizeForm(
                    {
                      code: 'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.HEADER',
                      dataSet: changeFormDs,
                    },
                    <Form dataSet={changeFormDs} columns={3} labelLayout="float">
                      <Lov name="mouldPrincipalLov" disabled={!changeContentIsEdit} />
                      <TextField name="modelSpecs" disabled={!changeContentIsEdit} />
                      <Lov name="uomLov" disabled={!changeContentIsEdit} />
                      <NumberField name="shareQuality" disabled={!changeContentIsEdit} />
                      <NumberField name="mouldLife" disabled={!changeContentIsEdit} />
                      <NumberField name="mouldQuality" disabled={!changeContentIsEdit} />
                      <NumberField name="mouldValue" disabled={!changeContentIsEdit} />
                      <TextField name="moldingCycle" disabled={!changeContentIsEdit} />
                      <TextField name="machineTonnage" disabled={!changeContentIsEdit} />
                      <NumberField name="cavityQuality" disabled={!changeContentIsEdit} />
                      <Select name="mouldType" disabled={!changeContentIsEdit} />
                      <Select name="mouldOwner" disabled={!changeContentIsEdit} />
                      <DatePicker name="effectiveTimeFrom" disabled={!changeContentIsEdit} />
                      <DatePicker name="effectiveTimeTo" disabled={!changeContentIsEdit} />
                      <NumberField name="usedValue" disabled={!changeContentIsEdit} />
                      <NumberField name="remainValue" disabled={!changeContentIsEdit} />
                      <NumberField name="usedQuality" disabled={!changeContentIsEdit} />
                      <NumberField name="remainQuality" disabled={!changeContentIsEdit} />
                      <TextArea name="reason" disabled={!changeContentIsEdit} />
                      {/* <TextField name="createdByName" /> */}
                      {/* <DatePicker name="creationDate" /> */}
                    </Form>
                  )}
                </div>
              </Content>
            </>
          )}
          {/* 维修/报废/转移的表单 */}
          {type && !['normal', 'modify'].includes(type) && (
            <Content
              className={`${styles['custom-page-content']} ${
                type && type === 'modify' ? styles.modifyReason : ''
              }`}
            >
              <div className={styles['rfx-card-item-form']}>
                <ChangeForm
                  maChangeFormDs={maChangeFormDs}
                  type={type}
                  disabled={!changeContentIsEdit}
                />
              </div>
            </Content>
          )}
          {type && type === 'modify' && (
            <>
              <ChangeTable
                dataSet={changeTableDs}
                disabled={changeContentIsEdit}
                customizeTable={customizeTable}
              />
              <ChangeExpandTable
                dataSet={maExpandLineDs}
                disabled={changeContentIsEdit}
                customizeTable={customizeTable}
                isSupplier={isSupplier}
              />
            </>
          )}
          <Content
            className={`${styles['custom-page-content']} ${
              type && type !== 'normal' ? styles.mouldBaseInfoContent : ''
            }`}
          >
            <h3 id="newAddSupplierCompany" className={styles['rfx-card-item-title']}>
              {intl.get('siec.mould.model.common.mouldBaseInfo').d('模具基础信息')}
            </h3>
            <div className={styles['rfx-card-item-form']}>
              {customizeForm(
                { code: 'SIEC.MOULD_PLATFORM.APPROVE.HEADER', dataSet: formDs },
                <Form
                  dataSet={formDs}
                  columns={3}
                  labelLayout="vertical"
                  labelAlign="left"
                  className={`c7n-pro-vertical-form-display ${styles.readOnlyForm}`}
                >
                  <Output name="maNum" />
                  <Output name="companyLov" />
                  <Output name="mouldPrincipalLov" />
                  <Output name="supplierLov" />
                  <Output name="mouldLov" />
                  <Output name="mouldName" />
                  <Output name="modelSpecs" />
                  <Output name="uomLov" />
                  <Output name="shareQuality" />
                  <Output name="mouldLife" />
                  <Output name="mouldQuality" />
                  <Output name="mouldValue" />
                  <Output name="moldingCycle" />
                  <Output name="machineTonnage" />
                  <Output name="cavityQuality" />
                  <Output name="mouldType" />
                  <Output name="mouldOwner" />
                  <Output name="effectiveTimeFrom" />
                  <Output name="effectiveTimeTo" />
                  <Output name="usedValue" />
                  <Output name="remainValue" />
                  <Output name="usedQuality" />
                  <Output name="remainQuality" />
                  <Output name="createdByName" />
                  <Output name="creationDate" />
                </Form>
              )}
            </div>
          </Content>
          <Content className={`${styles['custom-page-content']} ${styles.mouldBaseInfoContent}`}>
            <h3 id="purchaseOrgInfo" className={styles['rfx-card-item-title']}>
              {intl.get('siec.mould.common.relateItemInfo').d('关联物料信息')}
            </h3>
            {customizeTable(
              { code: 'SIEC.MOULD_PLATFORM.DETAIL.LIST', dataSet: tableDS },
              <Table dataSet={tableDS} columns={columns} />
            )}
          </Content>
          {showContent && (
            <Content className={`${styles['custom-page-content']} ${styles.mouldBaseInfoContent}`}>
              <h3 id="purchaseOrgInfo" className={styles['rfx-card-item-title']}>
                {intl.get('siec.mould.common.expandLine').d('关联子模具信息')}
              </h3>
              {customizeTable(
                {
                  code: 'SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
                  dataSet: maExpandDs,
                },
                <Table dataSet={maExpandDs} columns={maExpandCol} />
              )}
            </Content>
          )}
          {type && type === 'modify' ? (
            <>
              <Content
                className={`${styles['custom-page-content']} ${styles.mouldBaseInfoContent}`}
              >
                <h3 id="attachment" className={styles['rfx-card-item-title']}>
                  {intl.get('siec.mould.model.common.attachment').d('附件')}
                </h3>
                <AttachmentInfo
                  customizeForm={customizeForm}
                  attachmentUuid={changeFormDs?.current?.get('attachmentUuid')}
                  formDs={changeFormDs}
                  ready
                  code="SIEC.MOULD_PLATFORM.APPROVE.ATTACHMENTINFO"
                />
              </Content>
            </>
          ) : (
            <Content className={`${styles['custom-page-content']} ${styles.mouldBaseInfoContent}`}>
              <h3 id="attachment" className={styles['rfx-card-item-title']}>
                {intl.get('siec.mould.model.common.attachment').d('附件')}
              </h3>
              <AttachmentInfo
                customizeForm={customizeForm}
                attachmentUuid={formDs?.current?.get('attachmentUuid')}
                formDs={formDs}
                ready
                code={
                  type === 'normal'
                    ? 'SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO'
                    : 'SIEC.MOULD_PLATFORM.APPROVE.ATTACHMENTINFO'
                }
              />
            </Content>
          )}
        </div>
        {!pubPathFlag && (
          <div className={`${styles['mould-footer-btn']}`}>
            {type === 'modify' ? (
              customizeBtnGroup(
                {
                  code: 'SIEC.MOULD_PLATFORM.APPROVE.CHANGE_BTN',
                  pro: true,
                },
                <DynamicButtons buttons={FooterBtn()} />
              )
            ) : (
              <DynamicButtons buttons={FooterBtn()} />
            )}
          </div>
        )}
      </Spin>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sprm.common', 'siec.mould'],
  }),
  WithCustomizeC7N({
    unitCode: [
      'SIEC.MOULD_PLATFORM.APPROVE.HEADER',
      'SIEC.MOULD_PLATFORM.DETAIL.LIST',
      'SIEC.MOULD_PLATFORM.APPROVE.CHANGE',
      'SIEC.MOULD_PLATFORM.DETAIL.EXPAND_LINE',
      'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.HEADER',
      'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE',
      'SIEC.MOULD_PLATFORM.APPROVE.MODIFY.LINE_EXPAND',
      'SIEC.MOULD_PLATFORM.APPROVE.CHANGE_BTN',
      'SIEC.MOULD_PLATFORM.APPROVE.ATTACHMENTINFO',
      'SIEC.MOULD_PLATFORM.DETAIL.ATTACHMENTINFO',
    ],
  })
)(Index);
// export default Index;
