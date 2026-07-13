import React from 'react';
import { Table, Button, Modal, DataSet, Output, Form } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { confirmAndSummaryPageData } from './api';

const EvaluationDetailModal = (props) => {
  const { record: outsideRecord } = props;

  if (!outsideRecord) return null;

  const quotationHeaderId = outsideRecord.get('quotationHeaderId');

  // 评标明细表单数据集
  const evaluationFormDataSet = () => {
    return {
      autoQuery: false,
      paging: false,
      fields: [
        {
          name: 'supplierCompanyName',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.supplierName`)
            .d('供应商名称'),
        },
        {
          name: 'rfxTitle',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.rfxTitle`).d('项目名称'),
        },
      ],
    };
  };

  // 评标明细数据集
  const evaluationDetailDataSet = () => {
    return {
      autoQuery: false,
      paging: false,
      selection: false,
      fields: [
        {
          name: 'indicateName',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.indicateName`)
            .d('要素名称'),
          type: 'string',
        },
        {
          name: 'indicateRemark',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.indicateRemark`)
            .d('评标细则'),
        },
        {
          name: 'attributeVarchar2',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.scoreGroup`).d('组别'),
        },
        {
          name: 'teamWeight',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.teamWeight`)
            .d('组别权重'),
        },
        {
          name: 'scoreRange',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.`).d('评分区间'),
        },
        {
          name: 'quoSum',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.supplierScore`)
            .d('供应商分数'),
        },
        {
          name: 'indicWeight',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.indicWeight`)
            .d('要素权重'),
        },
        {
          name: 'indicateType',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.indicateType`).d('类型'),
          lookupCode: 'SSRC.INDICATE_TYPE',
        },
      ],
    };
  };

  // 专家评标明细数据集
  const expertDetailDataSet = () => {
    return {
      autoQuery: false,
      paging: false,
      selection: false,
      fields: [
        {
          name: 'expertName',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.expertName`).d('专家'),
        },
        {
          name: 'evaluateLeaderFlag',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.evaluateLeaderFlag`)
            .d('专家职责'),
          lookupCode: 'SSRC.EXPERT_DUTY',
        },
        {
          name: 'indicScore',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.indicScoreResult`)
            .d('评标结果'),
        },
        {
          name: 'passStatus',
          label: intl
            .get(`scux.bidEvaluationManagement.model.twnf.summary.indicScoreResult`)
            .d('评标结果'),
          lookupCode: 'SSRC.APPROVED_STATUS',
        },
      ],
    };
  };

  // 专家评标明细
  const getExpertColumns = (evaluationRecord) => {
    const { indicateType } = evaluationRecord?.get(['indicateType']) || {};

    return [
      {
        name: 'expertName',
      },
      {
        name: 'evaluateLeaderFlag',
      },
      {
        name: 'indicScore',
        hidden: indicateType !== 'SCORE',
      },
      {
        name: 'passStatus',
        hidden: indicateType === 'SCORE',
      },
    ];
  };

  // 专家评标明细
  const openExpertDetail = async (evaluationRecord) => {
    const { evaluateIndicId, indicateType } = evaluationRecord.get([
      'evaluateIndicId',
      'indicateType',
    ]);
    const expertFormDs = new DataSet(evaluationDetailDataSet());
    const expertDs = new DataSet(expertDetailDataSet());
    const res = await confirmAndSummaryPageData({
      postType: 'SCORE',
      quotationHeaderId,
      evaluateIndicId, // TODO:跟后端确认，到底如果没有明细就传evaluateIndicId，如果有明细就传indicId啥意思。
    });
    if (getResponse(res)) {
      const { scoreList, ...others } = res;
      expertFormDs.loadData([others]);
      expertDs.loadData(scoreList || []);
    }
    Modal.open({
      title: intl
        .get(`scux.bidEvaluationManagement.view.title.exportEvaluationDetail`)
        .d('专家评标明细'),
      destroyOnClose: true,
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      style: {
        width: 800,
      },
      children: (
        <>
          <div style={{ marginBottom: '24px' }}>
            <Form dataSet={expertFormDs} columns={3} labelLayout="float">
              <Output name="indicateName" />
              <Output name="indicateRemark" />
              <Output name="indicateType" />
              {indicateType === 'SCORE' && (
                <Output
                  name="scoreRange"
                  renderer={({ record: expertFormRecord }) => {
                    const { minScore, maxScore } =
                      expertFormRecord?.get(['minScore', 'maxScore']) || {};
                    return `[${minScore},${maxScore}]`;
                  }}
                />
              )}
            </Form>
          </div>
          <Table dataSet={expertDs} columns={getExpertColumns(evaluationRecord)} />
        </>
      ),
    });
  };

  // 评标明细列
  const getEvaluationColumns = () => {
    return [
      {
        name: 'indicateName',
      },
      {
        name: 'indicateRemark',
      },
      {
        name: 'attributeVarchar2',
      },
      {
        name: 'teamWeight',
      },
      {
        name: 'scoreRange',
        renderer: ({ record: evaluationRecord }) => {
          const { indicateType, minScore, maxScore } =
            evaluationRecord?.get(['indicateType', 'minScore', 'maxScore']) || {};
          return indicateType === 'SCORE' ? `[${minScore},${maxScore}]` : '';
        },
      },
      {
        name: 'quoSum',
        renderer: ({ record: evaluationRecord, value }) => {
          return value ? (
            <Button funcType="link" wait={1200} onClick={() => openExpertDetail(evaluationRecord)}>
              {value}
            </Button>
          ) : null;
        },
      },
      {
        name: 'indicWeight',
      },
    ];
  };

  // 评标明细弹框
  const openEvaluationDetail = async () => {
    const evaluationFormDs = new DataSet(evaluationFormDataSet());
    const evaluationDetailDs = new DataSet(evaluationDetailDataSet());
    const res = await confirmAndSummaryPageData({
      postType: 'DETAIL',
      quotationHeaderId,
    });
    if (getResponse(res)) {
      const { scoreList, ...others } = res;
      evaluationFormDs.loadData([others]);
      evaluationDetailDs.loadData(scoreList || []);
    }
    Modal.open({
      title: intl
        .get(`scux.bidEvaluationManagement.view.title.viewEvaluationDetail`)
        .d('评标明细查看'),
      destroyOnClose: true,
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      style: {
        width: 900,
      },
      children: (
        <>
          <div style={{ marginBottom: '24px' }}>
            <Form dataSet={evaluationFormDs} columns={2} labelLayout="float">
              <Output name="supplierCompanyName" />
              <Output name="rfxTitle" />
            </Form>
          </div>
          <Table dataSet={evaluationDetailDs} columns={getEvaluationColumns()} />
        </>
      ),
    });
  };

  return (
    <Button funcType="link" wait={1200} onClick={openEvaluationDetail}>
      {intl.get(`scux.bidEvaluationManagement.model.twnf.summary.evaluationDetail`).d('评标明细')}
    </Button>
  );
};

export default EvaluationDetailModal;
