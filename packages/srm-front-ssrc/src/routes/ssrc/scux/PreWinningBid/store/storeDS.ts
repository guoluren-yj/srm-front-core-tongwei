import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const preWinningBidModel = 'scux.preWinningBid.model.';

function getAttributeHeaderFields() {
  return [
    {
      name: 'attributeLongtext30',
      label: intl.get(`${preWinningBidModel}decisionRemark`).d('定标备注'),
      type: FieldType.string,
    },
    {
      name: 'attributeLongtext31',
      label: intl.get(`${preWinningBidModel}approvalDocument`).d('FBC审批单号'),
      type: FieldType.string,
      disabled: true,
    },
    {
      name: 'attributeLongtext32',
      label: intl.get(`${preWinningBidModel}approvalOpinion`).d('FBC审批状态'),
      type: FieldType.string,
      disabled: true,
    },
    {
      name: 'attributeLongtext3',
      label: intl.get(`${preWinningBidModel}approvalUrl`).d('FBC审批链接'),
      type: FieldType.string,
      disabled: true,
    },
  ];
}

// 开启专家评分字段
function getComprehensiveScoreFields() {
  const scoreFields = [
    {
      name: 'rank',
      type: FieldType.string,
      dynamicProps: {
        label: ({ dataSet }) => {
          const scoreWay = dataSet.getState('headerDs')?.current?.get('scoreWay');
          if (scoreWay === '10') { // 综合评分法
            return intl.get(`${preWinningBidModel}comprehensiveRanking`).d('综合排名');
          };
          // 技术排名商务符合法
          return intl.get(`${preWinningBidModel}techRanking`).d('技术综合排名');
        },
      },
    },
    {
      name: 'businessReviewSum',
      label: intl.get(`${preWinningBidModel}businessReviewResult`).d('商务评审结果'),
      type: FieldType.string,
    },
    {
      name: 'techSum',
      type: FieldType.string,
      dynamicProps: {
        label: ({ dataSet }) => {
          const { scoreWay, technologyWeight } = dataSet.getState('headerDs')?.current?.get(['scoreWay', 'technologyWeight']) || {};
          if (scoreWay === '10') { // 综合评分法
            return `${intl.get(`${preWinningBidModel}techScore`).d('技术分')}${!isNil(technologyWeight) ? `(${technologyWeight})` : ''}`;
          }
          if (['20', '40'].includes(scoreWay)) { // 合理低价法
            return intl.get(`${preWinningBidModel}techGroup`).d('技术组');
          }
          // 技术排名商务符合法
          return intl.get(`${preWinningBidModel}techResult`).d('技术结果');
        },
      },
    },
    {
      name: 'businessSum',
      type: FieldType.string,
      dynamicProps: {
        label: ({ dataSet }) => {
          const { scoreWay, businessWeight } = dataSet.getState('headerDs')?.current?.get(['scoreWay', 'businessWeight']) || {};
          if (scoreWay === '10') { // 综合评分法
            return `${intl.get(`${preWinningBidModel}businessScore`).d('商务分')}${!isNil(businessWeight) ? `(${businessWeight})` : ''}`;
          }
          if (['20', '40'].includes(scoreWay)) { // 合理低价法
            return intl.get(`${preWinningBidModel}businessGroup`).d('商务组');
          }
          // 技术排名商务符合法
          return intl.get(`${preWinningBidModel}businessResult`).d('商务结果');
        },
      },
    },
    {
      name: 'priceSum',
      type: FieldType.string,
      dynamicProps: {
        label: ({ dataSet }) => {
          const { scoreWay, priceWeight } = dataSet.getState('headerDs')?.current?.get(['scoreWay', 'priceWeight']) || {};
          if (scoreWay === '10') { // 综合评分法
            return `${intl.get(`${preWinningBidModel}priceScore`).d('价格分')}${!isNil(priceWeight) ? `(${priceWeight})` : ''}`;
          }
          if (['20', '40'].includes(scoreWay)) { // 合理低价法
            return intl.get(`${preWinningBidModel}priceGroup`).d('价格组');
          }
          // 技术排名商务符合法
          return intl.get(`${preWinningBidModel}priceResult`).d('价格结果');
        },
      },
    },
    {
      name: 'allScoreSum',
      type: FieldType.number,
      dynamicProps: {
        label: ({ dataSet }) => {
          const { scoreWay } = dataSet.getState('headerDs')?.current?.get(['scoreWay']) || {};
          if (scoreWay === '10') { // 综合评分法
            return intl.get(`${preWinningBidModel}comprehensiveScore`).d('综合得分');
          };
          if (['20', '40'].includes(scoreWay)) { // 合理低价法
            return intl.get(`${preWinningBidModel}evaluationResult`).d('评审结果');
          };
        },
      },
    },
    { // 技术排名商务符合法
      name: 'allScoreSumTech', // 位置不一样故这里单独放一个只有前端使用的虚拟字段
      label: intl.get(`${preWinningBidModel}totalScore`).d('总分'),
      type: FieldType.number,
      transformResponse: (_, data) => data?.allScoreSum || null,
    },
  ];
  return [
    {
      name: 'invalidFlag',
      type: FieldType.boolean,
      trueValue: '1',
      falseValue: '0',
      label: intl.get(`${preWinningBidModel}invalidBid`).d('无效投标'),
    },
    {
      name: 'invalidReason',
      label: intl.get(`${preWinningBidModel}invalidRemark`).d('无效说明'),
      type: FieldType.string,
    },
    ...scoreFields,
  ];
}

function getCommonSupplierListFields() {
  return [
    {
      name: 'supplierCompanyName',
      label: intl.get(`${preWinningBidModel}supplierCompanyName`).d('供应商名称'),
      type: FieldType.string,
    },
    {
      name: 'bidDetail',
      label: intl.get(`${preWinningBidModel}bidDetail`).d('投标详情'),
      type: FieldType.string,
    },
    {
      name: 'sectionName',
      label: intl.get(`${preWinningBidModel}sectionName`).d('标段名称'),
      type: FieldType.string,
    },
    {
      name: 'sectionBidQtnTotalAmount',
      label: intl.get(`${preWinningBidModel}sectionBidQtnTotalAmount`).d('标段投标价（元）'),
      type: FieldType.number,
    },
    {
      name: 'sectionQtnTotalAmount',
      label: intl.get(`${preWinningBidModel}sectionQtnTotalAmount`).d('标段最终价（元）'),
      type: FieldType.number,
    },
    {
      name: 'bidQtnTotalAmount',
      label: intl.get(`${preWinningBidModel}bidQtnTotalAmount`).d('投标总价（元）'),
      type: FieldType.number,
    },
    {
      name: 'qtnTotalAmount',
      label: intl.get(`${preWinningBidModel}qtnTotalAmount`).d('总最终价（元）'),
      type: FieldType.number,
    },
    {
      name: 'attributeVarchar2',
      label: intl.get(`${preWinningBidModel}proposedBid`).d('拟定标'),
      type: FieldType.boolean,
      trueValue: '1',
      falseValue: '0',
    },
    {
      name: 'attributeLongtext2',
      label: intl.get(`${preWinningBidModel}recommendation`).d('推荐意见'),
      type: FieldType.string,
      dynamicProps: {
        required: ({ record }: { record: any }) => String(record.get('attributeVarchar2')) === '1',
      },
    },
  ];
}

export const headerDataSet = ({ rfxHeaderId }: { rfxHeaderId: string }): DataSetProps => {
  return {
    autoQuery: false,
    fields: getAttributeHeaderFields(),
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/H0wIsAC24ecUq1bjSL7jJr1S29X5LNuIDHy7fIBQTgI`,
          data: {
            queryType: 'HEADER',
            rfxHeaderId,
          },
        };
      },
    },
  };
};

export const supplierListDataSet = ({ rfxHeaderId }: { rfxHeaderId: string }): DataSetProps => {
  return {
    primaryKey: 'quotationHeaderId', // TODO: 主键
    autoQuery: false,
    paging: false,
    selection: false,
    fields: [
      ...getCommonSupplierListFields(),
      ...getComprehensiveScoreFields(),
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/H0wIsAC24ecUq1bjSL7jJr1S29X5LNuIDHy7fIBQTgI`,
          data: {
            queryType: 'LINE',
            rfxHeaderId,
          },
        };
      },
    },
  };
};
