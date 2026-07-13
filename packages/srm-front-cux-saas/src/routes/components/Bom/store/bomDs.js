import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { formatUom } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

const bom = () => ({
  dataToJSON: 'all',
  fields: [
    {
      name: 'orderSeq',
      label: intl.get(`sodr.workspace.model.common.orderSeq`).d('序号'),
    },
    {
      name: 'itemLov',
      label: intl.get(`sodr.workspace.model.common.orderSeq`).d('物料编码'),
      type: 'object',
      lovCode: 'SPUC.ITEM_PRICE_CODE',
      textField: 'itemCode',
      ignore: 'always',
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
    },
    {
      name: 'itemId',
      bind: 'itemLov.itemId',
    },
    {
      name: 'itemName',
      required: true,
      label: intl.get(`sodr.workspace.model.common.orderSeq`).d('物料名称'),
      bind: 'itemLov.itemName',
    },
    {
      name: 'categoryLov',
      label: intl.get(`sodr.workspace.model.common.categoryLov`).d('物料类别'),
      type: 'object',
      lovCode: 'SPRM.ITEM_CATEGOR',
      ignore: 'always',
    },
    {
      name: 'categoryId',
      bind: 'categoryLov.categoryId',
    },
    {
      name: 'categoryName',
      bind: 'categoryLov.categoryName',
    },
    {
      name: 'quantity',
      required: true,
      label: intl.get(`sodr.workspace.model.common.demandQuantity`).d('需求数量'),
      type: 'number',
    },
    {
      name: 'uomLov',
      required: true,
      label: intl.get(`sodr.workspace.model.common.uomId`).d('单位'),
      type: 'object',
      lovCode: 'SMDM.UOM',
      ignore: 'always',
    },
    {
      name: 'uomId',
      bind: 'uomLov.uomId',
    },
    {
      name: 'uomCode',
      bind: 'uomLov.uomCode',
    },
    {
      name: 'uomCodeAndName',
      bind: 'uomLov.uomCodeAndName',
    },
    {
      name: 'invOrganizationLov',
      required: true,
      label: intl.get(`sodr.workspace.model.common.orderSeq`).d('收货组织'),
      type: 'object',
      lovCode: 'SPUC.SMDM.INV_ORG',
      ignore: 'always',
    },
    {
      name: 'invOrganizationId',
      bind: 'invOrganizationLov.organizationId',
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationLov.organizationName',
    },
    {
      name: 'needByDate',
      label: intl.get(`sodr.workspace.model.common.needByDate`).d('需求日期'),
      type: 'date',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms`,
        method: 'GET',
      };
    },
    destroy: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms/delete`,
        method: 'DELETE',
      };
    },
    submit: () => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms/maintain`,
        method: 'PUT',
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((i) => {
        Object.assign(i, { status: 'update' });
      });
    },
    update: ({ name, value, record }) => {
      if (name === 'itemLov') {
        const { uomId, uomName, uomCode, categoryId, categoryName } = value || {};
        record.set({
          uomId,
          uomCode,
          uomName,
          uomCodeAndName: formatUom(uomCode, uomName),
          categoryId,
          categoryName,
        });
      }
    },
    submitSuccess: ({ dataSet }) => {
      dataSet.query();
    },
  },
});

export { bom };
