import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SIEC, PRIVATE_BUCKET } from '_utils/config';
import { isFunction } from 'lodash';
import { fetchCategory } from '@/services/mouldMasterData';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'siec.mould.model.common';

function detailDS({ tableDS, maExpandDs, handleDsUpdate }) {
  return {
    paging: false,
    autoCreate: true,
    dataToJSON: 'all',
    autoQuery: false,
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
        name: 'mouldNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldNum`).d('模具编码'),
        pattern: /^[a-zA-Z0-9_-]*$/,
      },
      {
        name: 'mouldName',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldName`).d('模具名称'),
        required: true,
      },
      {
        name: 'creationDate',
        type: 'date',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
      },
      {
        name: 'companyLov',
        type: 'object',
        label: intl.get(`${commonPrompt}.companyId`).d('模具生产商'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        lovPara: { tenantId: organizationId },
        textField: 'companyName',
        valueField: 'companyId',
      },
      {
        name: 'companyId',
        type: 'string',
        label: '公司id',
        bind: 'companyLov.companyId',
      },
      {
        name: 'companyName',
        type: 'string',
        label: '模具生产商',
        bind: 'companyLov.companyName',
      },
      {
        name: 'supplierLov',
        type: 'object',
        ignore: 'always',
        textField: 'supplierCompanyName',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              companyId: record.get('companyId'),
            };
          },
        },
        lovCode: 'SPRM.SUPPLIER',
        label: intl.get(`${commonPrompt}.supplier`).d('外放供应商'),
      },
      {
        name: 'supplierId',
        bind: 'supplierLov.supplierId',
      },
      {
        name: 'supplierName',
        bind: 'supplierLov.supplierName',
      },
      {
        name: 'supplierTenantId',
        bind: 'supplierLov.supplierTenantId',
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierLov.supplierCompanyId',
      },
      {
        name: 'supplierCompanyNum',
        bind: 'supplierLov.supplierCompanyNum',
      },
      {
        name: 'supplierCompanyName',
        bind: 'supplierLov.supplierCompanyName',
      },
      {
        name: 'mouldPrincipalLov',
        type: 'object',
        label: intl.get(`${commonPrompt}.mouldPrincipal`).d('模具负责人'),
        lovCode: 'SPUC.PURCHASE_AGENT',
        lovPara: { tenantId: organizationId },
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
      },
      {
        name: 'mouldPrincipalId',
        type: 'string',
        bind: 'mouldPrincipalLov.purchaseAgentId',
      },
      {
        name: 'mouldPrincipalName',
        type: 'string',
        bind: 'mouldPrincipalLov.purchaseAgentName',
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
        type: 'string',
        label: intl.get(`${commonPrompt}.cavityQuality`).d('模腔数量'),
      },
      {
        name: 'mouldQuality',
        type: 'number',
        min: 0,
        label: intl.get(`${commonPrompt}.mouldQuality`).d('模具数量'),
      },
      {
        name: 'shareQuality',
        type: 'number',
        min: 0,
        label: intl.get(`${commonPrompt}.shareQuality`).d('分摊模数'),
      },
      {
        name: 'mouldOwner',
        type: 'string',
        lookupCode: 'SIEC.MOULD_OWNER',
        label: intl.get(`${commonPrompt}.mouldOwner`).d('模具归属方'),
      },
      {
        name: 'uomLov',
        type: 'object',
        label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
        lovCode: 'SMDM.DUAL_UOM',
        textField: 'uomName',
        valueField: 'uomId',
        required: true,
      },
      {
        name: 'uomName',
        type: 'string',
        label: intl.get(`${commonPrompt}.mouldUomName`).d('模具单位'),
        bind: 'uomLov.uomName',
      },
      {
        name: 'uomId',
        type: 'string',
        bind: 'uomLov.uomId',
      },
      {
        name: 'modelSpecs',
        type: 'string',
        label: intl.get(`${commonPrompt}.modelSpecs`).d('规格型号'),
        required: true,
      },
      {
        name: 'mouldLife',
        type: 'number',
        min: 0,
        label: intl.get(`${commonPrompt}.mouldLife`).d('模具寿命(次)'),
      },
      {
        name: 'mouldValue',
        type: 'number',
        min: 0,
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
        type: 'string',
        label: intl.get(`${commonPrompt}.objectVersionNumber`).d('版本'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get(`hzero.common.remark`).d('备注'),
      },
      {
        label: intl.get('hzero.common.view.title.attachment').d('附件'),
        type: 'attachment',
        name: 'attachmentUuid',
        bucketName: PRIVATE_BUCKET,
      },
    ],
    transport: {
      read: ({ data }) => {
        // console.log(statusConfigId);
        const { mouldStatus, mouldId } = data;
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/mould/${mouldId}`,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
            customizeUnitCode: ['EFFECTIVE', 'CHANGE_APPROVING'].includes(mouldStatus)
              ? 'SIEC.MOULD_DATA.DETAIL.HEADER_CHANGE,SIEC.MOULD_DATA.DETAIL.LIST,SIEC.MOULD_DATA.DETAIL.EXPAND_LIST'
              : 'SIEC.MOULD_DATA.DETAIL.HEADER,SIEC.MOULD_DATA.DETAIL.LIST,SIEC.MOULD_DATA.DETAIL.EXPAND_LIST',
          }),
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/mould`,
          method: 'delete',
          data: data[0],
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/mould`,
          method: 'post',
          data: data[0],
        };
      },
      update: ({ data }) => {
        return {
          url: `${SRM_SIEC}/v1/${organizationId}/mould`,
          method: 'put',
          data: data[0],
        };
      },
    },
    events: {
      update: ({ name, value, record }) => {
        if (name === 'companyLov' && value) {
          record.set({ supplierLov: null });
        }
        if(isFunction(handleDsUpdate)) {
          handleDsUpdate({ name, value, record })
        }
      },
    },
    children: {
      mouldItemList: tableDS,
      mouldLineExpandList: maExpandDs,
    },
  };
}

function tableLineDS() {
  return {
    paging: false,
    dataToJSON: 'all',
    autoQuery: false,
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'itemLov',
        type: 'object',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        // lovPara: { tenantId: organizationId, enabledFlag: 1, companyId },
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              companyId: dataSet.parent && dataSet.parent.current.get('companyId'),
            };
          },
        },
        // multiple: true,
        // required: true,
      },
      {
        name: 'itemCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.itemCode`).d('物料编码'),
        bind: 'itemLov.itemCode',
      },
      {
        name: 'itemId',
        type: 'string',
        label: '物料id',
      },
      {
        name: 'tenantId',
        type: 'string',
        label: '租户id',
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get(`${commonPrompt}.itemName`).d('物料名称'),
        required: true,
        maxLength: 360,
      },
      {
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
        name: 'categoryId',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        optionsProps: {
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: record => record.get('isCheck') !== false,
            },
          },
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              itemId: record.get('itemId'),
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              categoryId: value,
              categoryName: data.categoryName,
            };
          } else {
            return null;
          }
        },
        transformRequest: value => value?.categoryId,
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
        label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      },
      {
        name: 'uomId',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM',
        type: 'object',
        textField: 'uomName',
        required: true,
        valueField: 'uomId',
        transformResponse(value, data) {
          if (value) {
            return {
              uomId: value,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomPrecision: data.uomPrecision,
              // uomCodeAndName: data.uomCodeAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: value => value?.uomId,
        dynamicProps: {
          // disabled: ({ record }) => record.get('itemCode')?.itemCode,
        },
      },
      {
        name: 'uomName',
        label: intl.get(`${commonPrompt}.uomName`).d('单位'),
        bind: 'uomId.uomName',
      },
    ],
    events: {
      update: ({ name, record, value }) => {
        if (name === 'itemLov') {
          if (value) {
            const { itemCode, itemName, itemId, uomId, uomName } = value;
            record.set({
              tenantId: organizationId,
              itemId,
              itemLov: { itemCode, itemName, itemId },
              itemName,
              uomId: {
                uomId,
                uomName,
              },
            });
            if (itemId) {
              fetchCategory({ itemId, enabledFlag: 1, defaultFlag: 1 }).then(res => {
                if (res && res.length === 1) {
                  const [{ categoryId, categoryName }] = res;
                  record.set({
                    categoryId: {
                      categoryId,
                      categoryName,
                    },
                  });
                } else {
                  record.set({
                    categoryId: {
                      categoryId: '',
                      categoryName: '',
                    },
                  });
                }
              });
            }
          } else {
            record.set({
              tenantId: organizationId,
              itemId: '',
              itemLov: {},
              itemName: '',
              uomId: {},
              categoryId: {},
            });
          }
        }
      },
    },
  };
}

const maExpandLineDs = () => {
  return {
    paging: false,
    dataToJSON: 'all',
    autoQuery: false,
    primaryKey: 'mouldLineExpandId',
    fields: [
      {
        name: 'lineNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'mouldLineExpandId',
        type: 'string',
      },
    ],
  };
};

export { detailDS, tableLineDS, maExpandLineDs };
