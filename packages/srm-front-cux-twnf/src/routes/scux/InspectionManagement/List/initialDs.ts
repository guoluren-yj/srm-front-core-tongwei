import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'hzero-front/lib/utils/constants';

export const prefix = 'scux.inspectionManagement';

const organizationId = getCurrentOrganizationId();

export const TABS: Array<{
  key: 'ALL' | 'DETAIL';
  name: string;
  primaryKey: string;
  url: string;
  exportUrl?: string;
  customizedCode: string;
  searchCode: string;
  queryData: object
}> = [
    {
      key: 'ALL',
      name: '整单',
      primaryKey: 'inspHeaderId',
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia14BYYpWNAzIJLm0TGia2rHibwj7VjbmmW1kjgAwyEO2Hic`,
      customizedCode: 'SCUX.INSPECTION_MANAGEMENT.ALL',
      searchCode: 'SCUX.INSPECTION_MANAGEMENT.SEARCH_ALL',
      queryData: {
        type: 'header'
      }
    },
    {
      key: 'DETAIL',
      name: '明细',
      primaryKey: 'inspLineId',
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia14BYYpWNAzIJLm0TGia2rHibwj7VjbmmW1kjgAwyEO2Hic`,
      exportUrl: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia14BYYpWNAzIJLm0TGia2rHibwj7VjbmmW1kjgAwyEO2Hic?type=excel`,
      customizedCode: 'SCUX.INSPECTION_MANAGEMENT.DETAIL',
      searchCode: 'SCUX.INSPECTION_MANAGEMENT.SEARCH_DETAIL',
      queryData: {
        type: 'line'
      }
    },
  ];

export const getTabValue = (key: 'ALL' | 'DETAIL', target?: string) => {
  const found: any = TABS.find(t => t.key === key);
  return target ? found?.[target] : found;
};

export const tableDs = (tabKey: 'ALL' | 'DETAIL'): DataSetProps => ({
  selection: DataSetSelection.multiple,
  autoQuery: false,
  cacheSelection: true,
  primaryKey: getTabValue(tabKey, 'primaryKey'),
  pageSize: 20,
  queryFields:
    tabKey === 'ALL'
      ? [
        {
          name: 'inspNumOrTitle',
          type: FieldType.string,
          display: true,
          merge: true,
          label: intl.get(`${prefix}.field.inspNumOrTitle`).d('点检标题、点检单号'),
        },
        {
          name: 'inspNum',
          type: FieldType.string,
          display: true,
          label: intl.get(`${prefix}.field.inspectionNum`).d('单据编号'),
        },
        {
          name: 'createdBy',
          type: FieldType.object,
          lovCode: 'HIAM.TENANT.USER',
          display: true,
          label: intl.get(`${prefix}.field.createdBy`).d('创建人'),
        },
        {
          name: 'inspStatus',
          type: FieldType.string,
          lookupCode: 'SCUX_NWTF_INSP_STATUS',
          display: true,
          label: intl.get(`${prefix}.field.status`).d('状态'),
        },
        {
          name: 'creationDate',
          type: FieldType.date,
          label: intl.get(`${prefix}.field.creationDate`).d('创建时间'),
          display: true,
          range: true,
          defaultValue: [moment().subtract(1, 'year'), moment()],
          transformRequest: (value) => Array.isArray(value) ? [value[0]?.format('YYYY-MM-DD 00:00:00'), value[1]?.format('YYYY-MM-DD 23:59:59')].join() : value 
        },
      ] as any[]
      : [
        {
          name: 'inspTitleOrName',
          type: FieldType.string,
          display: true,
          merge: true,
          label: intl.get(`${prefix}.field.inspTitleOrName`).d('点检标题、合同名称'),
        },
        {
          name: 'pcNum',
          type: FieldType.string,
          display: true,
          label: intl.get(`${prefix}.field.contractNum`).d('合同编号'),
        },
        {
          name: 'inspNum',
          type: FieldType.string,
          display: true,
          label: intl.get(`${prefix}.field.inspectionNum`).d('点检单号'),
        },
        {
          name: 'createdBy',
          type: FieldType.object,
          lovCode: 'HIAM.TENANT.USER',
          display: true,
          label: intl.get(`${prefix}.field.createdBy`).d('创建人'),
        },
        {
          name: 'attributeVarchar18',
          type: FieldType.string,
          display: true,
          lookupCode: 'TWNF_HT_YWLB',
          label: intl.get(`${prefix}.field.businessCategory`).d('业务类别'),
        },
        {
          name: 'creationDate',
          type: FieldType.date,
          label: intl.get(`${prefix}.field.creationDate`).d('创建时间'),
          display: true,
          range: true,
          defaultValue: [moment().subtract(1, 'year'), moment()],
          transformRequest: (value) => Array.isArray(value) ? [value[0]?.format('YYYY-MM-DD 00:00:00'), value[1]?.format('YYYY-MM-DD 23:59:59')].join() : value 
        },
      ] as any[],
  fields: [
    { name: 'inspStatus', type: FieldType.string, lookupCode: 'SCUX_NWTF_INSP_STATUS', label: intl.get(`${prefix}.field.status`).d('状态') },
    { name: 'inspNum', type: FieldType.string, label: intl.get(`${prefix}.field.inspectionNum`).d('点检编号') },
    { name: 'inspNumAndLineNum', type: FieldType.string, label: intl.get(`${prefix}.field.inspNumAndLineNum`).d('点检编号-行号') },
    { name: 'inspTitle', type: FieldType.string, label: intl.get(`${prefix}.field.title`).d('点检标题') },
    { name: 'companyName', type: FieldType.string, label: intl.get(`${prefix}.field.company`).d('公司') },
    { name: 'createdName', type: FieldType.string, label: intl.get(`${prefix}.field.createdBy`).d('创建人') },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.creationDate`).d('创建时间') },
    { name: 'participantsMeaning', type: FieldType.string, label: intl.get(`${prefix}.field.participant`).d('参与人') },
    { name: 'remark', type: FieldType.string, label: intl.get(`${prefix}.field.description`).d('点检说明') },

    // 明细附加字段
    { name: 'pcNum', type: FieldType.string, label: intl.get(`${prefix}.field.contractNum`).d('合同编码') },
    { name: 'pcName', type: FieldType.string, label: intl.get(`${prefix}.field.contractName`).d('合同名称') },
    { name: 'pcCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.pcCompanyName`).d('合同公司') },
    { name: 'supplierName', type: FieldType.string, label: intl.get(`${prefix}.field.contractSupplier`).d('合同供应商') },
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierCompanyName`).d('合同供应商') },
    { name: 'taxIncludeAmount', type: FieldType.number, label: intl.get(`${prefix}.field.taxIncludeAmount`).d('合同金额') },
    { name: 'pcStatusCodeMeaning', type: FieldType.string, label: intl.get(`${prefix}.field.pcStatusCodeMeaning`).d('合同状态') },
    { name: 'pcCreatedName', type: FieldType.string, label: intl.get(`${prefix}.field.contractCreatedBy`).d('合同创建人') },
    { name: 'attributeVarchar18Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar18Meaning`).d('业务类别') },
    { name: 'attributeVarchar10', lookupCode: 'CGLB', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar10`).d('合同类型') },
    { name: 'attributeVarchar4Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar4Meaning`).d('点检创建状态') },
    { name: 'attributeVarchar5Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar5Meaning`).d('合同验收结果') },
  ],
  transport: {
    read: ({ params }) => {
      const { url, queryData } = getTabValue(tabKey);
      return {
        url,
        method: 'GET',
        params: { ...params, ...queryData },
      };
    },
  },
});

