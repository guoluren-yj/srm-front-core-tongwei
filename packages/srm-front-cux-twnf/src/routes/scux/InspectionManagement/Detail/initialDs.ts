import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';

const organizationId = getCurrentOrganizationId();

export const prefix = 'scux.inspectionManagement';

export const headerDsConfig = (inspHeaderId?: string | number | null): DataSetProps => ({
  autoCreate: !inspHeaderId,
  autoQuery: !!inspHeaderId,
  forceValidate: true,
  primaryKey: 'inspHeaderId',
  paging: false,
  fields: [
    { name: 'inspHeaderId', type: FieldType.number },
    {
      name: 'inspNum',
      type: FieldType.string,
      label: intl.get(`${prefix}.field.inspectionNum`).d('单据编号'),
    },
    {
      name: 'inspTitle',
      type: FieldType.string,
      required: true,
      label: intl.get(`${prefix}.field.title`).d('标题'),
    },
    {
      name: 'inspStatus',
      type: FieldType.string,
      lookupCode: 'SCUX_NWTF_INSP_STATUS',
      label: intl.get(`${prefix}.field.status`).d('状态'),
    },
    {
      name: 'companyLov',
      type: FieldType.object,
      required: true,
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      label: intl.get(`${prefix}.field.company`).d('公司'),
      ignore: FieldIgnore.always,
      lovPara: { tenantId: organizationId },
    },
    { name: 'companyId', bind: 'companyLov.companyId' },
    { name: 'companyNum', bind: 'companyLov.companyNum' },
    { name: 'companyName', bind: 'companyLov.companyName' },
    {
      name: 'ouLov',
      type: FieldType.object,
      lovCode: 'SPFM.USER_AUTH.OU',
      label: intl.get(`${prefix}.field.ou`).d('业务实体'),
      ignore: FieldIgnore.always,
      computedProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          companyId: record.get('companyId'),
          enabledFlag: 1,
        }),
        disabled: ({ record }) => !record.get('companyId'),
      },
    },
    { name: 'ouId', bind: 'ouLov.ouId' },
    { name: 'ouName', bind: 'ouLov.ouName' },
    {
      name: 'purchaseOrgLov',
      type: FieldType.object,
      lovCode: 'HPFM.PURCHASE_ORGANIZATION',
      label: intl.get(`${prefix}.field.purchaseOrg`).d('采购组织'),
      ignore: FieldIgnore.always,
      computedProps: {
        lovPara: ({ record }) => ({
          tenantId: organizationId,
          ouId: record.get('ouId'),
        }),
        disabled: ({ record }) => !record.get('ouId'),
      },
    },
    { name: 'purchaseOrgId', bind: 'purchaseOrgLov.purchaseOrgId' },
    { name: 'purchaseOrgName', bind: 'purchaseOrgLov.organizationName' },
    {
      name: 'createdName',
      type: FieldType.string,
      label: intl.get(`${prefix}.field.createdBy`).d('创建人'),
    },
    {
      name: 'unitLov',
      type: FieldType.object,
      required: true,
      lovCode: 'SPRM.USER_UNIT',
      label: intl.get(`${prefix}.field.unit`).d('创建部门'),
      ignore: FieldIgnore.always,
    },
    { name: 'createdUnitId', bind: 'unitLov.unitId' },
    { name: 'unitName', bind: 'unitLov.unitName' },
    {
      name: 'creationDate',
      type: FieldType.dateTime,
      label: intl.get(`${prefix}.field.creationDate`).d('创建日期'),
    },
    {
      name: 'participantsLov',
      type: FieldType.object,
      required: true,
      lovCode: 'SCUX.HPFM.TW.BATCH.EMPLOYEE',
      label: intl.get(`${prefix}.field.participant`).d('参与人'),
      ignore: FieldIgnore.always,
      multiple: true,
    },
    { name: 'participants', bind: 'participantsLov.uniqueId', transformResponse: (_, object) => typeof object.participants === 'string' ? object?.participants?.split(',') : object.participants, transformRequest: (value) => Array.isArray(value) ? value.join() : value },
    { name: 'participantsMeaning', bind: 'participantsLov.employeePositionName', transformResponse: (_, object) => typeof object.participantsMeaning === 'string' ? object?.participantsMeaning?.split(',') : object.participantsMeaning, transformRequest: (value) => Array.isArray(value) ? value.join() : value },
    {
      name: 'remark',
      type: FieldType.string,
      required: true,
      label: intl.get(`${prefix}.field.description`).d('点检说明'),
    },
    {
      name: 'attachmentUuid',
      type: FieldType.attachment,
      label: intl.get(`${prefix}.field.attachment`).d('点检附件'),
      bucketName: (globalThis as any).$$env?.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: '',
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia14BYYpWNAzIJLm0TGia2rHibwj7VjbmmW1kjgAwyEO2Hic`,
      method: 'GET',
      params: {
        ...params,
        inspHeaderId,
        type: 'header',
      },
    }),
  },
  events: {
    update: ({ name, value, record }) => {
      if (name === 'companyLov') {
        if (!value) {
          record.set('ouLov', null)
        }
      }
      if (name === 'ouLov') {
        if (!value) {
          record.set('purchaseOrgLov', null)
        }
      }
    }
  }
});

export const lineDsConfig = (inspHeaderId?: string | number | null): DataSetProps => ({
  autoQuery: false,
  selection: false,
  forceValidate: true,
  primaryKey: 'inspLineId',
  cacheModified: true,
  pageSize: 20,
  fields: [
    { name: 'inspLineId', type: FieldType.number },
    { name: 'lineNum', type: FieldType.number, label: intl.get(`${prefix}.field.lineNum`).d('序号') },
    { name: 'pcHeaderId', type: FieldType.number },
    { name: 'inspHeaderId', type: FieldType.number },
    { name: 'pcHeaderId', type: FieldType.number, label: intl.get(`${prefix}.field.contractNum`).d('合同编码') },
    { name: 'pcNum', type: FieldType.string, label: intl.get(`${prefix}.field.contractNum`).d('合同编码') },
    { name: 'pcName', type: FieldType.string, label: intl.get(`${prefix}.field.contractName`).d('合同名称') },
    { name: 'pcCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.pcCompanyName`).d('公司') },
    { name: 'supplierName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierName`).d('供应商') },
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierCompanyName`).d('供应商公司名称') },
    { name: 'taxIncludeAmount', type: FieldType.number, label: intl.get(`${prefix}.field.taxIncludeAmount`).d('合同金额') },
    { name: 'pcStatusCodeMeaning', type: FieldType.string, label: intl.get(`${prefix}.field.pcStatusCodeMeaning`).d('合同状态') },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.creationDate`).d('创建时间') },
    { name: 'createdName', type: FieldType.string, label: intl.get(`${prefix}.field.createdName`).d('创建人') },
    { name: 'pcCreatedName', type: FieldType.string, label: intl.get(`${prefix}.field.contractCreatedBy`).d('合同创建人') },
    { name: 'attributeVarchar18Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar18Meaning`).d('业务类别') },
    { name: 'attributeVarchar10', lookupCode: 'CGLB', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar10`).d('合同类型') },
    { name: 'attributeVarchar4Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar4Meaning`).d('点检创建状态') },
    { name: 'attributeVarchar5Meaning', type: FieldType.string, label: intl.get(`${prefix}.field.attributeVarchar5Meaning`).d('合同验收结果') },
    { name: 'ouName', type: FieldType.number, label: intl.get(`${prefix}.field.ouName`).d('业务实体') },
    { name: 'purchaseOrgName', type: FieldType.number, label: intl.get(`${prefix}.field.purchaseOrgName`).d('采购组织ID') },
    {
      name: 'inspResult',
      type: FieldType.string,
      lookupCode: 'SPUC.QUALIFIED.FLAG',
      label: intl.get(`${prefix}.field.inspectionResult`).d('点检结果'),
      dynamicProps: {
        required: ({ record }) => record.get('attributeVarchar18') === 'ZC',
      },
    },
    {
      name: 'lineDetail',
      type: FieldType.string,
      label: intl.get(`${prefix}.field.lineDetail`).d('点检明细'),
    },
    {
      name: 'lineRemark',
      type: FieldType.string,
      label: intl.get(`${prefix}.field.remark`).d('备注'),
    },
    {
      name: 'lineAttachmentUuid',
      type: FieldType.attachment,
      label: intl.get(`${prefix}.field.lineAttachment`).d('附件上传'),
      bucketName: (globalThis as any).$$env?.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: '',
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia14BYYpWNAzIJLm0TGia2rHibwj7VjbmmW1kjgAwyEO2Hic`,
      method: 'GET',
      params: {
        ...params,
        inspHeaderId,
        type: 'line',
      },
    }),
  },
});

export const lineDetailDsConfig = (inspLineId?: string | number): DataSetProps => ({
  autoCreate: !inspLineId,
  autoQuery: true,
  forceValidate: true,
  primaryKey: 'inspLineDetailId',
  fields: [
    // 项目信息
    { name: 'pcNum', type: FieldType.string, label: intl.get(`${prefix}.field.contractNum`).d('合同编码') },
    { name: 'pcName', type: FieldType.string, label: intl.get(`${prefix}.field.contractName`).d('合同名称') },
    { name: 'companyName', type: FieldType.string, label: intl.get(`${prefix}.field.contractCompany`).d('合同公司') },
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.contractSupplier`).d('合同供应商') },

    // 立项信息
    { name: 'paReportAnalysis', type: FieldType.string, required: true, label: intl.get(`${prefix}.field.projectFeasibility`).d('立项可行性报告分析') },
    { name: 'paTargetFlag', type: FieldType.string, required: true, lookupCode: 'HPFM.FLAG.NEW', label: intl.get(`${prefix}.field.projectTargetAchieved`).d('立项目标是否达成') },
    { name: 'paBudgetFlag', type: FieldType.string, required: true, lookupCode: 'HPFM.FLAG.NEW', label: intl.get(`${prefix}.field.budgetDeviation`).d('概算是否有偏差') },

    // 项目执行信息
    { name: 'projEng', type: FieldType.string, label: intl.get(`${prefix}.field.executeInfoConstruction`).d('建筑工程类') },
    { name: 'projEngDataCompleteFlag', type: FieldType.string, lookupCode: 'HPFM.FLAG.NEW', label: intl.get(`${prefix}.field.processDocComplete`).d('过程资料是否完整') },
    { name: 'projEngAsDrawingFlag', type: FieldType.string, lookupCode: 'HPFM.FLAG.NEW', label: intl.get(`${prefix}.field.buildByDrawing`).d('是否按图纸施工') },
    { name: 'projEngQualityDeviationFlag', type: FieldType.string, lookupCode: 'HPFM.FLAG.NEW', label: intl.get(`${prefix}.field.qualityDeviationConstruction`).d('质量是否有偏差') },
    { name: 'projEquip', type: FieldType.string, label: intl.get(`${prefix}.field.executeInfoDevice`).d('设备类') },
    { name: 'projEquipListFlag', type: FieldType.string, lookupCode: 'HPFM.FLAG.NEW', label: intl.get(`${prefix}.field.deviceListDeviation`).d('设备清单是否偏差') },
    { name: 'projEquipMissingFlag', type: FieldType.string, lookupCode: 'HPFM.FLAG.NEW', label: intl.get(`${prefix}.field.installMissingItems`).d('安装是否有漏项') },
    { name: 'projEquipQualityDeviationFlag', type: FieldType.string, lookupCode: 'HPFM.FLAG.NEW', label: intl.get(`${prefix}.field.qualityDeviationDevice`).d('质量是否有偏差') },
    { name: 'projService', type: FieldType.string, label: intl.get(`${prefix}.field.executeInfoService`).d('服务类') },
  ],
  transport: {
    read: () => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/Ps3F3TBZpN8ymKBBK7cDia14BYYpWNAzIJLm0TGia2rHibwj7VjbmmW1kjgAwyEO2Hic`,
      method: 'GET',
      params: {
        inspLineId,
        type: 'lineDetail'
      },
    }),
  },
});

