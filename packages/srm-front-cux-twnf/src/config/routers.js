module.exports = [
  // 索赔单创建 - 供应商
  {
    path: '/scux/claim-create-sup',
    models: [],
    components: [
      {
        path: '/scux/claim-create-sup/list',
        models: [() => import('../models/sqam/createClaim.js')],
        component: () => import('../routes/scux/CreateClaimSup'),
      },
      {
        path: '/scux/claim-create-sup/create',
        models: [() => import('../models/sqam/createClaim.js'), () => import('../models/sqam/sqamCommon.js')],
        component: () => import('../routes/scux/CreateClaimSup/Detail'),
      },
      {
        path: '/scux/claim-create-sup/detail/:id',
        models: [() => import('../models/sqam/createClaim.js'), () => import('../models/sqam/sqamCommon.js')],
        component: () => import('../routes/scux/CreateClaimSup/Detail'),
      },
    ],
  },
  {
    path: '/scux/claim-query-sup',
    components: [
      {
        path: '/scux/claim-query-sup/list',
      },
      {
        path: '/scux/claim-query-sup/detail',
      },
    ],
  },
  {
    path: '/scux/claim-query-sup',
    models: [],
    components: [
      {
        path: '/scux/claim-query-sup/list',
        models: [() => import('../models/sqam/myClaimForm.js')],
        component: () => import('../routes/scux/MyClaimFormSup'),
      },
      {
        path: '/scux/claim-query-sup/detail',
        models: [() => import('../models/sqam/myClaimForm.js'), () => import('../models/sqam/sqamCommon.js')],
        component: () => import('../routes/scux/MyClaimFormSup/Detail'),
      },
    ],
  },
  {
    path: '/scux/open-new-item-modal',
    component: () => import('../routes/sprm/PurchaseExecution/components/NewItemModal'),
  },
  {
    path: '/scux/complaint-workbench',
    components: [
      {
        path: '/scux/complaint-workbench/list',
        component: () => import('../routes/scux/ComplaintWorkbench/List'),
      },
      {
        path: '/scux/complaint-workbench/detail',
        component: () => import('../routes/scux/ComplaintWorkbench/Detail'),
      },
    ],
  },
  // 点检管理
  {
    path: '/scux/inspection-management',
    components: [
      {
        path: '/scux/inspection-management/list',
        component: () => import('../routes/scux/InspectionManagement/List'),
      },
      {
        path: '/scux/inspection-management/detail',
        component: () => import('../routes/scux/InspectionManagement/Detail'),
      },
    ],
  },
  // 入围供应商评审
  {
    path: '/scux/supplier-evaluation',
    components: [
      {
        path: '/scux/supplier-evaluation/list',
        component: () => import('../routes/scux/SupplierEvaluation/List'),
      },
      {
        path: '/scux/supplier-evaluation/detail',
        component: () => import('../routes/scux/SupplierEvaluation/Detail'),
      },
    ],
  },
  // 采购方式变更查询
  {
    path: '/scux/purchase-method-change',
    components: [
      {
        path: '/scux/purchase-method-change/list',
        component: () => import('../routes/scux/PurchaseMethodChange/List'),
      },
      {
        path: '/scux/purchase-method-change/detail',
        component: () => import('../routes/scux/PurchaseMethodChange/Detail'),
      },
    ],
  },
];
