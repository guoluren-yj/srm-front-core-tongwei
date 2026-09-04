import React from 'react';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { Collapse, Alert } from 'choerodon-ui';

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

// 解析保存/提交与明细查询统一使用的 id：有 lastNomination* 时取 last，否则取当前 id
const resolveNominationId = (
  resultDs: DataSet,
  nominationHeaderId: any,
  nominationSupLineId: any
) => {
  const lastNominationHeaderId = resultDs?.current?.get('lastNominationHeaderId');
  const lastNominationSupLineId = resultDs?.current?.get('lastNominationSupLineId');
  return {
    nominationHeaderId:
      lastNominationHeaderId ||
      resultDs?.current?.get('nominationHeaderId') ||
      nominationHeaderId,
    nominationSupLineId:
      lastNominationSupLineId ||
      resultDs?.current?.get('nominationSupLineId') ||
      nominationSupLineId,
    // 存在上次提名时，明细行是从上次提名带过来的，保存/提交需去掉其 financeReviewLineId
    hasLastNomination: Boolean(lastNominationHeaderId && lastNominationSupLineId),
  };
};

const loadFinanceReviewData = async (nominationHeaderId: any, nominationSupLineId: any) => {
  const resultDs = new DataSet(financeReviewResultDS(nominationHeaderId, nominationSupLineId));
  await resultDs.query();

  // 若存在上次提名，则财务明细按上次提名的 id 取数
  const { nominationHeaderId: infoNominationHeaderId, nominationSupLineId: infoNominationSupLineId } =
    resolveNominationId(resultDs, nominationHeaderId, nominationSupLineId);
  const infoDs = new DataSet(financeReviewInfoDS(infoNominationHeaderId, infoNominationSupLineId));
  // 建立父子引用：financeReviewInfoDS 的 update 事件依赖 dataSet.parent 找到评审结果行，回写 financeAvgLiabilityRatio / financeAvgRevenueRatio
  infoDs.parent = resultDs;
  if (infoNominationHeaderId && infoNominationSupLineId) {
    await infoDs.query();
  }

  return { resultDs, infoDs };
};

export const openFinanceReviewModal = async (record: any, type?: string, dataSet?: any, basicInfoDs?: any) => {
  const nominationHeaderId = dataSet.getState('nominationHeaderId');
  const nominationSupLineId = record.get('nominationSupLineId');
  const { resultDs, infoDs } = await loadFinanceReviewData(nominationHeaderId, nominationSupLineId);

  // 判断是否存在上次提名：存在时评审信息明细由上次提名带入，保存/提交需特殊处理

  const { hasLastNomination } = resolveNominationId(resultDs, nominationHeaderId, nominationSupLineId);
  let modal;

  const nominationStatus = basicInfoDs.current?.get('nominationStatus');
  const isReadOnly = type === 'unreleasedReadOnly' || (nominationStatus !== 'PENDING_REVIEW' && nominationStatus !== 'TO_BE_RELEASED');

  const supplierName = record.get('supplierCompanyName') || '';
  const reviewTypeCode = basicInfoDs?.current?.get('reviewType') || '';
  const reviewTypeField = basicInfoDs?.getField('reviewType');
  const reviewTypeText = reviewTypeCode ? (reviewTypeField?.getText(reviewTypeCode) || reviewTypeCode) : '';
  const title = `财务入围评审${reviewTypeText ? ` - ${reviewTypeText}` : ''}${supplierName ? ` - ${supplierName}` : ''}`;

  const infoColumns = [
    { name: 'year', editor: !isReadOnly, width: 100 },
    { name: 'operatingRevenue', editor: !isReadOnly, width: 150 },
    { name: 'netProfit', editor: !isReadOnly, width: 150 },
    { name: 'totalAssets', editor: !isReadOnly, width: 150 },
    { name: 'netAssets', editor: !isReadOnly, width: 150 },
    { name: 'interestBearingDebt', editor: !isReadOnly, width: 150 },
    { name: 'totalLiabilities', editor: !isReadOnly, width: 150 },
    { name: 'assetLiabilityRatio', width: 130 },
    { name: 'roe', width: 130 },
  ];

  // 二开：删除财务评审行——无 financeReviewLineId（新增/未落库）的行走前端移除，不调删除接口；
  // 有 financeReviewLineId（已落库）的行调删除接口（FIN_LINE_DELETE），删除成功后重新查询评审结果头（FINANCE_REVIEW），由后端重算 financeAvgLiabilityRatio / financeAvgRevenueRatio
  const handleDeleteInfo = () => {
    const selectedRecords = infoDs.selected.slice();
    if (selectedRecords.length === 0) {
      notification.warning({
        message: intl.get('hzero.common.message.selectRecord').d('请先选择要删除的数据'),
      });
      return;
    }
    const localRecords = selectedRecords.filter((row: any) => !row.get('financeReviewLineId'));
    const serverRecords = selectedRecords.filter((row: any) => !!row.get('financeReviewLineId'));
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm').d('删除确认'),
      children: intl.get(`${prefix}.message.deleteFinanceLine`).d('确定删除选中的财务评审行吗？'),
      onOk: async () => {
        if (serverRecords.length > 0) {
          // delete() 第二个参数 false：避免重复弹删除确认框；内部调 FIN_LINE_DELETE 接口
          try {
            const res = await infoDs.delete(serverRecords, false);
            if (getResponse(res)) {
              // forceRemove 物理移除，避免行停留在删除标记（变灰）状态
              infoDs.remove(serverRecords, true);
              // 删除后重新查询评审结果头，由后端基于最新明细重算均值
              resultDs.query();
            } else {
              // 接口删除失败：重新查询，恢复被 delete 误标记的行
              infoDs.query();
              return;
            }
          } catch (e) {
            infoDs.query();
            return;
          }
        }
        if (localRecords.length > 0) {
          infoDs.remove(localRecords, true);
        }
      },
    });
  };

  const infoButtons = isReadOnly ? [] : [
    TableButtonType.add,
    <Button key="delete" onClick={handleDeleteInfo}>
      {intl.get('hzero.common.button.delete').d('删除')}
    </Button>,
    <Button key="save" color={ButtonColor.primary} onClick={() => handleSaveOrSubmit()}>
      {intl.get('hzero.common.button.save').d('保存')}
    </Button>,
  ];

  const resultFields = [
    { name: 'financeAvgLiabilityRatio', _type: 'NumberField', disabled: true },
    { name: 'financeAvgRevenueRatio', _type: 'NumberField', disabled: true },
    { name: 'empty', _type: 'empty' },
    { name: 'financeReviewResult', _type: 'Select' },
    { name: 'financeReviewDesc', _type: 'TextArea', colSpan: 3, newLine: true },
    // { name: 'financeSubmitUserName', _type: 'TextField', disabled: true },
    // { name: 'financeSubmitDate', _type: 'DateTimePicker', disabled: true },
  ];

  const handleSaveOrSubmit = async (submitFlag?:boolean) => {
    if (submitFlag) {
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
    }
    // 存在上次提名时，明细行由上次提名带入：去掉 financeReviewLineId，
    // 并将每行的 nominationHeaderId/nominationSupLineId 统一为财务入围评审结果所属的 id
    // 全新数据时 FINANCE_REVIEW 查询结果不带 nomination id，保存/提交用当前提名 id 兜底
    const resultNominationHeaderId =
      resultDs?.current?.get('nominationHeaderId') || nominationHeaderId;
    const resultNominationSupLineId =
      resultDs?.current?.get('nominationSupLineId') || nominationSupLineId;
    console.log(resultNominationHeaderId, resultNominationSupLineId);
    const financeReviewLineList = hasLastNomination
      ? infoDs.toData().map((line: any) => {
          const { financeReviewLineId, ...rest } = line;
          // 行本身没有 nominationHeaderId/nominationSupLineId 视为新建数据，不需要替换，保持为空
          if (!(line?.nominationHeaderId && line?.nominationSupLineId)) {
            return rest;
          }
          // 由上次提名带入的行，替换为财务入围评审结果所属的 id
          return {
            ...rest,
            ...(resultNominationHeaderId ? { nominationHeaderId: resultNominationHeaderId } : {}),
            ...(resultNominationSupLineId
              ? { nominationSupLineId: resultNominationSupLineId }
              : {}),
          };
        })
      : infoDs.toData();
    const res = await supplierEvaluationDetailPostApi({ financeReviewInfo: { ...resultDs.current?.toJSONData(), nominationHeaderId: resultNominationHeaderId, nominationSupLineId: resultNominationSupLineId, financeReviewLineList, children: null } }, submitFlag ? 'FIN_REVIEW_SUBMIT' : 'FIN_REVIEW_SAVE');
    if (getResponse(res)) {
      notification.success({});
      if(!submitFlag) {
        // 保存成功后，使用接口返回的 nominationHeaderId/nominationSupLineId 重新查询评审信息行
        // 优先使用接口返回的新 nomination id；拿不到时退回当前结果中的 id
        const savedNominationHeaderId = res?.nominationHeaderId || resultNominationHeaderId;
        const savedNominationSupLineId = res?.nominationSupLineId || resultNominationSupLineId;
        setTimeout(() => {
          if (savedNominationHeaderId) {
            infoDs.setQueryParameter('nominationHeaderId', savedNominationHeaderId);
          }
          if (savedNominationSupLineId) {
            infoDs.setQueryParameter('nominationSupLineId', savedNominationSupLineId);
          }
          infoDs.query();
          resultDs.query();
        }, 1000);
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
    closable: true,
    children: (
      <div className={styles['detail-container']}>
        <Collapse trigger="text-icon" ghost expandIconPosition="text-right" defaultActiveKey={['reviewInfo', 'reviewResult']}>
          <Panel header={intl.get(`${prefix}.view.panel.financeReviewInfo`).d('评审信息')} key="reviewInfo">
            <Alert
              type="info"
              showIcon
              message={intl.get(`${prefix}.tip.financeReviewInfo`).d('财务信息有且必须维护一行')}
              style={{ marginBottom: 8 }}
            />
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
      </div>
    ),
    destroyOnClose: true,
  });
};

const FinanceReviewModal: React.FC = () => {
  return null;
};

export default FinanceReviewModal;
