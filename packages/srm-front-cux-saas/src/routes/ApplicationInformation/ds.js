import intl from 'utils/intl';

const InformationDataSet = () => ({
  selection: false,
  autoQuery: true,
  paging: false,
  fields: [
    {
      name: 'displayPrNum',
      label: intl
        .get(`sinv.receiptWorkbench.model.receiptWorkbench.displayPrNum`)
        .d('政府项目采购申请单号'),
      type: 'string',
    },
    {
      name: 'displayLineNum',
      label: intl
        .get(`sinv.receiptWorkbench.model.receiptWorkbench.displayLineNum`)
        .d('政府项目采购申请行号'),
      type: 'string',
    },
    {
      name: 'itemName',
      label: intl.get(`sinv.receiptWorkbench.model.receiptWorkbench.itemName`).d('物料名称'),
      type: 'string',
    },
    {
      name: 'quantity',
      label: intl.get('sinv.receiptWorkbench.model.receiptWorkbench.quantity').d('申请数量'),
    },
    {
      name: 'taxIncludedLineAmount',
      label: intl
        .get(`sinv.receiptWorkbench.model.receiptWorkbench.taxIncludedLineAmount`)
        .d('申请行含税金额'),
      type: 'string',
    },
    {
      name: 'currencyCode',
      label: intl.get(`sinv.receiptWorkbench.model.receiptWorkbench.currencyCode`).d('币种'),
      type: 'string',
    },
    {
      name: 'governmentProjectName',
      label: intl
        .get(`sinv.receiptWorkbench.model.receiptWorkbench.governmentProjectName`)
        .d('政府项目名称'),
      type: 'string',
    },
    {
      name: 'governmentProjectNum',
      label: intl
        .get('sinv.receiptWorkbench.model.receiptWorkbench.governmentProjectNum')
        .d('政府项目号'),
    },
    {
      name: 'gpBudgetSubject',
      label: intl
        .get(`sinv.receiptWorkbench.model.receiptWorkbench.gpBudgetSubject`)
        .d('政府预算科目'),
      type: 'string',
    },
    {
      name: 'gpBudgetNum',
      label: intl.get(`sinv.receiptWorkbench.model.receiptWorkbench.gpBudgetNum`).d('政府预算编号'),
      type: 'string',
    },
    {
      name: 'pcNumAndLine',
      label: intl.get(`sinv.receiptWorkbench.model.receiptWorkbench.pcNumAndLine`).d('协议单号'),
      type: 'string',
    },
    {
      name: 'poNumAndLine',
      label: intl.get('sinv.receiptWorkbench.model.receiptWorkbench.poNumAndLine').d('采购订单号'),
    },
  ],
  transport: {},
});

export default InformationDataSet;
