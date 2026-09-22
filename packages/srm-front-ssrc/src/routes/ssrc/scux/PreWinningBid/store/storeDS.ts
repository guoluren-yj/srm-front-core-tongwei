import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

const preWinningBidModel = 'scux.preWinningBid.model.';

// 通威二开 - 是否启用评标：templateScoreType 为 SCORE_NEW / WEIGHT 即启用了评标。
// 未启用评标时，「供应商列表」tab 启用最终价同步 + 附件上传（getFinalPriceSyncFields）
export const isRatingEnabled = (templateScoreType?: string) =>
  templateScoreType === 'SCORE_NEW' || templateScoreType === 'WEIGHT';

function getAttributeHeaderFields() {
  return [
    {
      name: 'currencyCode',
      label: intl.get(`${preWinningBidModel}currencyCode`).d('币种'),
      type: FieldType.string,
    },
    {
      name: 'attributeDecimal7',
      label: intl.get(`${preWinningBidModel}attributeDecimal7`).d('定标总金额'),
      type: FieldType.number,
      precision: 2, // 金额保留两位小数，提交时同样截断到两位
      numberGrouping: true, // 千分位分组显示
      padDecimalZeros: true, // 不足两位补零，如 1,234.5 → 1,234.50
    },
    {
      name: 'attributeDecimal9',
      label: intl.get(`${preWinningBidModel}attributeDecimal9`).d('概算金额'),
      type: FieldType.number,
      precision: 2,
      numberGrouping: true,
      padDecimalZeros: true,
    },
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
      label: intl.get(`${preWinningBidModel}approvalOpinion`).d('审批意见'),
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
      type: FieldType.string,
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
      label: intl.get(`${preWinningBidModel}invalidBid`).d('综评结果'),
    },
    {
      name: 'invalidReason',
      label: intl.get(`${preWinningBidModel}invalidRemark`).d('综评说明'),
      type: FieldType.string,
    },
    ...scoreFields,
  ];
}

// 最终价同步 + 附件上传。是否启用由 supplierListDs 的 finalPriceSync 状态决定，
// 该状态 = 未启用评标（见 StoreProvider 的 initData），仅此时「供应商列表」tab 才可编辑最终价、上传附件
function getFinalPriceSyncFields() {
  return [
    {
      name: 'attributeDecimal2', // 保存/提交时接收 qtnTotalAmount 的赋值，两字段值保持一致
      label: intl.get(`${preWinningBidModel}attributeDecimal2`).d('最终价（同步）'),
      type: FieldType.number,
      precision: 2, // 金额保留两位小数，提交时同样截断到两位
      numberGrouping: true, // 千分位分组显示
      padDecimalZeros: true, // 不足两位补零，如 1,234.5 → 1,234.50
    },
    {
      name: 'attributeLongtext9', // 最终价附件，最终价被改动过的行必填
      label: intl.get(`${preWinningBidModel}attributeLongtext9`).d('附件'),
      type: FieldType.attachment,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-template-requirement',
      dynamicProps: {
        // 仅"供应商列表"（finalPriceSync）场景需附件必填；评分方式表格与只读查看不启用。
        // 且只在本行最终价被改过时必填：接口返回的行行都有最终价（attributeDecimal2 等于 qtnTotalAmount），
        // 按「有值」判断会把所有行都判成必填，故与行上的原始值 getPristineValue 比对
        required: ({ dataSet, record }) => {
          if (!dataSet?.getState('finalPriceSync')) return false;
          const current = record.get('qtnTotalAmount');
          if (isNil(current)) return false; // 最终价为空，无需附件
          const pristine = record.getPristineValue('qtnTotalAmount');
          return isNil(pristine) || Number(current) !== Number(pristine);
        },
      },
    },
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
      name: 'bidDetail', // 虚拟字段，仅用于承接投标详情列的点击跳转，数据由 renderer 渲染
      label: intl.get(`${preWinningBidModel}bidDetail`).d('投标详情'),
      type: FieldType.string,
    },
    {
      name: 'attributeVarchar9', // 1-推荐，其余为不推荐（与标段列表同名字段，保存/提交时随 supplierList 一起下发）
      label: intl.get(`${preWinningBidModel}recommendWinBid`).d('推荐中标'),
      type: FieldType.boolean,
      trueValue: '1',
      falseValue: '0',
    },
    {
      name: 'sectionName',
      label: intl.get(`${preWinningBidModel}sectionName`).d('标段名称'),
      type: FieldType.string,
    },
    // {
    //   name: 'sectionBidQtnTotalAmount',
    //   label: intl.get(`${preWinningBidModel}sectionBidQtnTotalAmount`).d('标段投标价（元）'),
    //   type: FieldType.number,
    //   precision: 2,
    //   numberGrouping: true,
    //   padDecimalZeros: true,
    // },
    // {
    //   name: 'sectionQtnTotalAmount',
    //   label: intl.get(`${preWinningBidModel}sectionQtnTotalAmount`).d('标段最终价（元）'),
    //   type: FieldType.number,
    //   precision: 2,
    //   numberGrouping: true,
    //   padDecimalZeros: true,
    // },
    {
      name: 'awardAmount',
      label: intl.get(`${preWinningBidModel}awardAmount`).d('中标金额'),
      type: FieldType.number,
      precision: 2, // 金额保留两位小数，提交时同样截断到两位
      numberGrouping: true, // 千分位分组显示
      padDecimalZeros: true, // 不足两位补零，如 1,234.5 → 1,234.50
    },
    {
      name: 'bidQtnTotalAmount',
      label: intl.get(`${preWinningBidModel}bidQtnTotalAmount`).d('投标价（元）'),
      type: FieldType.number,
      precision: 2, // 金额保留两位小数，提交时同样截断到两位
      numberGrouping: true, // 千分位分组显示
      padDecimalZeros: true, // 不足两位补零，如 1,234.5 → 1,234.50
    },
    {
      name: 'qtnTotalAmount',
      label: intl.get(`${preWinningBidModel}qtnTotalAmount`).d('最终价（元）'),
      type: FieldType.number,
      precision: 2, // 金额保留两位小数，提交时同样截断到两位
      numberGrouping: true, // 千分位分组显示
      padDecimalZeros: true, // 不足两位补零，如 1,234.5 → 1,234.50
    },
    ...getFinalPriceSyncFields(),
    // {
    //   name: 'attributeVarchar2',
    //   label: intl.get(`${preWinningBidModel}proposedBid`).d('拟定标'),
    //   type: FieldType.boolean,
    //   trueValue: '1',
    //   falseValue: '0',
    // },
    {
      name: 'attributeLongtext22', // 备注（后端字段由 attributeLongtext2 变更为 attributeLongtext22），非必填
      label: intl.get(`${preWinningBidModel}recommendation`).d('备注'),
      type: FieldType.string,
    },
  ];
}

// 通威二开 - 标段列表 tab 的字段，数据来自 queryPreWinningBid 接口的 sectionList
function getSectionListFields() {
  return [
    {
      name: 'bidDetail', // 虚拟字段，仅用于承接投标详情列的点击跳转，数据由 renderer 渲染
      label: intl.get(`${preWinningBidModel}bidDetail`).d('投标详情'),
      type: FieldType.string,
    },
    {
      name: 'attributeVarchar9', // 1-推荐，其余为不推荐
      label: intl.get(`${preWinningBidModel}recommendWinBid`).d('推荐中标'),
      type: FieldType.boolean,
      trueValue: '1',
      falseValue: '0',
    },
    {
      name: 'attributeLongtext8',
      label: intl.get(`${preWinningBidModel}sectionName`).d('标段名称'),
      type: FieldType.string,
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`${preWinningBidModel}supplierCompanyName`).d('供应商名称'),
      type: FieldType.string,
    },
    {
      name: 'awardAmount',
      label: intl.get(`${preWinningBidModel}awardAmount`).d('中标金额'),
      type: FieldType.number,
      precision: 2, // 金额保留两位小数，提交时同样截断到两位
      numberGrouping: true, // 千分位分组显示
      padDecimalZeros: true, // 不足两位补零，如 1,234.5 → 1,234.50
    },
    {
      name: 'quotationAmount',
      label: intl.get(`${preWinningBidModel}quotationAmount`).d('投标价格（元）'),
      type: FieldType.number,
      precision: 2,
      numberGrouping: true,
      padDecimalZeros: true,
    },
    {
      name: 'finalAmount',
      label: intl.get(`${preWinningBidModel}finalAmount`).d('最终价（元）'),
      type: FieldType.number,
      precision: 2,
      numberGrouping: true,
      padDecimalZeros: true,
    },
    {
      name: 'attributeLongtext22',
      label: intl.get(`${preWinningBidModel}recommendation`).d('备注'),
      type: FieldType.string,
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

// 通威二开 - 标段列表 tab。数据由 StoreProvider 从 queryPreWinningBid 的 sectionList 一次性下发，
// 故 autoQuery 关闭、不配置 read，直接 loadData
export const sectionListDataSet = (): DataSetProps => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    fields: getSectionListFields(),
  };
};
