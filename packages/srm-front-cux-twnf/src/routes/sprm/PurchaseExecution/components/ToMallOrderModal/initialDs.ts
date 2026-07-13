import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType, DataToJSON } from 'choerodon-ui/pro/lib/data-set/enum';
import request from 'hzero-front/lib/utils/request';
// import { isNil } from 'lodash';
// import { math } from 'choerodon-ui/dataset';
// import BigNumber from 'bignumber.js';

const organizationId = getCurrentOrganizationId(); // 设置当前租户信息
const intlPrompt = 'scux.toMallOrderModal'; // 多语言前缀

// function getPrecision(step) {
//   return new BigNumber(1 / Number(math.pow(10, step || 0))).toFormat();
// }

// const getQuantityValid = ({ record, value }) => {
//   const {
//     uomPrecision,
//     minPackageQuantity,
//     minPurchaseQuantity,
//   } = record.get([
//     'uomPrecision',
//     'minPackageQuantity',
//     'minPurchaseQuantity',
//     'ladderPriceList',
//   ]);
//   const total = value;
//   const minLimit = minPurchaseQuantity ?? 1;
//   const defaultValue = uomPrecision ? getPrecision(uomPrecision) : 1;
//   // 是否满足包装量校验
//   const packgeValid =
//     isNil(total) ||
//     (uomPrecision && !Number.isInteger(minPackageQuantity)) ||
//     (minPackageQuantity || 1) === 1 ||
//     math.eq(math.mod(total, minPackageQuantity || 1), 0); // 包装量为1则不校验
//   // 是否满足最小起订量
//   const minValid = isNil(total) || math.gte(total, minLimit || defaultValue);
//   return { packgeValid, minValid, minPackageQuantity, minQuantity: minLimit || defaultValue };
// };

// 基础信息ds
const tableDataSet = (): DataSetProps => {
  return {
    pageSize: 20,
    selection: false,
    forceValidate: true,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'skuCode',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.productNum`).d('商品编码'),
      },
      {
        name: 'skuName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.productName`).d('商品名称'),
      },
      {
        name: 'originalQuantity',
        type: FieldType.number,
      },
      {
        name: 'quantity',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.quantity`).d('需求数量'),
        required: true,
        min: 0,
        dynamicProps: {
          max: ({ record }) => record.get('originalQuantity'),
        },
      },
      {
        name: 'neededDate',
        type: FieldType.date,
        label: intl.get(`${intlPrompt}.item.neededDate`).d('需求日期'),
      },
      {
        name: 'unitPrice',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.unitPrice`).d('单价(含税)'),
      },
      {
        name: 'taxCode',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.taxLov`).d('税率'),
      },
      {
        name: 'uomName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.uomLov`).d('单位'),
      },
      {
        name: 'currencyCode',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.currencyLov`).d('币种'),
      },
      {
        name: 'unitLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.unitLov`).d('组织'),
        lovCode: 'SMCT.UNIT_INFO',
        dynamicProps: {
          required: ({ record }) => record.get('prSourcePlatform') === 'ERP',
        },
      },
      {
        name: 'attributeVarchar36',
        bind: 'unitLov.unitId'
      },
      {
        name: 'companyId',
        bind: 'unitLov.companyId'
      },
      {
        name: 'addressLov',
        type: FieldType.object,
        label: intl.get(`${intlPrompt}.item.addressLov`).d('地址'),
        lovCode: 'SMCT.ADDRESS',
        dynamicProps: {
          required: ({ record }) => record.get('prSourcePlatform') === 'ERP',
          lovPara: ({ record }) => ({
            companyId: record.get('companyId'),
          }),
          disabled: ({ record }) => !record.get('companyId'),
        },
      },
      {
        name: 'attributeVarchar35',
        bind: 'addressLov.addressId'
      },
      {
        name: 'receiveContactName',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.receiveContactName`).d('收货人'),
        bind: 'addressLov.contactName'
      },
      {
        name: 'receiveTelNum',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.receiveTelNum`).d('收货电话'),
        bind: 'addressLov.mobile'
      },
      {
        name: 'receiveAddress',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.receiveAddress`).d('收货地址'),
        bind: 'addressLov.fullAddress'
      },
      {
        name: 'attributeLongtext8Meaning',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.freightRule`).d('运费规则'),
      },
      {
        name: 'attributeDecimal20',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.unitPriceOfFreightIncludingTax`).d('运费含税单价'),
        min: 0,
        dynamicProps: ({ record }) => ({
          disabled: String(record.get('attributeLongtext8')) !== '-1',
        }),
      },
      {
        name: 'attributeLongtext7Meaning',
        type: FieldType.string,
        label: intl.get(`${intlPrompt}.item.serviceRule`).d('服务费规则'),
      },
      {
        name: 'attributeDecimal21',
        type: FieldType.number,
        label: intl.get(`${intlPrompt}.item.unitPriceOfServiceIncludingTax`).d('服务费含税单价'),
        min: 0,
        dynamicProps: ({ record }) => ({
          disabled: String(record.get('attributeLongtext7')) !== '-1',
        }),
      },
    ],
    events: {
      update: ({ name, record }) => {
        if (name === 'unitLov') {
          record.set('addressLov', null);
        }
      },
    }
  };
};

function saveDetailApi(body) {
  return request(`${SRM_MARMOT}/v1/${organizationId}/marmot-api/Cygw7TicaUDuo0ImqTKNkYj0gYE7F4H6ZibxANOiboTsj8`, {
    method: 'POST',
    body,
  });
}

export { tableDataSet, intlPrompt, saveDetailApi };
