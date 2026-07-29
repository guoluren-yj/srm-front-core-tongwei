import React from 'react';
import { Table, DataSet, Modal } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';

const categoryDetailDS = (organizationId, categoryCode, comparePeriod) => ({
  autoQuery: false,
  selection: false,
  paging: false,
  fields: [
    { name: 'categoryCode', label: intl.get('scux.reportWorkbench.field.categoryCode').d('品名') },
    { name: 'categoryName', label: intl.get('scux.reportWorkbench.field.categoryName').d('品名描述') },
    { name: 'supplierName', label: intl.get('scux.reportWorkbench.field.supplierName').d('供应商名称') },
    { name: 'previousPurchaseQuantity', label: intl.get('scux.reportWorkbench.field.previousPurchaseQuantity').d('上期采购数量') },
    { name: 'currentPurchaseQuantity', label: intl.get('scux.reportWorkbench.field.currentPurchaseQuantity').d('本期采购数量') },
    { name: 'lastYearPurchaseQuantity', label: intl.get('scux.reportWorkbench.field.lastYearPurchaseQuantity').d('去年同期采购数量') },
    { name: 'quantityYearOnYear', label: intl.get('scux.reportWorkbench.field.quantityYearOnYear').d('数量同比') },
    { name: 'quantityPeriodOnPeriod', label: intl.get('scux.reportWorkbench.field.quantityPeriodOnPeriod').d('数量环比') },
    { name: 'previousPurchaseAmount', label: intl.get('scux.reportWorkbench.field.previousPurchaseAmount').d('上期采购金额') },
    { name: 'currentPurchaseAmount', label: intl.get('scux.reportWorkbench.field.currentPurchaseAmount').d('本期采购金额') },
    { name: 'lastYearPurchaseAmount', label: intl.get('scux.reportWorkbench.field.lastYearPurchaseAmount').d('去年同期采购金额') },
    { name: 'amountYearOnYear', label: intl.get('scux.reportWorkbench.field.amountYearOnYear').d('金额同比') },
    { name: 'amountPeriodOnPeriod', label: intl.get('scux.reportWorkbench.field.amountPeriodOnPeriod').d('金额环比') },
  ],
  transport: {
    read: () => ({
      url: `/marmot/v1/${organizationId}/marmot-api/RNSM1ViakicjXcJ14ib3HeMicXlPtnYYv6fKdKqwPicIGiccqI8Ot5Oag1BiauJb5ibicicJAD`,
      method: 'POST',
      data: { categoryCode, comparePeriod },
    }),
  },
});

const supplierDetailDS = (organizationId, supplierCode, comparePeriod, compareDimension) => ({
  autoQuery: false,
  selection: false,
  paging: false,
  fields: [
    { name: 'supplierCode', label: intl.get('scux.reportWorkbench.field.supplierCode').d('供应商编码') },
    { name: 'supplierName', label: intl.get('scux.reportWorkbench.field.supplierName2').d('供应商名称') },
    { name: 'categoryName', label: intl.get('scux.reportWorkbench.field.categoryName2').d('品名') },
    { name: 'supplyQty', label: intl.get('scux.reportWorkbench.field.supplyQty').d('供应数量') },
    { name: 'orderAmt', label: intl.get('scux.reportWorkbench.field.orderAmt').d('金额') },
    { name: 'supplyRate', label: intl.get('scux.reportWorkbench.field.supplyRate').d('供应占比') },
  ],
  transport: {
    read: () => ({
      url: `/marmot/v1/${organizationId}/marmot-api/RNSM1ViakicjXcJ14ib3HeMicXlPtnYYv6fKdKqwPicIGiccp1yc524bhFjuQh5JUwa0Ob`,
      method: 'GET',
      params: { supplierCode, comparePeriod, compareDimension },
    }),
  },
});

const categoryColumns = [
  { name: 'categoryCode' },
  { name: 'categoryName' },
  { name: 'supplierName' },
  { name: 'previousPurchaseQuantity' },
  { name: 'currentPurchaseQuantity' },
  { name: 'lastYearPurchaseQuantity' },
  { name: 'quantityYearOnYear' },
  { name: 'quantityPeriodOnPeriod' },
  { name: 'previousPurchaseAmount' },
  { name: 'currentPurchaseAmount' },
  { name: 'lastYearPurchaseAmount' },
  { name: 'amountYearOnYear' },
  { name: 'amountPeriodOnPeriod' },
];

const supplierColumns = [
  { name: 'supplierCode' },
  { name: 'supplierName' },
  { name: 'categoryName' },
  { name: 'supplyQty' },
  { name: 'orderAmt' },
  { name: 'supplyRate' },
];

export const openCategoryDetail = (organizationId, categoryCode, comparePeriod) => {
  const ds = new DataSet(categoryDetailDS(organizationId, categoryCode, comparePeriod));
  ds.query();
  Modal.open({
    key: Modal.key(),
    title: intl.get('scux.reportWorkbench.view.title.categoryDetail').d('品类明细'),
    style: { width: 1200 },
    children: <Table dataSet={ds} columns={categoryColumns} />,
    afterClose: () => ds.destroy(),
  });
};

export const openSupplierDetail = (organizationId, supplierCode, comparePeriod, compareDimension) => {
  const ds = new DataSet(supplierDetailDS(organizationId, supplierCode, comparePeriod, compareDimension));
  ds.query();
  Modal.open({
    key: Modal.key(),
    title: intl.get('scux.reportWorkbench.view.title.supplierDetail').d('供应商明细'),
    style: { width: 1000 },
    children: <Table dataSet={ds} columns={supplierColumns} />,
    afterClose: () => ds.destroy(),
  });
};
