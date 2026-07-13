// import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SIEC } from 'srm-front-boot/lib/utils/config';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'siec.mould.model.common';

const TableDs = getStatusConfigId => {
  return {
    // autoQuery: true,
    primaryKey: 'mouldId',
    cacheModified: true,
    cacheSelection: true,
    pageSize: 20,
    fields: [
      {
        name: 'mouldStatus',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldStatus`).d('模具状态'),
        lookupCode: 'SIEC.MOULD_STATUS',
      },
      {
        name: 'sourcePlatform',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldSource`).d('模具来源'),
        lookupCode: 'SIEC.MOULD_SOURCE_PLATFORM',
      },
      {
        label: intl.get('hzero.common.buttom.action').d('操作'),
        name: 'action',
      },
      {
        name: 'mouldNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldNum`).d('模具编码'),
      },
      {
        name: 'mouldName',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldName`).d('模具名称'),
      },
      {
        name: 'creationDate',
        type: 'date',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`${commonPrompt}.companyId`).d('模具生产商'),
      },
      {
        name: 'supplierName',
        type: 'string',
        label: intl.get(`${commonPrompt}.supplier`).d('外放供应商'),
      },
      {
        name: 'mouldPrincipalName',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
      },
      {
        name: 'mouldType',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldType`).d('模具类型'),
        lookupCode: 'SIEC.MOULD_TYPE',
      },
      {
        name: 'createdByName',
        type: 'string',
        label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
      },
      {
        name: 'cavityQuality',
        type: 'number',
        label: intl.get(`${commonPrompt}.cavityQuality`).d('模腔数量'),
      },
      {
        name: 'shareQuality',
        type: 'number',
        label: intl.get(`${commonPrompt}.shareQuality`).d('分摊模数'),
      },
      {
        name: 'mouldOwner',
        type: 'string',
        lookupCode: 'SIEC.MOULD_OWNER',
        label: intl.get(`${commonPrompt}.mouldOwner`).d('模具归属方'),
      },
      {
        name: 'uomName',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
      },
      {
        name: 'modelSpecs',
        type: 'string',
        label: intl.get(`${commonPrompt}.modelSpecs`).d('规格型号'),
      },
      {
        name: 'mouldLife',
        type: 'number',
        label: intl.get(`${commonPrompt}.mouldLife`).d('模具寿命(次)'),
      },
      {
        name: 'mouldValue',
        type: 'number',
        label: intl.get(`${commonPrompt}.mouldValue`).d('模具价值(万元)'),
      },
      {
        name: 'machineTonnage',
        type: 'string',
        label: intl.get(`${commonPrompt}.machineTonnage`).d('机台吨位'),
      },
      {
        name: 'moldingCycle',
        type: 'string',
        label: intl.get(`${commonPrompt}.moldingCycle`).d('成型周期'),
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
        label: intl.get(`${commonPrompt}.objectVersionNumber`).d('版本'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get(`hzero.common.remark`).d('备注'),
      },
      {
        name: 'operatorRecord',
        type: 'string',
        label: intl.get(`hzero.common.button.operating`).d('操作记录'),
      },
    ],
    // queryFields: [
    //   {
    //     name: 'mouldNum',
    //     type: 'string',
    //     label: intl.get('hwfm.commom.modal.mouldNum').d('模具编码'),
    //   },
    //   {
    //     name: 'mouldName',
    //     type: 'string',
    //     label: intl.get('hwfm.commom.modal.mouldName').d('模具名称'),
    //   },
    //   {
    //     name: 'mouldOwner',
    //     typeof: 'string',
    //     lookupCode: 'SIEC.MOULD_OWNER',
    //     label: intl.get('hwfm.commom.modal.mouldOwner').d('模具归属方'),
    //   },
    //   {
    //     name: 'companyId',
    //     type: 'object',
    //     label: intl.get('hwfm.commom.modal.companyId').d('模具生产商'),
    //     lovCode: 'SIEC.MOULD_COMPANY',
    //     // textField: 'categoryName',
    //   },
    // ],

    transport: {
      read: ({ data }) => {
        // console.log(statusConfigId);
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/mould/list`,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            statusConfigId: getStatusConfigId(),
            customizeUnitCode: 'SIEC.MOULD_DATA.LIST.SEARCH_BAR,SIEC.MOULD_DATA.LIST.LIST',
          }),
        };
      },
    },
  };
};

const LineTableDs = getStatusConfigId => {
  return {
    // autoQuery: true,
    pageSize: 20,
    cacheModified: true,
    primaryKey: 'mouldItemId',
    cacheSelection: true,
    fields: [
      {
        name: 'mouldStatus',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldStatus`).d('模具状态'),
        lookupCode: 'SIEC.MOULD_STATUS',
      },
      {
        name: 'sourcePlatform',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldSource`).d('模具来源'),
        lookupCode: 'SIEC.MOULD_SOURCE_PLATFORM',
      },
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldNumAndlineNum`).d('模具编码-行号'),
      },
      {
        name: 'mouldName',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldName`).d('模具名称'),
      },
      {
        name: 'creationDate',
        type: 'date',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
      },
      {
        name: 'companyName',
        type: 'string',
        label: intl.get(`${commonPrompt}.companyId`).d('模具生产商'),
      },
      {
        name: 'supplierName',
        type: 'string',
        label: intl.get(`${commonPrompt}.supplier`).d('外放供应商'),
      },
      {
        name: 'mouldPrincipalName',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
      },
      {
        name: 'mouldType',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldType`).d('模具类型'),
        lookupCode: 'SIEC.MOULD_TYPE',
      },
      {
        name: 'createdByName',
        type: 'string',
        label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
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
        name: 'categoryName',
        type: 'string',
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      },
      {
        name: 'uomName',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get(`hzero.common.remark`).d('备注'),
      },
      {
        name: 'operatorRecord',
        type: 'string',
        label: intl.get(`hzero.common.button.operating`).d('操作记录'),
      },
    ],

    transport: {
      read: ({ data }) => {
        // console.log(statusConfigId);
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/mould/list-item`,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            statusConfigId: getStatusConfigId(),
            customizeUnitCode:
              'SIEC.MOULD_DATA.LIST.LINE_LIST,SIEC.MOULD_DATA.LIST.LINE_SEARCH_BAR',
          }),
        };
      },
    },
  };
};

export { TableDs, LineTableDs };
