import intl from 'utils/intl';

const prefix = 'scux.bidEvaluationManagement';

const basicFormDS = () => ({
  fields: [
    {
      name: 'companyName',
      label: intl.get('ssrc.common.company').d('公司'),
    },
    {
      name: 'sourceCategoryMeaning',
      label: intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      label: intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式'),
    },
    {
      name: 'expertScoreTypeMeaning',
      label: intl.get(`ssrc.expertScoring.view.message.title.expertScore`).d('专家评分'),
    },
    {
      name: 'openBidOrderMeaning',
      label: intl.get('ssrc.sourceTemplate.model.template.openBidOrder').d('评标步制'),
    },
  ],
});

// 评分汇总 - 评标专家数据集
const evaluationExpertDataSet = () => {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'expertName',
        label: intl.get(`${prefix}.model.twnf.summary.expertName`).d('专家姓名'),
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
        name: 'scoreStatus',
        label: intl.get(`${prefix}.model.twnf.summary.scoreStatus`).d('评分状态'),
      },
      {
        name: 'attributeLongtext1',
        label: intl.get(`${prefix}.model.twnf.summary.stopReason`).d('中止原因'),
      },
    ],
  };
};

// 评分汇总 - 供应商列表数据集
const supplierListDataSet = () => {
  return {
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'number',
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
        type: 'number',
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

export { basicFormDS, evaluationExpertDataSet, supplierListDataSet };
