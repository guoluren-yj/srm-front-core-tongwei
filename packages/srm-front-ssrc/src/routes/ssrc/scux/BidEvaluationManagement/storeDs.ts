// import { DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';

import intl from "utils/intl";
import { getCurrentOrganizationId } from 'utils/utils';

import { timeFilerProcess } from '../utils/fun';

function getQueryFields({ queryType = '' } = {}) {
  return [
    {
      name: 'rfxNum',
      label: intl.get('scux.bidEvaluationManagement.model.twnf.bidNum').d('招标单号'),
      display: true,
    },
    {
      name: 'rfxTitle',
      label: intl.get('scux.bidEvaluationManagement.model.twnf.bidName').d('项目名称'),
      display: true,
    },
    {
      name: 'companyId',
      label: intl.get('scux.bidEvaluationManagement.model.twnf.companyName').d('创建公司'),
      type: FieldType.object,
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      display: true,
    },
    {
      name: 'scoreStatus',
      label: intl.get('scux.bidEvaluationManagement.model.twnf.evaluationStatus').d('状态'),
      display: true,
      dynamicProps: {
        lookupCode: () => {
          if (queryType === 'SCORING') {
            return 'SCUX.TWNF_BID_EXP_EVA_STATUS'; // 专家评分状态 - 待评标
          }
          return 'SCUX.TWNF_BID_EVA_STATUS'; // 评分单状态 - 历史评标和汇总显示
        },
      },
    },
    {
      name: 'createdByName',
      label: intl.get('scux.bidEvaluationManagement.model.twnf.createdByName').d('创建人'),
      display: true,
    },
    {
      name: 'creationDate_range',
      label: intl.get('scux.bidEvaluationManagement.model.twnf.creationDateScope').d('创建日期'),
      display: true,
      multiple: ',',
      type: FieldType.date,
      defaultValue: [moment().subtract(12, 'months').startOf('day'), moment().endOf('day')],
    },
  ];
}

const tableDataSet = ({ queryType }): DataSetProps => {
  return {
    primaryKey: 'evaluateScoreId',
    autoQuery: true,
    // selection: DataSetSelection.multiple,
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'scoreStatus',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.evaluationStatus').d('状态'),
        type: FieldType.string,
        dynamicProps: {
          lookupCode: () => {
            if (queryType === 'SCORING') {
              return 'SCUX.TWNF_BID_EXP_EVA_STATUS'; // 专家评分状态 - 待评标
            }
            return 'SCUX.TWNF_BID_EVA_STATUS'; // 评分单状态 - 历史评标和汇总显示
          },
        },
      },
      {
        name: 'rfxNum',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.bidNum').d('招标单号'),
        type: FieldType.string,
      },
      {
        name: 'rfxTitle',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.bidName').d('项目名称'),
        type: FieldType.string,
      },
      {
        name: 'scoreTeam',
        label: intl.get(`scux.bidEvaluationManagement.model.twnf.evaluationGroup`).d('评分组别'),
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_EXPERT_TEAM',
      },
      {
        name: 'companyName',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.companyName').d('公司'),
        type: FieldType.string,
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.supplierName').d('供应商名称'),
        type: FieldType.string,
      },
      {
        name: 'attributeLongtext20',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.openingOrder').d('开标顺序'),
        type: FieldType.string,
      },
      {
        name: 'scoreWay',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.scoreWay').d('评分方式'),
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_SCORE_WAY',
      },
      {
        name: 'attributeVarchar12',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.bidBusinessType').d('招标业务类型'),
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_BUS_TYPE',
      },
      {
        name: 'inquiryByName',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.bidManager').d('招标经理'),
        type: FieldType.string,
      },
      {
        name: 'techLeaderName',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.technicalManager').d('技术负责人'),
        type: FieldType.string,
      },
      {
        name: 'roundNumber',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.roundNumber').d('轮次'),
        type: FieldType.string,
      },
      {
        name: 'versionNumber',
        label: intl.get('scux.bidEvaluationManagement.model.twnf.versionNumber').d('版本'),
        type: FieldType.string,
      },
      // {
      //   name: 'createdByName',
      //   label: intl.get('scux.bidEvaluationManagement.model.twnf.createdByName').d('创建人'),
      //   type: FieldType.string,
      // },
    ],
    queryFields: getQueryFields({ queryType }),
    transport: {
      read: ({ params, data }) => {
        return {
          method: 'GET',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqQaicMEYmW0ZO8C1BFiaYKP0I`,
          data: {
            ...(params || {}),
            ...timeFilerProcess(data, [{
              name: 'creationDate_range',
              startName: 'creationDateFrom',
              endName: 'creationDateTo',
            }]),
            queryType,
          },
        };
      },
    },
  };
};

export { tableDataSet };
