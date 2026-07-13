import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import request from 'hzero-front/lib/utils/request';
import { isEmpty } from 'lodash'

const organizationId = getCurrentOrganizationId(); // 设置当前租户信息
const intlPrompt = 'scux.newItemModal'; // 多语言前缀

// 基础信息ds
const formDataSet = (): DataSetProps => {
  return {
    autoCreate: true,
    forceValidate: true,
    fields: [
      {
        name: 'itemCategoryLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.itemCategoryLov`).d('物料品名'),
        lovCode: 'SCUX_TWNF_ITEM_CATEGORY_QUERY_VIEW',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('productNum') || record.get('itemId')),
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              // itemId: record.get('itemId'),
            };
          },
        },
        ignore: FieldIgnore.always,
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
      {
        name: 'itemDesc',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.itemDesc`).d('物料描述'),
        disabled: true,
      },
    ],
    events: {
      update: ({ record, name, value }) => {
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
            record.set('itemName', `${value?.categoryName || ''}${record.get('itemModel') || ''}`);
            record.set('itemDesc', `${value?.categoryName || ''}${record.get('itemModel') || ''}`);
        }

        if (name === 'itemModel') { // 设置物料名
          record.set('itemName', `${record.get('categoryName') || ''}${value || ''}`);
          record.set('itemDesc', `${record.get('categoryName') || ''}${value || ''}`);
        }
      },
    },
  };
};

function saveDetailApi(body) {
  return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/LZGAYUicK0pAPS51P7uRlYlvNxoicObsib6waUzfaH9wFU`, {
    method: 'POST',
    body,
  });
}

export { formDataSet, intlPrompt, saveDetailApi };
