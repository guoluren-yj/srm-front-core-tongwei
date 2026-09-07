import React from 'react';
import { Table, Button, Modal, DataSet } from 'choerodon-ui/pro';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isNil } from 'lodash';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { useStore } from '../store/StoreProvider';

// 复用 Detail 模块「评标明细」查看功能（对应路由 evaluation/view/:evaluateScoreId）
import EvaluationDetailStoreProvider from '../../Detail/store/StoreProvider';
import EvaluationScoreInfo from '../../Detail/components/ScoreInfo';

// 组别专家评分明细 marmot 接口标识
const TEAM_SCORE_API =
  'rmUqg9ywibfy5EQkyBniaKbibtNkPnR2AvDJK96Vhl0QvET7q1UnCwxgjQ1bn7Qt4In';

interface TeamScoreDetailProps {
  record: any;
  /** 组别：技术组 TECHNOLOGY / 商务组 BUSINESS / 价格组 PRICE */
  scoreTeam: string;
  /** 组别名称（用于列值缺失时的兜底展示） */
  teamName: string;
  value: any;
}

// 技术组/商务组/价格组专家评分详情，点击列值后右侧弹框展示
const TeamScoreDetail: React.FC<TeamScoreDetailProps> = ({ record, scoreTeam, teamName, value }) => {
  const { rfxHeaderId, prefix } = useStore();

  // 组专家评分数据集
  const scoreDetailDataSet = (quotationHeaderId: any): DataSetProps => {
    return {
      autoQuery: false,
      paging: false,
      selection: false,
      fields: [
        {
          name: 'evaluateScoreId',
          label: intl.get(`${prefix}.model.twnf.teamScore.evaluateScoreId`).d('评标分数ID'),
        },
        {
          name: 'loginName',
          label: intl.get(`${prefix}.model.twnf.summary.loginName`).d('专家账户'),
          type: FieldType.string,
        },
        {
          name: 'realName',
          label: intl.get(`${prefix}.model.twnf.summary.expertName`).d('姓名'),
          type: FieldType.string,
        },
        {
          name: 'evaluationScore',
          label: intl.get(`${prefix}.model.twnf.teamScore.evaluationScore`).d('评标分数'),
          type: FieldType.string,
        },
        {
          name: 'suggestInvalidFlag',
          label: intl.get(`${prefix}.model.twnf.teamScore.suggestInvalidFlag`).d('评标结果'),
          type: FieldType.string,
          lookupCode: 'SSRC.SCORE.INVALID_FLAG',
        },
        {
          name: 'expertSuggestion',
          label: intl.get(`${prefix}.model.twnf.teamScore.expertSuggestion`).d('评标意见'),
          type: FieldType.string,
        },
      ],
      transport: {
        read: () => {
          return {
            method: 'GET',
            url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/${TEAM_SCORE_API}`,
            data: {
              quotationHeaderId,
              rfxHeaderId,
              scoreTeam,
            },
          };
        },
      },
    };
  };

  // 打开评标明细（对应路由 evaluation/view/:evaluateScoreId 的功能）
  const openEvaluationView = (scoreRecord: any) => {
    const evaluateScoreId = scoreRecord?.get('evaluateScoreId');
    if (isNil(evaluateScoreId)) {
      return;
    }
    // 当前供应商行的评标汇总单ID（有则透传，页面未强依赖）
    const evaluateSummaryId = record?.get('evaluateSummaryId');
    const expertName = scoreRecord?.get('realName') || scoreRecord?.get('loginName') || '';
    const supplierName = record?.get('supplierCompanyName') || '';
    Modal.open({
      title: `专家【${expertName}】对供应商【${supplierName}】的评标明细`,
      destroyOnClose: true,
      drawer: true,
      closable: true,
      okButton: false,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      style: {
        width: 1000,
      },
      children: (
        <EvaluationDetailStoreProvider
          match={{ params: { pageType: 'view', evaluateScoreId } }}
          location={{
            pathname: '',
            search: isNil(evaluateSummaryId)
              ? ''
              : `?evaluateSummaryId=${evaluateSummaryId}`,
          }}
        >
          <EvaluationScoreInfo />
        </EvaluationDetailStoreProvider>
      ),
    });
  };

  const columns: ColumnProps[] = [
    {
      name: 'loginName',
      width: 140,
    },
    {
      name: 'realName',
      width: 120,
    },
    {
      name: 'evaluationScore',
      width: 100,
      renderer: ({ record: scoreRecord, value: cellValue }) =>
        isNil(scoreRecord?.get('evaluateScoreId')) ? (
          isNil(cellValue) ? (
            <span>-</span>
          ) : (
            cellValue
          )
        ) : (
          <Button
            funcType={FuncType.link}
            wait={1200}
            onClick={() => openEvaluationView(scoreRecord)}
          >
            {isNil(cellValue) ? '-' : cellValue}
          </Button>
        ),
    },
    {
      name: 'suggestInvalidFlag',
      width: 100,
    },
    {
      name: 'expertSuggestion',
      minWidth: 220,
    },
  ];

  // 打开组别专家评分详情弹框
  const openScoreDetail = async () => {
    const quotationHeaderId = record?.get('quotationHeaderId');
    if (!record || !quotationHeaderId) {
      return;
    }
    const detailDs = new DataSet(scoreDetailDataSet(quotationHeaderId));
    const res = await detailDs.query();
    if (!res) {
      return;
    }
    Modal.open({
      title: `${teamName}${intl.get(`${prefix}.view.title.teamScoreDetail`).d('专家评分明细')}`,
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
          <Table
            dataSet={detailDs}
            columns={columns}
          />
        </>
      ),
    });
  };

  if (isNil(record) || isNil(record.get('quotationHeaderId'))) {
    return <span>-</span>;
  }

  return isNil(value) ? (
    <span>-</span>
  ) : (
    <Button
      funcType={FuncType.link}
      wait={1200}
      onClick={openScoreDetail}
    >
      {value}
    </Button>
  );
};

export default TeamScoreDetail;
