import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { getDynamicLabel, getPrecision } from './utils';

const intlPrompt = 'scux.twnfReferProtocol'; // 多语言前缀
const MAX_QUAN_NUMBER = '99999999999999999999.9999999999';

const tableDS = () => ({
  dataToJSON: 'selected',
  cacheSelection: true,
  modifiedCheck: false,
  cacheModified: true,
  primaryKey: 'pcSubjectId',
  pageSize: 20,
  fields: [
    {
      name: 'pcNum',
      label: intl.get('sodr.workspace.model.common.pcNum').d('采购协议编号'),
    },
    {
      name: 'lineNum',
      label: intl.get('sodr.workspace.model.common.lineNum').d('行号'),
    },
    {
      name: 'pcName',
      label: intl.get('sodr.workspace.model.common.pcName').d('采购协议名称'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'itemCode',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      dynamicProps: {
        precision: ({ record }) => record.get('secondaryUomPrecision'),
      },
    },
    {
      name: 'receiptsOrderQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.thisOrderQuantity').d('本次下单数量'),
      required: true,
      max: MAX_QUAN_NUMBER,
      validator: (value, name, record) => {
        if (value <= 0) {
          return intl
            .get('sodr.workspace.view.message.greaterThanZero')
            .d('本次下单数量必须大于零');
        }
        if (record.get('orderQuantityFlag') === 1 && record.get('residueOrderQuantity') < value) {
          return intl
            .get('sodr.workspace.view.message.greaterThanResidue')
            .d('本次下单数量大于剩余可下单数量');
        }
        return true;
      },
      dynamicProps: {
        precision: ({ record, dataSet }) =>
          getPrecision(
            record.get(
              dataSet.getState('doubleUnitEnabled') ? 'secondaryUomPrecision' : 'uomPrecision'
            )
          ),
      },
    },
    {
      name: 'residueOrderQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.restPoQuantity').d('剩余可下单数量'),
      dynamicProps: {
        precision: ({ record, dataSet }) =>
          getPrecision(
            record.get(
              dataSet.getState('doubleUnitEnabled') ? 'secondaryUomPrecision' : 'uomPrecision'
            )
          ),
      },
    },
    // {
    //   name: 'neededDate',
    //   type: 'date',
    //   label: intl.get('sodr.workspace.model.common.neededDate').d('需求日期'),
    // },
    {
      name: 'secondaryUomCodeAndName',
      label: intl.get('sodr.workspace.model.common.uom').d('单位'),
    },
    {
      name: 'quantity',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('uomPrecision'),
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      name: 'uomCodeAndName',
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
    },
    {
      name: 'deliverDate',
      type: 'date',
      label: intl.get('sodr.workspace.model.common.deliveDate').d('交付日期'),
    },
    {
      name: 'ladderPrice',
      label: intl.get('sodr.workspace.model.common.ladderInquiry').d('阶梯价格'),
    },
    {
      name: 'unitPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'lineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountNet').d('金额(不含税)'),
    },
    {
      name: 'enteredTaxIncludedPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxprices').d('单价(含税)'),
      dynamicProps: {
        precision: ({ record }) => record.get('defaultPrecision'),
      },
    },
    {
      name: 'taxIncludedLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTax').d('金额(含税)'),
    },
    {
      name: 'taxRate',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
    },
    {
      name: 'unitPriceBatch',
      label: intl.get('sodr.workspace.model.common.priceBatchQuantity').d('每'),
    },
    // {
    //   name: 'ladderInquiry',
    //   label: intl.get('sodr.workspace.model.common.ladderInquiry').d('阶梯价格'),
    // },
    {
      name: 'companyName',
      label: intl.get('sodr.workspace.model.common.companyName').d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get('sodr.workspace.model.common.purOrganizationName').d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get('sodr.workspace.model.common.purchaseAgentName').d('采购员'),
    },
    {
      name: 'categoryName',
      label: intl.get('sodr.workspace.model.common.categoryName').d('物料分类'),
    },
    {
      name: 'createdByName',
      label: intl.get('sodr.workspace.model.common.realName').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sodr.workspace.model.common.creationTime').d('创建时间'),
    },
    // {
    //   name: 'prNumAndLineNum', // 待定
    //   label: intl.get('sodr.workspace.model.common.prNumAndLineNum').d('采购申请单号|行号'),
    // },
    // {
    //   name: 'prNumAndLineNum1', // 待定
    //   label: intl.get('sodr.workspace.model.common.prNumAndLineNum1').d('寻源/招投标号|行号'),
    // },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
    },
    {
      name: 'chanageOrderQuantity',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.occupiedQuantity').d('已创建单据数量'),
    },
    {
      name: 'supplierCompanyNum',
      label: intl.get('sodr.workspace.model.common.supplierCompanyNum').d('供应商编码'),
    },
    {
      name: 'docFlow',
      label: intl.get(`sodr.workspace.model.common.docFlow`).d('单据流'),
    },
    {
      name: 'pendingFlag',
      label: intl.get('sodr.common.model.common.suspend').d('是否暂挂'),
    },
    {
      name: 'projectTaskId',
      label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
    },
  ],
  queryParameter: {

  },
  transport: {
    read: () => {
      return {
        url: `${SRM_MARMOT}/v1/${getCurrentOrganizationId()}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia5noPcB8OhuDsqfiaEp9jI9I`,
        method: 'GET',
      };
    },
  },
  events: {
    load({ dataSet }) {
      dataSet.forEach((i) => {
        i.init({ receiptsOrderQuantity: i.get('residueOrderQuantity') });
      });
    },
    selectAll({ dataSet }) {
      dataSet.forEach((i) => {
        if (i.get('residueOrderQuantity') > 0) {
          i.set({ receiptsOrderQuantity: i.get('residueOrderQuantity') });
        }
      });
    },
    unSelect({ record }) {
      record.reset();
    },
    unSelectAll({ dataSet }) {
      dataSet.forEach((i) => i.reset());
    },
  },
});

export {
    intlPrompt,
    tableDS,
};