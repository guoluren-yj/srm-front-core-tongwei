import { isNil, isEmpty, isArray, intersection, omit, remove } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import notification from 'utils/notification';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { getCurrentLanguage } from 'utils/utils/user';

const language = getCurrentLanguage();
const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';
const isPlat = !isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();
const platPrefix = `${SRM_SSTA}/v1/site`;
const tenantPrefix = `${SRM_SSTA}/v1/${organizationId}`;
// 平台级结算策略需要调用的接口前缀为site
const prefix = isPlat ? platPrefix : tenantPrefix;
// platModalFlag表示租户查询平台级结算策略接口数据
const getPrefix = (platModalFlag) =>
  platModalFlag ? `${tenantPrefix}/settle-config-site` : prefix;

const settleCodesMap = {
  BILL: 'bill',
  INVOICE: 'settle',
  PAYMENT: 'settle',
};

// 列表页
const tableDS = () => ({
  pageSize: 20,
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  paging: 'server',
  childrenField: 'children',
  primaryKey: 'settleConfigId',
  fields: [
    {
      name: 'settleConfigNum',
      label: intl.get(`${commonPrompt}.settleConfigNum`).d('结算策略编码'),
      type: 'string',
    },
    {
      name: 'settleConfigName',
      label: intl.get(`${commonPrompt}.settleConfigName`).d('结算策略名称'),
      type: 'intl',
    },
    {
      name: 'enableFlag',
      label: intl.get(`${commonPrompt}.enableFlag`).d('启用'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'versionNumber',
      label: intl.get(`${commonPrompt}.version`).d('版本'),
      type: 'number',
    },
    {
      name: 'displayStatus',
      label: intl.get(`${commonPrompt}.configStatus`).d('状态'),
      type: 'string',
      lookupCode: 'SSTA.CONFIG_STATUS',
    },
    {
      name: 'tenantInitFlag',
      type: 'string',
      label: intl.get(`${commonPrompt}.tenantInitFlag`).d('租户初始化策略'),
      lookupCode: 'HPFM.FLAG',
    },
    {
      name: 'action',
      label: intl.get('hzero.common.button.action').d('操作'),
      type: 'string',
    },
  ],
  queryParameter: {
    customizeUnitCode: isPlat
      ? 'SSTA.SETTLE_STRATEGY_LIST_PLAT.SEARCH_BAR'
      : 'SSTA.SETTLE_STRATEGY_LIST.SEARCH_BAR',
  },
  transport: {
    read: ({ params }) => {
      return {
        url: `${prefix}/settle-config/page`,
        method: 'GET',
        params,
      };
    },
    submit: ({ data }) => {
      return {
        url: `${prefix}/settle-config/enable`,
        method: 'PUT',
        data: data[0],
      };
    },
  },
});

// 详情页头
const headerDS = (settleConfigId, editFlag) => {
  const disabled = !editFlag;
  return {
    paging: false,
    selection: false,
    autoCreate: true,
    dataToJSON: 'all',
    forceValidate: true,
    // autoQueryAfterSubmit: true,
    autoQuery: settleConfigId !== 'create',
    // 创建时默认值
    data: [
      {
        settleBasePrice: 'NET_PRICE', // 单价（不含税）
        settleMode: 'BILL_FIRST', // 先对账后结算
        settleMatchDimension: 'QUANTITY', // 数量
        billDependencyFlag: '0', // 否
        invoiceDependencyFlag: '0', // 否
        paymentDependencyFlag: '0', // 否
        enableChargeDebitFlag: '0',
        billCompany: 'SOURCE_COMPANY', // 数据源公司
        billSupplier: 'SOURCE_SUPPLIER', // 数据源供应商
        invoiceSettleCompanyCode: 'SOURCE_COMPANY', // 数据源公司
        invoiceSettleSupplierCode: 'SOURCE_SUPPLIER', // 数据源供应商
        paymentSettleCompanyCode: 'SOURCE_COMPANY', // 数据源公司
        paymentSettleSupplierCode: 'SOURCE_SUPPLIER', // 数据源供应商
        autoIssueCode: 'NONE_AUTO', // 无需自动
        enableBillLineLimitFlag: '0', // 否
        enableInvoiceLineLimitFlag: '0', // 否
        enablePaymentLineLimitFlag: '0', // 否
        enableBillErpSyncFlag: '0', // 否
        enableInvoiceErpSyncFlag: '0', // 否
        enablePaymentErpSyncFlag: '0', // 否
        paymentSyncPayPlatformFlag: '0', // 否
        enableBillPriceAdjustFlag: '0', // 否
        billPartMatchFlag: '0', // 否
        invoicePartMatchFlag: '0', // 否
        paymentPartMatchFlag: '0', // 否
        enablePaymentControlFlag: '0', // 否
        enablePaymentFundPlanFlag: '0', // 否
        priceSource: 'SETTLE', // 结算池
        invoiceStepFlag: '1',
        paymentStepFlag: '1',
        invoicePaymentStepFlag: '1',
        billUxFlag: '1',
        billQuantitySumFlag: '0',
        invoiceUxFlag: '1',
        paymentUxFlag: '1',
        invoicePaymentUxFlag: '1',
        billAutoFillFlag: '0',
        autoSubmitFlag: '0',
        invoiceAutoFillFlag: '0',
        invoiceSyncPrepFlag: '0',
        paymentAutoFillFlag: '0',
        eSignFlag: '0',
        billSilentSignatureFlag: '0',
        eSignOrder: 'PURCHASER',
        invoiceMatchRuleCode: 'OFFLINE_INVOICE', // 线下开票
        enableCheckFlag: '0', // 不启用查验
        amountAdjustFlag: '0', // 否
        invoicePayEnableFlag: '1', // 否
        enableInvoiceAmountAdjustFlag: '0', // 否
        enablePaymentFlag: '0', // 否
        enableAmountHiddenFlag: '0', // 否
        sealTimestampCode: 'E_SIGN_N', // E签宝-否
        enableTaxInvoiceLineLimitFlag: '0', // 否
        enableTaxInvoiceLineCreateFlag: '1', // 是
        paymentAmountAdjustFlag: '0',
        defaultPaymentAmountType: 'ZERO',
        debitEffectiveNode: 'SETTLE_OR_BILLED', // 事务推入结算池或对账完成
        debitCamp: 'PURCHASER', // 默认为采购方阵营
        debitDocumentStatus: 'SUBMITED',
        debitCreatorType: 'SYSTEM',
        paymentCancelValidatorType: 'EXIST_PAY_RECORD_TO_BAN',
        paymentSupplierBankValidatorType: 'UNCHECK',
        invoiceCancelValidatorType: 'EXIST_PAY_RECORD_TO_BAN',
        // 协同模式默认值：确认取消、单边协同、供应商可见
        billCollaborativeModes: [
          {
            typeCode: 'CONFIRM',
            collaborativeModeCode: 'SINGLE',
            supplierViewFlag: '1',
            founderCampCode: 'UNLIMIT',
          },
          {
            typeCode: 'CANCEL',
            collaborativeModeCode: 'SINGLE',
            supplierViewFlag: '1',
            founderCampCode: 'UNLIMIT',
          },
        ],
        invoiceCollaborativeModes: [
          {
            settleTypeCode: 'INVOICE',
            typeCode: 'CONFIRM',
            collaborativeModeCode: 'SINGLE',
            supplierViewFlag: '1',
            founderCampCode: 'UNLIMIT',
          },
          {
            settleTypeCode: 'INVOICE',
            typeCode: 'CANCEL',
            collaborativeModeCode: 'SINGLE',
            supplierViewFlag: '1',
            founderCampCode: 'UNLIMIT',
          },
        ],
        paymentCollaborativeModes: [
          {
            settleTypeCode: 'PAYMENT',
            typeCode: 'CONFIRM',
            collaborativeModeCode: 'SINGLE',
            supplierViewFlag: '1',
            founderCampCode: 'UNLIMIT',
          },
          {
            settleTypeCode: 'PAYMENT',
            typeCode: 'CANCEL',
            collaborativeModeCode: 'SINGLE',
            supplierViewFlag: '1',
            founderCampCode: 'UNLIMIT',
          },
        ],
        // 审批方式默认值：确认取消、功能审批
        billApprovalConfigs: [
          { typeCode: 'CONFIRM', approvedMethodCode: 'FUNCTIONAL' },
          { typeCode: 'CANCEL', approvedMethodCode: 'FUNCTIONAL' },
        ],
        invoiceApprovalConfigs: [
          { settleTypeCode: 'INVOICE', typeCode: 'CONFIRM', approvedMethodCode: 'FUNCTIONAL' },
          { settleTypeCode: 'INVOICE', typeCode: 'CANCEL', approvedMethodCode: 'FUNCTIONAL' },
        ],
        paymentApprovalConfigs: [
          { settleTypeCode: 'PAYMENT', typeCode: 'CONFIRM', approvedMethodCode: 'FUNCTIONAL' },
          { settleTypeCode: 'PAYMENT', typeCode: 'CANCEL', approvedMethodCode: 'FUNCTIONAL' },
        ],
        billDimensionList: [],
        invoiceDimensionList: [],
        paymentDimensionList: [],
        paymentOptPermissions: [],
        // 付款规则默认值：付款-开票结算单-由大到小，预付款-供应商-先进先出-不校验
        paymentSettlePaymentRules: [
          {
            paymentTypeCode: 'PAYMENT',
            paymentRangeCode: 'INVOICE',
            paymentRangeCodeMeaning: 'INVOICE',
            autoSplitRuleCode: 'DESC',
          },
          {
            paymentTypeCode: 'PREPAYMENT',
            paymentRangeCode: 'SUPPLIER',
            paymentRangeCodeMeaning: 'SUPPLIER',
            autoSplitRuleCode: 'FIFO',
            prepaymentCheckLevel: 'NONE',
            autoApplyPrepaymentRuleCode: 'DESC',
            autoApplyPayAmountRuleCode: 'REMAIN_PAY_AMOUNT',
          },
        ],
        // 付款/预付款核销默认金额： 付款金额预付款金额，独立计算
        paymentAmountInits: [
          { initType: 'PAYMENT_AMOUNT', defaultMode: 'INDEPENDENT' },
          { initType: 'PRE_PAYMENT_AMOUNT', defaultMode: 'INDEPENDENT' },
        ],
      },
    ],
    fields: [
      {
        name: 'settleConfigNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleConfigNum`).d('结算策略编码'),
      },
      {
        name: 'settleConfigName',
        type: 'intl',
        label: intl.get(`${commonPrompt}.settleConfigName`).d('结算策略名称'),
        required: true,
        validationGroup: 'base',
      },
      {
        name: 'displayStatus',
        type: 'string',
        label: intl.get(`${commonPrompt}.configStatus`).d('状态'),
        lookupCode: 'SSTA.CONFIG_STATUS',
      },
      {
        name: 'versionNumber',
        type: 'number',
        label: intl.get(`${commonPrompt}.version`).d('版本'),
      },
      {
        name: 'settleConfigProcessUuid',
        type: 'attachment',
        label: intl.get(`${commonPrompt}.flowChart`).d('结算策略流程图'),
        validationGroup: 'base',
      },
      {
        name: 'remark',
        type: 'intl',
        label: intl.get(`${commonPrompt}.desc`).d('结算策略描述'),
      },
      {
        name: 'tenantInitFlag',
        type: 'boolean',
        label: intl.get(`${commonPrompt}.tenantInitFlag`).d('租户初始化策略'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'settleBasePrice',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleBasePrice`).d('结算基准价'),
        lookupCode: 'SSTA.BASE_PRICE',
        required: true,
        disabled,
      },
      {
        name: 'settleMode',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleMode`).d('结算模式'),
        lookupCode: 'SSTA.SETTLE_MODE',
        required: true,
        disabled,
      },
      {
        name: 'settleMatchDimension',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleMatchDimension`).d('结算匹配维度'),
        lookupCode: 'SSTA.MATCH_DIMENSION',
        required: true,
        disabled,
      },
      {
        name: 'billDependencyFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.billDependencyFlag`).d('依赖'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'invoiceDependencyFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.invDependencyFlag`).d('依赖'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'paymentDependencyFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.payDependencyFlag`).d('依赖'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enableChargeDebitFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.enableAutoFlag`).d('是否自动出单'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'billCompany',
        type: 'string',
        label: intl.get(`${commonPrompt}.billCompany`).d('对账公司'),
        lookupCode: 'SSTA.BILL_COMPANY',
        required: true,
        disabled,
      },
      {
        name: 'billSupplier',
        type: 'string',
        label: intl.get(`${commonPrompt}.billSupplier`).d('对账供应商'),
        lookupCode: 'SSTA.SETTLE_SUPPLIER',
        required: true,
        disabled,
      },
      {
        name: 'invoiceSettleCompanyCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleCompanyCode`).d('结算公司'),
        lookupCode: 'SSTA.BILL_COMPANY',
        required: true,
        disabled,
      },
      {
        name: 'invoiceSettleSupplierCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleSupplier`).d('结算供应商'),
        lookupCode: 'SSTA.SETTLE_SUPPLIER',
        required: true,
        disabled,
      },
      {
        name: 'paymentSettleCompanyCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleCompanyCode`).d('结算公司'),
        lookupCode: 'SSTA.BILL_COMPANY',
        required: true,
        disabled,
      },
      {
        name: 'paymentSettleSupplierCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleSupplier`).d('结算供应商'),
        lookupCode: 'SSTA.SETTLE_SUPPLIER',
        required: true,
        disabled,
      },
      {
        name: 'enableAmountHiddenFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.amountHideCode`).d('金额隐藏'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'autoIssueCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.autoIssueCode`).d('自动出单'),
        lookupCode: 'SSTA.AUTO_ISSUE',
        required: true,
        disabled,
      },
      {
        name: 'enableBillLineLimitFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.billLinesLimit`).d('对账单行数控制'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enableInvoiceLineLimitFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleLinesLimit`).d('结算单行数控制'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enablePaymentLineLimitFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.settleLinesLimit`).d('结算单行数控制'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enableTaxInvoiceLineLimitFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.enableTaxInvoiceLineLimit`).d('税务发票行数控制'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enableTaxInvoiceLineCreateFlag',
        type: 'string',
        label: intl
          .get(`${commonPrompt}.enableTaxInvoiceLineCreateFlag`)
          .d('允许手工录入税务发票行信息'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enableBillErpSyncFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.syncErpConfig`).d('同步ERP设置'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enableInvoiceErpSyncFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.syncErpConfig`).d('同步ERP设置'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enablePaymentErpSyncFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.syncErpConfig`).d('同步ERP设置'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'paymentSyncPayPlatformFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.syncPayPoolConfig`).d('同步支付池设置'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'paymentSyncPayPlatformType',
        type: 'string',
        label: intl.get(`${commonPrompt}.paymentSyncPayPlatformType`).d('同步支付池类型'),
        lookupCode: 'SSTA.SYNC_PAY_POOL_TYPE',
        // required: true,
        disabled,
        // validationGroup: 'payment',
      },
      {
        name: 'enableBillPriceAdjustFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.priceAdjustFlag`).d('单价调整'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'billPartMatchFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.partBillFlag`).d('部分对账'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'invoicePartMatchFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.invPartMatch`).d('部分开票'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'paymentPartMatchFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.payPartMatch`).d('部分付款'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'priceSource',
        type: 'string',
        label: intl.get(`${commonPrompt}.pricingModel`).d('取价模式'),
        lookupCode: 'SSTA.PRICE_SOURCE',
        required: true,
        disabled,
      },
      {
        name: 'invoiceStepFlag',
        type: 'string',
        label: intl
          .get(`${commonPrompt}.invoiceStepFlag`)
          .d('先事务后发票模式显示STEP单据创建引导'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'paymentStepFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.showStepGuideFlag`).d('显示STEP单据创建引导'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'invoicePaymentStepFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.showStepGuideFlag`).d('显示STEP单据创建引导'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'billUxFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.uxTitleFlag`).d('显示UX标题'),
        lookupCode: 'HPFM.MARK',
        required: true,
        disabled,
      },
      {
        name: 'billQuantitySumFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.billQuantitySumFlag`).d('显示行汇总数量'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'invoiceUxFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.uxTitleFlag`).d('显示UX标题'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'paymentUxFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.uxTitleFlag`).d('显示UX标题'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'invoicePaymentUxFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.payUxTitleFlag`).d('显示付款UX标题'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'billAutoFillFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.billAutoFillFlag`).d('启用对账行自动填单'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'autoSubmitFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.autoSubmitFlag`).d('启用自动提交外部系统导入对账单'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'invoiceAutoFillFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.invoiceAutoFillFlag`).d('启用发票申请行自动填单'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'invoiceSyncPrepFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.invoiceSyncPrepFlag`).d('同步资金计划编制池'),
        lookupCode: 'HPFM.FLAG',
        // required: true,
        disabled,
      },
      {
        name: 'paymentAutoFillFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.paymentAutoFillFlag`).d('启用付款申请行自动填单'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'eSignFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.electronicealRule`).d('电子签章规则'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'sealTimestampCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.sealTimestamp`).d('显示时间戳'),
        lookupCode: 'SSTA.SEAL_TIMESTAMP_FLAG',
        required: true,
        disabled,
      },
      {
        name: 'eSignOrder',
        type: 'string',
        label: intl.get(`${commonPrompt}.sealOrder`).d('签章顺序'),
        lookupCode: 'SSTA.SIGN_ORDER',
        computedProps: {
          required: ({ record }) => record.get('eSignFlag') === '1',
        },
        validationGroup: 'eSignFlag',
      },
      {
        name: 'purchaserESignKeyword',
        type: 'string',
        label: intl.get(`${commonPrompt}.purchaserESignKeyword`).d('采购方签章关键字'),
        computedProps: {
          required: ({ record }) =>
            record.get('eSignFlag') === '1' && record.get('billSilentSignatureFlag') === '1',
        },
        validationGroup: 'eSignFlag',
      },
      {
        name: 'supplierESignKeyword',
        type: 'string',
        label: intl.get(`${commonPrompt}.supplierESignKeyword`).d('销售方签章关键字'),
        computedProps: {
          required: ({ record }) =>
            record.get('eSignFlag') === '1' && record.get('billSilentSignatureFlag') === '1',
        },
        validationGroup: 'eSignFlag',
      },
      {
        name: 'billSilentSignatureFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.silentSignatureFlag`).d('启用静默签'),
        validationGroup: 'eSignFlag',
        lookupCode: 'HPFM.FLAG',
        computedProps: {
          disabled: ({ record }) => record.get('billSealType') === 'DRAG_SEAL',
        },
      },
      {
        name: 'billSealType',
        type: 'string',
        label: intl.get(`${commonPrompt}.billSealType`).d('印章类型'),
        validationGroup: 'eSignFlag',
        lookupCode: 'SPCM.BATCH_SEAL_TYPE',
      },
      {
        name: 'enablePaymentControlFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.termEnableFlag`).d('启用付款管控'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enablePaymentFundPlanFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.enablePaymentFundPlanFlag`).d('启用资金计划管控'),
        lookupCode: 'HPFM.FLAG',
        // required: true,
        disabled,
      },
      // 发票匹配规则
      {
        name: 'invoiceMatchRuleCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.invoiceMatchRuleCode`).d('发票匹配规则'),
        lookupCode: 'SSTA.INVOICE_MATCH_RULES',
        computedProps: {
          required: ({ record }) => record.get('settleMode') !== 'ONLY_BILL',
        },
        validationGroup: 'invMatchRule',
      },
      {
        name: 'enableCheckFlag',
        type: 'boolean',
        label: intl.get(`${commonPrompt}.enableCheckFlag`).d('启用查验'),
        trueValue: 1,
        falseValue: 0,
        // computedProps: {
        //   required: ({ record }) => record.get('invoiceMatchRuleCode') === 'OFFLINE_INVOICE',
        // },
        validationGroup: 'invMatchRule',
      },
      {
        name: 'directInvoiceType',
        type: 'string',
        label: intl.get(`${commonPrompt}.directInvoiceType`).d('直连开票类型'),
        lookupCode: 'SSTA.DIRECT_INVOICE_TYPE',
        computedProps: {
          required: ({ record }) => record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING',
        },
        validationGroup: 'invMatchRule',
      },
      {
        name: 'directInvoicePoint',
        type: 'string',
        label: intl.get(`${commonPrompt}.directInvoicePoint`).d('直连开票节点'),
        lookupCode: 'SSTA.DIRECT_INVOICE_POINT',
        defaultValue: 'SUBMITED',
        computedProps: {
          required: ({ record }) =>
            record.get('invoiceMatchRuleCode') === 'DIRECT_INVOICING' &&
            record.get('directInvoiceType') === 'INVOICE_PLATFORM',
        },
        validationGroup: 'invMatchRule',
      },
      {
        name: 'confirmAgainFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.confirmAgainFlag`).d('二次确认标志'),
        lookupCode: 'HPFM.FLAG',
      },
      {
        name: 'confirmAgainApprovedMethodCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.confirmAgainApprovedMethodCode`).d('二次确认审批方式'),
        lookupCode: 'SSTA.APPROVAL_METHOD',
        computedProps: {
          required: ({ record }) => {
            const {
              invoiceMatchRuleCode,
              directInvoiceType,
              directInvoicePoint,
              confirmAgainFlag,
            } =
              record.get([
                'invoiceMatchRuleCode',
                'directInvoiceType',
                'directInvoicePoint',
                'confirmAgainFlag',
              ]) || {};
            const isConfirmColShow =
              invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
              directInvoiceType === 'INVOICE_PLATFORM' &&
              directInvoicePoint === 'APPROVED';
            return Number(confirmAgainFlag) === 1 && isConfirmColShow;
          },
        },
      },
      {
        name: 'invoiceSettleCancelFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.invoiceSettleCancelFlag`).d('票单同步取消'),
        lookupCode: 'HPFM.FLAG',
      },
      // 查验规则
      {
        name: 'inspectRuleConfig',
        type: 'string',
        label: intl.get(`${commonPrompt}.inspectRuleConfig`).d('查验规则'),
      },
      // 校验规则
      {
        name: 'checkRuleConfig',
        type: 'string',
        label: intl.get(`${commonPrompt}.checkRuleConfig`).d('校验规则'),
      },
      {
        name: 'checkPointCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.checkPointCode`).d('查验节点'),
        lookupCode: 'SSTA.INVOICE_CHECK_POINT',
        defaultValue: 'INITIATE',
      },
      {
        name: 'autoCheckFlag',
        type: 'boolean',
        label: intl.get(`${commonPrompt}.autoCheck`).d('自动查验'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'ignoreCheckInvoiceType',
        type: 'string',
        label: intl.get(`${commonPrompt}.ignoreCheckInvoiceType`).d('无需查验发票种类'),
        lookupCode: 'SSTA.INVOICE_TYPE',
        multiple: true,
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value ? value.split(',') : null),
      },
      {
        name: 'invoiceVerifyNodeList',
        type: 'string',
        label: intl.get(`${commonPrompt}.checkPoint`).d('校验节点'),
        lookupCode: 'SSTA.INVOICE_VERIFY_NODE',
        // valueField: 'meaning',
        textField: 'meaning',
        multiple: true,
        transformRequest: (value) => (isArray(value) ? value : [value]),
      },
      {
        name: 'verifyTaxNumConsistencyList',
        type: 'string',
        label: intl.get(`${commonPrompt}.checkInvoiceInfoSome`).d('校验发票信息与单据信息一致性'),
        lookupCode: 'SSTA.VERIFY_TAX_NUM_CONSISTENCY',
        computedProps: {
          required: ({ record }) => !isEmpty(record.get('invoiceVerifyNodeList')),
          disabled: ({ record }) => isEmpty(record.get('invoiceVerifyNodeList')),
          multiple: ({ record }) => !isEmpty(record.get('invoiceVerifyNodeList')),
        },
        validationGroup: 'invMatchRule',
      },
      {
        name: 'amountAdjustFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.invoiceToleranceMode`).d('发票尾差处理模式'),
        lookupCode: 'SSTA.INVOICE_TOLERANCE_MODE',
        required: true,
        disabled,
      },
      {
        name: 'invoiceAllowanceCtrlType',
        type: 'string',
        label: intl.get(`${commonPrompt}.invoiceAllowanceCtrlType`).d('尾差控制类型'),
        lookupCode: 'SSTA.ALLOWANCE_CTRL_TYPE',
        // required: true, 因为该字段跟其他不是头ds的字段在弹窗里，所以不在头校验里
        disabled,
      },
      {
        name: 'invoicePayEnableFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.enableInvAndPay`).d('付款申请(含发票)配置'),
        // lookupCode: 'HPFM.FLAG',
        disabled,
      },
      {
        name: 'paymentAmountAdjustFlag',
        type: 'string',
        label: intl
          .get(`${commonPrompt}.paymentAmountAdjustFlag`)
          .d('自动调整发票尾差后自动调整本次付款金额'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: '0',
        disabled,
      },
      {
        name: 'defaultPaymentAmountType',
        type: 'string',
        label: intl.get(`${commonPrompt}.defaultPaymentAmountType`).d('本次付款金额默认值'),
        lookupCode: 'SSTA.DEFAULT_PAYMENT_AMOUNT_TYPE',
        defaultValue: 'ZERO',
        disabled,
      },
      {
        name: 'enableInvoiceAmountAdjustFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.invAmountAdjust`).d('金额调整'),
        lookupCode: 'HPFM.FLAG',
        required: true,
        disabled,
      },
      {
        name: 'enablePaymentFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.payEnableFlag`).d('启用付款配置'),
        lookupCode: 'HPFM.FLAG',
        required: true,
      },
      {
        name: 'autoInvoiceScenarioType',
        type: 'string',
        label: intl
          .get('ssta.settleStrategy.model.settleStrategy.autoInvoiceScenarioType')
          .d('基础场景'),
        lookupCode: 'SSTA.AUTO_INVOICE_SCENARIO_TYPE',
        dynamicProps: {
          required: ({ record }) => Number(record.get('enableChargeDebitFlag')) === 1,
        },
        validationGroup: 'enableChargeDebitFlag',
      },
      {
        name: 'debitEffectiveNode',
        type: 'string',
        label: intl
          .get('ssta.settleStrategy.model.settleStrategy.debitEffectiveNode')
          .d('生效节点'),
        lookupCode: 'SSTA.DEBIT_EFFECTIVE_NODE',
        defaultValue: 'SETTLE_OR_BILLED',
        dynamicProps: {
          required: ({ record }) => Number(record.get('enableChargeDebitFlag')) === 1,
          disabled: ({ record }) =>
            ['OFFLINE_INVOICE', 'EC', 'INVOICE_PLATFORM'].includes(
              record.get('autoInvoiceScenarioType')
            ),
        },
        validationGroup: 'enableChargeDebitFlag',
      },
      {
        name: 'debitDocumentStatus',
        type: 'string',
        label: intl
          .get('ssta.settleStrategy.model.settleStrategy.debitCreateDocumentStatus')
          .d('生成单据状态'),
        lookupCode: 'SSTA.SETTLE_STATUS',
        required: true,
        dynamicProps: {
          disabled: ({ record }) =>
            ['OFFLINE_INVOICE', 'INVOICE_PLATFORM'].includes(record.get('autoInvoiceScenarioType')),
          required: ({ record }) =>
            Number(record.get('enableChargeDebitFlag')) === 1 &&
            !(
              record.get('autoInvoiceScenarioType') === 'DEBIT' &&
              record.get('debitEffectiveNode') === 'INVOICE_CREATE'
            ),
        },
        validationGroup: 'enableChargeDebitFlag',
      },
      {
        name: 'debitCamp',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.settleStrategy.debitCamp').d('创建方阵营'),
        lookupCode: 'SSTA.CAMP',
        // defaultValue: 'PURCHASER',
        dynamicProps: {
          required: ({ record }) =>
            Number(record.get('enableChargeDebitFlag')) === 1 &&
            !(
              record.get('autoInvoiceScenarioType') === 'DEBIT' &&
              record.get('debitEffectiveNode') === 'INVOICE_CREATE'
            ),
          disabled: ({ record }) =>
            ['EC', 'INVOICE_PLATFORM'].includes(record.get('autoInvoiceScenarioType')),
        },
        validationGroup: 'enableChargeDebitFlag',
      },
      {
        name: 'debitCreatorType',
        type: 'string',
        label: intl
          .get('ssta.settleStrategy.model.settleStrategy.debitCreatorType')
          .d('创建人类型'),
        lookupCode: 'SSTA.DEBIT_CREATOR_TYPE',
        defaultValue: 'SYSTEM',
        dynamicProps: {
          required: ({ record }) => Number(record.get('enableChargeDebitFlag')) === 1,
        },
        validationGroup: 'enableChargeDebitFlag',
      },
      {
        name: 'debitCreatedByLov',
        type: 'object',
        label: intl.get('ssta.settleStrategy.model.settleStrategy.debitCreatedBy').d('创建人'),
        lovCode: 'HIAM.TENANT.USER',
        ignore: 'always',
        dynamicProps: {
          required: ({ record }) => {
            const { debitCreatorType } = record.get(['debitCreatorType']) || {};
            return (
              Number(record.get('enableChargeDebitFlag')) === 1 &&
              ['DESIGNATE_ACCOUNT'].includes(debitCreatorType)
            );
          },
        },
        validationGroup: 'enableChargeDebitFlag',
      },
      {
        name: 'debitCreatedByName',
        bind: 'debitCreatedByLov.realName',
      },
      {
        name: 'debitCreatedBy',
        bind: 'debitCreatedByLov.id',
      },
      {
        name: 'invoiceCancelValidatorType',
        type: 'string',
        label: intl
          .get(`${commonPrompt}.invoiceCancelValidateRecord`)
          .d('发票申请取消校验付款记录'),
        lookupCode: 'SSTA.PREPAY_CANCEL_VALIDATOR_TYPE',
        // required: true,
        disabled,
      },
      {
        name: 'paymentCancelValidatorType',
        type: 'string',
        label: intl
          .get(`${commonPrompt}.paymentCancelValidateRecord`)
          .d('付款申请取消校验付款记录'),
        lookupCode: 'SSTA.PREPAY_CANCEL_VALIDATOR_TYPE',
        // required: true,
        disabled,
      },
      {
        name: 'paymentSupplierBankValidatorType',
        type: 'string',
        label: intl
          .get(`${commonPrompt}.supplierBankInfoValidityControl`)
          .d('供应商银行信息有效性控制'),
        lookupCode: 'SSTA.SUPPLIER_BANK_INFO_VALID_CONTROL_RULE',
        disabled,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/settle-config/${settleConfigId}`,
          method: 'GET',
          data: {},
          params: {},
        };
      },
      // children会全量校验导致提交失败,自定义调用接口
      submit: ({ data, dataSet }) => {
        const submitType = dataSet.getState('submitType');
        return {
          url:
            submitType === 'save' ? `${prefix}/settle-config` : `${prefix}/settle-config/release`,
          method: submitType === 'save' ? 'POST' : 'PUT',
          data: {
            ...data[0],
            // invoiceFieldCssList: invoiceUxFWeight || [],
            // paymentFieldCssList: paymentUxFWeight || [],
            // invoicePaymentFieldCssList: invoicePaymentUxFWeight || [],
          },
        };
      },
    },
  };
};

// 协同模式通用（在条件配置时需要设置primaryKey缓存修改记录）
const collaborativeModeDS = (type, platModalFlag, primaryKey) => ({
  paging: false,
  autoQuery: false,
  selection: false,
  dataToJSON: 'all',
  forceValidate: true,
  validationGroup: type.toLowerCase(),
  validationTitle: intl.get('ssta.settleStrategy.view.title.collaborativeMode').d('协同模式'),
  primaryKey,
  fields: [
    {
      name: 'typeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.typeCode`).d('类型'),
      lookupCode: 'SSTA.BILL_ACTION_TYPE',
      required: true,
    },
    {
      name: 'collaborativeModeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.collaborativeModeCode`).d('协同模式'),
      lookupCode: 'SSTA.COOPERATION_MODE',
      required: true,
    },
    {
      name: 'supplierViewFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.supplierViewFlag`).d('销售方可见'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      computedProps: {
        required: ({ record }) =>
          record.get('collaborativeModeCode') !== 'DOUBLE' && record.get('typeCode') !== 'CANCEL',
        disabled: ({ record }) =>
          record.get('collaborativeModeCode') === 'DOUBLE' || record.get('typeCode') === 'CANCEL',
      },
    },
    {
      name: 'founderCampCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.founderCamp`).d('创建方阵营'),
      lookupCode: type === 'BILL' ? 'SSTA.BILL_FOUNDER_CAMP' : 'SSTA.FOUNDER_CAMP',
      defaultValue: 'UNLIMIT',
      computedProps: {
        required: ({ record }) =>
          record.get('typeCode') === 'CONFIRM' && record.get('collaborativeModeCode') === 'DOUBLE',
        disabled: ({ record }) =>
          !(
            record.get('typeCode') === 'CONFIRM' && record.get('collaborativeModeCode') === 'DOUBLE'
          ),
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      const { settleConfigId } = data;
      const filledCode = settleCodesMap[type];
      return {
        url: `${getPrefix(platModalFlag)}/${filledCode}-collaborative-modes/${settleConfigId}`,
        method: 'GET',
        data: {},
        params: { settleTypeCode: type },
      };
    },
    create: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      const filledCode = settleCodesMap[type];
      return {
        url: `${prefix}/${filledCode}-collaborative-modes/${settleConfigId}`,
        method: 'POST',
        data,
        params: { settleTypeCode: type },
      };
    },
    update: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      const filledCode = settleCodesMap[type];
      return {
        url: `${prefix}/${filledCode}-collaborative-modes/${settleConfigId}`,
        method: 'POST',
        data,
        params: { settleTypeCode: type },
      };
    },
    destroy: () => {
      const filledCode = settleCodesMap[type];
      return {
        url: `${prefix}/${filledCode}-collaborative-modes`,
        method: 'DELETE',
        params: { settleTypeCode: type },
      };
    },
  },
});

// 审批方式通用
const approveMethodDS = (type, platModalFlag) => ({
  paging: false,
  autoQuery: false,
  selection: false,
  dataToJSON: 'all',
  forceValidate: true,
  validationGroup: type.toLowerCase(),
  validationTitle: intl.get('ssta.settleStrategy.view.title.approveMethod').d('审批方式'),
  primaryKey: 'configId',
  fields: [
    {
      name: 'typeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.typeCode`).d('类型'),
      lookupCode: 'SSTA.BILL_ACTION_TYPE',
      required: true,
    },
    {
      name: 'approvedMethodCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.approvedMethodCode`).d('审批方式'),
      lookupCode: type === 'PAYMENT' ? 'SSTA.PAYMENT_APPROVAL_METHOD' : 'SSTA.APPROVAL_METHOD',
      required: true,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { settleConfigId } = data;
      const filledCode = settleCodesMap[type];
      return {
        url: `${getPrefix(platModalFlag)}/${filledCode}-approval-configs/${settleConfigId}`,
        method: 'GET',
        data: {},
        params: { settleTypeCode: type },
        transformResponse: (response) => {
          try {
            const res = JSON.parse(response);
            return res.sort((a, b) => {
              return a.squence - b.squence;
            });
          } catch (e) {
            return response;
          }
        },
      };
    },
    update: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      const filledCode = settleCodesMap[type];
      return {
        url: `${prefix}/${filledCode}-approval-configs/${settleConfigId}`,
        method: 'POST',
        data,
        params: { settleTypeCode: type },
      };
    },
    destroy: () => {
      const filledCode = settleCodesMap[type];
      return {
        url: `${prefix}/${filledCode}-approval-configs`,
        method: 'DELETE',
        params: { settleTypeCode: type },
      };
    },
  },
});

// 维度通用
const dimensionDS = (type, platModalFlag) => ({
  paging: false,
  autoQuery: false,
  dataToJSON: 'all',
  forceValidate: true,
  validationGroup: type.toLowerCase(),
  validationTitle:
    type === 'BILL'
      ? intl.get('ssta.settleStrategy.view.title.billDimension').d('对账维度')
      : intl.get('ssta.settleStrategy.view.title.settleDimension').d('结算维度'),
  record: {
    dynamicProps: {
      // SPLITE
      selectable: (record) => {
        const { billDimensionId, dimensionType, dimension } = record.get([
          'billDimensionId',
          'dimensionType',
          'dimension',
        ]);
        const billEditFlag =
          (['DOC_MERGE', 'VALIDATE_RULE'].includes(dimensionType) &&
            [
              'companyId',
              'supplierCompanyId',
              'currencyCode',
              'AFTER_SALE',
              'EC_PO_SUB',
              'supplierId',
            ].includes(dimension)) ||
          (dimensionType === 'VALIDATE_RULE' && dimension === 'ORI_TRX_NUM');
        const invEditFlag =
          (dimensionType === 'DOC_MERGE' &&
            [
              'companyId',
              'supplierCompanyId',
              'currencyCode',
              'invoiceMethod',
              'invoiceType',
              'supplierId',
            ].includes(dimension)) ||
          (dimensionType === 'VALIDATE_RULE' &&
            ['ORI_TRX_NUM', 'EC_PO_SUB', 'AFTER_SALE'].includes(dimension));
        const payEditFlag =
          (dimensionType === 'DOC_MERGE' &&
            ['companyId', 'supplierCompanyId', 'currencyCode', 'supplierId'].includes(dimension)) ||
          (dimensionType === 'VALIDATE_RULE' && dimension === 'ORI_TRX_NUM');
        const pristineFlag =
          dimensionType === record.getPristineValue('dimensionType') &&
          dimension === record.getPristineValue('dimension');
        const editFlagMap = {
          BILL: billEditFlag,
          INVOICE: invEditFlag,
          PAYMENT: payEditFlag,
        };
        if (dimensionType === 'SPLITE') {
          return false;
        } else if (billDimensionId && pristineFlag && editFlagMap[type]) {
          return false;
        } else {
          return true;
        }
      },
    },
  },
  fields: [
    {
      name: 'docType',
      type: 'string',
      defaultValue: type,
    },
    {
      name: 'dimensionType',
      type: 'string',
      label: intl.get(`${commonPrompt}.dimensionType`).d('类型'),
      lookupCode: 'SSTA.BILL_DIMENSION_TYPE',
      required: true,
    },
    {
      name: 'dimension',
      type: 'string',
      label: intl.get(`${commonPrompt}.dimension`).d('维度'),
      lookupCode:
        type === 'BILL'
          ? 'SSTA.BILL_DIMENSION'
          : type === 'PAYMENT'
          ? 'SSTA.PAYMENT_SETTLE_DIMENSION'
          : 'SSTA.SETTLE_DIMENSION',
      cascadeMap: { parentValue: 'dimensionType' },
      required: true,
    },
    {
      name: 'nullAble',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.nullAble`).d('允许空值'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'skipFullReversedLineFlag',
      type: 'boolean',
      label: intl.get(`ssta.settleStrategy.view.settleStrategy.skipReserve`).d('跳过完全冲销行'),
      trueValue: 1,
      falseValue: 0,
      bind: 'nullAble',
    },
    {
      name: 'skipPendLineFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.skipPendLineFlag`).d('跳过暂挂行'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'billDimension',
      type: 'string',
      label: intl.get(`${commonPrompt}.billDimension`).d('明细维度'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { settleConfigId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/bill-dimension/${settleConfigId}`,
        method: 'GET',
        data: { documentType: type }, // 后端没加该参数,方便前端排查
        params: {},
        transformResponse: (response) => {
          try {
            const res = JSON.parse(response);
            const result = res ? res.filter((item) => item.docType === type) : [];
            return result;
          } catch (message) {
            notification.error({ message });
            return [];
          }
        },
      };
    },
    destroy: () => {
      return {
        url: `${prefix}/bill-dimension`,
        method: 'DELETE',
      };
    },
    update: ({ data, dataSet }) => {
      const settleConfigId = dataSet.parent.current.get('settleConfigId');
      return {
        url: `${prefix}/bill-dimension/${settleConfigId}`,
        method: 'POST',
        data,
      };
    },
    create: ({ data, dataSet }) => {
      const settleConfigId = dataSet.parent.current.get('settleConfigId');
      return {
        url: `${prefix}/bill-dimension/${settleConfigId}`,
        method: 'POST',
        data,
      };
    },
  },
});

// 采购事务类型通用
const purOrderTypeDS = (platModalFlag, dimension) => ({
  autoCreate: true,
  autoQuery: false,
  paging: false,
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'validateFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.validateFlag`).d('启用校验'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'rcvTrxTypeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.rcvTrxTypeCode`).d('租户事务类型编码'),
    },
    {
      name: 'rcvTrxTypeName',
      type: 'string',
      label: intl.get(`${commonPrompt}.rcvTrxTypeName`).d('租户事务类型名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { billDimensionId } = data;
      const orderFlag = ['orderType', 'RETURN_ORDER_TYPE'].includes(dimension);
      return {
        url: `${getPrefix(platModalFlag)}/bill-dimension-dtl${
          orderFlag ? '/order/type' : ''
        }/${billDimensionId}`,
        method: 'GET',
        data: {},
        params: {
          dimension,
        },
      };
    },
    submit: ({ data, dataSet }) => {
      const { billDimensionId } = dataSet.queryParameter;
      return {
        url: `${prefix}/bill-dimension-dtl/update/${billDimensionId}`,
        method: 'POST',
        data,
      };
    },
  },
});

// 库存组织类型通用
const purInvTypeDS = (platModalFlag, setAllChecked) => ({
  primaryKey: 'organizationId',
  autoCreate: true,
  autoQuery: false,
  paging: true,
  pageSize: 20,
  selection: false,
  forceValidate: true,
  queryFields: [
    {
      label: intl.get(`${commonPrompt}.rcvInvTypeCode`).d('库存组织编码'),
      type: 'string',
      name: 'organizationCode',
      display: true,
      sortFlag: true,
    },
    {
      label: intl.get(`${commonPrompt}.rcvInvTypeName`).d('库存组织名称'),
      type: 'string',
      name: 'organizationName',
      display: true,
    },
  ],
  fields: [
    {
      name: 'validateFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.validateFlag`).d('启用校验'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'invOrganizationCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.rcvInvTypeCode`).d('库存组织编码'),
    },
    {
      name: 'rcvTrxTypeName',
      type: 'string',
      label: intl.get(`${commonPrompt}.rcvInvTypeName`).d('库存组织名称'),
    },
    {
      label: intl.get(`ssta.common.model.common.businessEntity`).d('业务实体'),
      type: 'string',
      name: 'ouName',
    },
    {
      label: intl.get(`hzero.common.source`).d('来源'),
      type: 'string',
      name: 'sourceCode',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { billDimensionId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/bill-dimension-dtl/inv/org/${billDimensionId}`,
        method: 'GET',
        transformResponse: (response) => {
          try {
            const res = JSON.parse(response);
            if (!res?.content || !isArray(res?.content)) return;
            if (setAllChecked) setAllChecked(res.content?.every((item) => item.validateFlag));
            return res;
          } catch (e) {
            return response;
          }
        },
      };
    },
    submit: ({ data, dataSet }) => {
      const { billDimensionId } = dataSet.queryParameter;
      return {
        url: `${prefix}/bill-dimension-dtl/update/${billDimensionId}`,
        method: 'POST',
        data,
      };
    },
  },
});

// 物料编码类型通用
const itemTypeDS = (platModalFlag, setAllChecked) => ({
  primaryKey: 'itemId',
  autoCreate: true,
  autoQuery: false,
  paging: true,
  pageSize: 20,
  selection: false,
  forceValidate: true,
  queryFields: [
    {
      label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
      type: 'string',
      name: 'itemCode',
      display: true,
      sortFlag: true,
    },
    {
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
      type: 'string',
      name: 'itemName',
      display: true,
    },
  ],
  fields: [
    {
      name: 'validateFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.validateFlag`).d('启用校验'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
    },
    {
      label: intl.get(`hzero.common.source`).d('来源'),
      type: 'string',
      name: 'externalSystemCode',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { billDimensionId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/bill-dimension-dtl/mdm/item/${billDimensionId}`,
        method: 'GET',
        transformResponse: (response) => {
          try {
            const res = JSON.parse(response);
            if (!res?.content || !isArray(res?.content)) return;
            if (setAllChecked) setAllChecked(res.content?.every((item) => item.validateFlag));
            return res;
          } catch (e) {
            return response;
          }
        },
      };
    },
    submit: ({ data, dataSet }) => {
      const { billDimensionId } = dataSet.queryParameter;
      return {
        url: `${prefix}/bill-dimension-dtl/update/${billDimensionId}`,
        method: 'POST',
        data,
      };
    },
  },
});

// 订单类型通用
const orderTypeDS = (platModalFlag) => ({
  autoCreate: true,
  autoQuery: false,
  paging: false,
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'validateFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.validateFlag`).d('启用校验'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'rcvOrderTypeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.rcvOrderTypeCode`).d('租户订单类型编码'),
    },
    {
      name: 'rcvOrderTypeName',
      type: 'string',
      label: intl.get(`${commonPrompt}.rcvOrderTypeName`).d('租户订单类型名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { billDimensionId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/bill-dimension-dtl/order/type/${billDimensionId}`,
        method: 'GET',
        data: {},
        params: {},
      };
    },
    submit: ({ data, dataSet }) => {
      const { billDimensionId } = dataSet.queryParameter;
      return {
        url: `${prefix}/bill-dimension-dtl/update/${billDimensionId}`,
        method: 'POST',
        data,
      };
    },
  },
});

// 对账单金额隐藏内部控制角色
const amountHideInnerDS = (platModalFlag) => ({
  pageSize: 20,
  autoQuery: false,
  forceValidate: true,
  primaryKey: 'shieldId',
  fields: [
    {
      name: 'role',
      type: 'object',
      label: intl.get(`${commonPrompt}.roleName`).d('角色名称'),
      lovCode: 'SSTA.TENANT.ROLE',
      lovPara: { tenantId: organizationId },
      required: true,
    },
    {
      name: 'roleId',
      type: 'string',
      bind: 'role.id',
      label: intl.get(`${commonPrompt}.roleId`).d('角色ID'),
    },
    {
      name: 'roleName',
      type: 'string',
      bind: 'role.name',
    },
    {
      name: 'roleCode',
      type: 'string',
      bind: 'role.code',
      label: intl.get(`${commonPrompt}.roleCode`).d('角色编码'),
    },
    {
      name: 'detailedControlFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.detailedControlFlag`).d('精细控制'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'allocateOrg',
      type: 'string',
      label: intl.get(`${commonPrompt}.allocateOrg`).d('分配组织'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { settleConfigId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/inner-price-shields/${settleConfigId}`,
        method: 'GET',
        params,
      };
    },
    create: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      return {
        url: `${prefix}/inner-price-shields/${settleConfigId}`,
        method: 'POST',
        data,
      };
    },
    update: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      return {
        url: `${prefix}/inner-price-shields/${settleConfigId}`,
        method: 'POST',
        data,
      };
    },
    destroy: () => {
      return {
        url: `${prefix}/inner-price-shields`,
        method: 'DELETE',
      };
    },
  },
  // 避免全部notication.success
  feedback: { submitSuccess() {} },
});

// 对账单金额隐藏内部控制公司
const amountHideSubDS = ({ shieldId, editFlag, platModalFlag }) => ({
  autoQuery: false,
  paging: false,
  forceValidate: true,
  dataToJSON: 'selected',
  queryParameter: { shieldId },
  selection: editFlag ? 'multiple' : false,
  transport: {
    read: () => {
      return {
        url: `${getPrefix(platModalFlag)}/inner-price-shield-coms/${shieldId}`,
        method: 'GET',
      };
    },
  },
  record: {
    dynamicProps: {
      defaultSelected: (record) => Number(record.get('checkedFlag')) === 1,
    },
  },
  events: {
    beforeLoad: ({ data }) => {
      if (!editFlag) {
        remove(data, (item) => Number(item.checkedFlag !== 1));
      }
    },
  },
  fields: [
    {
      name: 'companyId',
      type: 'number',
      label: intl.get(`${commonPrompt}.companyId`).d('公司ID'),
    },
    {
      name: 'parentId',
      type: 'number',
      label: intl.get(`${commonPrompt}.parentId`).d('父ID'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get(`${commonPrompt}.companyName`).d('公司'),
    },
    {
      name: 'companyNum',
      type: 'string',
      label: intl.get(`${commonPrompt}.companyNum`).d('代码'),
    },
    {
      name: 'checkedFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.checkedFlag`).d('勾选'),
      trueValue: 1,
      falseValue: 0,
    },
  ],
  // 避免全部notication.success
  feedback: { submitSuccess() {} },
});

// 对账单金额隐藏外部控制
const amountHideOuterTableDS = (platModalFlag) => ({
  pageSize: 20,
  autoQuery: false,
  forceValidate: true,
  primaryKey: 'shieldSupId',
  fields: [
    {
      name: 'supplierCompany',
      type: 'object',
      lovCode: 'SSTA.USER_AUTH.EXT_SUPPLIER',
      lovPara: { tenantId: organizationId },
      label: intl.get(`${commonPrompt}.supplierCompany`).d('供应商'),
      required: true,
    },
    {
      name: 'displaySupplierName',
      bind: 'supplierCompany.displaySupplierName',
      ignore: 'always',
    },
    {
      name: 'supplierCompanyId',
      type: 'number',
      bind: 'supplierCompany.supplierCompanyId',
      label: intl.get(`${commonPrompt}.supplierCompanyId`).d('供应商ID'),
    },
    {
      name: 'supplierTenantId',
      type: 'number',
      bind: 'supplierCompany.supplierTenantId',
    },

    {
      name: 'supplierCompanyName',
      type: 'string',
      computedProps: {
        bind: ({ record }) => {
          return record.get('supplierCompany')?.supplierCompanyName
            ? 'supplierCompany.supplierCompanyName'
            : 'supplierCompany.supplierName';
        },
      },
      // bind: 'supplierCompany.supplierCompanyName' || 'supplierCompany.supplierName',
    },
    {
      name: 'supplierCompanyNumber',
      type: 'string',
      bind: 'supplierCompany.supplierCompanyNum',
      label: intl.get(`${commonPrompt}.supplierCompanyNumber`).d('供应商编码'),
    },

    {
      name: 'supplierId',
      bind: 'supplierCompany.supplierId',
    },

    {
      name: 'supplierNum',
      bind: 'supplierCompany.supplierNum',
    },
  ],
  queryFields: [
    {
      name: 'supplierCompanyNumber',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierCompanyNumber`).d('供应商编码'),
      display: true,
      sortFlag: true,
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get(`${commonPrompt}.supplierCompanyName`).d('供应商名称'),
      display: true,
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { settleConfigId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/outer-price-shield-sups/${settleConfigId}`,
        method: 'GET',
        params,
      };
    },
    create: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      return {
        url: `${prefix}/outer-price-shield-sups/${settleConfigId}`,
        method: 'POST',
        data: data.map((item) => ({ ...item, documentCategory: 'BILL' })),
      };
    },
    update: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      return {
        url: `${prefix}/outer-price-shield-sups/${settleConfigId}`,
        method: 'POST',
        data: data.map((item) => ({ ...item, documentCategory: 'BILL' })),
      };
    },
    destroy: () => {
      return {
        url: `${prefix}/outer-price-shield-sups`,
        method: 'DELETE',
      };
    },
  },
  // 避免全部notication.success
  feedback: { submitSuccess() {} },
});

// 对账单金额隐藏外部控制加入全部
const amountHideOuterAllDS = () => ({
  autoQuery: false,
  forceValidate: true,
  fields: [
    {
      name: 'billPriceSupPriceShiledIncludeAll',
      label: intl.get(`${commonPrompt}.billPriceSupPriceShiledIncludeAll`).d('加入全部'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { settleConfigId } = data;
      return {
        url: `${prefix}/settle-config/${settleConfigId}`,
        method: 'GET',
        params,
      };
    },
    submit: ({ data }) => {
      const value = data[0].billPriceSupPriceShiledIncludeAll;
      const settleConfig = data[0];
      return {
        url: `${prefix}/outer-price-shield-sups/${value ? 'include-all' : 'not-include-all'}`,
        method: 'PUT',
        data: {
          ...settleConfig,
          billPriceSupPriceShiledIncludeAll: value,
        },
      };
    },
  },
});

// 行数限制
const linesLimitDS = (activeKey, platModalFlag) => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'limitQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.limitQuantity`).d('行数'),
      computedProps: {
        required: ({ record }) => record.get('enableFlag'),
        disabled: ({ record }) => !record.get('enableFlag'),
      },
      validator: (value, name, record) => {
        if (record.get('enableFlag') && (value <= 0 || !Number.isInteger(value))) {
          return intl
            .get(`${commonPrompt}.quantityNeedIntegerAndExceedZero`)
            .d('行数需维护大于零的整数');
        }
        return true;
      },
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${getPrefix(platModalFlag)}/line-limits/${data.settleConfigId}`,
      method: 'get',
      params: {},
      data: { documentType: activeKey.toUpperCase() },
    }),
    submit: ({ data }) => {
      return {
        url: `${prefix}/line-limits`,
        method: 'put',
        data,
      };
    },
  },
});

// 同步ERP
const syncErpDS = (activeKey, platModalFlag) => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'erpCancelType',
      lookupCode: 'SSTA.ERP_CANCEL_TYPE',
      defaultValue: 'SRM',
      required: true,
      type: 'string',
      label: intl.get(`${commonPrompt}.erpCancelType`).d('ERP取消类型'),
    },
    {
      name: 'cancelSynchronizeErpFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.cancelSynchronizeErpFlag`).d('取消时同步ERP'),
      computedProps: {
        disabled: ({ record }) => record.get('erpCancelType') !== 'SRM',
      },
    },
    {
      name: 'billErpSyncNode',
      lookupCode: 'SSTA.SETTLE_CONFIG_BILL_SYNC_NODE',
      defaultValue: 'COMPLETED',
      required: activeKey === 'bill', // 对账单匹配规则是显示必输
      type: 'string',
      multiple: true,
      label: intl.get(`${commonPrompt}.billErpSyncNode`).d('同步节点'),
      transformRequest: (value) => (isArray(value) ? value.join() : value),
      transformResponse: (value) => (value ? value.split(',') : null),
    },
    {
      name: 'billReturnCancelFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get(`${commonPrompt}.billReturnCancelFlag`).d('审核退回同步成功取消单据'),
      help: intl
        .get(`${commonPrompt}.billReturnCancelFlagHelp`)
        .d(
          '启用后，对账单供应商退回及采购方功能或工作流审核退回同步外部系统成功后将自动取消对账单，若退回同步外部系统失败不会继续取消对账单，在可同步页签重新触发同步成功后取消对账单。'
        ),
      computedProps: {
        disabled: ({ record }) => !record?.get('billErpSyncNode').includes('RETURN'),
      },
    },
    {
      name: 'partSynchronizeErpCancelFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`${commonPrompt}.partSynchronizeErpCancelFlag`).d('部分同步成功允许取消'),
      computedProps: {
        disabled: ({ record }) => record.get('erpCancelType') !== 'SRM',
      },
    },
    {
      name: 'confirmSyncMethod',
      lookupCode: 'SSTA.SETTLE_HEADER_SYNC_METHOD',
      defaultValue: 'AUTO',
      type: 'string',
      label: intl.get(`${commonPrompt}.confirmSyncMethod`).d('确认时同步方式'),
      required: true,
    },
    {
      name: 'cancelSyncMethod',
      lookupCode: 'SSTA.SETTLE_HEADER_SYNC_METHOD',
      defaultValue: 'AUTO',
      required: activeKey === 'invoice',
      type: 'string',
      label: intl.get(`${commonPrompt}.cancelSyncMethod`).d('取消时同步方式'),
      computedProps: {
        disabled: ({ record }) => Number(record?.get('cancelSynchronizeErpFlag')) !== 1,
        required: ({ record }) =>
          activeKey === 'invoice' && Number(record?.get('cancelSynchronizeErpFlag')) === 1,
      },
      help: intl
        .get(`${commonPrompt}.syncMethodHelp`)
        .d(
          '取消时配置自动同步，同步失败将阻塞srm单据的取消，单据状态将停留在取消中；若配置手工同步，srm将独立完成取消流程后更新单据同步状态，等待用户在”可同步“页签进行手工同步'
        ),
    },
    {
      name: 'zeroAmountWithoutSyncFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      label: intl.get(`${commonPrompt}.zeroAmountSyncFlag`).d('0金额不同步erp'),
      // computedProps: {
      //   disabled: ({ record }) => record.get('erpCancelType') !== 'SRM',
      // },
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${getPrefix(platModalFlag)}/sync-es-configs/${data.settleConfigId}`,
      method: 'get',
      data: {},
      params: { settleTypeCode: activeKey.toUpperCase() },
    }),
    submit: ({ dataSet, data }) => {
      const {
        queryParameter: { settleConfigId },
      } = dataSet;
      return {
        url: `${prefix}/sync-es-configs/${settleConfigId}`,
        method: 'post',
        data,
        params: { settleTypeCode: activeKey.toUpperCase() },
      };
    },
  },
});

// 付款管控
const paymentControlDS = (platModalFlag) => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'paymentControlRuleSource',
      type: 'string',
      label: intl.get(`${commonPrompt}.paymentControlRuleOrigin`).d('付款管控规则来源'),
      lookupCode: 'SSTA.PAYMENT_CONTROL_RULE_SOURCE',
      required: true,
    },
    {
      name: 'expectPaymentDateInitRule',
      type: 'string',
      label: intl.get(`${commonPrompt}.expectPaymentDateDefaultRule`).d('期望付款日期默认规则'),
      lookupCode: 'SSTA.EXPECT_PAYMENT_DATE_INIT_RULE',
      required: true,
    },
    {
      name: 'enablePredictExpectPaymentDate',
      type: 'boolean',
      label: intl
        .get(`ssta.common.model.common.enablePredictExpectPaymentDate`)
        .d('预计期望付款日期'),
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ record }) => {
          const expectPaymentDateInitRule = record.get('expectPaymentDateInitRule');
          return !expectPaymentDateInitRule || expectPaymentDateInitRule === 'NO_REQUIRE_DEFAULT';
        },
      },
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${getPrefix(platModalFlag)}/payment-control-config/${data.settleConfigId}`,
      method: 'get',
      data: {},
    }),
    submit: ({ dataSet, data }) => {
      const {
        queryParameter: { settleConfigId },
      } = dataSet;
      const param = data[0] || {};
      return {
        url: `${prefix}/payment-control-config/${settleConfigId}`,
        method: 'post',
        data: {
          ...param,
          settleConfigId,
        },
      };
    },
  },
});

// 付款管控
const paymentFundPlanControlDS = (platModalFlag) => ({
  autoCreate: true,
  autoQuery: false,
  selection: false,
  forceValidate: true,
  fields: [
    {
      name: 'sourceTypeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.sourceTypeCode`).d('付款行金额分摊至阶段明细规则'),
      lookupCode: 'SSTA.PAYMENT_FUND_PLAN_SOURCE_TYPE_CODE',
      required: true,
    },
    {
      name: 'expectPaymentDateInitRule',
      type: 'string',
      label: intl.get(`${commonPrompt}.expectPaymentDateDefaultRule`).d('期望付款日期默认规则'),
      lookupCode: 'SSTA.FP_EXPECT_PAYMENT_DATE_INIT_RULE',
      required: true,
    },
    {
      name: 'paymentLineDefaultAmount',
      type: 'string',
      label: intl.get(`${commonPrompt}.paymentLineDefaultAmount`).d('付款行金额默认值'),
      lookupCode: 'SSTA.FP_PAYMENT_LINE_DEFAULT_AMOUNT',
      required: true,
    },
  ],
  transport: {
    read: ({ data }) => ({
      url: `${getPrefix(platModalFlag)}/payment-fund-plan-config/${data.settleConfigId}`,
      method: 'get',
      data: {},
    }),
    submit: ({ dataSet, data }) => {
      const {
        queryParameter: { settleConfigId },
      } = dataSet;
      const param = data[0] || {};
      return {
        url: `${prefix}/payment-fund-plan-config/${settleConfigId}`,
        method: 'post',
        data: {
          ...param,
          settleConfigId,
        },
      };
    },
  },
});

// 对账单单价调整
const billPriceAdjustDS = (platModalFlag) => ({
  autoCreate: true,
  selection: false,
  autoQuery: false,
  forceValidate: true,
  fields: [
    {
      name: 'settleTypeCode',
      type: 'string',
      lookupCode: 'SSTA.DOCUMENT_TYPE',
      label: intl.get(`${commonPrompt}.documentType`).d('单据类型'),
    },
    {
      name: 'priceEditFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.priceModifiedFlag`).d('允许修改单价'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'priceAllowanceCtrlType',
      type: 'string',
      lookupCode: 'SSTA.ALLOWANCE_CTRL_TYPE',
      label: intl.get(`${commonPrompt}.toleranceCtrlType`).d('允差控制类型'),
      required: true,
    },
    {
      name: 'priceAllowance',
      type: 'number',
      range: ['lower', 'upper'],
      step: 0.01,
      computedProps: {
        label: ({ record }) =>
          record.get('priceAllowanceCtrlType') === 'PROPORTION'
            ? `${intl.get(`${commonPrompt}.toleranceRange`).d('允差范围')}(%)`
            : intl.get(`${commonPrompt}.toleranceRange`).d('允差范围'),
      },
      validator: (value, _, record) => {
        const { lower, upper } = value || {};
        const ctrlType = record.get('priceAllowanceCtrlType');
        if (['AMOUNT', 'PROPORTION'].includes(ctrlType) && (isNil(lower) || isNil(upper))) {
          return intl.get('hzero.common.validation.notNull', {
            name: intl.get(`${commonPrompt}.toleranceRange`).d('允差范围'),
          });
        }
        if (ctrlType === 'AMOUNT' && (lower > 0 || upper < 0)) {
          return intl
            .get(`${commonPrompt}.validation.noGreater0AndnoLess0`)
            .d('左侧值（下限）不能大于0，右侧值不能小于0');
        }
        if (ctrlType === 'PROPORTION' && (lower > 0 || lower < -100 || upper < 0 || upper > 100)) {
          return intl
            .get(`${commonPrompt}.validation.betweenPlusAndMinus100`)
            .d('左侧值（下限）-100到0之间，右侧值0到100之间');
        }
      },
    },
    {
      name: 'priceAllowanceLower',
      bind: 'priceAllowance.lower',
    },
    {
      name: 'priceAllowanceUpper',
      bind: 'priceAllowance.upper',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { settleConfigId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/settle-amount-settings/${settleConfigId}`,
        method: 'GET',
        data: {
          ...data,
          settleTypeCodeList: 'BILL',
        },
      };
    },
    submit: ({ dataSet }) => {
      return {
        url: `${prefix}/settle-amount-settings/${dataSet.getQueryParameter('settleConfigId')}`,
        method: 'POST',
      };
    },
  },
});

// 对账单取价模式价格库
const pricingModelTableDS = (editFlag) => ({
  paging: false,
  autoCreate: true,
  autoQuery: false,
  selection: false,
  dataToJSON: 'all',
  forceValidate: true,
  fields: [
    {
      name: 'action',
      type: 'string',
      label: intl.get(`${commonPrompt}.action`).d('操作时点'),
      lookupCode: 'SSTA.PRICE_ACTION',
      required: true,
    },
    {
      name: 'enableFlag',
      label: intl.get(`${commonPrompt}.enableFlag`).d('启用'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      disabled: !editFlag,
    },
  ],
});

// 对账单取价模式价格服务
const pricingModelFromDS = () => ({
  paging: false,
  autoCreate: true,
  autoQuery: false,
  selection: false,
  dataToJSON: 'all',
  forceValidate: true,
  fields: [
    {
      name: 'serviceLov',
      type: 'object',
      textField: 'serviceCode',
      lovCode: 'SSRC.PRICE_LIB_SERVICE',
      noCache: true,
      required: true,
      ignore: 'always',
      label: intl.get('ssta.settlePool.model.settlePool.serviceCode').d('价格服务编码'),
    },
    {
      name: 'serviceCode',
      type: 'string',
      bind: 'serviceLov.serviceCode',
      required: true,
    },
    {
      required: true,
      name: 'serviceName',
      type: 'string',
      label: intl.get(`${commonPrompt}.serviceName`).d('价格服务名称'),
      bind: 'serviceLov.serviceName',
      defaultValue: 'serviceLov.serviceName',
    },
  ],
});

// 对账单取价模式取价维度限制
const pricingModelLimitDS = () => ({
  paging: false,
  autoCreate: true,
  autoQuery: false,
  dataToJSON: 'all',
  forceValidate: true,
  selection: 'multiple',
  fields: [
    {
      name: 'dimensionType',
      type: 'string',
      label: intl.get(`${commonPrompt}.dimensionType`).d('类型'),
      lookupCode: 'SSTA.PRICING_DIMENSION_TYPE',
      required: true,
    },

    {
      name: 'dimension',
      type: 'string',
      label: intl.get(`${commonPrompt}.dimension`).d('维度'),
      lookupCode: 'SSTA.PRICE_DIMENSION',
      cascadeMap: { parentValue: 'dimensionType' },
      required: true,
    },
  ],
  transport: {
    destroy: () => {
      return {
        url: `${prefix}/price-services/price-dimension`,
        method: 'DELETE',
      };
    },
  },
});

// 价格库转结算池自动填单模板配置
const priceToSettleAutoFillTemplateDS = () => ({
  autoCreate: true,
  autoQuery: false,
  dataToJSON: 'all',
  forceValidate: true,
  fields: [
    {
      name: 'libPriceAutoTemplate',
      type: 'string',
      label: intl.get(`${commonPrompt}.autoFillTemplate`).d('自动填单模板'),
      lovCode: 'SSTA.AUTO_TEMPLATE_LIB_PRICE',
    },
  ],
});

// 尾差自动调整
const toleAutoAdjustDS = (settleConfigId, platModalFlag) => {
  return {
    autoCreate: true,
    autoQuery: true,
    forceValidate: true,
    fields: [
      {
        name: 'invoiceAllowanceCtrlType',
        type: 'string',
        label: intl.get(`${commonPrompt}.invoiceAllowanceCtrlType`).d('尾差控制类型'),
        lookupCode: 'SSTA.ALLOWANCE_CTRL_TYPE',
      },
      {
        name: 'taxIncludedAmountTolRange',
        type: 'number',
        range: ['lower', 'upper'],
        step: 0.01,
        computedProps: {
          label: ({ dataSet }) =>
            dataSet.getState('percentFlag')
              ? `${intl.get(`${commonPrompt}.taxIncludedAmountTolRange`).d('含税金额允差范围')}(%)`
              : intl.get(`${commonPrompt}.taxIncludedAmountTolRange`).d('含税金额允差范围'),
        },
        validator: (value, _, { dataSet }) => {
          const { lower, upper } = value || {};
          if (isNil(lower) || isNil(upper)) {
            return intl.get('hzero.common.validation.notNull', {
              name: intl.get(`${commonPrompt}.taxIncludedAmountTolRange`).d('含税金额允差范围'),
            });
          }
          if (!dataSet.getState('percentFlag') && (lower > 0 || upper < 0)) {
            return intl
              .get(`${commonPrompt}.validation.noGreater0AndnoLess0`)
              .d('左侧值（下限）不能大于0，右侧值不能小于0');
          }
          if (
            dataSet.getState('percentFlag') &&
            (lower > 0 || lower < -100 || upper < 0 || upper > 100)
          ) {
            return intl
              .get(`${commonPrompt}.validation.betweenPlusAndMinus100`)
              .d('左侧值（下限）-100到0之间，右侧值0到100之间');
          }
        },
      },
      {
        name: 'taxIncludedAmountTolLower',
        bind: 'taxIncludedAmountTolRange.lower',
      },
      {
        name: 'taxIncludedAmountTolUpper',
        bind: 'taxIncludedAmountTolRange.upper',
      },
      {
        name: 'taxAmountTolRange',
        type: 'number',
        range: ['lower', 'upper'],
        step: 0.01,
        computedProps: {
          label: ({ dataSet }) =>
            dataSet.getState('percentFlag')
              ? `${intl.get(`${commonPrompt}.taxAmountTolRange`).d('税额允差范围')}(%)`
              : intl.get(`${commonPrompt}.taxAmountTolRange`).d('税额允差范围'),
        },
        validator: (value, _, { dataSet }) => {
          const { lower, upper } = value || {};
          if (isNil(lower) || isNil(upper)) {
            return intl.get('hzero.common.validation.notNull', {
              name: intl.get(`${commonPrompt}.taxAmountTolRange`).d('税额允差范围'),
            });
          }
          if (!dataSet.getState('percentFlag') && (lower > 0 || upper < 0)) {
            return intl
              .get(`${commonPrompt}.validation.noGreater0AndnoLess0`)
              .d('左侧值（下限）不能大于0，右侧值不能小于0');
          }
          if (
            dataSet.getState('percentFlag') &&
            (lower > 0 || lower < -100 || upper < 0 || upper > 100)
          ) {
            return intl
              .get(`${commonPrompt}.validation.betweenPlusAndMinus100`)
              .d('左侧值（下限）-100到0之间，右侧值0到100之间');
          }
        },
      },
      {
        name: 'taxAmountTolLower',
        type: 'number',
        bind: 'taxAmountTolRange.lower',
      },
      {
        name: 'taxAmountTolUpper',
        type: 'number',
        bind: 'taxAmountTolRange.upper',
      },
      {
        name: 'adjustMode',
        type: 'string',
        label: intl.get(`${commonPrompt}.adjustMode`).d('尾差分摊模式'),
        lookupCode: 'SSTA.AMOUNT_ADJUST_MODE',
        required: true,
        defaultValue: 'LINE_SPLITE',
      },
      {
        name: 'adjustRule',
        type: 'string',
        label: intl.get(`${commonPrompt}.adjustRule`).d('尾差分摊规则'),
        lookupCode: 'SSTA.AMOUNT_ADJUST_RULE',
        cascadeMap: { parentValue: 'adjustMode' },
        required: true,
        defaultValue: 'MAX_AMOUNT',
      },
      {
        name: 'stepAdjustFlag',
        type: 'boolean',
        label: intl.get(`${commonPrompt}.stepAdjustFlag`).d('step节点自动调整'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'directInvoiceAdjustAmountFlag',
        type: 'boolean',
        label: intl
          .get(`${commonPrompt}.directInvoiceAdjustAmountFlag`)
          .d('直连开票成功节点自动调整'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
    transport: {
      read: () => ({
        url: `${getPrefix(platModalFlag)}/amount-adjusts/${settleConfigId}`,
        method: 'get',
        data: {},
      }),
      submit: ({ dataSet, data }) => {
        return {
          url: `${prefix}/amount-adjusts`,
          method: 'put',
          data: {
            ...dataSet.parent,
            amountAdjust: data[0],
          },
        };
      },
    },
  };
};

// 尾差手动调整
const toleManualAdjustDS = (settleConfigId, platModalFlag) => {
  return {
    autoCreate: true,
    autoQuery: true,
    forceValidate: true,
    fields: [
      {
        name: 'invoiceAllowanceCtrlType',
        type: 'string',
        label: intl.get(`${commonPrompt}.invoiceAllowanceCtrlType`).d('尾差控制类型'),
        lookupCode: 'SSTA.ALLOWANCE_CTRL_TYPE',
      },
      {
        name: 'taxIncludedAmountTolRange',
        type: 'number',
        range: ['lower', 'upper'],
        step: 0.01,
        computedProps: {
          label: ({ dataSet }) =>
            dataSet.getState('percentFlag')
              ? `${intl.get(`${commonPrompt}.taxIncludedAmountTolRange`).d('含税金额允差范围')}(%)`
              : intl.get(`${commonPrompt}.taxIncludedAmountTolRange`).d('含税金额允差范围'),
        },
        validator: (value, _, { dataSet }) => {
          const { lower, upper } = value || {};
          if (isNil(lower) || isNil(upper)) {
            return intl.get('hzero.common.validation.notNull', {
              name: intl.get(`${commonPrompt}.taxIncludedAmountTolRange`).d('含税金额允差范围'),
            });
          }
          if (!dataSet.getState('percentFlag') && (lower > 0 || upper < 0)) {
            return intl
              .get(`${commonPrompt}.validation.noGreater0AndnoLess0`)
              .d('左侧值（下限）不能大于0，右侧值不能小于0');
          }
          if (
            dataSet.getState('percentFlag') &&
            (lower > 0 || lower < -100 || upper < 0 || upper > 100)
          ) {
            return intl
              .get(`${commonPrompt}.validation.betweenPlusAndMinus100`)
              .d('左侧值（下限）-100到0之间，右侧值0到100之间');
          }
        },
      },
      {
        name: 'taxIncludedAmountTolLower',
        bind: 'taxIncludedAmountTolRange.lower',
      },
      {
        name: 'taxIncludedAmountTolUpper',
        bind: 'taxIncludedAmountTolRange.upper',
      },
      {
        name: 'taxAmountTolRange',
        type: 'number',
        range: ['lower', 'upper'],
        step: 0.01,
        computedProps: {
          label: ({ dataSet }) =>
            dataSet.getState('percentFlag')
              ? `${intl.get(`${commonPrompt}.taxAmountTolRange`).d('税额允差范围')}(%)`
              : intl.get(`${commonPrompt}.taxAmountTolRange`).d('税额允差范围'),
        },
        validator: (value, _, { dataSet }) => {
          const { lower, upper } = value || {};
          if (isNil(lower) || isNil(upper)) {
            return intl.get('hzero.common.validation.notNull', {
              name: intl.get(`${commonPrompt}.taxAmountTolRange`).d('税额允差范围'),
            });
          }
          if (!dataSet.getState('percentFlag') && (lower > 0 || upper < 0)) {
            return intl
              .get(`${commonPrompt}.validation.noGreater0AndnoLess0`)
              .d('左侧值（下限）不能大于0，右侧值不能小于0');
          }
          if (
            dataSet.getState('percentFlag') &&
            (lower > 0 || lower < -100 || upper < 0 || upper > 100)
          ) {
            return intl
              .get(`${commonPrompt}.validation.betweenPlusAndMinus100`)
              .d('左侧值（下限）-100到0之间，右侧值0到100之间');
          }
        },
      },
      {
        name: 'taxAmountTolLower',
        type: 'number',
        bind: 'taxAmountTolRange.lower',
      },
      {
        name: 'taxAmountTolUpper',
        type: 'number',
        bind: 'taxAmountTolRange.upper',
      },
      {
        name: 'validateLevel',
        type: 'string',
        label: intl.get(`${commonPrompt}.validateLevel`).d('尾差校验等级'),
        lookupCode: 'SSTA.AMOUNT_VALIDATE_LEVEL',
        required: true,
      },
      {
        name: 'validateAction',
        type: 'string',
        label: intl.get(`${commonPrompt}.validateAction`).d('尾差校验节点'),
        lookupCode: 'SSTA.AMOUNT_VALIDATE_ACTION',
        required: true,
        multiple: true,
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value ? value.split(',') : null),
      },
      {
        name: 'directInvoiceAutoSubmitFlag',
        type: 'boolean',
        label: intl
          .get(`${commonPrompt}.directInvoiceAutoSubmitFlag`)
          .d('直连开票单据允差范围内直接提交'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
    ],
    transport: {
      read: () => ({
        url: `${getPrefix(platModalFlag)}/amount-tolerances/${settleConfigId}`,
        method: 'get',
        data: {},
      }),
      submit: ({ dataSet, data }) => {
        return {
          url: `${prefix}/amount-tolerances`,
          method: 'put',
          data: {
            ...dataSet.parent,
            amountTolerance: data[0],
          },
        };
      },
    },
  };
};

// 校验规则设置
const checkRuleDS = (platModalFlag, enableCheckFlag) => {
  return {
    paging: false,
    autoQuery: false,
    dataToJSON: 'all',
    forceValidate: true,
    validationGroup: 'payment',
    validationTitle: intl
      .get(`ssta.settleStrategy.view.settleStrategy.checkRuleSet`)
      .d('校验规则设置'),
    fields: [
      {
        name: 'invoiceVerifyNode',
        type: 'string',
        label: intl.get(`${commonPrompt}.checkPoint`).d('校验节点'),
        lookupCode: 'SSTA.INVOICE_VERIFY_NODE',
        required: true,
      },
      {
        name: 'invoiceType',
        type: 'string',
        label: intl.get(`${commonPrompt}.checkInvoiceScope`).d('校验发票种类'),
        lookupCode: 'SSTA.INVOICE_TYPE',
        required: true,
        multiple: true,
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value ? value.split(',') : null),
      },
      {
        name: 'validateLevel',
        type: 'string',
        label: intl.get(`${commonPrompt}.checkLevel`).d('校验等级'),
        lookupCode: 'SSTA.INVOICE_VALIDATE_LEVEL',
        required: true,
      },
      {
        name: 'dimension',
        type: 'string',
        label: intl.get(`${commonPrompt}.checkDimension`).d('检验维度'),
        lookupCode: 'SSTA.INVOICE_VERIFY_DIMENSION',
        multiple: true,
        required: true,
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value ? value.split(',') : null),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${getPrefix(platModalFlag)}/invoice-validate-rules/list`,
          method: 'GET',
          params: {},
        };
      },
      destroy: () => {
        return {
          url: `${prefix}/invoice-validate-rules/batchDelete`,
          method: 'DELETE',
        };
      },
      submit: ({ data, dataSet }) => {
        const settleConfigId = dataSet.getQueryParameter('settleConfigId');
        return {
          url: `${prefix}/invoice-validate-rules/batch/save`,
          method: 'POST',
          data: {
            settleConfigId,
            enableCheckFlag,
            invoiceValidateRuleList: data,
          },
        };
      },
    },
  };
};

// 付款操作权限
const payOprPermissionDS = (documentType, platModalFlag) => {
  return {
    paging: false,
    autoQuery: false,
    dataToJSON: 'all',
    forceValidate: true,
    validationGroup: 'payment',
    validationTitle: intl
      .get(`ssta.settleStrategy.view.settleStrategy.paymentOpterPermission`)
      .d('付款操作权限'),
    fields: [
      {
        name: 'documentType',
        type: 'string',
        label: intl.get(`${commonPrompt}.documentType`).d('单据类型'),
        lookupCode: 'SSTA.RECORD_DOCUMENT_TYPE',
        required: true,
      },
      {
        name: 'permissionType',
        type: 'string',
        label: intl.get(`${commonPrompt}.permissionType`).d('操作权限'),
        lookupCode: 'SSTA.RECORD_PERMISSION_TYPE',
        required: true,
      },
      {
        name: 'operationType',
        type: 'string',
        label: intl.get(`${commonPrompt}.operationType`).d('操作类型'),
        lookupCode: 'SSTA.RECORD_OPERATION_TYPE',
        multiple: true,
        required: true,
        transformRequest: (value) => (isArray(value) ? value.join() : value),
        transformResponse: (value) => (value ? value.split(',') : null),
      },
    ],
    record: {
      dynamicProps: {
        selectable: (record) => Boolean(record.nextRecord),
      },
    },
    transport: {
      read: ({ data }) => {
        const { settleConfigId } = data;
        return {
          url: `${getPrefix(platModalFlag)}/opt-permissions/${settleConfigId}`,
          method: 'GET',
          params: {},
          data: {},
          transformResponse: (response) => {
            try {
              const { content } = JSON.parse(response);
              return content.filter((item) => item.documentType === documentType);
            } catch (message) {
              notification.error({ message });
              return [];
            }
          },
        };
      },
      destroy: () => {
        return {
          url: `${prefix}/opt-permissions`,
          method: 'DELETE',
        };
      },
      // 启用开票并付款才会用到提交方法
      submit: ({ dataSet }) => {
        const settleConfigId = dataSet.getQueryParameter('settleConfigId');
        return {
          url: `${prefix}/opt-permissions/${settleConfigId}`,
          method: 'POST',
        };
      },
    },
  };
};

// 付款规则
const payRuleDS = (platModalFlag) => ({
  paging: false,
  autoQuery: false,
  selection: false,
  dataToJSON: 'all',
  forceValidate: true,
  validationGroup: 'payment',
  validationTitle: intl.get(`ssta.settleStrategy.view.settleStrategy.paymentRules`).d('付款规则'),
  fields: [
    {
      name: 'paymentTypeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.paymentTypeCode`).d('付款类型'),
      lookupCode: 'SSTA.PAYMENT_TYPE',
      required: true,
    },
    {
      name: 'paymentRangeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.paymentOrPrePaymentDimension`).d('付款/预付款核销维度'),
      lookupCode: 'SSTA.PAYMENT_RANGE',
      required: true,
    },
    {
      name: 'autoSplitRuleCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.autoSplitRule`).d('自动拆分规则'),
      lookupCode: 'SSTA.AUTO_SPLIT_RULE',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('paymentTypeCode') !== 'PAYMENT',
      },
    },
    {
      name: 'prepaymentCheckLevel',
      type: 'string',
      label: intl.get(`${commonPrompt}.prepaymentCheckLevel`).d('预付款核销校验等级'),
      lookupCode: 'SSTA.PREPAYMENT_CHECK_LEVEL',
      dynamicProps: {
        disabled: ({ record }) => record.get('paymentTypeCode') === 'PAYMENT',
        required: ({ record }) => record.get('paymentTypeCode') !== 'PAYMENT',
      },
    },
    {
      name: 'prepaymentCheckPoint',
      type: 'string',
      label: intl.get(`${commonPrompt}.prepaymentCheckPoint`).d('预付款核销校验时点'),
      lookupCode: 'SSTA.PREPAYMENT_CHECK_PIONT',
      multiple: true,
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('paymentTypeCode') === 'PAYMENT' ||
          record.get('prepaymentCheckLevel') === 'NONE',
        required: ({ record }) =>
          record.get('paymentTypeCode') === 'PREPAYMENT' &&
          record.get('prepaymentCheckLevel') !== 'NONE',
      },
      transformRequest: (value) => (isArray(value) ? value.join() : value),
      transformResponse: (value) => (value ? value.split(',') : null),
    },
    {
      name: 'prepaymentApplyContentType',
      type: 'string',
      label: intl.get(`${commonPrompt}.prepaymentWriteOffContent`).d('预付款核销内容'),
      lookupCode: 'SSTA.PREPAYMENT_APPLY_CONTENT_TYPE',
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('paymentTypeCode') === 'PAYMENT' ||
          record.get('prepaymentCheckLevel') === 'NONE',
        required: ({ record }) =>
          record.get('paymentTypeCode') === 'PREPAYMENT' &&
          record.get('prepaymentCheckLevel') !== 'NONE',
      },
    },
    {
      name: 'autoApplyPrepaymentRuleCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.prepaymentAutoWriteOffRule`).d('预付款自动核销规则'),
      lookupCode: 'SSTA.AUTO_APPLY_SPLIT_RULE',
      dynamicProps: {
        disabled: ({ record }) => record.get('paymentTypeCode') !== 'PREPAYMENT',
        // required: ({ record }) => record.get('paymentTypeCode') === 'PREPAYMENT',
      },
    },
    {
      name: 'autoApplyPayAmountRuleCode',
      type: 'string',
      label: intl
        .get(`${commonPrompt}.afterPrepayAutoWriteOffPayAmount`)
        .d('预付款自动核销后付款金额'),
      lookupCode: 'SSTA.AUTO_APPLY_PAY_AMOUNT_RULES',
      dynamicProps: {
        disabled: ({ record }) => record.get('paymentTypeCode') !== 'PREPAYMENT',
        // required: ({ record }) => record.get('paymentTypeCode') === 'PREPAYMENT',
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      const { settleConfigId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/settle-payment-ruless/${settleConfigId}`,
        method: 'GET',
        params: {},
        data: {},
      };
    },
    update: ({ data }) => {
      const { settleConfigId } = data[0];
      return {
        url: `${prefix}/settle-payment-ruless/${settleConfigId}`,
        method: 'POST',
        data,
      };
    },
    destroy: () => {
      return {
        url: `${prefix}/settle-payment-ruless`,
        method: 'DELETE',
      };
    },
  },
  // 避免启用开票并付款ds全部notication.success
  feedback: { submitSuccess() {} },
  events: {
    update: ({ value, record, name, dataSet }) => {
      if (name === 'paymentTypeCode') {
        record.set('paymentRangeCode', value === 'PAYMENT' ? null : 'SUPPLIER');
        record.set('prepaymentCheckLevel', value === 'PAYMENT' ? null : 'NONE');
        record.set('prepaymentCheckPoint', null);
      }
      if (name === 'autoSplitRuleCode') {
        dataSet.records[1].set('autoSplitRuleCode', dataSet.records[0].get('autoSplitRuleCode'));
      }
      if (name === 'prepaymentCheckLevel' && value === 'NONE') {
        record.set('prepaymentCheckPoint', null);
      }
    },
  },
});

// 付款/预付款默认金额
const payDefaultAmountDS = (platModalFlag) => ({
  paging: false,
  autoQuery: false,
  selection: false,
  dataToJSON: 'all',
  forceValidate: true,
  validationGroup: 'payment',
  validationTitle: intl
    .get(`ssta.settleStrategy.view.settleStrategy.handlePaymentAmountInit`)
    .d('付款/预付款核销默认金额'),
  fields: [
    {
      name: 'initType',
      type: 'string',
      label: intl.get(`${commonPrompt}.initType`).d('类型'),
      lookupCode: 'SSTA.PAYMENT_INIT_TYPE',
      required: true,
    },
    {
      name: 'defaultMode',
      type: 'string',
      label: intl.get(`${commonPrompt}.defaultMode`).d('默认方式'),
      required: true,
      computedProps: {
        lookupCode: ({ record }) =>
          record?.get('initType') === 'PRE_PAYMENT_AMOUNT'
            ? 'SSTA.PAYMENT_APPLY_INIT_DEFAULT_MODE'
            : 'SSTA.PAYMENT_INIT_DEFAULT_MODE',
      },
    },
  ],
  transport: {
    read: ({ data }) => {
      const { settleConfigId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/payment-amount-inits/${settleConfigId}`,
        method: 'GET',
        params: {},
        data: {},
      };
    },
    submit: ({ data, dataSet }) => {
      const { settleConfigId } = data[0];
      return {
        url: `${prefix}/payment-amount-inits/${settleConfigId}`,
        method: 'put',
        dataSet,
      };
    },
  },
  // 避免启用开票并付款ds全部notication.success
  feedback: { submitSuccess() {} },
});

// 金额调整
const invAmountAdjustDS = (platModalFlag) => ({
  autoCreate: true,
  autoQuery: false,
  dataToJSON: 'all',
  forceValidate: true,
  transport: {
    read: ({ data }) => {
      const { settleConfigId } = data;
      return {
        url: `${getPrefix(platModalFlag)}/settle-amount-settings/${settleConfigId}`,
        method: 'GET',
        data: { ...data, settleTypeCodeList: 'INVOICE' },
      };
    },
    create: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      return {
        url: `${prefix}/settle-amount-settings/${settleConfigId}`,
        method: 'POST',
        data,
      };
    },
    update: ({ data, dataSet }) => {
      const { settleConfigId } = dataSet.queryParameter;
      return {
        url: `${prefix}/settle-amount-settings/${settleConfigId}`,
        method: 'POST',
        data,
      };
    },
    destroy: () => {
      return {
        url: `${prefix}/settle-amount-settings`,
        method: 'DELETE',
      };
    },
  },
  fields: [
    {
      name: 'settleTypeCode',
      type: 'string',
      label: intl.get(`${commonPrompt}.settleTypeCode`).d('结算单类型'),
      lookupCode: 'SSTA.SETTLE_TYPE',
    },
    {
      name: 'priceEditFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.priceEditFlag`).d('允许修改单价'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'priceAllowanceCtrlType',
      type: 'string',
      lookupCode: 'SSTA.ALLOWANCE_CTRL_TYPE',
      label: intl.get(`${commonPrompt}.priceToleranceCtrlType`).d('单价允差控制类型'),
      required: true,
      computedProps: {
        required: ({ record }) => Number(record.get('priceEditFlag')),
      },
    },
    {
      name: 'priceAllowance',
      type: 'number',
      range: ['lower', 'upper'],
      step: 0.01,
      computedProps: {
        label: ({ record }) =>
          record.get('priceAllowanceCtrlType') === 'PROPORTION'
            ? `${intl.get(`${commonPrompt}.priceToleranceRange`).d('单价允差范围')}(%)`
            : intl.get(`${commonPrompt}.priceToleranceRange`).d('单价允差范围'),
      },
      validator: (value, _, record) => {
        const { lower, upper } = value || {};
        const ctrlType = record.get('priceAllowanceCtrlType');
        if (['AMOUNT', 'PROPORTION'].includes(ctrlType) && (isNil(lower) || isNil(upper))) {
          return intl.get('hzero.common.validation.notNull', {
            name: intl.get(`${commonPrompt}.priceToleranceRange`).d('单价允差范围'),
          });
        }
        if (ctrlType === 'AMOUNT' && (lower > 0 || upper < 0)) {
          return intl
            .get(`${commonPrompt}.validation.noGreater0AndnoLess0`)
            .d('左侧值（下限）不能大于0，右侧值不能小于0');
        }
        if (ctrlType === 'PROPORTION' && (lower > 0 || lower < -100 || upper < 0 || upper > 100)) {
          return intl
            .get(`${commonPrompt}.validation.betweenPlusAndMinus100`)
            .d('左侧值（下限）-100到0之间，右侧值0到100之间');
        }
      },
    },
    {
      name: 'priceAllowanceLower',
      bind: 'priceAllowance.lower',
    },
    {
      name: 'priceAllowanceUpper',
      bind: 'priceAllowance.upper',
    },
    {
      name: 'taxRateEditFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.taxRateEditFlag`).d('允许修改税率'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'taxAmountEditFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.taxAmountEditFlag`).d('允许修改税额'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'taxAmountAllowanceCtrlType',
      type: 'string',
      lookupCode: 'SSTA.ALLOWANCE_CTRL_TYPE',
      label: intl.get(`${commonPrompt}.taxToleranceCtrlType`).d('税额允差控制类型'),
      computedProps: {
        required: ({ record }) => Number(record.get('taxAmountEditFlag')),
      },
    },
    {
      name: 'taxAllowanceAmount',
      type: 'number',
      label: intl.get(`${commonPrompt}.taxAllowanceAmount`).d('税额允差'),
      step: 0.01,
      min: 0,
      defaultValue: 0,
      validator: (value, dataSet, record) => {
        if (record.get('taxAmountEditFlag') === 1) {
          const pattern = /^\d*(?:\.\d{1,2})?$/;
          if (!pattern.test(value)) {
            return intl
              .get(`${commonPrompt}.numberVerification`)
              .d('请输入有效的值，限制精度为小数点后2位。');
          }
        }
      },
      required: true,
    },
    {
      name: 'taxAllowance',
      type: 'number',
      label: intl.get(`${commonPrompt}.taxAllowanceAmountRange`).d('税额允差范围'),
      range: ['lower', 'upper'],
      step: 0.01,
      computedProps: {
        label: ({ record }) =>
          record.get('taxAmountAllowanceCtrlType') === 'PROPORTION'
            ? `${intl.get(`${commonPrompt}.taxAllowanceAmountRange`).d('税额允差范围')}(%)`
            : intl.get(`${commonPrompt}.taxAllowanceAmountRange`).d('税额允差范围'),
      },
      validator: (value, _, record) => {
        const { lower, upper } = value || {};
        const ctrlType = record.get('taxAmountAllowanceCtrlType');
        if (['AMOUNT', 'PROPORTION'].includes(ctrlType) && (isNil(lower) || isNil(upper))) {
          return intl.get('hzero.common.validation.notNull', {
            name: intl.get(`${commonPrompt}.taxAllowanceAmountRange`).d('税额允差范围'),
          });
        }
        if (ctrlType === 'AMOUNT' && (lower > 0 || upper < 0)) {
          return intl
            .get(`${commonPrompt}.validation.noGreater0AndnoLess0`)
            .d('左侧值（下限）不能大于0，右侧值不能小于0');
        }
        if (ctrlType === 'PROPORTION' && (lower > 0 || lower < -100 || upper < 0 || upper > 100)) {
          return intl
            .get(`${commonPrompt}.validation.betweenPlusAndMinus100`)
            .d('左侧值（下限）-100到0之间，右侧值0到100之间');
        }
      },
    },
    {
      name: 'taxAllowanceAmountLower',
      bind: 'taxAllowance.lower',
    },
    {
      name: 'taxAllowanceAmountUpper',
      bind: 'taxAllowance.upper',
    },
    {
      name: 'unitBatchEditFlag',
      type: 'boolean',
      label: intl.get(`${commonPrompt}.unitBatchEditFlag`).d('允许修改每'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
  ],
});

const autoFillDS = (documentType, settleConfigId, platModalFlag) => {
  const labelMap = {
    BILL: intl.get(`${commonPrompt}.billAutoFillTempFromPool`).d('来源结算池的对账行自动填单模版'),
    INVOICE: intl
      .get(`${commonPrompt}.invAutoFillTempFromPool`)
      .d('来源结算池的发票申请行自动填单模版'),
    PAYMENT: intl
      .get(`${commonPrompt}.payAutoFillTempFromInv`)
      .d('来源发票申请行的付款申请行自动填单模版'),
  };
  return {
    autoQuery: true,
    forceValidate: true,
    fields: [
      {
        name: 'templateLov',
        type: 'object',
        label: labelMap[documentType],
        lovCode: 'SSTA.SETTLE_AUTO_FILL',
        lovPara: { type: documentType },
        required: true,
        ignore: 'always',
      },
      {
        name: 'templateCode',
        bind: 'templateLov.templateCode',
      },
      {
        name: 'templateName',
        bind: 'templateLov.templateName',
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${getPrefix(platModalFlag)}/auto-fill-configs/${settleConfigId}`,
          method: 'GET',
          data: { ...data, documentType },
        };
      },
      update: ({ data }) => {
        return {
          url: `${prefix}/auto-fill-configs`,
          method: 'PUT',
          data: { ...data[0], documentType, settleConfigId, tenantId: organizationId },
        };
      },
    },
  };
};

const uxTitleCssDS = () => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'cssJson',
        type: 'string',
        lookupCode: 'SSTA.CSS_FIELD',
        multiple: true,
        textField: 'meaning',
        computedProps: {
          disabled: ({ record }) => {
            const displayAreaArr = record?.get('displayArea') || [];
            //  【显示区域】没值时，【加粗字体】禁用；
            // 当【显示区域】仅选中 单号币种总额标题 或 发票价格差异等式，则【加粗字体】禁用，
            // 即【显示区域】只要选中 未付款金额等式 或者 尾差金额等式时，【加粗字体】可编辑
            return (
              !displayAreaArr.length ||
              !intersection(displayAreaArr, ['Tail Difference Equation', 'Unpaid Amount Equation'])
                .length
            );
          },
        },
        transformRequest: (value) => (isArray(value) ? JSON.stringify(value) : value),
        transformResponse: (value) => {
          let newValue = null;
          if (value) {
            try {
              newValue = JSON.parse(value);
            } catch {
              newValue = null;
            }
          }

          return newValue;
        },
      },
      {
        name: 'displayArea',
        type: 'string',
        lookupCode: 'SSTA.DISPLAY_AREA',
        multiple: true,
        required: true,
        textField: 'meaning',
        transformRequest: (value) => (isArray(value) ? JSON.stringify(value) : value),
        transformResponse: (value) => {
          let newValue = null;
          if (value) {
            try {
              newValue = JSON.parse(value);
            } catch {
              newValue = null;
            }
          }

          return newValue;
        },
      },
    ],
    transport: {
      read: ({ data }) => {
        const { settleConfigId } = data;
        return {
          url: `${prefix}/settle-area-config/${settleConfigId}`,
          method: 'GET',
          params: {},
          data: { ...data, area: 'UX_TITLE' },
        };
      },
      submit: ({ data }) => {
        return {
          url: `${prefix}/settle-area-config`,
          method: 'PUT',
          data: data[0],
        };
      },
    },
  };
};

// 条件配置相关DS
// 列表ds
const configConditionListDS = () => {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'conditionName',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.common.conditionName').d('策略名称'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.common.description').d('策略描述'),
      },
      {
        name: 'priority',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.common.priority').d('优先级'),
      },
      {
        name: 'conditionExpression',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.common.conditionExpression').d('表达式'),
      },
      {
        name: 'operation',
        type: 'string',
        label: intl.get('hzero.common.table.column.options').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${prefix}/settle-config-conds/list`,
          method: 'GET',
        };
      },
    },
  };
};
// 特性条件 ds
const getCondOperatorDs = () => {
  return [
    {
      meaning: intl.get('ssta.settleStrategy.model.rulesDefinition.equals').d('等于'),
      value: 'EQUALS',
    },
    {
      meaning: intl.get('ssta.settleStrategy.model.rulesDefinition.in').d('包含'),
      value: 'IN',
    },
    {
      meaning: intl.get('ssta.settleStrategy.model.rulesDefinition.notIn').d('不包含'),
      value: 'NOT_IN',
    },
    {
      meaning: intl.get('ssta.settleStrategy.model.rulesDefinition.notequals').d('不等于'),
      value: 'NOTEQUALS',
    },
    {
      meaning: intl.get('ssta.settleStrategy.model.rulesDefinition.exists').d('不为空'),
      value: 'EXISTS',
    },
    {
      meaning: intl.get('ssta.settleStrategy.model.rulesDefinition.not_exists').d('为空'),
      value: 'NOT_EXISTS',
    },
  ];
};

const conditionDS = (selectDs) => {
  const optionsDs = [];
  return {
    autoCreate: true,
    fields: [
      {
        name: 'leftValue',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.config.fieldSelect').d('字段选择'),
        required: true,
        options: selectDs,
        textField: language === 'en_US' ? 'fieldNameEn' : 'fieldName',
        valueField: 'fieldNum',
      },
      {
        name: 'lovCode', // 源字段 值集编码
        type: 'string',
      },
      {
        name: 'componentType', // 源字段组件类型
        type: 'string',
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.common.fieldCondition').d('字段条件'),
        required: true,
        textField: 'meaning',
        options: new DataSet({
          selection: 'single',
          data: getCondOperatorDs(),
        }),
      },
      {
        dynamicProps: {
          multiple: ({ record }) => {
            return ['IN', 'NOT_IN'].includes(record.get('operator'));
          },
          lovCode: ({ record }) => {
            if (record.get('componentType') === 'LOV') {
              return record.get('lovCode');
            } else {
              return null;
            }
          },
          type: ({ record }) => {
            return record.get('componentType') === 'LOV' ? 'object' : 'string';
          },
          disabled: ({ record }) => {
            return ['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
          },
          required: ({ record }) => {
            return !['EXISTS', 'NOT_EXISTS'].includes(record.get('operator'));
          },

          options: ({ record }) => {
            if (record.get('componentType') === 'SELECT') {
              if (!['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(record.get('operator'))) {
                return null;
              } else {
                return (optionsDs.find((od) => od.lookupCode === record.get('lovCode')) || {}).ds;
              }
            }
          },
        },
        name: 'rightValue',
        label: intl.get('ssta.settleStrategy.model.config.fieldValue').d('字段值'),
        transformRequest: (value, record = {}) => {
          const isNumberType = !['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(
            record.get('operator')
          );
          if (isNumberType) return value;
          const componentType = record.get('componentType');
          if (componentType === 'LOV') {
            const valueField = record.get('rightLovValueField');
            return ['IN', 'NOT_IN'].includes(record.get('operator'))
              ? JSON.stringify(value.map((v) => v[valueField]))
              : value[valueField];
          } else {
            return isArray(value) ? JSON.stringify(value) : value;
          }
        },
        transformResponse: (value, object) => {
          const {
            operator,
            componentType,
            rightValueMeaning,
            rightLovValueField,
            rightLovMeaningField,
          } = object;
          if (!['EQUALS', 'IN', 'NOTEQUALS', 'NOT_IN'].includes(operator)) {
            return value;
          }
          if (componentType === 'SELECT') {
            pushLookupCodeArray(optionsDs, object.lovCode);
          }

          if (componentType === 'LOV') {
            return ['IN', 'NOT_IN'].includes(operator)
              ? JSON.parse(value || '[]').map((v, index) => {
                  return {
                    [rightLovMeaningField]: JSON.parse(rightValueMeaning || '[]')[index],
                    [rightLovValueField]: v,
                  };
                })
              : {
                  ...value,
                  [rightLovMeaningField]: rightValueMeaning,
                  [rightLovValueField]: value,
                };
          } else {
            let val = value;
            try {
              val = JSON.parse(value);
            } catch (e) {
              val = value;
            }
            return val;
          }
        },
        validator: (value) => {
          if (isArray(value) && value.length === 0) {
            return intl.get('hzero.common.validation.notNull', {
              name: intl.get('ssta.settleStrategy.model.config.fieldValue').d('字段值'),
            });
          }
        },
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'rightValueMeaning',
      },
      {
        name: 'rightLovMeaningField',
      },
      {
        name: 'rightLovValueField',
      },
    ],
    selection: false,
    paging: false,
    events: {
      update: ({ record, name, value }) => {
        if (name === 'leftValue') {
          const selectRecord = selectDs?.find((v) => v?.get('fieldNum') === value);
          const { lovCode, componentType } = selectRecord?.get(['lovCode', 'componentType']) || {};
          if (componentType === 'SELECT') {
            pushLookupCodeArray(optionsDs, lovCode);
          }
          record.set({
            operator: null,
            rightValueMeaning: null,
            rightValue: null,
          });
        }
        if (name === 'operator') {
          record.set('rightValue', null);
          record.set('rightValueMeaning', null);
        }

        if (name === 'rightValue') {
          const field = record.getField('rightValue');
          const rightLovValueField = field.get('valueField');
          const rightLovMeaningField = field.get('textField');
          if (record.get('componentType') === 'LOV') {
            record.set({
              rightLovValueField,
              rightLovMeaningField,
            });
          } else {
            record.set({
              rightLovMeaningField: 'meaning',
              rightLovValueField: 'value',
            });
          }

          if (['IN', 'NOT_IN'].includes(record.get('operator'))) {
            if (record.get('componentType') === 'LOV') {
              record.set({
                rightValueMeaning: JSON.stringify(
                  (value || []).map((v) => v[rightLovMeaningField])
                ),
              });
            } else {
              record.set({
                rightValueMeaning: JSON.stringify((value || []).map((v) => field.getText(v))),
              });
            }
          } else {
            record.set({
              rightValueMeaning: field.getText(),
            });
          }
        }
      },
    },
  };
};

// 如果渲染的是 lookup 下拉框，查询下拉框数据，放到数组中
function pushLookupCodeArray(optionsDs, lookupCode) {
  if (optionsDs.filter((ds) => ds.lookupCode === lookupCode).length <= 0) {
    optionsDs.push({
      lookupCode,
      ds: new DataSet({
        selection: 'single',
        autoQuery: true,
        paging: false,
        transport: {
          read: ({ params }) => {
            return {
              url: `/hpfm/v1/${organizationId}/lovs/data?lovCode=${lookupCode}`,
              method: 'GET',
              params: omit(params, ['page', 'size']),
            };
          },
        },
      }),
    });
  }
  return optionsDs;
}

// 用户自定义条件Ds
const customizeConditionCombinationDS = (recordDataSet, configType, activeKey) => {
  const typeCode = recordDataSet?.get('typeCode');
  const isCollaborativeMode = configType === 'collaborativeMode';
  return {
    autoCreate: false,
    primaryKey: 'conditionId4',
    cacheSelection: false,
    forceValidate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'conditionCombination',
        type: 'string',
        pattern: /^((AND)|(OR)|[0-9 )(]+)+$/,
        required: true,
        help: intl
          .get('ssta.settleStrategy.view.message.title.tips3')
          .d('使用条件编号及AND、OR编写运算规则。示例(1 OR 2) AND 3'),
        label: intl.get('ssta.settleStrategy.view.message.title.calculatLogic').d('筛选逻辑'),
        validator: (value) => {
          if (/^[A-Z0-9 )(]+$/.test(value)) {
            return /^((AND)|(OR)|[0-9 )(]+)+$/.test(value);
          } else {
            return intl.get('ssta.settleStrategy.validator.pattern_mismatch').d('请输入有效的值');
          }
        },
      },
      {
        name: 'collaborativeModeCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.collaborativeModeCode`).d('协同模式'),
        lookupCode: 'SSTA.COOPERATION_MODE',
        required: isCollaborativeMode,
      },
      {
        name: 'supplierViewFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.supplierViewFlag`).d('销售方可见'),
        lookupCode: 'HPFM.FLAG',
        defaultValue: '1',
        dynamicProps: {
          required: ({ record }) =>
            record.get('collaborativeModeCode') !== 'DOUBLE' &&
            typeCode !== 'CANCEL' &&
            isCollaborativeMode,
          disabled: ({ record }) =>
            record.get('collaborativeModeCode') === 'DOUBLE' || typeCode === 'CANCEL',
        },
      },
      {
        name: 'founderCampCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.founderCamp`).d('创建方阵营'),
        lookupCode:
          activeKey.toUpperCase() === 'BILL' ? 'SSTA.BILL_FOUNDER_CAMP' : 'SSTA.FOUNDER_CAMP',
        defaultValue: 'UNLIMIT',
        computedProps: {
          required: ({ record }) =>
            typeCode === 'CONFIRM' &&
            record.get('collaborativeModeCode') === 'DOUBLE' &&
            isCollaborativeMode,
          disabled: ({ record }) =>
            !(typeCode === 'CONFIRM' && record.get('collaborativeModeCode') === 'DOUBLE'),
        },
      },
      {
        name: 'approvedMethodCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.approvedMethodCode`).d('审批方式'),
        lookupCode: 'SSTA.APPROVAL_METHOD',
        required: !isCollaborativeMode,
      },
      {
        name: 'conditionName',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.common.conditionName').d('策略名称'),
        required: true,
        defaultValue: '1',
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('ssta.settleStrategy.model.common.description').d('策略描述'),
      },
      {
        name: 'priority',
        type: 'number',
        label: intl.get('ssta.settleStrategy.model.common.priority').d('优先级'),
        required: true,
        defaultValue: 1,
      },
      {
        name: 'enableCondFlag',
        type: 'boolean',
        label: intl
          .get(`ssta.settleStrategy.model.settleStrategy.conditionEnableFlag`)
          .d('启用条件配置'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'conditionType',
        type: 'string',
        // label: intl.get('ssta.settleStrategy.model.rulesDefinition.conditionType').d('策略逻辑'),
        required: true,
        defaultValue: 'AND',
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${prefix}/settle-config-conds/create-or-update`,
          data: data[0],
          method: 'POST',
        };
      },
    },
  };
};

const conditionSelectDS = ({ paging, queryFlag, ...queryParameter }) => {
  return {
    paging,
    queryParameter,
    autoQuery: queryFlag,
    selection: 'single',
    transport: {
      read() {
        return {
          url: `${prefix}/settle-config-conds/field-list`,
          method: 'GET',
        };
      },
    },
  };
};

// 静默签
const slientSignatureDS = (settleConfigId, documentType) => {
  return {
    autoCreate: true,
    autoQuery: true,
    forceValidate: true,
    fields: [
      {
        name: 'signatureConfigId',
        type: 'string',
        label: intl.get(`${commonPrompt}.signatureConfigId`).d('静默签配置id'),
      },
      {
        name: 'silentSealId',
        type: 'string',
        label: intl.get(`${commonPrompt}.silentSealId`).d('静默签指定印章'),
        lookupCode: 'SPCM_SILENT_SEAL',
        required: true,
      },
      {
        name: 'userIdLov',
        type: 'object',
        label: intl.get(`${commonPrompt}.slientUser`).d('E签宝SaaS静默签解约场景用章人'),
        lovCode: 'AMKT.SIGN_AUTH_USER_LIST',
        required: true,
        ignore: 'always',
      },
      {
        name: 'userId',
        bind: 'userIdLov.userId',
      },
      {
        name: 'userName',
        bind: 'userIdLov.authName',
      },
    ],
    transport: {
      read: () => ({
        url: `${prefix}/signature-config/${settleConfigId}?documentType=${documentType}`,
        method: 'GET',
      }),
      submit: ({ data }) => {
        return {
          url: `${prefix}/signature-config/${settleConfigId}`,
          method: 'POST',
          data: [
            {
              ...data[0],
              documentType,
              tenantId: organizationId,
              settleConfigId,
              silentSignatureFlag: 1, // 只有启用静默签的时候才可编码
            },
          ],
        };
      },
    },
  };
};

export {
  tableDS,
  headerDS,
  collaborativeModeDS,
  approveMethodDS,
  dimensionDS,
  purOrderTypeDS,
  orderTypeDS,
  amountHideInnerDS,
  amountHideSubDS,
  amountHideOuterTableDS,
  amountHideOuterAllDS,
  linesLimitDS,
  syncErpDS,
  billPriceAdjustDS,
  pricingModelTableDS,
  pricingModelFromDS,
  pricingModelLimitDS,
  priceToSettleAutoFillTemplateDS,
  toleAutoAdjustDS,
  toleManualAdjustDS,
  payOprPermissionDS,
  payRuleDS,
  payDefaultAmountDS,
  invAmountAdjustDS,
  autoFillDS,
  checkRuleDS,
  uxTitleCssDS,
  paymentControlDS,
  conditionDS,
  customizeConditionCombinationDS,
  conditionSelectDS,
  configConditionListDS,
  purInvTypeDS,
  itemTypeDS,
  slientSignatureDS,
  paymentFundPlanControlDS,
};
