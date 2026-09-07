import React from 'react';
import { Table, Button, Modal, DataSet, Output, Form } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { isUndefined, isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import { confirmAndSummaryPageData } from './api';
import Style from './index.less';

// 通威二开 - 评标明细弹框：与评标管理-评标明细弹框保持一致，
// 含 综评结果(翻译)/评分附件/综评意见 三个字段，接口仍为原 DETAIL/SCORE。
const EvaluationDetailModal = (props) => {
  const { record: outsideRecord, btnName } = props;

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
            .get('scux.bidEvaluationManagement.model.twnf.summary.supplierName')
            .d('供应商名称'),
        },
        {
          name: 'rfxTitle',
          label: intl.get('scux.bidEvaluationManagement.model.twnf.summary.rfxTitle').d('项目名称'),
        },
        // 综评结果取 summaryInvalidFlag，返回数字需按 SSRC.SCORE.INVALID_FLAG 翻译
        {
          name: 'summaryInvalidFlag',
          label: intl.get('scux.bidEvaluationManagement.model.twnf.techSummaryResult').d('综评结果'),
          type: 'string',
          lookupCode: 'SSRC.SCORE.INVALID_FLAG',
        },
        // 评分附件取 summaryAttributeLongtext1
        {
          name: 'summaryAttributeLongtext1',
          label: intl.get('scux.bidEvaluationManagement.model.twnf.scoreAttachmentUuid').d('评分附件'),
          type: 'attachment',
          bucketName: PRIVATE_BUCKET,
          bucketDirectory: 'ssrc-expert-header',
        },
        // 综评意见取 summaryInvalidReason
        {
          name: 'summaryInvalidReason',
          label: intl.get('scux.bidEvaluationManagement.model.twnf.techSummarySuggestion').d('综评意见'),
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
            .get('scux.bidEvaluationManagement.model.twnf.summary.indicateName')
            .d('要素名称'),
          type: 'string',
        },
        {
          name: 'indicateRemark',
          label: intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.indicateRemark')
            .d('评标细则'),
        },
        {
          name: 'team',
          label: intl.get('scux.bidEvaluationManagement.model.twnf.summary.scoreGroup').d('组别'),
          lookupCode: 'SCUX.TWNF_BID_EVA_GROUP',
        },
        {
          name: 'teamWeight',
          label: intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.teamWeight')
            .d('组别权重'),
        },
        {
          name: 'scoreRange',
          label: intl.get('scux.bidEvaluationManagement.model.twnf.summary.').d('评分区间'),
        },
        {
          name: 'supplierScore',
          label: intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.supplierScore')
            .d('供应商分数'),
        },
        {
          name: 'indicWeight',
          label: intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.indicWeight')
            .d('指标权重'),
        },
        {
          name: 'indicateType',
          label: intl.get('scux.bidEvaluationManagement.model.twnf.summary.indicateType').d('类型'),
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
          label: intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.expertName')
            .d('专家'),
          type: 'string',
        },
        {
          name: 'evaluateLeaderFlag',
          label: intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.evaluateLeaderFlag')
            .d('专家职责'),
          lookupCode: 'SSRC.EXPERT_DUTY',
        },
        {
          name: 'indicScore',
          label: intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.indicScoreResult')
            .d('评标结果'),
        },
        {
          name: 'passStatus',
          label: intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.indicScoreResult')
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
    const { evaluateIndicId, indicateType, indicateId } = evaluationRecord.get([
      'evaluateIndicId',
      'indicateType',
      'indicateId',
    ]);
    const expertFormDs = new DataSet(evaluationDetailDataSet());
    const expertDs = new DataSet(expertDetailDataSet());
    const params = evaluateIndicId ? { evaluateIndicId } : { indicateId };
    const res = await confirmAndSummaryPageData({
      postType: 'SCORE',
      quotationHeaderId,
      ...params,
    });
    if (getResponse(res)) {
      const { scoreList, ...others } = res;
      expertFormDs.loadData([others]);
      expertDs.loadData(scoreList || []);
    }
    Modal.open({
      title: intl
        .get('scux.bidEvaluationManagement.view.title.exportEvaluationDetail')
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

  // 处理评分数据源
  const renderDataSource = (dataSource = []) => {
    const arrayItem = [];
    let totalDataSource = {};
    const supplierDataSource = dataSource.map((item) => {
      const { detailEnabledFlag, evaluateScoreLineDetailS = [], ...otherItem } = item || {};
      const hasCount =
        item.approvedCount !== undefined &&
        item.approvedCount !== null &&
        item.allExpertCount !== undefined &&
        item.allExpertCount !== null;
      const totalContent =
        item.sumPassStatus === 'ALL_PASS'
          ? item.sumPassStatusMeaning || ''
          : item.sumPassStatusMeaning
          ? hasCount
            ? `${item.sumPassStatusMeaning}${item.approvedCount}/${item.allExpertCount}`
            : item.sumPassStatusMeaning
          : '';
      totalDataSource = {
        ...totalDataSource,
        indicateNameFlag: 1,
        isEditing: false,
        redFlag: item.sumPassStatus === 'UN_PASS',
        supplierScore: item.supplierScoreTitle === 'PASS' ? totalContent : item.sumIndicScore,
        indicScore: item.supplierScoreTitle === 'PASS' ? totalContent : item.sumIndicScore,
        indicateName: intl.get('ssrc.inquiryHall.model.inquiryHall.summaryScore').d('汇总'),
      };
      if (Number(detailEnabledFlag)) {
        let subtotalDataSource = {};
        const elementItem = evaluateScoreLineDetailS.map((element) => {
          let elementDetail = {};
          elementDetail = { ...element, isEditing: false };
          subtotalDataSource = {
            ...subtotalDataSource,
            indicateNameFlag: 1,
            isEditing: false,
            supplierScore: item.indicScore,
            indicScore: item.indicScore,
            indicateName: intl.get('ssrc.expertScoring.view.message.subtotal').d('小计'),
          };
          return elementDetail;
        });
        elementItem.unshift({
          ...otherItem,
          isEditing: true,
          indicateNameFlag: 0,
          teamWeight: otherItem.teamWeight,
          indicateName: otherItem.indicateName,
        });
        elementItem.push(subtotalDataSource);
        return elementItem;
      } else {
        return { ...item, isEditing: true };
      }
    });
    supplierDataSource.forEach((item) => {
      if (Array.isArray(item)) {
        arrayItem.push(...item);
      } else {
        arrayItem.push(item);
      }
    });
    arrayItem.push(totalDataSource);
    return arrayItem;
  };

  const renderCell = (record, name) => {
    if (!isUndefined(record.get('indicateNameFlag'))) {
      if (record.get('indicateNameFlag')) {
        return {
          colSpan: name === 'indicateName' ? 2 : 1,
          hidden: name === 'indicateRemark',
        };
      } else {
        return {
          colSpan: name === 'indicateName' ? 4 : 1,
          hidden: name !== 'indicateName',
        };
      }
    }
    return {
      colSpan: 1,
      hidden: false,
    };
  };

  // 评标明细列
  const getEvaluationColumns = () => {
    return [
      {
        name: 'indicateName',
        onCell: ({ record }) => renderCell(record, 'indicateName'),
        renderer: ({ value, record }) => {
          return !isUndefined(record?.get('indicateNameFlag')) &&
            record?.get('indicateNameFlag') ? (
              <span style={{ fontWeight: 'bold' }}>{value}</span>
          ) : (
            <span>
              {
                <Popover placement="topLeft" content={value}>
                  {value}
                </Popover>
              }
            </span>
          );
        },
      },
      {
        name: 'indicateRemark',
        onCell: ({ record }) => renderCell(record, 'indicateRemark'),
        renderer: ({ value, record }) => {
          return !isUndefined(record?.get('indicateNameFlag')) &&
            !record?.get('indicateNameFlag')
            ? ''
            : value;
        },
      },
      {
        name: 'team',
        onCell: ({ record }) => renderCell(record, 'team'),
      },
      {
        name: 'teamWeight',
        renderer: ({ value }) => (value ? `${value}%` : null),
      },
      {
        name: 'scoreRange',
        onCell: ({ record }) => renderCell(record, 'scoreRange'),
        renderer: ({ record: evaluationRecord }) => {
          const { indicateType, minScore, maxScore } =
            evaluationRecord?.get(['indicateType', 'minScore', 'maxScore']) || {};
          return indicateType === 'SCORE' ? `[${minScore},${maxScore}]` : '';
        },
      },
      {
        name: 'supplierScore',
        className: Style['scux-twnf-indicate-table-cell'],
        onCell: ({ record }) => renderCell(record, 'supplierScore'),
        renderer: ({ record: evaluationRecord }) => {
          if (!evaluationRecord) return null;
          return isUndefined(evaluationRecord?.get('indicateNameFlag')) &&
            !evaluationRecord?.get('indicateNameFlag') ? (
              <Button
                funcType="link"
                wait={1200}
                onClick={() => openExpertDetail(evaluationRecord)}
              >
                {evaluationRecord.get('quoSum')}
              </Button>
          ) : (
            <span
              style={{
                fontWeight: 'bold',
                marginLeft: 8,
                color: Number(evaluationRecord.get('redFlag')) ? 'red' : '',
              }}
            >
              {evaluationRecord.get('supplierScore')}
            </span>
          );
        },
      },
      {
        name: 'indicWeight',
        renderer: ({ value }) => (value ? `${value}%` : null),
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
      evaluationDetailDs.loadData(scoreList ? renderDataSource(scoreList || []) : []);
      // 综评字段若接口明细未返回，则回退取供应商行数据兜底
      const formRecord = evaluationFormDs.current;
      if (formRecord && outsideRecord) {
        ['summaryInvalidFlag', 'summaryAttributeLongtext1', 'summaryInvalidReason'].forEach(
          (fieldName) => {
            if (isNil(formRecord.get(fieldName)) && !isNil(outsideRecord.get(fieldName))) {
              formRecord.set(fieldName, outsideRecord.get(fieldName));
            }
          }
        );
      }
    }
    Modal.open({
      title: intl
        .get('scux.bidEvaluationManagement.view.title.viewEvaluationDetail')
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
              <Output name="summaryInvalidFlag" />
              <Output name="summaryAttributeLongtext1" />
              <Output name="summaryInvalidReason" colSpan={2} />
            </Form>
          </div>
          <Table dataSet={evaluationDetailDs} columns={getEvaluationColumns()} />
        </>
      ),
    });
  };

  return (
    <Button funcType="link" wait={1200} onClick={openEvaluationDetail}>
      {!isNil(btnName)
        ? btnName
        : intl
            .get('scux.bidEvaluationManagement.model.twnf.summary.evaluationDetail')
            .d('评标明细')}
    </Button>
  );
};

export default EvaluationDetailModal;
