import intl from 'utils/intl';
import { IDENTITY_CARD, PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

function unifiedSocialCodeValidator(value) {
  const pattern = /^(?![A-Z]{18}$)[0-9A-Z]{18}$/;
  if (value && !pattern.test(value)) {
    return intl
      .get('spfm.enterprise.model.legal.unifiedSocialCodeNewRule')
      .d('由18位大写字母和数字混合组成,且不能是纯字母');
  }
}

const getCreateFormDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'domesticForeignRelation',
      label: intl
        .get('sslm.supplierEntry.model.supplierEntryCreate.domesticForeignRelation')
        .d('认证地区'),
      lookupCode: 'SPFM.DOMESTIC_FOREIGN_RELATION',
      valueField: 'value',
      textField: 'meaning',
      required: true,
      help: intl
        .get('sslm.supplierEntry.view.message.abroadTips')
        .d('港澳台及中国以外的其他国家的企业请选择境外录入信息'),
    },
    {
      name: 'registeredCountryId',
      type: 'object',
      lovCode: 'HPFM.COUNTRY',
      noCache: true,
      label: intl
        .get('sslm.supplierEntryDetail.model.companyBaseForm.registeredCountry')
        .d('注册国家/地区'),
      dynamicProps: {
        required: ({ record }) => record.get('domesticForeignRelation') === '2',
      },
      transformRequest: value => value && value.countryId,
    },
    {
      name: 'idNum',
      label: intl.get('sslm.supplierEntry.model.supplierEntryCreate.idNum').d('身份证号'),
      pattern: IDENTITY_CARD,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('domesticForeignRelation') === '2' && !record.get('passport');
        },
        disabled: ({ record }) => {
          return record.get('domesticForeignRelation') === '2' && record.get('passport');
        },
      },
    },
    {
      name: 'passport',
      label: intl.get('sslm.supplierEntry.model.supplierEntryCreate.passport').d('护照号/通行证号'),
      dynamicProps: {
        required: ({ record }) => {
          return record.get('domesticForeignRelation') === '2' && !record.get('idNum');
        },
        disabled: ({ record }) => {
          return record.get('domesticForeignRelation') === '2' && record.get('idNum');
        },
      },
      maxLength: 12,
    },
    {
      name: 'companyName',
      maxLength: 500,
      type: 'intl',
      required: true,
      dynamicProps: {
        label: ({ dataSet }) => {
          const domesticForeignRelation = dataSet.current.get('domesticForeignRelation');
          return domesticForeignRelation === '2'
            ? intl.get('sslm.supplierEntry.model.supplierEntryCreate.name').d('姓名')
            : intl.get('sslm.supplierEntry.model.supplierEntryCreate.companyName').d('企业名称');
        },
      },
    },
    {
      name: 'dunsCode',
      label: intl.get('sslm.supplierEntry.model.supplierEntryCreate.dunsCode').d('邓白氏编码'),
      pattern: /^[0-9]{9}$/,
      dynamicProps: {
        required: ({ record }) => {
          return (
            record.get('domesticForeignRelation') === '0' &&
            !record.get('businessRegistrationNumber')
          );
        },
      },
    },
    {
      name: 'businessRegistrationNumber',
      label: intl
        .get('sslm.supplierEntry.model.supplierEntryCreate.registrationNumber')
        .d('企业注册登记号/税号'),
      dynamicProps: {
        required: ({ record }) =>
          record.get('domesticForeignRelation') === '0' && !record.get('dunsCode'),
      },
    },
    {
      name: 'unifiedSocialCode',
      type: 'string',
      dynamicProps: ({ record }) => {
        if (record.get('domesticForeignRelation') === '1') {
          return {
            required: true,
            pattern: /^(?![A-Z]{18}$)[0-9A-Z]{18}$/,
            validator: unifiedSocialCodeValidator,
          };
        } else {
          return {};
        }
      },
      label: intl
        .get('sslm.supplierEntry.model.supplierEntryCreate.unifiedSocialCode')
        .d('统一社会信用代码'),
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      dynamicProps: {
        required: ({ record }) => !!record.get('idNum'),
      },
      label: intl
        .get('sslm.supplierEntryDetail.model.entryBaseForm.recInternationalTelCode')
        .d('国别码'),
    },
    {
      name: 'phone',
      label: intl.get('sslm.supplierEntryDetail.model.companyBaseForm.mobilephone').d('手机号码'),
      dynamicProps: {
        required: ({ record }) => !!record.get('idNum'),
        pattern: ({ record }) =>
          (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
  ],
  events: {
    update: ({ oldValue, name, record }) => {
      if (name === 'domesticForeignRelation') {
        switch (oldValue) {
          case '0':
            record.set({
              companyName: undefined,
              dunsCode: undefined,
              businessRegistrationNumber: undefined,
            });
            break;
          case '1':
            record.set({
              companyName: undefined,
              unifiedSocialCode: undefined,
            });
            break;
          case '2':
            record.set({
              companyName: undefined,
              idNum: undefined,
              passport: undefined,
            });
            break;
          default:
            break;
        }
      }
      if (name === 'idNum') {
        record.set({
          passport: null,
        });
      }
      if (name === 'registeredCountryId') {
        record.set({
          idNum: null,
          passport: null,
        });
      }
    },
  },
});

const getOperateTypeDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'firstType',
      type: 'string',
    },
    {
      name: 'secondType',
      type: 'string',
    },
  ],
  events: {
    update: ({ name, record }) => {
      if (name === 'firstType') {
        record.set('secondType', null);
      }
    },
  },
});
export { getCreateFormDs, getOperateTypeDs };
