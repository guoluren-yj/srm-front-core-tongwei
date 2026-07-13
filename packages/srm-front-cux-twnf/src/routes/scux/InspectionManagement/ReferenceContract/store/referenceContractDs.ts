import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
// import type { FieldProps } from 'choerodon-ui/dataset/data-set/Field';
import { DataSetSelection, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export const prefix = 'scux.inspectionManagement';

export const referenceContractDs = (): DataSetProps => ({
  selection: DataSetSelection.multiple,
  autoQuery: false,
  cacheSelection: true,
  primaryKey: 'pcHeaderId',
  pageSize: 20,
  queryFields: [
    {
      name: 'pcNum',
      type: FieldType.string,
      display: true,
      label: intl.get(`${prefix}.field.contractNum`).d('合同编码'),
    },
    {
      name: 'pcName',
      type: FieldType.string,
      display: true,
      label: intl.get(`${prefix}.field.contractName`).d('合同名称'),
    },
    {
      name: 'createdBy',
      type: FieldType.object,
      lovCode: 'HIAM.TENANT.USER',
      display: true,
      label: intl.get(`${prefix}.field.createdBy`).d('创建人'),
    },
    {
      name: 'attributeVarchar4',
      type: FieldType.string,
      lookupCode: 'SCUX_TWNF_INSP_CREATE_STATUS',
      display: true,
      label: intl.get(`${prefix}.field.attributeVarchar4`).d('点检创建状态'),
    },
  ] as any[],
  fields: [
    { name: 'pcHeaderId', type: FieldType.number, label: intl.get(`${prefix}.field.contractNum`).d('合同编码') },
    { name: 'pcNum', type: FieldType.string, label: intl.get(`${prefix}.field.contractNum`).d('合同编码') },
    { name: 'pcName', type: FieldType.string, label: intl.get(`${prefix}.field.contractName`).d('合同名称') },
    { name: 'companyId', type: FieldType.number, label: intl.get(`${prefix}.field.company`).d('公司ID') },
    { name: 'companyNum', type: FieldType.string, label: intl.get(`${prefix}.field.companyNum`).d('公司编码') },
    { name: 'companyName', type: FieldType.string, label: intl.get(`${prefix}.field.companyName`).d('公司') },
    { name: 'supplierId', type: FieldType.number, label: intl.get(`${prefix}.field.supplier`).d('供应商ID') },
    { name: 'supplierNum', type: FieldType.string, label: intl.get(`${prefix}.field.supplierNum`).d('供应商编码') },
    { name: 'supplierName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierName`).d('供应商') },
    { name: 'supplierTenantId', type: FieldType.number, label: intl.get(`${prefix}.field.supplierTenantId`).d('供应商租户ID') },
    { name: 'supplierCompanyId', type: FieldType.number, label: intl.get(`${prefix}.field.supplierCompanyId`).d('供应商公司ID') },
    { name: 'supplierCompanyNum', type: FieldType.string, label: intl.get(`${prefix}.field.supplierCompanyNum`).d('供应商公司编码') },
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierCompanyName`).d('供应商公司名称') },
    { name: 'ouId', type: FieldType.number, label: intl.get(`${prefix}.field.ouId`).d('OU ID') },
    { name: 'purchaseOrgId', type: FieldType.number, label: intl.get(`${prefix}.field.purchaseOrg`).d('采购组织ID') },
    { name: 'purchaseAgentId', type: FieldType.number, label: intl.get(`${prefix}.field.purchaseAgent`).d('采购代理人ID') },
    { name: 'taxIncludeAmount', type: FieldType.number, label: intl.get(`${prefix}.field.taxIncludeAmount`).d('合同金额') },
    { name: 'originalDbTaxIncludeAmount', type: FieldType.number, label: intl.get(`${prefix}.field.originalDbTaxIncludeAmount`).d('原始含税金额') },
    { name: 'pcStatusCode', type: FieldType.string, label: intl.get(`${prefix}.field.contractStatus`).d('合同状态码') },
    { name: 'pcStatusCodeMeaning', type: FieldType.string, label: intl.get(`${prefix}.field.pcStatusCodeMeaning`).d('合同状态') },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.creationDate`).d('创建时间') },
    { name: 'createdBy', type: FieldType.number, label: intl.get(`${prefix}.field.createdBy`).d('创建人ID') },
    { name: 'createdName', type: FieldType.string, label: intl.get(`${prefix}.field.createdName`).d('创建人') },
    { name: 'attributeVarchar18', type: FieldType.string, label: intl.get(`${prefix}.field.businessCategory`).d('业务类别') },
    { name: 'attributeVarchar18Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar18Meaning`).d('业务类别') },
    { name: 'attributeVarchar10', lookupCode: 'CGLB', type: FieldType.string, label: intl.get(`${prefix}.field.contractType`).d('合同类型') },
    { name: 'attributeVarchar4', type: FieldType.string, label: intl.get(`${prefix}.field.inspectionCreateStatus`).d('点检创建状态') },
    { name: 'attributeVarchar4Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar4Meaning`).d('点检创建状态') },
    { name: 'attributeVarchar5', type: FieldType.string, label: intl.get(`${prefix}.field.acceptanceResult`).d('合同验收结果') },
    { name: 'attributeVarchar5Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar5Meaning`).d('合同验收结果') },
  ],
  transport: {
    read: ({ params }: any) => {
      const organizationId = getCurrentOrganizationId();
      return {
        url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia14BYYpWNAzIJLm0TGia2rHibwj7VjbmmW1kjgAwyEO2Hic`,
        method: 'GET',
        params: { ...params, type: 'pcToInsp' },
      };
    },
  },
});

