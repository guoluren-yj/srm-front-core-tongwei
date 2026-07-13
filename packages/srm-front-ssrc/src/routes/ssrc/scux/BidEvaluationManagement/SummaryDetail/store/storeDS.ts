import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

const prefix = 'scux.bidEvaluationManagement';

// 评标头信息数据集
export const evaluationHeaderDataSet = ({ rfxHeaderId }): DataSetProps => {
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
        name: 'supplierCompanyName',
        label: intl.get(`${prefix}.model.twnf.supplierName`).d('供应商名称'),
        type: FieldType.string,
      },
      {
        name: 'supplierCompanyCode',
        label: intl.get(`${prefix}.model.twnf.supplierCompanyCode`).d('供应商编码'),
        type: FieldType.string,
      },
      {
        name: 'suggestInvalidFlag',
        label: intl.get(`${prefix}.model.twnf.qualifiedFlag`).d('是否合格'),
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
          method: 'POST',
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/xPWJSwNE7yBVnffzKs9tqZGBIFRNiao7IKQZcxsb2icq4Nzn3XxSda7ia2HDVSWeMJY`,
          data: {
            postType: 'BASIC',
            rfxHeaderId,
          },
        };
      },
    },
  };
};

// 评分汇总 - 开标列表
export const bidOpeningListDataSet = (): DataSetProps => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'lineNum',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.lineNum`).d('序号'),
      },
      {
        name: 'supplierName',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.supplierName`).d('供应商名称'),
      },
      {
        name: 'contactPerson',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.contactPerson`).d('联系人'),
      },
      {
        name: 'phone',
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.rfxPhone').d('联系电话'),
      },
      {
        name: 'email',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.email`).d('电子邮件'),
      },
      {
        name: 'openTenderOrder',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.openTenderOrder`).d('开标顺序'),
      },
      {
        name: 'techBid',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.techBid`).d('技术标状态'),
      },
      {
        name: 'techOpenTime',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.techOpenTime`).d('技术开标时间'),
      },
      {
        name: 'businessBid',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.businessBid`).d('商务标状态'),
      },
      {
        name: 'businessOpenTime',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.businessOpenTime`).d('商务开标时间'),
      },
      {
        name: 'priceBid',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.priceBid`).d('价格标状态'),
      },
      {
        name: 'priceOpenTime',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.priceOpenTime`).d('价格开标时间'),
      },
      {
        name: 'businessBattle',
        label: intl.get(`${prefix}.model.twnf.bidOpeningList.businessBattle`).d('商务谈判'),
      },
    ],
  };
};

// 评分汇总 - 评标专家数据集
export const evaluationExpertDataSet = (): DataSetProps => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'expertName',
        label: intl.get(`${prefix}.model.twnf.summary.expertName`).d('专家姓名'),
        type: FieldType.string,
      },
      {
        name: 'evaluateLeaderFlag',
        label: intl.get(`${prefix}.model.twnf.summary.responsibility`).d('职责'),
        lookupCode: 'SSRC.EXPERT_DUTY',
      },
      {
        name: 'attributeVarchar1',
        label: intl.get(`${prefix}.model.twnf.summary.expertCategory`).d('评分类别'),
        lookupCode: 'SCUX.TWNF_BID_EXPERT_TEAM',
      },
      {
        name: 'scoredStatus',
        label: intl.get(`${prefix}.model.twnf.summary.scoreStatus`).d('评分状态'),
        lookupCode: 'SSRC.BID_EVALUATE_STATUS',
      },
      {
        name: 'attributeLongtext1',
        label: intl.get(`${prefix}.model.twnf.summary.stopReason`).d('中止原因'),
      }
    ],
  };
};

// 评分汇总 - 供应商列表数据集
export const supplierListDataSet = (): DataSetProps => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'sequence',
        label: intl.get(`${prefix}.model.twnf.summary.supplierLineNumber`).d('序号'),
      },
      {
        name: 'supplierCompanyNum',
        label: intl.get(`${prefix}.model.twnf.summary.supplierCode`).d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`${prefix}.model.twnf.summary.supplierName`).d('供应商名称'),
      },
      {
        name: 'qtnTotalAmount',
        label: intl.get(`${prefix}.model.twnf.summary.quoteTotalAmount`).d('报价总金额'),
        type: FieldType.number,
      },
      {
        name: 'techSum',
        label: intl.get(`${prefix}.model.twnf.summary.techGroup`).d('技术组'),
      },
      {
        name: 'businessSum',
        label: intl.get(`${prefix}.model.twnf.summary.businessGroup`).d('商务组'),
      },
      {
        name: 'priceSum',
        label: intl.get(`${prefix}.model.twnf.summary.priceGroup`).d('价格组'),
      },
    ],
  };
};
