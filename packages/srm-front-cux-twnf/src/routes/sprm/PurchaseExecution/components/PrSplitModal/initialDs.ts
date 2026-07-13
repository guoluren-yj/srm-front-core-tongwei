import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType, DataToJSON, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import request from 'hzero-front/lib/utils/request';
import { math } from 'choerodon-ui/dataset';

const organizationId = getCurrentOrganizationId(); // 设置当前租户信息
const intlPrompt = 'scux.prSplitModal'; // 多语言前缀

// 基础信息ds
const tableDataSet = (): DataSetProps => {
  return {
    paging: false,
    selection: false,
    forceValidate: false,
    fields: [
      {
        name: 'operation',
        label: intl.get(`${intlPrompt}.item.operation`).d('操作'),
      },
      {
        name: 'attributeLongtext16',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.displayLineNum`).d('行号'),
      },
      {
        name: 'attributeVarchar9',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar9`).d('是否拆分'),
        lookupCode: 'HPFM.FLAG.NEW',
      },
      {
        name: 'prLineStatusCodeMeaning',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.prLineStatusCodeMeaning`).d('行状态'),
      },
      {
        name: 'itemCodeLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.itemCodeLov`).d('物料编码'),
        lovCode: 'SCUX_TWNF_MDM_ITEM_VIEW',
        textField: 'itemCode',
        ignore: FieldIgnore.always,
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
        name: 'itemName',
        bind: 'itemCodeLov.itemName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.itemName`).d('物料名称'),
      },
      {
        name: 'categoryLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.categoryLov`).d('物料分类'),
        lovCode: 'SCUX_TWNF_ITEM_CATEGORY_QUERY_VIEW',
        textField: 'categoryName',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('itemId')),
          lovPara({}) {
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
        name: 'categoryId',
        bind: 'categoryLov.categoryId',
      },
      {
        name: 'categoryName',
        bind: 'categoryLov.categoryName',
      },
      {
        name: 'categoryCode',
        bind: 'categoryLov.categoryCode',
      },
      {
        name: 'uomNameLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.uomName`).d('主要单位'),
        lovCode: 'SCUX_TWNF_MAIN_UOM_LOV_QUERY_VIEW',
        textField: 'uomName',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('itemId')),
          lovPara: ({ record }) => {
            return {
              itemCategoryId: record.get('categoryId'),
            };
          },
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
      {
        name: 'attributeVarchar17Lov',
        label: intl.get(`${intlPrompt}.item.attributeVarchar17`).d('品牌'),
        type: FieldType.object,
        lovCode: 'SCUX_TWNF_BRAND_LOV_QUERY',
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('itemId')),
          lovPara: ({ record }) => {
            return {
              itemCategoryId: record.get('categoryId'),
            };
          },
        },
        ignore: FieldIgnore.always,
      },
      {
        name: 'attributeVarchar17',
        label: intl.get(`${intlPrompt}.item.attributeVarchar17`).d('品牌'),
        type: FieldType.string,
        bind: 'attributeVarchar17Lov.brand',
      },
      {
        name: 'quantity',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.quantity`).d('需求数量'),
        required: true,
        min: 0,
      },
      {
        name: 'taxIncludedUnitPrice',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.taxIncludedUnitPrice`).d('含税单价'),
        required: true,
        min: 0,
      },
      {
        name: 'taxIncludedLineAmount',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.taxIncludedLineAmount`).d('含税金额'),
      },
      {
        name: 'localCurrencyTaxUnit',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.localCurrencyTaxUnit`).d('本币含税单价'),
      },
      {
        name: 'localCurrencyTaxSum',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.localCurrencyTaxSum`).d('本币含税金额'),
      },
      {
        name: 'localCurrencyNoTaxUnit',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.localCurrencyNoTaxUnit`).d('本币不含税单价'),
      },
      {
        name: 'localCurrencyNoTaxSum',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.localCurrencyNoTaxSum`).d('本币不含税金额'),
      },
      {
        name: 'taxRateLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.taxRate`).d('税率'),
        lovCode: 'SMDM.TAX',
        ignore: FieldIgnore.always,
      },
      {
        name: 'taxId',
        bind: 'taxRateLov.taxId',
      },
      {
        name: 'taxRate',
        bind: 'taxRateLov.taxRate',
      },
      {
        name: 'attributeVarchar4',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar4`).d('原需求行号'),
      },
      {
        name: 'maxAmount',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.attributeDecimal13`).d('剩余可拆金额'),
      },
      {
        name: 'attributeVarchar20',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar20`).d('库存管理'),
      },
      {
        name: 'attributeVarchar19',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar19`).d('费用分摊模式'),
      },
      {
        name: 'attributeVarchar13',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar13`).d('类别编码'),
      },
      {
        name: 'attributeVarchar14',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar14`).d('类别描述'),
      },
      {
        name: 'attributeVarchar18',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar18`).d('物资分类'),
      },
      {
        name: 'attributeVarchar28',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar28`).d('一级分类'),
      },
      {
        name: 'itemModel',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.itemModel`).d('型号'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('itemId')),
        },
      },
      {
        name: 'itemSpecs',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.itemSpecs`).d('规格'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('itemId')),
        },
      },
      {
        name: 'attributeVarchar15',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar15`).d('材质'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('itemId')),
        },
      },
      {
        name: 'attributeVarchar16',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar16`).d('适用设备'),
        dynamicProps: {
          disabled: ({ record }) => Boolean(record.get('itemId')),
        },
      },
      {
        name: 'attributeVarchar30',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar30`).d('物料描述'),
      },
      {
        name: 'neededDate',
        type: FieldType.date,
        label: intl.get(`${intlPrompt}.item.neededDate`).d('需求日期'),
      },
      {
        name: 'prRequestedName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.prRequestedName`).d('申请人'),
      },
      {
        name: 'purchaseAgentName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.purchaseAgentName`).d('采购员'),
      },
      {
        name: 'executorName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.executorName`).d('需求执行人'),
      },
      {
        name: 'receiveAddress',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.receiveAddress`).d('收货地址'),
      },
      {
        name: 'receiveContactName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.receiveContactName`).d('收货联系人'),
      },
      {
        name: 'receiveTelNum',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.receiveTelNum`).d('收货联系电话'),
      },
      {
        name: 'invOrganizationName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.invOrganizationIdLov`).d('库存组织'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.currencyCode`).d('币种'),
      },
      {
        name: 'attributeVarchar35',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar35`).d('商城地址id'),
      },
      {
        name: 'attributeVarchar36',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar36`).d('采买组织id'),
      },
      {
        name: 'attributeVarchar21',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar21`).d('部门编码'),
      },
      {
        name: 'attributeVarchar5',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.attributeVarchar5`).d('商城申请编号'),
      },
      {
        name: 'unitPriceBatch',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.unitPriceBatch`).d('每'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.projectNum`).d('项目号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.projectName`).d('项目名称'),
      },
    ],
    events: {
      update: ({ name, record, value }) => {
        if (name === 'itemCodeLov') {
          if (!value) {
            record.set('categoryLov', null);
            record.set('uomNameLov', null);
            record.set('itemModel', null);
            record.set('itemSpecs', null);
            record.set('attributeVarchar15', null);
            record.set('attributeVarchar16', null);
          } else {
            // 带出 物料品名/单位/型号/材质/品牌/规格/适用设备/物料名称
            const {
              itemName,
              model,
              categoryId,
              categoryName,
              attributeVarchar22,
              attributeVarchar19,
              brand,
              specifications,
              attributeVarchar13,
              attributeVarchar14,
              uomId,
              uomName,
              uomCode,
            } = value || {};
            record.set(
              'categoryLov',
              categoryId
                ? {
                    categoryId,
                    categoryName,
                    attributeVarchar13,
                    attributeVarchar14,
                    brand,
                    uomId,
                    uomName,
                    uomCode,
                  }
                : uomId
                ? {
                    // 物料品名空但是物料有单位带出物料单位
                    uomId,
                    uomName,
                    uomCode,
                  }
                : {}
            );
            record.set('itemModel', model);
            record.set('itemSpecs', specifications);
            record.set('attributeVarchar15', attributeVarchar22);
            record.set('attributeVarchar16', attributeVarchar19);
            record.set('itemName', itemName);
            record.set('itemChangeFlag', 1);
          }
        }

        if (name === 'categoryLov') {
          if (!value) {
            // 清空物料品名
            record.set('uomNameLov', null);
            record.set('attributeVarchar13', null);
            record.set('attributeVarchar14', null);
            record.set('attributeVarchar17Lov', null);
          } else {
            // 带出类别编码/类别描述/单位/品牌
            const {
              uomId,
              uomName,
              uomCode,
              attributeVarchar13,
              attributeVarchar14,
              brand,
              attributeVarchar17,
            } = value || {};
            record.set('attributeVarchar13', attributeVarchar13);
            record.set('attributeVarchar14', attributeVarchar14);
            record.set(
              'uomNameLov',
              uomId
                ? {
                    uomId,
                    uomName,
                    uomCode,
                  }
                : {}
            );
            record.set('attributeVarchar17', brand || attributeVarchar17);
          }
        }
        if (name === 'quantity' || name === 'taxIncludedUnitPrice') {
          record.set(
            'taxIncludedLineAmount',
            math.toFixed(
              math.multipliedBy(
                record.get('quantity') || 0,
                record.get('taxIncludedUnitPrice') || 0
              ),
              2
            )
          );
        }
      },
    },
  };
};

function saveDetailApi(body) {
  return request(
    `${SRM_MARMOT}/v1/${organizationId}/marmot-api/gbjgDDZMoBOJBu5gnllCjdhYPjshHficLb6PcmiaX0zRg`,
    {
      method: 'POST',
      body,
    }
  );
}

function fetchDataApi(query) {
  return request(
    `${SRM_MARMOT}/v1/${organizationId}/marmot-api/gbjgDDZMoBOJBu5gnllCjXC32G7QVkdueNibicP7hYDS8`,
    {
      method: 'GET',
      query,
    }
  );
}

export { tableDataSet, intlPrompt, saveDetailApi, fetchDataApi };
