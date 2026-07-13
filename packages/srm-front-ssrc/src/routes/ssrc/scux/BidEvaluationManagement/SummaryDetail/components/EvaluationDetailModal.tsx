import React from 'react';
import { Table, Button, Modal, DataSet, Output, Form } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { isUndefined, isNil } from 'lodash';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { Popover } from 'choerodon-ui';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { confirmAndSummaryPageData } from '../../api';
import Style from '../index.less';

// 定义数据项接口类型，修复 TS 类型推断问题
interface EvaluationScoreItem {
  sumPassStatus?: string;
  sumPassStatusMeaning?: string;
  approvedCount?: number | string;
  allExpertCount?: number | string;
  supplierScoreTitle?: string;
  sumIndicScore?: any;
  indicScore?: any;
  detailEnabledFlag?: boolean;
  evaluateScoreLineDetailS?: any[];
  teamWeight?: any;
  indicateName?: string;
  btnName?: any;
  [key: string]: any;
}

// 此组件在拟中标页面也有使用
const EvaluationDetailModal = (props) => {
  const { record: outsideRecord, btnName } = props;

  if (!outsideRecord) return null;

  const quotationHeaderId = outsideRecord.get('quotationHeaderId');

  // 评标明细表单数据集
  const evaluationFormDataSet = (): DataSetProps => {
    return {
      autoQuery: false,
      paging: false,
      fields: [
        {
          name: 'supplierCompanyName',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.supplierName`).d('供应商名称'),
        },
        {
          name: 'rfxTitle',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.rfxTitle`).d('项目名称'),
        },
      ],
    };
  };

  // 评标明细数据集
  const evaluationDetailDataSet = (): DataSetProps => {
    return {
      autoQuery: false,
      paging: false,
      selection: false,
      fields: [
        {
          name: 'indicateName',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.indicateName`).d('要素名称'),
          type: FieldType.string,
        },
        {
          name: 'indicateRemark',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.indicateRemark`).d('评标细则'),
        },
        {
          name: 'team',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.scoreGroup`).d('组别'),
          lookupCode: 'SCUX.TWNF_BID_EVA_GROUP',
        },
        {
          name: 'teamWeight',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.teamWeight`).d('组别权重'),
        },
        {
          name: 'scoreRange',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.`).d('评分区间'),
        },
        {
          name: 'supplierScore',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.supplierScore`).d('供应商分数'),
        },
        {
          name: 'indicWeight',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.indicWeight`).d('指标权重'),
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
  const expertDetailDataSet = (): DataSetProps => {
    return {
      autoQuery: false,
      paging: false,
      selection: false,
      fields: [
        {
          name: 'expertName',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.expertName`).d('专家'),
          type: FieldType.string,
        },
        {
          name: 'evaluateLeaderFlag',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.evaluateLeaderFlag`).d('专家职责'),
          lookupCode: 'SSRC.EXPERT_DUTY',
        },
        {
          name: 'indicScore',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.indicScoreResult`).d('评标结果'),
        },
        {
          name: 'passStatus',
          label: intl.get(`scux.bidEvaluationManagement.model.twnf.summary.indicScoreResult`).d('评标结果'),
          lookupCode: 'SSRC.APPROVED_STATUS',
        },
      ],
    };
  };

  // 专家评标明细
  const getExpertColumns = (evaluationRecord): ColumnProps[] => {
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
    const { evaluateIndicId, indicateType, indicateId } = evaluationRecord.get(['evaluateIndicId', 'indicateType', 'indicateId']);
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
    };
    Modal.open({
      title: intl.get(`scux.bidEvaluationManagement.view.title.exportEvaluationDetail`).d('专家评标明细'),
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
            <Form dataSet={expertFormDs} columns={3} labelLayout={LabelLayout.float}>
              <Output name="indicateName" />
              <Output name="indicateRemark" />
              <Output name="indicateType" />
              {indicateType === 'SCORE' && (
                <Output
                  name="scoreRange"
                  renderer={({ record: expertFormRecord }) => {
                    const { minScore, maxScore } = expertFormRecord?.get(['minScore', 'maxScore']) || {};
                    return `[${minScore},${maxScore}]`;
                  }}
                />
              )}
            </Form>
          </div>
          <Table
            dataSet={expertDs}
            columns={getExpertColumns(evaluationRecord)}
          />
        </>
      ),
    });
  };

  // 处理评分数据源
  const renderDataSource = (dataSource: EvaluationScoreItem[] = []) => {
    const arrayItem: any[] = [];
    let totalDataSource: any = {};
    const supplierDataSource = dataSource.map((item: EvaluationScoreItem = {} as any) => {
      const { detailEnabledFlag, evaluateScoreLineDetailS = [], ...otherItem } = item || {};
      const totalContent =
        item.sumPassStatus === 'ALL_PASS'
          ? item.sumPassStatusMeaning || ''
          : item.sumPassStatusMeaning
          ? `${item.sumPassStatusMeaning}${item.approvedCount}/${item.allExpertCount}`
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
  const getEvaluationColumns = (): ColumnProps[] => {
    return [
      {
        name: 'indicateName',
        onCell: ({ record }) => renderCell(record, 'indicateName'),
        renderer: ({ value, record }) => {
          return !isUndefined(record?.get('indicateNameFlag')) && record?.get('indicateNameFlag') ? (
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
          return !isUndefined(record?.get('indicateNameFlag')) && !record?.get('indicateNameFlag')
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
          const { indicateType, minScore, maxScore } = evaluationRecord?.get(['indicateType', 'minScore', 'maxScore']) || {};
          return indicateType === 'SCORE' ? `[${minScore},${maxScore}]` : '';
        },
      },
      {
        name: 'supplierScore',
        className: Style['scux-twnf-indicate-table-cell'],
        onCell: ({ record }) => renderCell(record, 'supplierScore'),
        renderer: ({ record: evaluationRecord }) => {
          if (!evaluationRecord) return null;
          return isUndefined(evaluationRecord?.get('indicateNameFlag')) && !evaluationRecord?.get('indicateNameFlag') ? (
            <Button
              funcType={FuncType.link}
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
      quotationHeaderId
    });
    if (getResponse(res)) {
      const { scoreList, ...others } = res;
      evaluationFormDs.loadData([others]);
      evaluationDetailDs.loadData(scoreList ? renderDataSource(scoreList || []) : []);
    };
    Modal.open({
      title: intl.get(`scux.bidEvaluationManagement.view.title.viewEvaluationDetail`).d('评标明细查看'),
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
            <Form dataSet={evaluationFormDs} columns={2} labelLayout={LabelLayout.float}>
              <Output name="supplierCompanyName" />
              <Output name="rfxTitle" />
            </Form>
          </div>
          <Table
            dataSet={evaluationDetailDs}
            columns={getEvaluationColumns()}
          />
        </>
      ),
    });
  };

  return (
    <Button
      funcType={FuncType.link}
      wait={1200}
      onClick={openEvaluationDetail}
    >
      {!isNil(btnName) ? btnName : intl.get(`scux.bidEvaluationManagement.model.twnf.summary.evaluationDetail`).d('评标明细')}
    </Button>
  )
};

export default EvaluationDetailModal;