import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import request from 'hzero-front/lib/utils/request';
import { isEmpty } from 'lodash'

const organizationId = getCurrentOrganizationId(); // 设置当前租户信息
const intlPrompt = 'scux.addItemModal'; // 多语言前缀

// 基础信息ds
const formDataSet = (outData): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'productLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.productNum`).d('商品编码'),
        lovCode: 'SCUX_TWNF_LIST_ALL_SKULIST_VIEW',
        lovPara: filterNullValueObject({ 
          itemId: outData.itemId,
          categoryId: outData.categoryId,
        }),
      },
      {
        name: 'productId',
        bind: 'productLov.skuId',
      },
      {
        name: 'productNum',
        bind: 'productLov.skuCode',
      },
      {
        name: 'productName',
        bind: 'productLov.skuName',
      },
      {
        name: 'itemCodeLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.itemCode`).d('物料编码'),
        lovCode: 'SCUX_TWNF_MDM_ITEM_VIEW',
        textField: 'itemCode',
        lovPara: filterNullValueObject({ 
          categoryId: outData.categoryId,
        }),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || outData.itemId),
        },
      },
      {
        name: 'itemId',
        bind: 'itemCodeLov.itemId',
      },
      {
        name: 'itemCode',
        bind: 'itemCodeLov.itemCode',
      },
      {
        name: 'itemCategoryLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.itemCategoryLov`).d('物料品名'),
        lovCode: 'SCUX_TWNF_ITEM_CATEGORY_QUERY_VIEW',
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId') || outData.categoryId),
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              // itemId: record.get('itemId'),
            };
          },
        },
      },
      {
        name: 'categoryName',
        bind: 'itemCategoryLov.categoryName',
      },
      {
        name: 'categoryId',
        bind: 'itemCategoryLov.categoryId',
      },
      {
        name: 'categoryCode',
        bind: 'itemCategoryLov.categoryCode',
      },
      {
        name: 'attributeVarchar13',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar13`).d('类别编码'),
        disabled: true,
      },
      {
        name: 'attributeVarchar14',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar14`).d('类别描述'),
        disabled: true,
      },
      {
        name: 'uomNameLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.uomName`).d('主要单位'),
        lovCode: 'SCUX_TWNF_MAIN_UOM_LOV_QUERY_VIEW',
        textField: 'uomName',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId')),
          lovPara: ({ record }) => {
            return {
              itemCategoryId: record.get('categoryId'),
            };
          }
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'uomName',
        bind: 'uomNameLov.uomName',
      },
      {
        name: 'uomId',
        bind: 'uomNameLov.uomId',
      },
      {
        name: 'uomCode',
        bind: 'uomNameLov.uomCode',
      },
      // {
      //   name: 'uomCodeAndName',
      //   bind: 'uomNameLov.uomCodeAndName',
      // },
      {
        name: 'itemModel',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.itemModel`).d('型号'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId')),
        },
      },
      {
        name: 'attributeVarchar15',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar15`).d('材质'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId')),
        },
      },
      {
        name: 'attributeVarchar17Lov',
        label: intl.get(`${intlPrompt}.item.attributeVarchar17`).d('品牌'),
        type: FieldType.object,
        lovCode: 'SCUX_TWNF_BRAND_LOV_QUERY',
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId')),
          lovPara: ({ record }) => {
            return {
              itemCategoryId: record.get('categoryId'),
            };
          }
        }
      },
      {
        name: 'attributeVarchar17',
        label: intl.get(`${intlPrompt}.item.attributeVarchar17`).d('品牌'),
        type: FieldType.string,
        bind: 'attributeVarchar17Lov.brand',
      },
      {
        name: 'itemSpecs',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.itemSpecs`).d('规格'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId')),
        },
      },
      {
        name: 'attributeVarchar16',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar16`).d('适用设备'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId')),
        },
      },
      {
        name: 'itemName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.itemName`).d('物料名称'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId')),
        },
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'productLov') {
          if (isEmpty(value)) {
            // 清空商品编码：同步清空物料编码与下游字段
            record.set('itemCodeLov', null);
          } else {
            // 带出物料编码
            const { itemCode, itemId, itemName, itemModel, categoryId, categoryName, attributeVarchar15, attributeVarchar16, attributeVarchar17, itemSpecs, attributeVarchar13, attributeVarchar14, uomId, uomName, uomCode } = value || {};
            record.set('itemCodeLov', itemId ? {
              itemCode,
              itemId,
              itemName,
              model: itemModel,
              specifications: itemSpecs,
              categoryId,
              categoryName,
              uomId,
              uomName,
              uomCode,
              attributeVarchar13,
              attributeVarchar14,
              attributeVarchar22: attributeVarchar15,
              attributeVarchar19: attributeVarchar16,
              brand: attributeVarchar17,
            } : {});
            record.set('productChangeFlag', 1);
          }
        }

        if (name === 'itemCodeLov') {
          if (isEmpty(value)) {
            // 清空物料编码：同步清空下游字段
            record.set('itemCategoryLov', null);
            record.set('uomNameLov', null);
            record.set('itemModel', null);
            record.set('attributeVarchar15', null);
            record.set('attributeVarchar17', null);
            record.set('itemSpecs', null);
            record.set('attributeVarchar16', null);
          } else {
            // 带出 物料品名/单位/型号/材质/品牌/规格/适用设备/物料名称
            const { itemName, model, categoryId, categoryName, attributeVarchar22, attributeVarchar19, brand, specifications, attributeVarchar13, attributeVarchar14, uomId, uomName, uomCode } = value || {};
            record.set('itemCategoryLov', categoryId ? {
              categoryId,
              categoryName,
              attributeVarchar13,
              attributeVarchar14,
              brand,
              uomId,
              uomName,
              uomCode,
            } : uomId ? { // 物料品名空但是物料有单位带出物料单位
              uomId,
              uomName,
              uomCode,
            } : {});
            record.set('itemModel', model);
            record.set('attributeVarchar15', attributeVarchar22);
            record.set('itemSpecs', specifications);
            record.set('attributeVarchar16', attributeVarchar19);
            record.set('itemName', itemName);
            record.set('itemChangeFlag', 1);
          }
        }

        if (name === 'itemCategoryLov') {
          if (isEmpty(value)) {
            // 清空物料品名
            record.set('uomNameLov', null);
            record.set('attributeVarchar13', null);
            record.set('attributeVarchar14', null);
            record.set('attributeVarchar17', null);
          } else {
            // 带出类别编码/类别描述/单位/品牌
            const { uomId, uomName, uomCode, attributeVarchar13, attributeVarchar14, brand, attributeVarchar17 } = value || {};
            record.set('attributeVarchar13', attributeVarchar13);
            record.set('attributeVarchar14', attributeVarchar14);
            record.set('uomNameLov', uomId ? {
              uomId,
              uomName,
              uomCode,
              // uomCodeAndName: `${uomCode}/${uomName}`,
            } : {});
            record.set('attributeVarchar17', brand || attributeVarchar17);
          }
          if (!record.get('productNum') && !record.get('itemId')) { // 设置物料名
            record.set('itemName', `${value?.categoryName || ''}${record.get('itemModel') || ''}`);
          }
        }

        if (name === 'itemModel' && !record.get('productNum') && !record.get('itemId')) { // 设置物料名
          record.set('itemName', `${record.get('categoryName') || ''}${value || ''}`);
        }
      },
    },
  };
};

function saveDetailApi(body) {
  return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/8cT3jiabbtpD88UJPmxzMwS2CHpA7K0icFOzcN9YWPETKNcCuYO5fM98oIIfhm2Woj`, {
    method: 'POST',
    body,
  });
}

export { formDataSet, intlPrompt, saveDetailApi };
