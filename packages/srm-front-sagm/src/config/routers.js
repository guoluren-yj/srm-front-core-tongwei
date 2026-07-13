/**
 * 在router.js中已经统一注入了path的服务名models和component的模块路径
 */
module.exports = [
  {
    authorized: true,
    path: '/sagm/data-import/:code',
    component: () => import('../routes/himp/CommonImport'),
  },
  {
    // title: '策略维度配置',
    // authorized: true,
    path: '/s2-mall/sagm/strategy-config',
    component: () => import('../routes/sagm/StrategyConfig'),
  },
  {
    // title: '价格策略管理',
    // authorized: true,
    path: '/s2-mall/sagm/price-strategy',
    FilterSupplier: true,
    component: () => import('../routes/sagm/PriceStrategy'),
  },
  // {
  //   // title: '销售协议管理',
  //   // authorized: true,
  //   path: '/s2-mall/sagm/sale-agreement',
  //   FilterSupplier: true,
  //   components: [
  //     {
  //       path: '/s2-mall/sagm/sale-agreement/list',
  //       FilterSupplier: true,
  //       component: () => import('../routes/sagm/SaleAgreement'),
  //     },
  //     {
  //       path: '/s2-mall/sagm/sale-agreement/detail/:status', // type: 区分电商/目录化协议, status: 区分只读/编辑状态
  //       FilterSupplier: true,
  //       component: () => import('../routes/sagm/SaleAgreement/Detail'),
  //     },
  //   ],
  // },
  {
    // title: '采买权限管理',
    path: '/s2-mall/sagm/product-authority',
    FilterSupplier: true,
    components: [
      {
        path: '/s2-mall/sagm/product-authority/list',
        // component: () => import('../routes/sagm/ProductAuthority'),
        component: () => import('../routes/sagm/ProductAuthorityNew'),
        FilterSupplier: true,
      },
      {
        FilterSupplier: true,
        path: '/s2-mall/sagm/product-authority/detail/:status',
        component: () => import('../routes/sagm/ProductAuthorityNew/Detail'),
      },
    ],
  },
  {
    // title: '采买权限维度',
    path: '/sagm/auth-dimension',
    component: () => import('../routes/sagm/AuthDimension'),
  },
  {
    // title: '运费规则',
    path: '/sagm/freight-rule',
    FilterSupplier: true,
    component: () => import('../routes/sagm/FreightRule'),
  },
  {
    // title: '销售协议工作台',
    path: '/sagm/sale-agreement-workbench',
    FilterSupplier: true,
    components: [
      {
        path: '/sagm/sale-agreement-workbench/list',
        FilterSupplier: true,
        component: () => import('../routes/sagm/SagmWorkbench'),
      },
      {
        path: '/sagm/sale-agreement-workbench/detail/:status', // status 为read时只读
        FilterSupplier: true,
        component: () => import('../routes/sagm/SagmWorkbench/Detail'),
      },
    ],
  },
  // 商城协议工作台
  {
    path: '/sagm/sagm-protocol-workbench',
    FilterSupplier: true,
    components: [
      {
        path: '/sagm/sagm-protocol-workbench/list',
        component: () => import('../routes/sagm/ProtocolWorkbench'),
        FilterSupplier: true,
      },
      {
        path: '/sagm/sagm-protocol-workbench/data-import/:code',
        FilterSupplier: true,
        component: () => import('../routes/himp/CommonImport'),
      },
      {
        path: '/sagm/sagm-protocol-workbench/detail/:status',
        models: [() => import('../models/mallProtocolManagement.js')],
        component: () => import('../routes/sagm/ProtocolWorkbench/Detail'),
      },
    ],
  },

  // 商城协议管理（新）
  {
    path: '/small/mall-protocol-management',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/small/mall-protocol-management/list',
        models: [() => import('../models/mallProtocolManagement.js')],
        component: () => import('../routes/small/MallProtocolManagement'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-protocol-management/handwork',
        models: [() => import('../models/mallProtocolManagement.js')],
        component: () => import('../routes/small/MallProtocolManagement/HandWork'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-protocol-management/data-import/:code',
        models: [],
        component: () => import('../routes/himp/CommonImport'),
      },
      {
        path: '/small/mall-protocol-management/check-detail/:agreementId',
        models: [() => import('../models/mallProtocolManagement.js')],
        component: () => import('../routes/small/MallProtocolManagement/CheckDetail'),
        FilterSupplier: true,
      },
      // {
      //   path: '/small/mall-protocol-management/quote-price-lib',
      //   models: [],
      //   component: () => import('../routes/small/QuotePriceLib'),
      //   FilterSupplier: true,
      // },
      {
        path: '/small/mall-protocol-management/history-detail/:agreementId/:versionNum',
        models: [() => import('../models/mallProtocolManagement.js')],
        component: () => import('../routes/small/MallProtocolManagement/HistoryDetail'),
        FilterSupplier: true,
      },
    ],
  },
  // 我收到的商城协议
  {
    path: '/small/mall-received-agreement',
    components: [
      {
        path: '/small/mall-received-agreement/list',
        component: () => import('../routes/sagm/SagmReceived'),
      },
      {
        path: '/small/mall-received-agreement/detail/:agreementId',
        component: () => import('../routes/sagm/SagmReceived/Detail'),
      },
      {
        path: '/small/mall-received-agreement/history-detail/:agreementId/:versionNum',
        component: () => import('../routes/sagm/SagmReceived/Detail'),
      },
    ],
  },
  // 协议审批
  {
    path: '/small/mall-agreement-approve',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/small/mall-agreement-approve/list',
        models: [() => import('../models/mallAgreementApprove.js')],
        component: () => import('../routes/small/MallAgreementApprove'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-agreement-approve/detail/:agreementId',
        models: [() => import('../models/mallAgreementApprove.js')],
        component: () => import('../routes/small/MallAgreementApprove/Detail'),
        FilterSupplier: true,
      },
    ],
  },
  // 协议发布
  {
    path: '/small/mall-agreement-publish',
    models: [],
    FilterSupplier: true,
    components: [
      {
        path: '/small/mall-agreement-publish/list',
        models: [() => import('../models/mallAgreementApprove.js')],
        component: () => import('../routes/small/MallAgreementApprove'),
        FilterSupplier: true,
      },
      {
        path: '/small/mall-agreement-publish/detail/:agreementId',
        models: [() => import('../models/mallAgreementApprove.js')],
        component: () => import('../routes/small/MallAgreementApprove/Detail'),
        FilterSupplier: true,
      },
    ],
  },

  // 采买组织映射
  // {
  //   path: '/small/purchase-manage',
  //   FilterSupplier: true,
  //   component: () => import('../routes/small/PurchaseManage'),
  // },
  // 商城采买组织管理 - 新
  // type: set - 新租户配置页面 use - 采买组织
  {
    path: '/small/purchase-manage',
    FilterSupplier: true,
    // authorized: true,
    component: () => import('../routes/sagm/PurchaseManageNew'),
  },
  // 费用规则管理
  {
    path: '/scux/sagm/fee-rule-management',
    FilterSupplier: true,
    components: [
      {
        path: '/scux/sagm/fee-rule-management/list',
        component: () => import('../routes/scux/FeeRuleManagement'),
      },
    ],
  },
];
