import intl from 'hzero-front/lib/utils/intl';
import { math } from 'choerodon-ui/dataset';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SRM_MARMOT } from 'srm-front-boot/lib/utils/config';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { DataSetSelection, FieldType, FieldIgnore, DataToJSON } from 'choerodon-ui/pro/lib/data-set/enum';

export const prefix = 'scux.supplierEvaluation';

const organizationId = getCurrentOrganizationId();

// 基础信息数据集
export const basicInfoDS = (nominationHeaderId): DataSetProps => ({
  autoQuery: !!nominationHeaderId,
  paging: false,
  fields: [
    { name: 'companyName', type: FieldType.string, label: intl.get(`${prefix}.field.companyName`).d('公司') },
    { name: 'sourceProjectName', type: FieldType.string, label: intl.get(`${prefix}.field.sourceProjectName`).d('招标名称') },
    { name: 'bidDirectorName', type: FieldType.string, label: intl.get(`${prefix}.field.bidDirectorName`).d('招标经理') },
    { name: 'technicalPersonName', type: FieldType.string, label: intl.get(`${prefix}.field.technicalPerson`).d('技术人员') },
    
    // 评审详情数据集
    { name: 'nominationNum', type: FieldType.string, label: intl.get(`${prefix}.field.nominationNum`).d('入围单编号') },
    { name: 'nominationStatusMeaning', type: FieldType.string, label: intl.get(`${prefix}.field.nominationStatusMeaning`).d('状态'), lookupCode: 'SCUX_TWNF_NOMINATION_STATUS' },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.creationDate`).d('创建时间') },
    { name: 'createdByName', type: FieldType.string, label: intl.get(`${prefix}.field.createdByName`).d('创建人') },
    { name: 'financePersonLov', type: FieldType.object, lovCode: 'HPFM.ON_EMPLOYEE', label: intl.get(`${prefix}.field.financePerson`).d('财务人员'), required: true, ignore: FieldIgnore.always, },
    { name: 'financePerson', bind: 'financePersonLov.employeeId' },
    { name: 'financePersonName', bind: 'financePersonLov.name' },
    { name: 'supManagerPersonLov', type: FieldType.object, lovCode: 'HPFM.ON_EMPLOYEE', label: intl.get(`${prefix}.field.supManagerPerson`).d('供应商专管员'), required: true, ignore: FieldIgnore.always, },
    { name: 'supManagerPerson', bind: 'supManagerPersonLov.employeeId' },
    { name: 'supManagerPersonName', bind: 'supManagerPersonLov.name' },
    { name: 'functionalHeadUserLov', type: FieldType.object, lovCode: 'HIAM.TENANT.USER', label: intl.get(`${prefix}.field.functionalHeadUser`).d('职能部门负责人'), required: true, ignore: FieldIgnore.always, },
    { name: 'functionalHeadUser', bind: 'functionalHeadUserLov.id' },
    { name: 'functionalHeadUserName', bind: 'functionalHeadUserLov.realName' },
    { name: 'submitDesc', type: FieldType.string, label: intl.get(`${prefix}.field.approvalNote`).d('审批的相关说明'), dynamicProps: { required: ({ record }) => record.get('nominationStatus') === 'TO_BE_RELEASED' },},
    { name: 'reviewType', type: FieldType.string, lookupCode: 'SCUX_TWNF_TECHNICAL_SHORTLIST_REVIEW_CATEGORY', label: intl.get(`${prefix}.field.reviewType`).d('入围评审类型'), required: true },
    { name: 'caseRequirementCount', type: FieldType.number, label: intl.get(`${prefix}.field.caseRequirementCount`).d('案例要求数量'), required: true },
    { name: 'warrantyPolicy', type: FieldType.string, label: intl.get(`${prefix}.field.warrantyPolicy`).d('质保政策'), required: true },
    { 
      name: 'nominationAttachmentUuid', 
      type: FieldType.attachment, 
      label: intl.get(`${prefix}.field.nominationAttachmentUuid`).d('入围标准附件'), 
      required: true,      
      bucketName: (globalThis as any).$$env?.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: '', 
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        queryType: 'HEADER'
      },
    }),
  },
});

// 供应商列表数据集
export const supplierListDS = (nominationHeaderId, type): DataSetProps => ({
  selection: type === 'edit' ? DataSetSelection.multiple : false,
  autoQuery: !!nominationHeaderId,
  paging: false,
  primaryKey: 'nominationSupLineId',
  fields: [
    { name: 'seqNum', type: FieldType.number, label: intl.get(`${prefix}.field.seqNum`).d('序号') },
    { name: 'isSelected', type: FieldType.string, label: intl.get(`${prefix}.field.isSelected`).d('是否入围') },
    { name: 'supplierCompanyNum', type: FieldType.string, label: intl.get(`${prefix}.field.supplierCode`).d('供应商编码') },
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierCompanyName`).d('供应商名称') },
    { name: 'stageDescription', type: FieldType.string, label: intl.get(`${prefix}.field.stageDescription`).d('生命周期') },
    { name: 'contactPersonLov', type: FieldType.object, lovCode: 'HIAM.TENANT.USER', label: intl.get(`${prefix}.field.contactPerson`).d('联系人'), required: true, ignore: FieldIgnore.always, },
    { name: 'contactName', type: FieldType.string, bind: "contactPersonLov.realName" },
    { name: 'contactMobilephone', type: FieldType.string, label: intl.get(`${prefix}.field.contactMobilephone`).d('联系人电话'), required: true },
    { name: 'contactMail', type: FieldType.string, label: intl.get(`${prefix}.field.contactEmail`).d('电子邮件') },
    { name: 'technologyReviewResult', type: FieldType.string, label: intl.get(`${prefix}.field.technologyReviewResult`).d('技术评审状态'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', },
    { name: 'businessReviewResult', type: FieldType.string, label: intl.get(`${prefix}.field.businessReviewResult`).d('商务评审状态'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', },
    { name: 'financeReviewResult', type: FieldType.string, label: intl.get(`${prefix}.field.financeReviewResult`).d('财务评审状态'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', },
    { name: 'summaryReviewResult', type: FieldType.string, label: intl.get(`${prefix}.field.summaryReviewResult`).d('评审总状态'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', },
    { name: 'remark', type: FieldType.string, label: intl.get(`${prefix}.field.remark`).d('备注') },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        queryType: 'SUP_LINE',
      },
    }),
    destroy: ({ data }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwS1bzxDCNOEAicftu4qN43uYEFxl5aklcAcgqDg5lczWR`,
      method: 'POST',
      data: {
        nominationHeaderId, 
        operationType: 'DELETE_SUP_LINE',
        nominationSupLineIds: data.map((item) => item.nominationSupLineId),
      },
    })
  },
  events: {
    update: ({ record, name, value })  => {
      if(name === 'contactPersonLov' && value) {
        record.set('contactMobilephone', value?.phone);
        record.set('contactMail', value?.email);}
    }
  }
});

// 供应商商务标准数据集
export const supplierBusinessStandardDS = (nominationHeaderId, supplierSelectDs): DataSetProps => ({
  autoQuery: true,
  paging: false,
  fields: [
    { 
      name: 'taxLevel', 
      type: FieldType.string, 
      label: intl.get(`${prefix}.field.taxGrade`).d('纳税等级'),
      lookupCode: 'SCUX_TW_TAX_LEVEL',
    },
    { 
      name: 'supplierRating', 
      type: FieldType.string, 
      label: intl.get(`${prefix}.field.supplierRating`).d('供应商评级'),
      lookupCode: 'SCUX_TWNF_SUPPLIER_LEVEL',
    },
    { 
      name: 'registeredCapitalFrom', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.registeredCapitalFrom`).d('注册资本从（万元）'),
    },
    { 
      name: 'registeredCapitalTo', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.registeredCapitalTo`).d('注册资本至（万元）'),
    },
    { 
      name: 'paidInCapitalFrom', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.paidInCapitalFrom`).d('实缴资本从（万元）'),
    },
    { 
      name: 'paidInCapitalTo', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.paidInCapitalTo`).d('实缴资本至（万元）'),
    },
    { 
      name: 'establishmentYearsFrom', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.establishmentYearsFrom`).d('成立年限从'),
    },
    { 
      name: 'establishmentYearsTo', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.establishmentYearsTo`).d('成立年限至'),
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        queryType: 'BUSINESS_CFG'
      },
      transformResponse: (res) => {
        try {
          const formatData = JSON.parse(res);
          Object.entries(formatData).forEach(([key, value]) => {
            supplierSelectDs.setQueryParameter(key, value);
          });
          supplierSelectDs.query();
          return formatData;
        } catch (error) {
          supplierSelectDs.query();
          return res;
        }
      }
    }),
  },
});

// 供应商技术标准数据集
export const supplierTechnicalStandardDS = (nominationHeaderId): DataSetProps => ({
  autoQuery: true,
  pageSize: 10,
  selection: false,
  fields: [
    { name: 'seqNum', type: FieldType.number, label: intl.get(`${prefix}.field.sequence`).d('序号') },
    { name: 'mainCategoryName', type: FieldType.string, label: intl.get(`${prefix}.field.mainBusiness`).d('主营业务') },
    { name: 'qualificationType', type: FieldType.string, label: intl.get(`${prefix}.field.qualificationType`).d('资质类型'), lookupCode: 'SCUX_TWNF_SUPPLIER_QUALIFICATION' },
    { name: 'qualificationGrade', type: FieldType.string, label: intl.get(`${prefix}.field.qualificationLevel`).d('资质等级'), lookupCode: 'SCUX_TWNF_QUALIFICATION_LEVEL' },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        queryType: 'TECHNOLOGY_CFG'
      },
    }),
  },
});

// 供应商选择数据集
export const supplierSelectDS = (): DataSetProps => ({
  pageSize: 10,
  selection: DataSetSelection.multiple,
  cacheSelection: true,
  primaryKey: 'supplierCompanyId',
  queryFields: [
    { name: 'supplierCompanyName', display: true, type: FieldType.string, label: intl.get(`${prefix}.field.supplierName`).d('供应商名称') },
    { name: 'stageDescription', lovCode: 'SSLM.LIFE_CYCLE_STAGE_TENANT', display: true, type: FieldType.object, label: intl.get(`${prefix}.field.lifeCycleStage`).d('供应商生命周期阶段'), },
  ] as any[],
  fields: [
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierName`).d('供应商名称') },
    { name: 'supplierCompanyNum', type: FieldType.string, label: intl.get(`${prefix}.field.supplierCode`).d('供应商编码') },
    { name: 'registeredCapital', type: FieldType.number, label: intl.get(`${prefix}.field.registeredCapital`).d('注册资本') },
    { name: 'paidInCapital', type: FieldType.number, label: intl.get(`${prefix}.field.paidInCapital`).d('实缴资本') },
    { name: 'buildDate', type: FieldType.date, label: intl.get(`${prefix}.field.establishmentDate`).d('成立日期') },
    { name: 'taxLevel', type: FieldType.string, label: intl.get(`${prefix}.field.taxBracket`).d('供应商纳税等级') },
    { name: 'supplierRating', type: FieldType.string, label: intl.get(`${prefix}.field.supplierLevel`).d('供应商评级') },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/zVXNV9QyW5yBoNom2sOzgalWianTzMRtvocBT18ibt7mnJLDxSOUtMdO8cKysicm4Fu`,
      method: 'GET',
      params: {
        ...params,
      },
    }),
  },
});

// 商务标准设置数据集
export const businessStandardDS = (nominationHeaderId, basicInfoDs): DataSetProps => ({
  autoQuery: true,
  autoCreate: true,
  paging: false,
  fields: [
    { name: 'nominationNum', type: FieldType.string, label: intl.get(`${prefix}.field.supplierEntryCode`).d('入围单位编码') },
    { name: 'createdByName', type: FieldType.string, label: intl.get(`${prefix}.field.createdByName`).d('创建人') },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.creationDate`).d('创建时间') },
    
    // 纳税等级
    { name: 'taxGradeRequired', type: FieldType.boolean, label: intl.get(`${prefix}.field.taxGradeRequired`).d('纳税等级是否有要求'), required: true, trueValue: '1', falseValue: '0', defaultValue: '0' },
    { 
      name: 'taxGrade', 
      type: FieldType.string, 
      label: intl.get(`${prefix}.field.taxGrade`).d('纳税等级'), 
      lookupCode: 'SCUX_TW_TAX_LEVEL',
      dynamicProps: {
        required: ({ record }) => +record.get('taxGradeRequired') === 1,
        disabled: ({ record }) => +record.get('taxGradeRequired') !== 1,
      },
    },
    
    // 供应商评级
    { name: 'supplierRatingRequired', type: FieldType.boolean, label: intl.get(`${prefix}.field.supplierRatingRequired`).d('供应商评级是否有要求'), required: true, trueValue: '1', falseValue: '0', defaultValue: '0' },
    { 
      name: 'supplierRating', 
      type: FieldType.string, 
      label: intl.get(`${prefix}.field.supplierRating`).d('供应商评级'), 
      lookupCode: 'SCUX_TWNF_SUPPLIER_LEVEL',
      dynamicProps: {
        required: ({ record }) => +record.get('supplierRatingRequired') === 1,
        disabled: ({ record }) => +record.get('supplierRatingRequired') !== 1,
      },
    },
    
    // 注册资本
    { name: 'registeredCapitalRequired', type: FieldType.boolean, label: intl.get(`${prefix}.field.registeredCapitalRequired`).d('注册资本是否有要求'), required: true, trueValue: '1', falseValue: '0', defaultValue: '0' },
    { 
      name: 'registeredCapitalFrom', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.registeredCapitalFrom`).d('注册资本从（万元）'),
      dynamicProps: {
        required: ({ record }) => +record.get('registeredCapitalRequired') === 1,
        disabled: ({ record }) => +record.get('registeredCapitalRequired') !== 1,
      },
    },
    { 
      name: 'registeredCapitalTo', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.registeredCapitalTo`).d('注册资本至（万元）'),
      dynamicProps: {
        required: ({ record }) => +record.get('registeredCapitalRequired') === 1,
        disabled: ({ record }) => +record.get('registeredCapitalRequired') !== 1,
      },
    },
    
    // 实缴资本
    { name: 'paidInCapitalRequired', type: FieldType.boolean, label: intl.get(`${prefix}.field.paidInCapitalRequired`).d('实缴资本是否有要求'), required: true, trueValue: '1', falseValue: '0', defaultValue: '0' },
    { 
      name: 'paidInCapitalFrom', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.paidInCapitalFrom`).d('实缴资本从（万元）'),
      dynamicProps: {
        required: ({ record }) => +record.get('paidInCapitalRequired') === 1,
        disabled: ({ record }) => +record.get('paidInCapitalRequired') !== 1,
      },
    },
    { 
      name: 'paidInCapitalTo', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.paidInCapitalTo`).d('实缴资本至（万元）'),
      dynamicProps: {
        required: ({ record }) => +record.get('paidInCapitalRequired') === 1,
        disabled: ({ record }) => +record.get('paidInCapitalRequired') !== 1,
      },
    },
    
    // 成立年限
    { name: 'establishmentYearsRequired', type: FieldType.boolean, label: intl.get(`${prefix}.field.establishmentYearsRequired`).d('成立年限是否有要求'), required: true, trueValue: '1', falseValue: '0', defaultValue: '0' },
    { 
      name: 'establishmentYearsFrom', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.establishmentYearsFrom`).d('成立年限从'),
      dynamicProps: {
        required: ({ record }) => +record.get('establishmentYearsRequired') === 1,
        disabled: ({ record }) => +record.get('establishmentYearsRequired') !== 1,
      },
    },
    { 
      name: 'establishmentYearsTo', 
      type: FieldType.number, 
      label: intl.get(`${prefix}.field.establishmentYearsTo`).d('成立年限至'),
      dynamicProps: {
        required: ({ record }) => +record.get('establishmentYearsRequired') === 1,
        disabled: ({ record }) => +record.get('establishmentYearsRequired') !== 1,
      },
    },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        queryType: 'BUSINESS_CFG',
      },
      transformResponse: (res) => {
        const { nominationNum, createdByName, creationDate } = basicInfoDs?.current?.get(['nominationNum', 'createdByName', 'creationDate']);
        const commonData = {
          nominationNum,
          createdByName,
          creationDate,
        }
        if(!res) {
          return commonData;
        } else {
          try {
            const formatData = JSON.parse(res);
            return { ...commonData, ...formatData };
          } catch (e) {
            return e;
          }
        }
      }
    }),
  },
});

// 技术标准设置表单数据集
export const technicalStandardHeaderDS = (): DataSetProps => ({
  autoCreate: true,
  paging: false,
  fields: [
    { name: 'supplierEntryCode', type: FieldType.string, label: intl.get(`${prefix}.field.supplierEntryCode`).d('入围单位编码') },
    { name: 'createdByName', type: FieldType.string, label: intl.get(`${prefix}.field.createdByName`).d('创建人') },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.creationDate`).d('创建时间') },
  ],
});

// 技术标准设置表格数据集
export const technicalStandardLineDS = (nominationHeaderId): DataSetProps => ({
  autoQuery: true,
  paging: false,
  selection: DataSetSelection.multiple,
  fields: [
    { name: 'seqNum', type: FieldType.number, label: intl.get(`${prefix}.field.sequence`).d('序号') },
    { 
      name: 'mainBusiness', 
      type: FieldType.object, 
      label: intl.get(`${prefix}.field.mainBusiness`).d('主营业务'),
      lovCode: 'SMDM.ITEM_CATEGORY_CNF',
      ignore: FieldIgnore.always,
    },
    {
      name: 'mainCategoryName',
      bind: 'mainBusiness.categoryName',
    },
    {
      name: 'mainCategoryId',
      bind: 'mainBusiness.categoryId',
    },
    { 
      name: 'qualificationType', 
      type: FieldType.string, 
      label: intl.get(`${prefix}.field.qualificationType`).d('资质类型'),
      lookupCode: 'SCUX_TWNF_SUPPLIER_QUALIFICATION',
    },
    { 
      name: 'qualificationGrade', 
      type: FieldType.string, 
      label: intl.get(`${prefix}.field.qualificationLevel`).d('资质等级'),
      lookupCode: 'SCUX_TWNF_QUALIFICATION_LEVEL',
    },
    { name: 'isRequired', type: FieldType.boolean, label: intl.get(`${prefix}.field.isRequired`).d('是否必须'), defaultValue: false, trueValue: '1', falseValue: '0' },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        queryType: 'TECHNOLOGY_CFG'
      },
    }),
    destroy: ({ data}) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwS1bzxDCNOEAicftu4qN43uYEFxl5aklcAcgqDg5lczWR`,
      method: 'POST',
      data: {
        nominationHeaderId,
        operationType: 'DELETE_TECHNOLOGY_CFG',
        technologyCfgIds: data.map((item) => item.technologyCfgId),
      },
    })
  },
});

// 技术评审基础信息数据集
export const technicalReviewBasicInfoDS = (nominationHeaderId, record): DataSetProps => ({
  autoQuery: !!nominationHeaderId,
  paging: false,
fields: [
    { name: 'companyName', type: FieldType.string, label: intl.get(`${prefix}.field.companyName`).d('公司') },
    { name: 'sourceProjectName', type: FieldType.string, label: intl.get(`${prefix}.field.sourceProjectName`).d('招标名称') },
    { name: 'bidDirectorName', type: FieldType.string, label: intl.get(`${prefix}.field.bidDirectorName`).d('招标经理') },
    { name: 'technicalPersonName', type: FieldType.string, label: intl.get(`${prefix}.field.technicalPerson`).d('技术人员') },
    
    // 评审详情数据集
    { name: 'nominationNum', type: FieldType.string, label: intl.get(`${prefix}.field.nominationNum`).d('入围单编号') },
    { name: 'nominationStatusMeaning', type: FieldType.string, label: intl.get(`${prefix}.field.nominationStatusMeaning`).d('状态') },
    { name: 'createdByName', type: FieldType.string, label: intl.get(`${prefix}.field.createdByName`).d('创建人') },
    { name: 'creationDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.creationDate`).d('创建时间') },
    { name: 'submitTime', type: FieldType.dateTime, label: intl.get(`${prefix}.field.submitTime`).d('提交时间') },
    { name: 'reviewType', type: FieldType.string, label: intl.get(`${prefix}.field.reviewType`).d('入围评审类型'), lookupCode: 'SCUX_TWNF_TECHNICAL_SHORTLIST_REVIEW_CATEGORY' },
    { name: 'caseRequirementCount', type: FieldType.number, label: intl.get(`${prefix}.field.caseRequirementCount`).d('案例要求数量') },
    { name: 'nominationAttachmentUuid', type: FieldType.attachment, label: intl.get(`${prefix}.field.nominationAttachmentUuid`).d('入围标准附件'),       bucketName: (globalThis as any).$$env?.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: '', },
    { name: 'warrantyPolicy', type: FieldType.string, label: intl.get(`${prefix}.field.warrantyPolicy`).d('质保政策') },
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierName`).d('供应商名称') },
    { name: 'contactName', type: FieldType.string, label: intl.get(`${prefix}.field.contactPerson`).d('供应商联系人') },
    { name: 'position', type: FieldType.string, label: intl.get(`${prefix}.field.contactPosition`).d('联系人职务') },
    { name: 'contactMail', type: FieldType.string, label: intl.get(`${prefix}.field.contactEmail`).d('联系人邮箱') },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        queryType: 'HEADER'
      },
      transformResponse: (res) => {
        try {
          const { supplierCompanyName, contactName, contactMail  } = record.get(['supplierCompanyName', 'contactName', 'contactMail']);
          const formatData = JSON.parse(res);
          return { supplierCompanyName, contactName, contactMail, ...formatData };
        } catch (e) {
          return e;
        }
      }
    }),
  },
});

// 技术评审案例表格数据集
export const technicalReviewCaseDS = (nominationHeaderId, nominationSupLineId): DataSetProps => ({
  autoQuery: !!nominationHeaderId,
  paging: false,
  primaryKey: 'technologyReviewLineId',
  dataToJSON: DataToJSON.all,
  fields: [
    { name: 'seqNum', type: FieldType.number, label: intl.get(`${prefix}.field.seqNum`).d('序号') },
    { name: 'caseName', type: FieldType.string, label: intl.get(`${prefix}.field.caseName`).d('案例名称'), required: true },
    { name: 'employer', type: FieldType.string, label: intl.get(`${prefix}.field.employer`).d('发包人'), required: true },
    { name: 'caseStatus', type: FieldType.string, label: intl.get(`${prefix}.field.caseStatus`).d('案例状态'), lookupCode: 'SCUX_TWNF_CASE_STATUS' },
    { name: 'caseTime', type: FieldType.number, label: intl.get(`${prefix}.field.caseTime`).d('案例时间') },
    { name: 'contractAmount', type: FieldType.number, label: intl.get(`${prefix}.field.contractAmount`).d('合同金额（元）') },
    { name: 'employerContact', type: FieldType.string, label: intl.get(`${prefix}.field.employerContact`).d('发包联系人') },
    { name: 'contactPhone', type: FieldType.string, label: intl.get(`${prefix}.field.contactPhone`).d('联系电话') },
    { name: 'remark', type: FieldType.string, label: intl.get(`${prefix}.field.remark`).d('备注') },
    { name: 'attachmentUuid', type: FieldType.attachment, label: intl.get(`${prefix}.field.attachmentUuid`).d('附件上传'),      
    bucketName: (globalThis as any).$$env?.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: '', },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        nominationSupLineId,
        queryType: 'TECHNOLOGY_LINE_REVIEW',
      },
    }),
    destroy: ({ data}) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwdjcCccJP6YlZCeMybA9ic252Kibx1ViaAFOf6K3WULtfmx`,
      method: 'POST',
      data: {
        nominationHeaderId,
        nominationSupLineId,
        operationType: 'TECH_LINE_DELETE',
        technologyReviewLineIds: data.map((item) => item.technologyReviewLineId),
      },
    })
  },
});

// 技术评审表单数据集
export const technicalReviewFormDS = (nominationHeaderId, nominationSupLineId): DataSetProps => ({
  autoQuery: false,
  autoCreate: true,
  paging: false,
  fields: [
    { name: 'techCapability', type: FieldType.string, label: intl.get(`${prefix}.field.techCapability`).d('技术/方案能力'), required: true },
    { name: 'techCapabilityMeet', type: FieldType.string, label: intl.get(`${prefix}.field.techCapabilityMeet`).d('是否满足要求'), lookupCode: 'SCUX_TWNF_SHORTLISTED_JUDGES', required: true },
    { name: 'techCapabilityDesc', type: FieldType.string, label: intl.get(`${prefix}.field.techCapabilityDesc`).d('说明'), required: true },
    { name: 'techQualityControl', type: FieldType.string, label: intl.get(`${prefix}.field.techQualityControl`).d('质量控制'), required: true },
    { name: 'techQualityControlMeet', type: FieldType.string, label: intl.get(`${prefix}.field.techQualityControlMeet`).d('是否满足要求'), lookupCode: 'SCUX_TWNF_SHORTLISTED_JUDGES', required: true },
    { name: 'techQualityControlDesc', type: FieldType.string, label: intl.get(`${prefix}.field.techQualityControlDesc`).d('说明'), required: true },
    { name: 'techPreparationCycle', type: FieldType.string, label: intl.get(`${prefix}.field.techPreparationCycle`).d('备货周期'), required: true },
    { name: 'techPreparationCycleMeet', type: FieldType.string, label: intl.get(`${prefix}.field.techPreparationCycleMeet`).d('是否满足要求'), lookupCode: 'SCUX_TWNF_SHORTLISTED_JUDGES', required: true },
    { name: 'techPreparationCycleDesc', type: FieldType.string, label: intl.get(`${prefix}.field.techPreparationCycleDesc`).d('说明'), required: true },
    { name: 'techCaseQuantity', type: FieldType.string, label: intl.get(`${prefix}.field.techCaseQuantity`).d('案例数量'), required: true },
    { name: 'techCaseQuantityMeet', type: FieldType.string, label: intl.get(`${prefix}.field.techCaseQuantityMeet`).d('是否满足要求'), lookupCode: 'SCUX_TWNF_SHORTLISTED_JUDGES', required: true },
    { name: 'techCaseQuantityDesc', type: FieldType.string, label: intl.get(`${prefix}.field.techCaseQuantityDesc`).d('说明'), required: true },
    { name: 'techWarrantyPolicy', type: FieldType.string, label: intl.get(`${prefix}.field.techWarrantyPolicy`).d('质保政策'), required: true },
    { name: 'techWarrantyPolicyMeet', type: FieldType.string, label: intl.get(`${prefix}.field.techWarrantyPolicyMeet`).d('是否满足要求'), lookupCode: 'SCUX_TWNF_SHORTLISTED_JUDGES', required: true },
    { name: 'techWarrantyPolicyDesc', type: FieldType.string, label: intl.get(`${prefix}.field.techWarrantyPolicyDesc`).d('说明'), required: true },
    { name: 'techSalesResponse', type: FieldType.string, label: intl.get(`${prefix}.field.techSalesResponse`).d('售后响应'), required: true },
    { name: 'techSalesResponseMeet', type: FieldType.string, label: intl.get(`${prefix}.field.techSalesResponseMeet`).d('是否满足要求'), lookupCode: 'SCUX_TWNF_SHORTLISTED_JUDGES', required: true },
    { name: 'techSalesResponseDesc', type: FieldType.string, label: intl.get(`${prefix}.field.techSalesResponseDesc`).d('说明'), required: true },
    { name: 'techInspectionEvaluation', type: FieldType.string, label: intl.get(`${prefix}.field.techInspectionEvaluation`).d('考察评价'), required: true },
    { name: 'techInspectionMethod', type: FieldType.string, label: intl.get(`${prefix}.field.techInspectionMethod`).d('考察方式'), lookupCode: 'SCUX_TWNF_EXAMINATION_FORMAT', required: true },
    { name: 'techInspectionEvaluationDesc', type: FieldType.string, label: intl.get(`${prefix}.field.techInspectionEvaluationDesc`).d('技术评审说明'), required: true },

    // 技术评审结果
    { name: 'technologyReviewResult', type: FieldType.string, label: intl.get(`${prefix}.field.technologyReviewResult`).d('技术评审结果'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', required: true },
    { name: 'technologySubmitUserName', type: FieldType.string, label: intl.get(`${prefix}.field.technologySubmitUserName`).d('提交人') },
    { name: 'technologySubmitDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.technologySubmitDate`).d('提交时间') },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        nominationSupLineId,
        queryType: 'TECHNOLOGY_REVIEW'
      },
    }),
  },
});

// 商务评审供应商信息数据集
export const businessReviewDS = (nominationHeaderId, nominationSupLineId, record): DataSetProps => ({
  autoQuery: false,
  paging: false,
  fields: [
    { name: 'supplierCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.supplierName`).d('供应商名称') },
    { name: 'contactName', type: FieldType.string, label: intl.get(`${prefix}.field.contactPerson`).d('供应商联系人') },
    { name: 'contactMobilephone', type: FieldType.string, label: intl.get(`${prefix}.field.contactPhone`).d('联系人电话') },
    { name: 'position', type: FieldType.string, label: intl.get(`${prefix}.field.contactPosition`).d('联系人职务') },
    { name: 'contactMail', type: FieldType.string, label: intl.get(`${prefix}.field.contactEmail`).d('联系人邮箱') },
    { name: 'registeredCapital', type: FieldType.number, label: intl.get(`${prefix}.field.registeredCapital`).d('注册资本（万元）') },
    { name: 'paidInCapital', type: FieldType.number, label: intl.get(`${prefix}.field.paidInCapital`).d('实缴资本（万元）') },
    { name: 'buildDate', type: FieldType.number, label: intl.get(`${prefix}.field.buildDate`).d('成立年限') },
    { name: 'insuredNumber', type: FieldType.number, label: intl.get(`${prefix}.field.insuredNumber`).d('参保人数') },
    { name: 'taxLevel', type: FieldType.string, label: intl.get(`${prefix}.field.taxLevel`).d('纳税等级'), lookupCode: 'SCUX_TWNF_TAX_BRACKET' },
    { name: 'supplierRating', type: FieldType.string, label: intl.get(`${prefix}.field.supplierLevel`).d('供应商评级'), lookupCode: 'SCUX_TWNF_SUPPLIER_LEVEL' },
    { name: 'businessReferrerUserLov', type: FieldType.object, lovCode: 'HIAM.TENANT.USER', label: intl.get(`${prefix}.field.businessReferrerUserId`).d('供应商推荐人'), ignore: FieldIgnore.always, },
    { name: 'businessReferrerUserId', bind: 'businessReferrerUserLov.id' },
    { name: 'businessReferrerUserName', bind: 'businessReferrerUserLov.realName' },
    { name: 'businessReferrerCompanyName', type: FieldType.string, label: intl.get(`${prefix}.field.businessReferrerCompanyName`).d('推荐人所属公司') },
    { name: 'caseRequirementCount', type: FieldType.number, label: intl.get(`${prefix}.field.caseRequiredCount`).d('案例要求数量') },
    { name: 'warrantyPolicy', type: FieldType.string, label: intl.get(`${prefix}.field.warrantyPolicy`).d('质保政策')},

    // 商务审查信息
    { name: 'businessQualificationReview', type: FieldType.string, label: intl.get(`${prefix}.field.businessQualificationReview`).d('资格审查情况'), required: true },
    { name: 'businessCreditLawReview', type: FieldType.string, label: intl.get(`${prefix}.field.businessCreditLawReview`).d('资信、失信情况等审查情况'), required: true },
    { name: 'businessLegalAction', type: FieldType.string, label: intl.get(`${prefix}.field.businessLegalAction`).d('法律诉讼'), required: true },
    { name: 'businessOtherSituations', type: FieldType.string, label: intl.get(`${prefix}.field.businessOtherSituations`).d('其他情况'), required: true },
    { name: 'businessReviewDesc', type: FieldType.string, label: intl.get(`${prefix}.field.businessReviewDesc`).d('审查说明'), required: true },

    // 商务评审结果
    { name: 'businessReviewResultDesc', type: FieldType.string, label: intl.get(`${prefix}.field.businessReviewResultDesc`).d('商务评审说明'), required: true },
    { name: 'businessReviewResult', type: FieldType.string, label: intl.get(`${prefix}.field.businessReviewResult`).d('商务评审结果'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', required: true },
    { name: 'businessSubmitUserName', type: FieldType.string, label: intl.get(`${prefix}.field.businessSubmitUserName`).d('提交人') },
    { name: 'businessSubmitDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.businessSubmitDate`).d('提交时间') },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        nominationSupLineId,
        queryType: 'BUSINESS_REVIEW'
      },
      // transformResponse: (res) => {
      //   const { objectVersionNumber, seqNum, createdBy, creationDate, lastUpdateDate, lastUpdatedBy, ...other } = record?.toData() || {};

      //   if(!res) {
      //     return other;
      //   } else {
      //     try {
      //       const formatData = JSON.parse(res);
      //       return { ...other, ...formatData };
      //     } catch (e) {
      //       return e;
      //     }
      //   }
      // }
    }),
  },
});

// 财务评审信息表格数据集
export const financeReviewInfoDS = (nominationHeaderId, nominationSupLineId): DataSetProps => ({
  autoQuery: false,
  paging: false,
  selection: DataSetSelection.multiple,
  primaryKey: 'financeReviewLineId',
  fields: [
    { name: 'year', type: FieldType.string, label: intl.get(`${prefix}.field.year`).d('年度'), required: true },
    { name: 'operatingRevenue', type: FieldType.number, label: intl.get(`${prefix}.field.operatingRevenue`).d('营业收入（万元）'), required: true },
    { name: 'netProfit', type: FieldType.number, label: intl.get(`${prefix}.field.netProfit`).d('净利润（万元）'), required: true },
    { name: 'totalAssets', type: FieldType.number, label: intl.get(`${prefix}.field.totalAssets`).d('总资产（万元）'), required: true },
    { name: 'netAssets', type: FieldType.number, label: intl.get(`${prefix}.field.netAssets`).d('净资产（万元）'), required: true },
    { name: 'interestBearingDebt', type: FieldType.number, label: intl.get(`${prefix}.field.interestBearingDebt`).d('有息负债（万元）'), required: true },
    { name: 'totalLiabilities', type: FieldType.number, label: intl.get(`${prefix}.field.totalLiabilities`).d('总负债（万元）'), required: true },
    { name: 'assetLiabilityRatio', type: FieldType.number, label: intl.get(`${prefix}.field.assetLiabilityRatio`).d('资产负债率（%）') },
    { name: 'returnOnEquity', type: FieldType.number, label: intl.get(`${prefix}.field.returnOnEquity`).d('净资产收益率（%）') },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        nominationSupLineId,
        queryType: 'FINANCE_LINE_REVIEW',
      },
    }),
    destroy: ({ data}) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwdjcCccJP6YlZCeMybA9ic252Kibx1ViaAFOf6K3WULtfmx`,
      method: 'POST',
      data: {
        nominationHeaderId,
        nominationSupLineId,
        operationType: 'FIN_LINE_DELETE',
        financeReviewLineIds: data.map((item) => item.financeReviewLineId),
      },
    })
  },
  events: {
    update: ({ name, record, dataSet }) => {
      const resultDs = dataSet.parent;
      if(name === 'totalAssets' || name === 'totalLiabilities') {
        record.set('assetLiabilityRatio', record.get('totalAssets') > 0 ? math.toFixed(math.multipliedBy(math.div(record.get('totalLiabilities'), record.get('totalAssets')), 100), 2) : null);
        if(resultDs) {
          const allRecords = dataSet.records;
          const allTotalLiabilities = allRecords.reduce((sum, current) => {
            const ratio = current.get('totalLiabilities');
            return math.plus(sum, (ratio || 0));
          }, 0);
          const allTotalAssets = allRecords.reduce((sum, current) => {
            const ratio = current.get('totalAssets');
            return math.plus(sum, (ratio || 0));
          }, 0);
          resultDs.current.set('financeAvgLiabilityRatio', allRecords.length && allTotalAssets > 0 ? math.toFixed(math.multipliedBy(math.div(allTotalLiabilities, allTotalAssets), 100), 2) : null);
        }
      }
      if(name === 'netAssets' || name === 'netProfit') {
        record.set('returnOnEquity', record.get('netAssets') > 0 ? math.toFixed(math.multipliedBy(math.div(record.get('netProfit'), record.get('netAssets')), 100), 2) : null); 
        if(resultDs) {
          const allRecords = dataSet.records;
          const allNetProfit = allRecords.reduce((sum, current) => {
            const ratio = current.get('netProfit');
            return math.plus(sum, (ratio || 0));
          }, 0);
          const allNetAssets = allRecords.reduce((sum, current) => {
            const ratio = current.get('netAssets');
            return math.plus(sum, (ratio || 0));
          }, 0);
          resultDs.current.set('financeAvgRevenueRatio', allRecords.length && allNetAssets > 0 ? math.toFixed(math.multipliedBy(math.div(allNetProfit, allNetAssets), 100), 2) : null);
        }
      }
    }
  }
});

// 财务评审结果数据集
export const financeReviewResultDS = (nominationHeaderId, nominationSupLineId): DataSetProps => ({
  autoQuery: false,
  autoCreate: true,
  paging: false,
  fields: [
    { name: 'financeAvgLiabilityRatio', type: FieldType.number, label: intl.get(`${prefix}.field.avgAssetLiabilityRatio`).d('年均资产负债率（%）') },
    { name: 'financeAvgRevenueRatio', type: FieldType.number, label: intl.get(`${prefix}.field.avgReturnOnEquity`).d('年均净资产收益率（%）') },
    { name: 'financeReviewDesc', type: FieldType.string, label: intl.get(`${prefix}.field.financeReviewDesc`).d('财务评审说明'), required: true },
    { name: 'financeReviewResult', type: FieldType.string, label: intl.get(`${prefix}.field.financeReviewResult`).d('财务评审结果'), lookupCode: 'SCUX_TWNF_REVIEW_RESULTS', required: true },
    { name: 'financeSubmitUserName', type: FieldType.string, label: intl.get(`${prefix}.field.financeSubmitUserName`).d('提交人') },
    { name: 'financeSubmitDate', type: FieldType.dateTime, label: intl.get(`${prefix}.field.financeSubmitDate`).d('提交时间') },
  ],
  transport: {
    read: ({ params }) => ({
      url: `${SRM_MARMOT}/v1/${organizationId}/marmot-api/YmqoMCVomiaIrEZCkyzZfwWqSQibr1ljY6UMPb3d0Bc0M`,
      method: 'GET',
      params: {
        ...params,
        nominationHeaderId,
        nominationSupLineId,
        queryType: 'FINANCE_REVIEW',
      },
    }),
  },
});