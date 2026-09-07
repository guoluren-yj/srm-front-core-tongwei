import intl from 'utils/intl';

const prefix = 'scux.bidEvaluationManagement';

// 评标进度 - 供应商列表数据集
// 通威二开 - 字段与评标管理「评标明细」页(bid-evaluation-management/summary/view)保持一致：
// 序号/供应商编码/供应商名称/价格标开启标识/报价总金额/技术组/商务组/价格组，接口仍为原 BASIC 单次查询。
const supplierListDataSet = () => {
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
        name: 'priceBidFlag',
        label: intl.get(`${prefix}.model.twnf.summary.priceBidFlag`).d('价格标开启标识'),
        type: 'number',
      },
      {
        name: 'qtnTotalAmount',
        label: intl.get(`${prefix}.model.twnf.summary.quoteTotalAmount`).d('报价总金额'),
        type: 'number',
      },
      {
        name: 'techExpertRatio',
        label: intl.get(`${prefix}.model.twnf.summary.techGroup`).d('技术组'),
      },
      {
        name: 'businessExpertRatio',
        label: intl.get(`${prefix}.model.twnf.summary.businessExpertRatio`).d('商务组'),
      },
      {
        name: 'priceExpertRatio',
        label: intl.get(`${prefix}.model.twnf.summary.priceExpertRatio`).d('价格组'),
      },
    ],
  };
};

export { supplierListDataSet };
