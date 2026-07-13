import { setWorkflowApproveForm } from 'hzero-front/lib/customize/workflowApproveForm';
import dynamic from 'dva/dynamic';
import { createElement } from 'react';

const modelNotExisted = (app = {}, model) =>
  // eslint-disable-next-line
  !(app._models || []).some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

const dynamicWrapper = (app, models, component) => {
  //  eslint-disable-next-line
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)) ||
      [],
    // add routerData prop
    component: () => {
      // if (!routerDataCache) {
      //   routerDataCache = getRouterData(app);
      // }
      return component().then(raw => {
        const Component = raw.default || raw;
        return props =>
          //  eslint-disable-next-line
          createElement(Component, {
            ...props,
            // routerData: routerDataCache,
          });
      });
    },
  });
};

// 模具台账下发审批表单
setWorkflowApproveForm({
  code: 'MOULD_ACCOUNT_RELEASE_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/MouldApprove') // 流程表单页面组件
    );
  },
});

// 模具台账异动审批表单
setWorkflowApproveForm({
  code: 'MOULD_ACCOUNT_CHANGE_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/MouldApprove') // 流程表单页面组件
    );
  },
});

// 模具主数据审批表单
setWorkflowApproveForm({
  code: 'SIEC.MOULD_CHANGE_WORKFLOW_DOC:CHANGE_FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/Mould/Read') // 流程表单页面组件
    );
  },
});

// 模具主数据审批表单
setWorkflowApproveForm({
  code: 'SIEC.MOULD_REQ_WORKFLOW_DOC:FORM', // 流程单据内配置的流程单据编码
  component: async () => {
    return dynamicWrapper(
      window.dvaApp,
      [], // 流程表单页面用到的 model
      () => import('../routes/MouldPurchaserReq/Detail/ReadOnly') // 流程表单页面组件
    );
  },
});
