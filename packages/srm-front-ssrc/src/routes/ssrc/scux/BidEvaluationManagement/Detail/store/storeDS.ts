import { DataToJSON, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

const prefix = 'scux.bidEvaluationManagement';

// 评标头信息数据集
export const evaluationHeaderDataSet = ({ evaluateScoreId }): DataSetProps => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'companyName',
        label: intl.get(`${prefix}.model.twnf.companyName`).d('公司'),
        type: FieldType.string,
      },
      {
        name: 'attributeVarchar11',
        label: intl.get(`${prefix}.model.twnf.bidMethod`).d('招标方式'),
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_METHOD',
      },
      {
        name: 'attributeVarchar12',
        label: intl.get(`${prefix}.model.twnf.bidBusinessType`).d('招标业务类型'),
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_BUS_TYPE',
      },
      {
        name: 'scoreWay',
        label: intl.get(`${prefix}.model.twnf.scoreWay`).d('评分方式'),
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_SCORE_WAY',
      },
      {
        name: 'attributeLongtext20',
        label: intl.get(`${prefix}.model.twnf.openingOrder`).d('开标顺序'),
        type: FieldType.string,
      },
      {
        name: 'scoreTeam',
        label: intl.get(`${prefix}.model.twnf.evaluationGroup`).d('评分组别'),
        type: FieldType.string,
        lookupCode: 'SCUX.TWNF_BID_EXPERT_TEAM',
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`${prefix}.model.twnf.supplierName`).d('供应商名称'),
        type: FieldType.string,
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get(`${prefix}.model.twnf.supplierCompanyCode`).d('供应商编码'),
        type: FieldType.string,
      },
      {
        name: 'suggestInvalidFlag',
        label: intl.get(`${prefix}.model.twnf.qualifiedFlag`).d('是否合格'),
        lookupCode: 'SSRC.SCORE.INVALID_FLAG',
      },
      {
        name: 'attachmentUuid',
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-expert-header',
        label: intl.get(`${prefix}.model.twnf.scoreAttachmentUuid`).d('评分附件'),
      },
      {
        name: 'expertSuggestion',
        label: intl.get(`${prefix}.model.twnf.expertSuggestion`).d('评审意见'),
      },
    ],
    transport: {
      read: () => {
        return {
          method: 'GET',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqVNG2nHApPHM6qzRGm5lEiczU95BkvZFkYhfTcMqF9okib`,
          data: {
            evaluateScoreId,
          },
        };
      },
    },
  };
};

// 评分表格数据集
export const evaluationItemsDataSet = ({ scoreFlag }): DataSetProps => ({
  autoQuery: false,
  dataToJSON: DataToJSON.all,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'indicateName',
      type: FieldType.string,
      label: intl.get(`${prefix}.model.twnf.expertScoring.elementsItems`).d('要素细项'),
    },
    {
      name: 'indicateRemark',
      type: FieldType.string,
      label: intl.get(`${prefix}.model.twnf.expertScoring.detail`).d('评分细则'),
    },
    {
      name: 'betweenScore',
      type: FieldType.string,
      label: intl.get(`${prefix}.model.twnf.expertScoring.betweenScore`).d('评分区间'),
    },
    {
      name: 'supplierScore',
      dynamicProps: {
        label: ({ dataSet }) => {
          switch (dataSet.getState('supplierScoreTitle')) {
            case 'SCORE':
              return intl
                .get(`${prefix}.model.twnf.expertScoring.supplierScore`)
                .d('供应商分数');
            case 'SCORE_PASS':
              return `${intl
                .get(`${prefix}.model.twnf.expertScoring.supplierScore`)
                .d('供应商分数')}(${intl
                .get(`${prefix}.model.twnf.expertScoring.passStatus`)
                .d('是否通过')})`;
            case 'PASS':
              return intl.get(`${prefix}.model.twnf.expertScoring.passStatus`).d('是否通过');
            default:
              return intl
                .get(`${prefix}.model.twnf.expertScoring.supplierScore`)
                .d('供应商分数');
          }
        },
      },
    },
    {
      name: 'indicScore',
      type: FieldType.number,
      dynamicProps: {
        min: ({ record }) => {
          return !isUndefined(record.get('indicateNameFlag')) ||
            scoreFlag ||
            record.get('calculateType') === 'AUTO'
            ? null
            : record.get('minScore')
            ? record.get('minScore')
            : 0;
        },
        max: ({ record }) => {
          return !isUndefined(record.get('indicateNameFlag')) ||
            scoreFlag ||
            record.get('calculateType') === 'AUTO'
            ? null
            : record.get('maxScore')
            ? record.get('maxScore')
            : 9999999999;
        },
        disabled: ({ record }) => {
          return scoreFlag || record.get('calculateType') === 'AUTO';
        },
        required: ({ record }) => {
          return (
            isUndefined(record.get('indicateNameFlag')) &&
            !record.get('indicateNameFlag') &&
            record.get('indicateType') === 'SCORE'
          );
        },
      },
    },
    {
      name: 'passStatus',
      type: FieldType.string,
      lookupCode: 'SSRC.DETAIL_APPROVED_STATUS',
      dynamicProps: {
        disabled: ({ record }) => {
          return scoreFlag || record.get('calculateType') === 'AUTO';
        },
        required: ({ record }) => {
          return (
            isUndefined(record.get('indicateNameFlag')) &&
            !record.get('indicateNameFlag') &&
            record.get('indicateType') !== 'SCORE'
          );
        },
      },
    },
    {
      name: 'teamWeight',
      type: FieldType.number,
      label: intl.get(`${prefix}.model.twnf.expertScoring.weight`).d('组别权重'),
    },
    {
      name: 'attributeVarchar1',
      label: intl.get(`${prefix}.model.twnf.vetoIndicator`).d('否决项指标'),
      type: FieldType.string,
      lookupCode: 'HPFM.FLAG.NEW',
    },
    {
      name: 'indicWeight',
      type: FieldType.number,
      label: intl.get(`${prefix}.model.twnf.expertScoring.indicWeight`).d('指标权重'),
    },
  ],
});

// 技术综评数据集
export const techSummaryDataSet = ({ evaluateSummaryId }): DataSetProps => {
  return {
    autoQuery: true,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'invalidFlag',
        label: intl.get(`${prefix}.model.twnf.techSummaryResult`).d('综评结果'),
        required: true,
        lookupCode: 'SSRC.SCORE.INVALID_FLAG',
      },
      {
        name: 'attributeLongtext1',
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-expert-header',
        label: intl.get(`${prefix}.model.twnf.scoreAttachmentUuid`).d('评分附件'),
      },
      {
        name: 'invalidReason',
        label: intl.get(`${prefix}.model.twnf.techSummarySuggestion`).d('综评意见'),
        required: true,
      },
    ],
    transport: {
      read: () => {
        return {
          method: 'POST',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqQXs3CPP5V456V6mxAO9EZvIRM4icaCQAju14cickz43sP`,
          data: {
            postType: 'GET',
            evaluateSummaryId,
          },
        };
      },
      submit: ({ data, dataSet }) => {
        const postType = dataSet?.getQueryParameter('postType');
        return {
          method: 'POST',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqQXs3CPP5V456V6mxAO9EZvIRM4icaCQAju14cickz43sP`,
          data: {
            ...(data[0] || {}),
            postType,
            evaluateSummaryId,
          },
        };
      },
    }
  };
};
