import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export const prefix = 'scux.supplierEvaluation';

// 页签类型
export type TabKeyType = 'EVALUATE' | 'ALL';

const organizationId = getCurrentOrganizationId();

export const TABS: Array<{
  key: TabKeyType;
  name: string;
  primaryKey: string;
  url: string;
  exportUrl?: string;
  customizedCode: string;
  searchCode: string;
  queryData: object
}> = [
    {
      key: 'EVALUATE',
      name: intl.get(`${prefix}.tab.evaluate`).d('待评审'),
      primaryKey: 'nominationHeaderId',
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwddvo6RMkbZw6xsZFnHrZU0`,
      customizedCode: 'SCUX.SUPPLIER_EVALUATION.EVALUATE',
      searchCode: 'SCUX.SUPPLIER_EVALUATION.SEARCH_EVALUATE',
      queryData: {
        queryType: 'UN_REVIEW'
      }
    },
    {
      key: 'ALL',
      name: intl.get(`${prefix}.tab.all`).d('全部'),
      primaryKey: 'nominationHeaderId',
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwddvo6RMkbZw6xsZFnHrZU0`,
      exportUrl: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwcAy29iaX6ziatnofSfqI0iaWkk4qz5X5CH9OE9PyEaLFib3`,
      customizedCode: 'SCUX.SUPPLIER_EVALUATION.ALL',
      searchCode: 'SCUX.SUPPLIER_EVALUATION.SEARCH_ALL',
      queryData: {
        queryType: 'ALL'
      }
    },
  ];

export const getTabValue = (key: TabKeyType, target?: string) => {
  const found: any = TABS.find(t => t.key === key);
  return target ? found?.[target] : found;
};

export const tableDs = (tabKey: TabKeyType): DataSetProps => ({
  selection: tabKey === 'ALL' ? DataSetSelection.multiple : undefined,
  autoQuery: false,
  cacheSelection: true,
  primaryKey: getTabValue(tabKey, 'primaryKey'),
  pageSize: 20,
  queryFields: [
    {
      name: 'numOrTitle',
      label: intl.get(`${prefix}.field.numOrTitle1`).d('入围单编号、招标名称'),
      type: FieldType.string,
      display: true,
      merge: true,
    },
    {
      name: 'sourceProjectNum',
      type: FieldType.string,
      display: true,
      label: intl.get(`${prefix}.field.tenderPlanNum`).d('招标计划单号'),
    },
    {
      name: 'sourceProjectName',
      type: FieldType.string,
      display: true,
      label: intl.get(`${prefix}.field.tenderName`).d('招标名称'),
    },
    {
      name: 'nominationStatus',
      type: FieldType.string,
      display: true,
      label: intl.get(`${prefix}.field.nominationStatus`).d('状态'),
      lookupCode: 'SCUX_TWNF_NOMINATION_STATUS'
    },
    {
      name: 'bidDirector',
      type: FieldType.object,
      lovCode: 'HIAM.TENANT.USER',
      display: true,
      label: intl.get(`${prefix}.field.tenderManager`).d('招标经理'),
    },
    {
      name: 'createStartDate',
      type: FieldType.date,
      label: intl.get(`${prefix}.field.createStartDate`).d('创建日期从'),
      display: true,
    },
    {
      name: 'createEndDate',
      type: FieldType.date,
      label: intl.get(`${prefix}.field.createEndDate`).d('创建日期至'),
      display: true,
    },
  ].filter(Boolean) as any[],
  fields: [
    { name: 'nominationStatus', type: FieldType.string, label: intl.get(`${prefix}.field.nominationStatus`).d('状态') },
    { name: 'nominationStatusMeaning', type: FieldType.string, label: intl.get(`${prefix}.field.nominationStatusMeaning`).d('状态') },
    { name: 'nominationNum', type: FieldType.string, label: intl.get(`${prefix}.field.nominationNum`).d('入围单编号') },
    { name: 'sourceProjectNum', type: FieldType.string, label: intl.get(`${prefix}.field.sourceProjectNum`).d('招标计划编号') },
    { name: 'sourceProjectId', type: FieldType.number, label: intl.get(`${prefix}.field.sourceProjectId`).d('招标计划ID') },
    { name: 'sourceProjectName', type: FieldType.string, label: intl.get(`${prefix}.field.sourceProjectName`).d('招标名称') },
    { name: 'companyId', type: FieldType.number, label: intl.get(`${prefix}.field.companyId`).d('公司ID') },
    { name: 'companyName', type: FieldType.string, label: intl.get(`${prefix}.field.companyName`).d('公司') },
    { name: 'templateId', type: FieldType.number, label: intl.get(`${prefix}.field.templateId`).d('招标流程') },
    { name: 'templateName', type: FieldType.string, label: intl.get(`${prefix}.field.templateName`).d('招标流程') },
    { name: 'bidDirector', type: FieldType.number, label: intl.get(`${prefix}.field.bidDirector`).d('招标经理ID') },
    { name: 'bidDirectorName', type: FieldType.string, label: intl.get(`${prefix}.field.bidDirectorName`).d('招标经理') },
    { name: 'financePerson', type: FieldType.string, label: intl.get(`${prefix}.field.financePerson`).d('财务人员') },
    { name: 'technicalPerson', type: FieldType.string, label: intl.get(`${prefix}.field.technicalPerson`).d('技术人员') },
    { name: 'supManagerPerson', type: FieldType.string, label: intl.get(`${prefix}.field.supManagerPerson`).d('供应商专管员') },
    { name: 'reviewType', type: FieldType.string, label: intl.get(`${prefix}.field.reviewType`).d('入围评审类型') },
    { name: 'caseRequirementCount', type: FieldType.number, label: intl.get(`${prefix}.field.caseRequirementCount`).d('案例要求数量') },
    { name: 'functionalHeadUser', type: FieldType.string, label: intl.get(`${prefix}.field.functionalHeadUser`).d('职能部门负责人') },
    { name: 'warrantyPolicy', type: FieldType.string, label: intl.get(`${prefix}.field.warrantyPolicy`).d('质保政策') },
    { name: 'nominationAttachmentUuid', type: FieldType.string, label: intl.get(`${prefix}.field.nominationAttachmentUuid`).d('入围标准附件') },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.createDate`).d('创建时间') },
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
