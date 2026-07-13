module.exports = {
  package: {
    tenantNum: 'SRM-TWNF',
    initLoad: false,
    registerRegex: "\/ssrc\/"
  },
  hzeroBoot: 'hzero-boot/lib/pathInfo',
  theme: require.resolve('srm-front-boot/lib/config/theme.js'), // less 变量配置, theme 的值可以是 string 表示指向配置文件
  hzeroMS: {
    remotePackages: ['srm-front-smpc'],
    exposes: {
      SQAM_MY_CLAIM_FORM_LIST_CUX: './src/routes/sqam/MyClaimForm/expose.js',
      SQAM_CLAIM_APPROVAL_DETAIL: './src/routes/sqam/ClaimApproval/Detail/expose.js',
      SSRC_CHECK_PRICE: './src/routes/ssrc/InquiryHall/CheckPrice/expose.js',
      SSRC_INQUIRY_HALL_NEW_LIST: './src/routes/ssrc/InquiryHallNew/expose.js',
      SPRM_EXECUTION_FUN_REMOTE: './src/routes/sprm/PurchaseExecution/expose.js',
      SPCM_CONTRACT_SIGN_DETAIL: './src/routes/spcm/ContractSign/Detail/expose.js',
      SKU_WORKBENCH: "./src/routes/smpc/SkuWorkbench/expose.js",
      SKU_WORKBENCH_SUP: "./src/routes/smpc/SkuWorkbenchSup/expose.js",
      SSRC_OFFLINE_RESULT_ENTRY_DETAIL: './src/routes/ssrc/OfflineResultEntry/Detail/expose.js',
      SKU_CREATE: "./src/routes/smpc/SkuCreate/expose.js",
      SMDM_MATRAIAL_LIST: "./src/routes/smdm/Materiel/expose.js",
      SPCM_WORKSPACE_DETAIL_CREATE: "./src/routes/spcm/workspace/Detail/Create/expose.js",
    },
  },
};
