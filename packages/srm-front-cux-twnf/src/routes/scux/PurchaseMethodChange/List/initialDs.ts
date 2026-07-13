import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldProps } from 'choerodon-ui/pro/lib/data-set/Field';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';

const organizationId = getCurrentOrganizationId();
const intlPrompt = 'scux.purchaseMethodChange';

const queryField = (): FieldProps[] => {
  return [
    {
      name: 'applyUser',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.applyUser`).d('申请人'),
      display: true,
      merge: true,
    },
    {
      name: 'fbcNum',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.search.fbcNum`).d('FBC流程编号'),
      display: true,
    },
    {
      name: 'startDate',
      type: FieldType.date,
      label: intl.get(`${intlPrompt}.search.startDate`).d('创建日期'),
      display: true,
      range: true,
      defaultValue: [moment().subtract(1, 'year'), moment()],
      transformRequest: (value) => Array.isArray(value) ? [value[0]?.format('YYYY-MM-DD 00:00:00'), value[1]?.format('YYYY-MM-DD 23:59:59')].join() : value 
    },
  ].filter(Boolean);
};

const columnField = (): FieldProps[] => {
  return [
    {
      name: 'status',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.status`).d('状态'),
    },
    {
      name: 'fbcNum',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.fbcNum`).d('FBC流程单号'),
    },
    {
      name: 'title',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.title`).d('主题'),
    },
    {
      name: 'applyUser',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.applyUser`).d('申请人'),
    },
    {
      name: 'applyTime',
      type: FieldType.dateTime,
      label: intl.get(`${intlPrompt}.table.applyTime`).d('申请时间'),
    },
    {
      name: 'processLink',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.processLink`).d('流程链接'),
    },
    {
      name: 'currencyCode',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.currencyCode`).d('币种'),
    },
    {
      name: 'amount',
      type: FieldType.number,
      label: intl.get(`${intlPrompt}.table.amount`).d('申请金额（元）'),
    },
    {
      name: 'purchaseRange',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.purchaseRange`).d('采购方式'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.remark`).d('备注'),
    },
    {
      name: 'requestNum',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.requestNum`).d('需求流程单号'),
    },
    {
      name: 'executionAmount',
      type: FieldType.number,
      label: intl.get(`${intlPrompt}.table.executionAmount`).d('执行金额（元）'),
    },
    {
      name: 'executionLink',
      type: FieldType.string,
      label: intl.get(`${intlPrompt}.table.executionLink`).d('执行单据'),
    },
  ];
};

const tableDataSet = (): DataSetProps => {
  return {
    primaryKey: 'id',
    pageSize: 20,
    queryFields: queryField(),
    fields: columnField(),
    selection:false,
    transport: {
      read: () => {
        return {
          url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/8dWrPxjlgvFsnJLhFNMnIbxjflwzeGVVEwcFotYmnFU`,
          method: 'GET',
        };
      },
    },
  };
};

export { tableDataSet, intlPrompt };
