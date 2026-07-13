/*
 * @Descripttion:
 * @version: 0.0.1
 * @Author: lilingfeng <lingfeng.li@going-link.com>
 * @Date: 2021-08-20 14:24:55
 * @LastEditors: yanglin
 * @LastEditTime: 2023-03-23 15:45:54
 */
module.exports = [
  // 政府项目申请信息
  {
    path: '/scux/application-information',
    component: () => import('../routes/ApplicationInformation'),
  },
  // 状态机分类定义
  {
    path: '/scux/definition-machine-classification',
    component: () => import('../routes/DefinitionMachineCF'),
  },

  // 状态机定义
  {
    path: '/scux/definition-state-machine',
    component: () => import('../routes/DefinitionStateMachine'),
    FilterSupplier: true, // 拦截供应商
  },
  {
    path: '/siec/pcnType-definition', // 对应菜单路径
    FilterSupplier: true, // 拦截供应商
    components: [
      {
        path: '/siec/pcnType-definition/list',
        component: () => import('../routes/PcnTypeDefinition'),
        FilterSupplier: true, // 拦截供应商
      },
    ],
  },
  // 模具主数据
  {
    path: '/scux/mould',
    FilterSupplier: true,
    models: [],
    components: [
      {
        path: '/scux/mould/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/Mould'),
      },
      {
        path: '/scux/mould/detail',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/Mould/Detail'),
      },
    ],
  },
  {
    path: '/pub/scux/mould/read',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/Mould/Read'),
  },
  // 模具台账列表(供)
  {
    path: '/scux/mould-account',
    models: [() => import('../models/mouldAccount.js')],
    components: [
      {
        path: '/scux/mould-account/list',
        models: [() => import('../models/mouldAccount.js')],
        component: () => import('../routes/MouldAccountNew/MaList'),
      },
      {
        path: '/scux/mould-account/create',
        models: [],
        component: () => import('../routes/MouldAccountNew/MaAccountDetail/Edit'),
      },
      {
        path: '/scux/mould-account/edit/:id',
        models: [],
        component: () => import('../routes/MouldAccountNew/MaAccountDetail/Edit'),
      },
      {
        path: '/scux/mould-account/readOnly/:id',
        models: [],
        component: () => import('../routes/MouldAccountNew/MaAccountDetail/ReadOnly'),
      },
      {
        path: '/scux/mould-account/readChangeOnly/:id',
        models: [],
        component: () => import('../routes/MouldAccountNew/MaAccountDetail/ChangeRead'),
      },
      {
        path: '/scux/mould-account/detail',
        // authorized: true,
        title: '模具台账详情',
        component: () => import('../routes/MouldAccount/MaDetail'),
      },
    ],
  },
  // 模具台账列表(采)
  {
    path: '/scux/mould-account-purchaser',
    models: [() => import('../models/mouldAccount.js')],
    FilterSupplier: true, // 拦截供应商
    components: [
      {
        path: '/scux/mould-account-purchaser/list',
        models: [() => import('../models/mouldAccount.js')],
        FilterSupplier: true,
        component: () => import('../routes/MouldAccountNew/MaList'),
      },
      {
        path: '/scux/mould-account-purchaser/create',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/MouldAccountNew/MaAccountDetail/Edit'),
      },
      {
        path: '/scux/mould-account-purchaser/edit/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/MouldAccountNew/MaAccountDetail/Edit'),
      },
      {
        path: '/scux/mould-account-purchaser/readOnly/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/MouldAccountNew/MaAccountDetail/ReadOnly'),
      },
      {
        path: '/scux/mould-account-purchaser/readChangeOnly/:id',
        FilterSupplier: true,
        models: [],
        component: () => import('../routes/MouldAccountNew/MaAccountDetail/ChangeRead'),
      },
      {
        path: '/scux/mould-account-purchaser/detail',
        // authorized: true,
        models: [],
        FilterSupplier: true,
        title: '模具台账详情',
        component: () => import('../routes/MouldAccount/MaDetail'),
      },
    ],
  },
  // 二开导入路由
  {
    path: '/scux/mould-account-purchaser/data-import/:code',
    models: [],
    FilterSupplier: true,
    component: () => import('../routes/components/CommentImport'),
    authorized: true,
  },

  /**
   * 工作流页面
   */
  {
    path: '/pub/scux/mould-account/detail',
    authorized: true,
    component: () => import('../routes/MouldApprove'),
  },

  // 计划单创建/维护
  {
    path: '/scux/qwkj/plan-sheets',
    models: [],
    components: [
      {
        path: '/scux/qwkj/plan-sheets/list',
        models: [
          () => import('../models/planSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheet'),
      },
      {
        path: '/scux/qwkj/plan-sheets/detail/:id',
        models: [
          () => import('../models/planSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheet/Detail'),
      },
      {
        path: '/scux/qwkj/plan-sheets/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
        models: [],
      },
    ],
  },

  // 计划单确认
  {
    path: '/scux/qwkj/plan-sheets-confirm',
    models: [],
    components: [
      {
        path: '/scux/qwkj/plan-sheets-confirm/list',
        models: [
          () => import('../models/planSheetConfirm.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheetConfirm'),
      },
      {
        // 批量导入
        path: '/scux/qwkj/plan-sheets-confirm/data-import/:code',
        component: () => import('../routes/himp/CommentImport'),
      },
      {
        path: '/scux/qwkj/plan-sheets-confirm/detail/:id',
        models: [
          () => import('../models/planSheetConfirm.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/PlanSheetConfirm/Detail'),
      },
    ],
  },

  // 我发出的计划单
  {
    path: '/scux/qwkj/my-plan-sheets',
    models: [],
    components: [
      {
        path: '/scux/qwkj/my-plan-sheets/list',
        models: [
          () => import('../models/myPlanSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/MyPlanSheet'),
      },
      {
        path: '/scux/qwkj/my-plan-sheets/detail/:id',
        models: [
          () => import('../models/myPlanSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/MyPlanSheet/Detail'),
      },
    ],
  },

  // 我收到的计划单
  {
    path: '/scux/qwkj/my-received-plan-sheets',
    models: [],
    components: [
      {
        path: '/scux/qwkj/my-received-plan-sheets/list',
        models: [
          () => import('../models/myReceivedPlanSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/MyReceivedPlanSheet'),
      },
      {
        path: '/scux/qwkj/my-received-plan-sheets/detail/:id',
        models: [
          () => import('../models/myReceivedPlanSheet.js'),
          () => import('../models/planSheetCommon.js'),
        ],
        component: () => import('../routes/MyReceivedPlanSheet/Detail'),
      },
    ],
  },
  // 协作单功能
  {
    path: '/scux/collaboration-single-function',
    components: [
      {
        path: '/scux/collaboration-single-function/list',
        component: () => import('../routes/CollaborationSinFun'),
      },
      {
        path: '/scux/collaboration-single-function/create',
        component: () => import('../routes/CollaborationSinFun/Details'),
      },
      {
        path: '/scux/collaboration-single-function/update/:customizeHeaderId',
        component: () => import('../routes/CollaborationSinFun/Details'),
      },
      {
        path: '/scux/collaboration-single-function/readOnlyDetails/:customizeHeaderId',
        component: () => import('../routes/CollaborationSinFun/DetailsReadOnly'),
      },
      {
        path: '/scux/collaboration-single-function/data-import/:code',
        component: () => import('../routes/components/CommentImport'),
        models: [],
      },
    ],
  },

  // 泛旅游库存查询
  {
    path: '/scux/inventory-search',
    component: () => import('../routes/InventoryManage'),
  },
  // 泛旅游库存管理
  {
    path: '/scux/inventory-manage',
    components: [
      {
        path: '/scux/inventory-manage/list',
        component: () => import('../routes/InventoryManage/Management'),
      },
      {
        path: '/scux/inventory-manage/create/:status',
        component: () => import('../routes/InventoryManage/Management/Detail'),
      },
      {
        path: '/scux/inventory-manage/detail/:inventoryManageHeaderId/:status',
        component: () => import('../routes/InventoryManage/Management/Detail'),
      },
      {
        path: '/scux/inventory-manage/data-import/:code',
        component: () => import('../routes/components/CommentImport'),
        models: [],
      },
    ],
  },
  // 泛旅游库存领用
  {
    path: '/scux/inventory-receiving',
    components: [
      {
        path: '/scux/inventory-receiving/list',
        component: () => import('../routes/InventoryManage/Receiving'),
      },
      {
        path: '/scux/inventory-receiving/detail/:inventoryReceiveHeaderId/:status',
        component: () => import('../routes/InventoryManage/Receiving/Detail'),
      },
    ],
  },
  // 库存领用工作流
  {
    path: '/pub/scux/inventory-receiving/detail/:inventoryReceiveHeaderId/:status',
    key: '/pub/scux/inventory-receiving/detail/:inventoryReceiveHeaderId/:status',
    authorized: true,
    component: () => import('../routes/InventoryManage/Receiving/Detail'),
    FilterSupplier: true,
  },
  // 模具申请单
  {
    path: '/scux/mould-req-purchaser',
    FilterSupplier: true,
    models: [],
    components: [
      {
        path: '/scux/mould-req-purchaser/list',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/MouldPurchaserReq'),
      },
      {
        path: '/scux/mould-req-purchaser/change/:id',
        models: [],
        component: () => import('../routes/MouldPurchaserReq/Detail/Edit/changeIndex.js'),
      },
      {
        path: '/scux/mould-req-purchaser/create',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/MouldPurchaserReq/Detail/Edit'),
      },
      {
        path: '/scux/mould-req-purchaser/edit/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/MouldPurchaserReq/Detail/Edit'),
      },
      {
        path: '/scux/mould-req-purchaser/query/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/MouldPurchaserReq/Detail/ReadOnly'),
      },
      {
        path: '/scux/mould-req-purchaser/approved/:id',
        models: [],
        FilterSupplier: true,
        component: () => import('../routes/MouldPurchaserReq/Detail/ReadOnly'),
      },
    ],
  },
  // 模具申请单-供应商
  {
    path: '/scux/mould-req-supplier',
    models: [],
    components: [
      {
        path: '/scux/mould-req-supplier/list',
        models: [],
        component: () => import('../routes/MouldPurchaserReq/supplierIndex.js'),
      },
      {
        path: '/scux/mould-req-supplier/create',
        models: [],
        component: () => import('../routes/MouldPurchaserReq/Detail/Edit/supplierReqIndex.js'),
      },
      {
        path: '/scux/mould-req-supplier/edit/:id',
        models: [],
        component: () => import('../routes/MouldPurchaserReq/Detail/Edit/supplierReqIndex.js'),
      },
      {
        path: '/scux/mould-req-supplier/change/:id',
        models: [],
        component: () => import('../routes/MouldPurchaserReq/Detail/Edit/supplierChange.js'),
      },
      {
        path: '/scux/mould-req-supplier/query/:id',
        models: [],
        component: () => import('../routes/MouldPurchaserReq/Detail/ReadOnly/supplierIndex.js'),
      },
      {
        path: '/scux/mould-req-supplier/approved/:id',
        models: [],
        component: () => import('../routes/MouldPurchaserReq/Detail/ReadOnly/supplierIndex.js'),
      },
    ],
  },
  // 工作流
  {
    path: '/pub/scux/mould-req-purchaser/query/:id',
    authorized: true,
    component: () => import('../routes/MouldPurchaserReq/Detail/ReadOnly'),
    FilterSupplier: true,
  },
   // 客户管理
   {
    path: '/scux/customer-management',
    components: [
      {
        path: '/scux/customer-management/list',
        component: () => import('../routes/CustomerManagement/index'),
      },
      {
        path: '/scux/customer-management/detail/:id',
        component: () => import('../routes/CustomerManagement/detail.js'),
      },
    ],
  },
];
